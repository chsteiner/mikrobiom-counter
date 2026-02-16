/**
 * Splits a speech recognition transcript into individual plant name tokens.
 * Handles German conjunctions and common speech patterns.
 */

const DELIMITERS = /\s*(?:,|\bund\b|\bsowie\b|\bauch\b|\bplus\b|\bdann\b|\bnoch\b)\s*/i;

// Common filler words/phrases to strip before matching
const FILLER_PATTERNS = [
  /^ich\s+hab(?:e)?\s+/i,
  /^ich\s+(?:hab|habe)\s+(?:gerade|heute|eben)\s+/i,
  /\s*gegessen\s*/gi,
  /\s*gehabt\s*/gi,
  /\s*dazu\s*/gi,
  /\s*noch\s+(?:etwas|ein(?:en?)?|was)\s*/gi,
  /\s*(?:ein(?:en?)?|etwas|was|viel|wenig)\s+/gi,
  /\s*(?:so|circa|ca|ungefähr|etwa)\s+\d+\s*(?:g|gramm|kg|ml|l|stück|portionen?)?\s*/gi,
  /\s*\d+\s*(?:g|gramm|kg|ml|l|stück|portionen?)\s*/gi,
];

export function parseTranscript(transcript: string): string[] {
  let cleaned = transcript.trim();

  // Remove filler phrases
  for (const pattern of FILLER_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  return cleaned
    .split(DELIMITERS)
    .map(s => s.trim())
    .filter(s => s.length >= 2);
}
