/**
 * Robust Shell Tokenizer
 * Correctly handles double quotes, single quotes, escaped characters,
 * equal sign assignments, and trailing whitespace.
 */
export class ShellTokenizer {
  public static tokenize(input: string): string[] {
    const tokens: string[] = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';
    let isEscaped = false;

    const trimmed = input.trim();

    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed[i];

      if (isEscaped) {
        current += char;
        isEscaped = false;
        continue;
      }

      if (char === '\\') {
        isEscaped = true;
        continue;
      }

      if ((char === '"' || char === "'") && (!inQuote || quoteChar === char)) {
        if (inQuote) {
          inQuote = false;
          quoteChar = '';
        } else {
          inQuote = true;
          quoteChar = char;
        }
        continue;
      }

      if (char === ' ' && !inQuote) {
        if (current.length > 0) {
          tokens.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current.length > 0) {
      tokens.push(current);
    }

    return tokens;
  }
}
