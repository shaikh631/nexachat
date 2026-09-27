/**
 * NexaChat Intent Classifier
 */

import { preprocessText, tokenizeMeaningful } from './tokenizer.js';
import { stemTokens } from './stemmer.js';

const INTENT_RULES = [
  {
    intent: 'greeting',
    patterns: [
      /^(hi|hello|hey|greetings|good morning|good afternoon|good evening|howdy|sup|yo)\b/i,
      /\b(hello nexa|hi nexa|hey nexa|hello assistant|can you help me)\b/i
    ],
    keywords: ['hi', 'hello', 'hey', 'greetings', 'morning', 'afternoon', 'evening', 'howdy', 'yo', 'sup']
  },
  {
    intent: 'introduction',
    patterns: [
      /\b(who are you|what is your name|who made you|who created you|tell me about yourself|what are you)\b/i,
      /\b(introduce yourself|your identity|what is nexachat)\b/i
    ],
    keywords: ['identity', 'name', 'who', 'created', 'built', 'introduce', 'yourself']
  },
  {
    intent: 'general_questions',
    patterns: [
      /^(what is|explain|define|tell me about|what does|why is|difference between)\b/i,
      /\b(what is leetcode|what is mongodb|what is react|what is rest api|what is jwt)\b/i
    ],
    keywords: ['what', 'explain', 'define', 'how', 'why', 'difference', 'concept', 'meaning', 'leetcode']
  },
  {
    intent: 'code_help',
    patterns: [
      /\b(write a|write code|create a|build a|generate code|code snippet|function example|mongoose schema|react hook|express route|html snippet|css snippet)\b/i,
      /\b(how to create|how to write|how to build|how to implement)\b/i
    ],
    keywords: ['write', 'create', 'build', 'snippet', 'schema', 'mongoose', 'implement', 'hook', 'algorithm']
  },
  {
    intent: 'thanks',
    patterns: [
      /\b(thank you|thanks|thx|thank|cheers|awesome|great|perfect|much appreciated)\b/i
    ],
    keywords: ['thanks', 'thank', 'thx', 'cheers', 'awesome', 'great', 'appreciated']
  },
  {
    intent: 'goodbye',
    patterns: [
      /\b(bye|goodbye|see you|see ya|farewell|cya|take care|have a good day)\b/i
    ],
    keywords: ['bye', 'goodbye', 'farewell', 'cya', 'later']
  },
  {
    intent: 'help',
    patterns: [
      /\b(help|can you help|i need help|what can you do|how to use|features|options|instructions)\b/i
    ],
    keywords: ['help', 'features', 'capabilities', 'guide', 'assist', 'instructions', 'options']
  },
  {
    intent: 'app_questions',
    patterns: [
      /\b(nexachat|this app|technology stack of nexachat|nexachat tech stack|how does nexachat work|nexachat architecture|nexachat database)\b/i
    ],
    keywords: ['nexachat', 'nexachat stack', 'nexachat architecture', 'nexachat backend', 'nexachat frontend']
  }
];

export function classifyIntent(text = '') {
  const normalized = preprocessText(text);
  if (!normalized) {
    return { intent: 'fallback', confidence: 0.0 };
  }

  // 1. Direct Regex Pattern Matching (Highest Precision)
  for (const rule of INTENT_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(text)) {
        return {
          intent: rule.intent,
          confidence: 0.95
        };
      }
    }
  }

  // 2. Keyword & Stem Overlap Scoring
  const tokens = tokenizeMeaningful(text);
  const stemmedTokens = stemTokens(tokens);

  let bestIntent = 'fallback';
  let maxScore = 0;

  for (const rule of INTENT_RULES) {
    let matches = 0;
    const ruleStems = stemTokens(rule.keywords);

    stemmedTokens.forEach(t => {
      if (ruleStems.includes(t)) {
        matches += 1;
      }
    });

    const score = tokens.length > 0 ? matches / tokens.length : 0;
    if (score > maxScore && score >= 0.25) {
      maxScore = score;
      bestIntent = rule.intent;
    }
  }

  if (bestIntent !== 'fallback') {
    return {
      intent: bestIntent,
      confidence: Math.min(0.9, Math.max(0.5, maxScore * 1.5))
    };
  }

  return {
    intent: 'fallback',
    confidence: 0.3
  };
}
