/**
 * NexaChat NLP Entity Extractor & Typo Normalizer
 */

const TECH_KEYWORDS = [
  'react', 'vite', 'node', 'nodejs', 'express', 'mongodb', 'monogoDB', 'mongo', 'mongoose', 'javascript',
  'typescript', 'tailwind', 'css', 'html', 'python', 'java', 'api', 'rest', 'jwt',
  'json', 'git', 'docker', 'sql', 'nosql', 'redux', 'context', 'hooks', 'nlp', 'llm', 'ai', 'database'
];

export function extractEntities(text = '') {
  const entities = [];
  const lower = text.toLowerCase();

  // 1. Tech stack entities & typo correction
  TECH_KEYWORDS.forEach(tech => {
    const regex = new RegExp(`\\b${tech}\\b`, 'gi');
    if (regex.test(text) || (tech === 'mongodb' && /\b(monogoDB|mongod|mongo)\b/i.test(text))) {
      entities.push({ type: 'technology', value: 'mongodb', label: 'MongoDB' });
    }
  });

  // 2. Email entities
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
  if (emailMatch) {
    emailMatch.forEach(email => {
      entities.push({ type: 'email', value: email });
    });
  }

  // 3. Name introduction patterns ("my name is X", "I am X", "call me X")
  const nameMatch = text.match(/(?:my name is|i am|call me)\s+([a-zA-Z]{2,20})/i);
  if (nameMatch && nameMatch[1]) {
    const candidate = nameMatch[1].trim();
    const reserved = ['a', 'the', 'here', 'ready', 'just', 'testing', 'learning', 'coding'];
    if (!reserved.includes(candidate.toLowerCase())) {
      entities.push({ type: 'user_name', value: candidate });
    }
  }

  // 4. Code query detection
  if (/\b(write|create|build|make|generate|show|code|example|function|class|component)\b/i.test(text)) {
    entities.push({ type: 'intent_flag', value: 'coding_requested' });
  }

  // 5. Question type entities
  if (/\b(how|what|why|where|when|who|which|can you|could you)\b/i.test(text)) {
    const qMatch = text.match(/\b(how|what|why|where|when|who|which|can|could)\b/i);
    if (qMatch) {
      entities.push({ type: 'question_type', value: qMatch[1].toLowerCase() });
    }
  }

  return entities;
}
