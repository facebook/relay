/**
 * @flow
 */

'use strict';

import {screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

type Step = {
  action: 'click' | 'type' | 'wait',
  role?: string,
  name: string,
  value?: string,
};

const USAGE = `Expected step syntax:
  click "Name"             — click element with text "Name"
  click role "Name"        — click element with ARIA role and accessible name
  type "Name" "value"      — type into element with text "Name"
  type role "Name" "value" — type into element with ARIA role and accessible name
  wait "Text"              — wait for element with text "Text" to appear

  role = button | link | textbox | checkbox | etc. (any ARIA role)
  "Name" = accessible name or visible text (must be quoted)`;

function tokenize(line: string): Array<string> {
  const tokens: Array<string> = [];
  const tokenRegex = /("(?:[^"\\]|\\.)*"|\S+)/g;
  let match;
  while ((match = tokenRegex.exec(line)) !== null) {
    tokens.push(match[1]);
  }
  return tokens;
}

function expectQuoted(
  token: string | void,
  label: string,
  line: string,
): string {
  if (token == null) {
    throw new Error(`Missing ${label} in step: ${line}\n\n${USAGE}`);
  }
  if (!token.startsWith('"') || !token.endsWith('"')) {
    throw new Error(
      `${label} must be quoted in step: ${line}\n  Got: ${token}\n\n${USAGE}`,
    );
  }
  return token.slice(1, -1);
}

/**
 * Parses a DSL line into a Step.
 *
 * Supported formats:
 *   click "Name"              -> getByText("Name") + click
 *   click role "Name"         -> getByRole("role", { name: "Name" }) + click
 *   type "Name" "value"       -> getByText("Name") + type
 *   type role "Name" "value"  -> getByRole("role", { name: "Name" }) + type
 */
function parseStep(line: string): Step {
  const tokens = tokenize(line);

  if (tokens.length === 0) {
    throw new Error(`Empty step\n\n${USAGE}`);
  }

  const action = tokens[0];
  if (action !== 'click' && action !== 'type' && action !== 'wait') {
    throw new Error(
      `Unknown action "${action}" in step: ${line}\n  Supported actions: click, type, wait\n\n${USAGE}`,
    );
  }

  if (tokens.length < 2) {
    throw new Error(
      `Missing arguments for "${action}" in step: ${line}\n\n${USAGE}`,
    );
  }

  if (action === 'wait') {
    if (tokens[1].startsWith('"')) {
      if (tokens.length > 2) {
        throw new Error(
          `Too many arguments for wait in step: ${line}\n  Expected: wait "Text" or wait role "Name"\n\n${USAGE}`,
        );
      }
      return {action, name: expectQuoted(tokens[1], 'text', line)};
    }
    // wait role "Name"
    const role = tokens[1];
    const name = expectQuoted(tokens[2], 'name', line);
    if (tokens.length > 3) {
      throw new Error(
        `Too many arguments for wait in step: ${line}\n  Expected: wait ${role} "Name"\n\n${USAGE}`,
      );
    }
    return {action, role, name};
  }

  if (action === 'click') {
    if (tokens[1].startsWith('"')) {
      // click "Name"
      if (tokens.length > 2) {
        throw new Error(
          `Too many arguments for click in step: ${line}\n  Expected: click "Name" or click role "Name"\n\n${USAGE}`,
        );
      }
      return {action, name: expectQuoted(tokens[1], 'name', line)};
    }
    // click role "Name"
    const role = tokens[1];
    const name = expectQuoted(tokens[2], 'name', line);
    if (tokens.length > 3) {
      throw new Error(
        `Too many arguments for click in step: ${line}\n  Expected: click ${role} "Name"\n\n${USAGE}`,
      );
    }
    return {action, role, name};
  }

  // type
  if (tokens[1].startsWith('"')) {
    // type "Name" "value"
    const name = expectQuoted(tokens[1], 'name', line);
    const value = expectQuoted(tokens[2], 'value', line);
    if (tokens.length > 3) {
      throw new Error(
        `Too many arguments for type in step: ${line}\n  Expected: type "Name" "value" or type role "Name" "value"\n\n${USAGE}`,
      );
    }
    return {action, name, value};
  }
  // type role "Name" "value"
  const role = tokens[1];
  const name = expectQuoted(tokens[2], 'name', line);
  const value = expectQuoted(tokens[3], 'value', line);
  if (tokens.length > 4) {
    throw new Error(
      `Too many arguments for type in step: ${line}\n  Expected: type ${role} "Name" "value"\n\n${USAGE}`,
    );
  }
  return {action, role, name, value};
}

function getElement(step: Step): HTMLElement {
  if (step.role) {
    return screen.getByRole(step.role, {name: step.name});
  }
  return screen.getByText(step.name);
}

export async function runInteractions(steps: Array<string>): Promise<void> {
  const user = userEvent.setup();
  for (const line of steps) {
    const step = parseStep(line);
    if (step.action === 'wait') {
      if (step.role) {
        await screen.findByRole(step.role, {name: step.name});
      } else {
        await screen.findByText(step.name, {exact: false});
      }
      continue;
    }
    const element = getElement(step);
    switch (step.action) {
      case 'click':
        await user.click(element);
        break;
      case 'type':
        await user.type(element, step.value || '');
        break;
    }
  }
}
