/**
 * @flow
 * @format
 */

'use strict';

const print = require('../printGraphQL');

const {parse} = require('graphql');
const path = require('path');
const fs = require('fs');

type OutputFixture = {name: string, input: string, output: string};
type ErrorFixture = {name: string, input: string, error: string};
type PrinterFixture = OutputFixture | ErrorFixture;

describe('printGraphQL', () => {
  const outputFixtures = loadPrinterFixtures()
    .filter(fixture => fixture.output)
    // object key format doesn't work
    .map(fixture => [fixture.name, fixture.input, fixture.output]);

  it.each(outputFixtures)(
    'tests printer idempotence: %s',
    (_name, input, expected) => {
      expect(print(parse(input))).toEqual(expected);
    },
  );
});

function loadPrinterFixtures(): PrinterFixture[] {
  const fixturesPath = path.join(
    __dirname,
    '../../../compiler/crates/graphql-text-printer/tests/print_ast/fixtures',
  );
  const fixtures = [];
  for (const file of fs.readdirSync(fixturesPath)) {
    if (!file.endsWith('.expected')) {
      continue;
    }
    const content = fs.readFileSync(path.join(fixturesPath, file), 'utf8');
    try {
      const fixture = parsePrintFixture(file, content);
      fixtures.push(fixture);
    } catch (err) {
      console.error(err);
    }
  }
  return fixtures;
}

function parsePrintFixture(name: string, content: string): PrinterFixture {
  const successPatttern =
    /^=+ INPUT =+\n(?<input>[\s\S]*)\n=+ OUTPUT =+\n(?<output>[\s\S]*)$/;
  const failurePattern =
    /^=+ INPUT =+\n(?<input>[\s\S]*)\n=+ ERROR =+\n(?<error>[\s\S]*)$/;

  const match = content.match(successPatttern) ?? content.match(failurePattern);
  if (!match) {
    throw new Error(
      `Failed to parse ${name}. Unknown fixture format from the graphql-text-printer crate!`,
    );
  }
  return {...match.groups as any, name} as PrinterFixture;
}
