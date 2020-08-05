/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const Sources = require('../Sources');

const {getName} = require('../GraphQLASTUtils');
const {parseExecutableNode, toASTRecord} = require('../extractAST');

function getNames(sources) {
  return Array.from(sources.nodes()).map(getName);
}

test('create instance from saved state', () => {
  const sources = Sources.fromSavedState({
    extractFromFile: jest.fn(),
    savedState: [
      {file: 'source1.js', sources: ['query Q1 { ...F1 }']},
      {
        file: 'source2.js',
        sources: ['fragment F1 on T { id, name }', 'query Q2 { id }'],
      },
    ],
  });
  expect(getNames(sources)).toEqual(['Q1', 'F1', 'Q2']);
});

test('handle updates in the file', () => {
  const originalText = `
    query Q1_1 {
      ...F1
    }
  `;
  const sources = Sources.fromSavedState({
    extractFromFile: jest.fn(() => {
      return {
        nodes: [toASTRecord(parseExecutableNode(originalText))],
        sources: [originalText],
      };
    }),
    savedState: [
      {file: 'source1.js', sources: ['query Q1 { ...F1 }']},
      {
        file: 'source2.js',
        sources: ['fragment F1 on T { id, name }', 'query Q2 { id }'],
      },
    ],
  });
  const {changes, sources: nextSources} = sources.processChanges('/base-dir', [
    {
      name: 'source1.js',
      exists: true,
      'content.sha1hex': 'abc',
    },
  ]);
  expect(changes.added.map(({ast}) => getName(ast))).toEqual(['Q1_1']);
  expect(changes.removed.map(({ast}) => getName(ast))).toEqual(['Q1']);
  expect(getNames(nextSources)).toEqual(['Q1_1', 'F1', 'Q2']);
});

test('context for parsing errors', () => {
  const sources = new Sources({
    extractFromFile: () => {
      throw new Error('mock syntax error');
    },
    state: {},
  });
  expect(() => {
    sources.processChanges('/base-dir', [
      {
        name: 'source1.js',
        exists: true,
        'content.sha1hex': 'abc',
      },
    ]);
  }).toThrowErrorMatchingInlineSnapshot(`
"RelayCompiler: Sources module failed to parse source1.js:
mock syntax error"
`);
});

test('duplicate node definitions', () => {
  const dupeFragment = `
    fragment Test on User {
      __typename
    }
  `;
  const sources = new Sources({
    extractFromFile: () => {
      return {
        nodes: [
          toASTRecord(parseExecutableNode(dupeFragment)),
          toASTRecord(parseExecutableNode(dupeFragment)),
        ],
        sources: [dupeFragment, dupeFragment],
      };
    },
    state: {},
  });
  expect(() => {
    sources.processChanges('/base-dir', [
      {
        name: 'source1.js',
        exists: true,
        'content.sha1hex': 'abc',
      },
    ]);
  }).toThrowErrorMatchingInlineSnapshot(
    '"Duplicate definition of `Test` in `source1.js`"',
  );
});

test('handle new file', () => {
  const originalText = `
    query Q3 {
      ...F1
    }
  `;
  const sources = Sources.fromSavedState({
    extractFromFile: jest.fn(() => {
      return {
        nodes: [toASTRecord(parseExecutableNode(originalText))],
        sources: [originalText],
      };
    }),
    savedState: [
      {file: 'source1.js', sources: ['query Q1 { ...F1 }']},
      {
        file: 'source2.js',
        sources: ['fragment F1 on T { id, name }', 'query Q2 { id }'],
      },
    ],
  });
  const {changes, sources: nextSources} = sources.processChanges('/base-dir', [
    {
      name: 'source3.js',
      exists: true,
      'content.sha1hex': 'abc',
    },
  ]);
  expect(changes.added.map(({ast}) => getName(ast))).toEqual(['Q3']);
  expect(changes.removed).toEqual([]);
  expect(getNames(nextSources)).toEqual(['Q1', 'F1', 'Q2', 'Q3']);
});

test('handle deleted file', () => {
  const sources = Sources.fromSavedState({
    extractFromFile: jest.fn(),
    savedState: [
      {file: 'source1.js', sources: ['query Q1 { ...F1 }']},
      {
        file: 'source2.js',
        sources: ['fragment F1 on T { id, name }', 'query Q2 { id }'],
      },
    ],
  });
  const {changes, sources: nextSources} = sources.processChanges('/base-dir', [
    {
      name: 'source2.js',
      exists: false,
      'content.sha1hex': null,
    },
  ]);
  expect(changes.added).toEqual([]);
  expect(changes.removed.map(({ast}) => getName(ast))).toEqual(['F1', 'Q2']);
  expect(getNames(nextSources)).toEqual(['Q1']);
});
