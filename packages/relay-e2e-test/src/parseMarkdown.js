/**
 * @flow
 */

'use strict';

export type CodeBlock = {
  filename: string,
  content: string,
};

export type ParsedFixture = {
  codeBlocks: Array<CodeBlock>,
  steps: Array<string>,
};

/**
 * Extracts code fences with `title="filename"` and `steps` blocks from markdown.
 */
export function parseMarkdown(markdown: string): ParsedFixture {
  const codeBlocks: Array<CodeBlock> = [];
  const fileRegex = /^```\w+\s+title="([^"]+)"\s*\n([\s\S]*?)^```$/gm;
  let match;
  while ((match = fileRegex.exec(markdown)) !== null) {
    codeBlocks.push({
      filename: match[1],
      content: match[2],
    });
  }

  const steps: Array<string> = [];
  const stepsRegex = /^```steps\s*\n([\s\S]*?)^```$/gm;
  while ((match = stepsRegex.exec(markdown)) !== null) {
    for (const line of match[1].split('\n')) {
      const trimmed = line.trim();
      if (trimmed) {
        steps.push(trimmed);
      }
    }
  }

  return {codeBlocks, steps};
}
