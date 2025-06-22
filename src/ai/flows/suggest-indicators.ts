// use server'
'use server';

/**
 * @fileOverview AI agent that recommends relevant technical indicators and strategies based on user trading goals.
 *
 * - suggestIndicators - A function that suggests technical indicators and strategies.
 * - SuggestIndicatorsInput - The input type for the suggestIndicators function.
 * - SuggestIndicatorsOutput - The return type for the suggestIndicators function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestIndicatorsInputSchema = z.object({
  tradingGoals: z
    .string()
    .describe('The trading goals of the user, e.g., short-term gains, long-term investment, risk tolerance.'),
  experienceLevel: z
    .string()
    .describe('The experience level of the user, e.g., beginner, intermediate, advanced.'),
  assetType: z
    .string()
    .describe('The type of asset the user is trading, e.g., stocks, options, futures.'),
});

export type SuggestIndicatorsInput = z.infer<typeof SuggestIndicatorsInputSchema>;

const SuggestIndicatorsOutputSchema = z.object({
  indicators: z
    .array(z.string())
    .describe('A list of relevant technical indicators based on the trading goals.'),
  strategies: z
    .array(z.string())
    .describe('A list of trading strategies that align with the trading goals.'),
  explanation: z
    .string()
    .describe('Explanation of why these indicators and strategies are recommended.'),
});

export type SuggestIndicatorsOutput = z.infer<typeof SuggestIndicatorsOutputSchema>;

export async function suggestIndicators(input: SuggestIndicatorsInput): Promise<SuggestIndicatorsOutput> {
  return suggestIndicatorsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestIndicatorsPrompt',
  input: {schema: SuggestIndicatorsInputSchema},
  output: {schema: SuggestIndicatorsOutputSchema},
  prompt: `You are an AI assistant that provides recommendations for technical indicators and strategies based on the user's trading goals, experience level, and asset type.

  Trading Goals: {{{tradingGoals}}}
  Experience Level: {{{experienceLevel}}}
  Asset Type: {{{assetType}}}

  Based on this information, provide a list of relevant technical indicators, trading strategies, and an explanation for each recommendation.
  Respond in JSON format.
  Ensure the indicators and strategies align with the user's provided trading goals, experience level, and asset type.
  Do not recommend indicators or strategies that are not relevant to the user's goals or experience level.
  Do not include examples in your response.
  Do not respond as a conversational chatbot.
  Remember, you MUST respond in JSON format.
  Do not wrap your JSON response in markdown or code blocks.
  `,config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const suggestIndicatorsFlow = ai.defineFlow(
  {
    name: 'suggestIndicatorsFlow',
    inputSchema: SuggestIndicatorsInputSchema,
    outputSchema: SuggestIndicatorsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
