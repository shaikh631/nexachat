import mongoose from 'mongoose';

const appRecordSchema = new mongoose.Schema(
  {},
  {
    collection: 'app_records',
    discriminatorKey: 'recordType',
    timestamps: true,
  }
);

const AppRecord = mongoose.model('AppRecord', appRecordSchema);
export default AppRecord;