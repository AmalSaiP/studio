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
  prompt: `You are an expert financial advisor AI. Based on the user profile below, recommend technical indicators, trading strategies, and explain your reasoning.

  User Profile:
  - Trading Goals: {{{tradingGoals}}}
  - Experience Level: {{{experienceLevel}}}
  - Asset Type: {{{assetType}}}
  `,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
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
