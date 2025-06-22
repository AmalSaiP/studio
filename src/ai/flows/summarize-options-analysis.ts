// Options Analyzer: Summarize Findings in Plain English

'use server';

/**
 * @fileOverview Summarizes the AI's options analysis findings in plain English.
 *
 * - summarizeOptionsAnalysis - A function that handles the summarization of options analysis.
 * - SummarizeOptionsAnalysisInput - The input type for the summarizeOptionsAnalysis function.
 * - SummarizeOptionsAnalysisOutput - The return type for the summarizeOptionsAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeOptionsAnalysisInputSchema = z.object({
  analysisData: z
    .string()
    .describe(
      'The AI analysis of option chain data, including open interest, implied volatility, and Greeks analysis.'
    ),
});
export type SummarizeOptionsAnalysisInput = z.infer<typeof SummarizeOptionsAnalysisInputSchema>;

const SummarizeOptionsAnalysisOutputSchema = z.object({
  summary: z.string().describe('A plain English summary of the options analysis.'),
  opportunities: z.string().describe('Key opportunities identified in the analysis.'),
  risks: z.string().describe('Potential risks identified in the analysis.'),
});
export type SummarizeOptionsAnalysisOutput = z.infer<typeof SummarizeOptionsAnalysisOutputSchema>;

export async function summarizeOptionsAnalysis(input: SummarizeOptionsAnalysisInput): Promise<SummarizeOptionsAnalysisOutput> {
  return summarizeOptionsAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeOptionsAnalysisPrompt',
  input: {schema: SummarizeOptionsAnalysisInputSchema},
  output: {schema: SummarizeOptionsAnalysisOutputSchema},
  prompt: `You are an AI options trading expert. Your task is to summarize the findings of an AI analysis of options chain data in plain English, highlighting key opportunities and risks for the user.

Analysis Data: {{{analysisData}}}

Summary:
Opportunities:
Risks: `,
});

const summarizeOptionsAnalysisFlow = ai.defineFlow(
  {
    name: 'summarizeOptionsAnalysisFlow',
    inputSchema: SummarizeOptionsAnalysisInputSchema,
    outputSchema: SummarizeOptionsAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
