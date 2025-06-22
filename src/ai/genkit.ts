'use server';
/**
 * @fileoverview This file initializes the Genkit AI singleton.
 *
 * It is important that this file is imported before any other Genkit files.
 */
import {genkit as initGenkit} from '@genkit-ai/ai';
import {googleAI} from '@genkit-ai/googleai';

// IMPORTANT: Set your Google AI API key in the .env file.
const genkitKey = process.env.GOOGLE_GENAI_API_KEY;

if (!genkitKey) {
  console.warn(
    'GOOGLE_GENAI_API_KEY is not set. Please set it in your .env file.'
  );
}

export const ai = initGenkit({
  plugins: [
    googleAI({
      apiKey: genkitKey,
    }),
  ],
});
