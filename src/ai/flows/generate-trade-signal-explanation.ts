// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview Explains the reasoning behind AI-generated buy/sell signals to help users evaluate recommendations.
 *
 * - generateTradeSignalExplanation - A function that generates an explanation for a trade signal.
 * - GenerateTradeSignalExplanationInput - The input type for the generateTradeSignalExplanation function.
 * - GenerateTradeSignalExplanationOutput - The return type for the generateTradeSignalExplanation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTradeSignalExplanationInputSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the stock or F&O.'),
  signalType: z
    .enum(['buy', 'sell'])
    .describe('The type of signal (buy or sell).'),
  reasoning: z
    .string()
    .describe(
      'The reasoning behind the signal, including technical indicators and data points.'
    ),
});
export type GenerateTradeSignalExplanationInput = z.infer<
  typeof GenerateTradeSignalExplanationInputSchema
>;

const GenerateTradeSignalExplanationOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A detailed explanation of the buy/sell signal, understandable by a user.'
    ),
});
export type GenerateTradeSignalExplanationOutput = z.infer<
  typeof GenerateTradeSignalExplanationOutputSchema
>;

export async function generateTradeSignalExplanation(
  input: GenerateTradeSignalExplanationInput
): Promise<GenerateTradeSignalExplanationOutput> {
  return generateTradeSignalExplanationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTradeSignalExplanationPrompt',
  input: {schema: GenerateTradeSignalExplanationInputSchema},
  output: {schema: GenerateTradeSignalExplanationOutputSchema},
  prompt: `You are an expert financial analyst explaining AI-generated trade signals to users.

  Provide a clear and concise explanation of the reasoning behind the {{{signalType}}} signal for {{{ticker}}}.
  The explanation should be understandable to someone with basic financial knowledge.
  Use the following reasoning provided by the AI:

  {{{reasoning}}}

  Focus on the key factors driving the signal and their potential impact on the user's trading decision.
  Explain the importance of each influencing factor.
  Give more weight and explanation to factors that most strongly influence the buy/sell signal.
  Be concise, but also explain each factor in enough detail that the user can understand.
  If there is any uncertainty in the signal, mention that as well.
  The explanation must be no more than 200 words.
`,
});

const generateTradeSignalExplanationFlow = ai.defineFlow(
  {
    name: 'generateTradeSignalExplanationFlow',
    inputSchema: GenerateTradeSignalExplanationInputSchema,
    outputSchema: GenerateTradeSignalExplanationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
