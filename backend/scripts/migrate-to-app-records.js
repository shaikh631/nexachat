import 'dotenv/config';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const legacyCollections = [
  ['users', 'User'],
  ['conversations', 'Conversation'],
  ['messages', 'Message'],
];

export const migrateLegacyCollections = async (database) => {
  const targetName = 'app_records';
  const targetExists = await database.listCollections({ name: targetName }).hasNext();

  if (!targetExists) {
    await database.createCollection(targetName);
  }

  const target = database.collection(targetName);
  const results = [];

  for (const [collectionName, recordType] of legacyCollections) {
    const documents = await database.collection(collectionName).find({}).toArray();
    let copied = 0;

    if (documents.length > 0) {
      const result = await target.bulkWrite(
        documents.map((document) => ({
          updateOne: {
            filter: { _id: document._id },
            update: { $setOnInsert: { ...document, recordType } },
            upsert: true,
          },
        })),
        { ordered: false }
      );
      copied = result.upsertedCount;
    }

    results.push({ collection: collectionName, total: documents.length, copied });
  }

  return results;
};

const runMigration = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('Set MONGODB_URI to the Atlas database you want to migrate.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  try {
    const results = await migrateLegacyCollections(mongoose.connection.db);
    for (const result of results) {
      console.log(`${result.collection}: copied ${result.copied} of ${result.total}`);
    }
    console.log('Migration complete. Original collections were left unchanged.');
  } finally {
    await mongoose.disconnect();
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runMigration().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}