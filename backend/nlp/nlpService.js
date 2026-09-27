/**
 * NexaChat Modular NLP Service Facade
 * 
 * Provides an isolated interface for text processing, intent classification,
 * entity extraction, and response generation.
 * Can be swapped or extended with LLM adapters (OpenAI/Gemini/Ollama) effortlessly.
 */

import { preprocessText, tokenizeMeaningful } from './tokenizer.js';
import { stemTokens } from './stemmer.js';
import { extractEntities } from './entityExtractor.js';
import { classifyIntent } from './intentClassifier.js';
import { generateResponse } from './responseGenerator.js';

export class NLPService {
  constructor() {
    this.name = 'NexaNLP-Modular-Engine';
    this.version = '1.0.0';
  }

  /**
   * Process incoming user message and generate a response payload
   */
  async processMessage({ text, user = null, context = [] }) {
    // 1. Text Preprocessing & Tokenization
    const cleanedText = preprocessText(text);
    const tokens = tokenizeMeaningful(text);
    const stems = stemTokens(tokens);

    // 2. Entity Extraction
    const entities = extractEntities(text);

    // 3. Intent Classification
    const { intent, confidence } = classifyIntent(text);

    // 4. Response Generation
    const responseContent = generateResponse({
      text,
      intent,
      entities,
      user,
      context
    });

    return {
      content: responseContent,
      metadata: {
        intent,
        confidence,
        entities,
        model: this.name,
        tokensCount: tokens.length,
      }
    };
  }
}

export const nlpService = new NLPService();
export default nlpService;
