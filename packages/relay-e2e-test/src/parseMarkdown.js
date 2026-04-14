/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
  const stepsMatches = [...markdown.matchAll(stepsRegex)];
  if (stepsMatches.length > 1) {
    throw new Error(
      `Expected at most one steps block, found ${stepsMatches.length}.`,
    );
  }
  for (const stepsMatch of stepsMatches) {
    for (const line of stepsMatch[1].split('\n')) {
      const trimmed = line.trim();
      if (trimmed) {
        steps.push(trimmed);
      }
    }
  }

  return {codeBlocks, steps};
}
