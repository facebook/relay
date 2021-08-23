/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

const playground = require('../');

const SCHEMA = `
type User {
  name: String
  age: Int
  best_friend: User
}

type Query {
  me: User
}`;

const DOCUMENT = `
query MyQuery {
    me {
        name
        ...AgeFragment
        best_friend {
        ...AgeFragment
        }
    }
}

fragment AgeFragment on User {
    age
}`;

const MALFORMED_SCHEMA = `
type User {
  name: String
  best_friend: InvalidType
}

type Query {
  me: User
}`;

// Syntax error
const MALFORMED_DOCUMENT = `
query MyQuery {
    me {
        {
    }
}
`;

// Invalid with regards to schema
const INVALID_DOCUMENT = `
query MyQuery {
    me {
        does_not_exist
    }
}
`;

describe('Ok', () => {
  test('parse_to_ast', () => {
    const actual = JSON.parse(playground.parse_to_ast(DOCUMENT));
    expect(actual.Ok).toMatch(/^ExecutableDocument/);
  });

  test('parse_to_ir', () => {
    const actual = JSON.parse(playground.parse_to_ir(SCHEMA, DOCUMENT));
    expect(actual.Ok).toMatch(/^Operation/);
  });

  test('parse_to_reader_ast', () => {
    const actual = JSON.parse(playground.parse_to_reader_ast(SCHEMA, DOCUMENT));
    expect(actual.Ok).toMatchSnapshot();
  });

  test('transform', () => {
    const actual = JSON.parse(playground.transform(SCHEMA, DOCUMENT));
    expect(actual.Ok).toMatchSnapshot();
  });
});

describe('Err', () => {
  test('parse_to_ast', () => {
    const actual = JSON.parse(playground.parse_to_ast(MALFORMED_DOCUMENT));
    expect(actual.Err).toEqual({
      DocumentDiagnostics: [
        {
          column_end: 0,
          column_start: 8,
          line_end: 4,
          line_start: 3,
          message:
            'Expected a selection: field, inline fragment, or fragment spread:<generated>:34:35\n',
        },
      ],
    });
  });

  test('parse_to_ir', () => {
    const actual = JSON.parse(playground.parse_to_ir(SCHEMA, INVALID_DOCUMENT));
    expect(actual.Err).toEqual({
      DocumentDiagnostics: [
        {
          column_end: 0,
          column_start: 8,
          line_end: 4,
          line_start: 3,
          message:
            'The type `User` has no field `does_not_exist`:<generated>:34:48\n',
        },
      ],
    });
  });

  test('parse_to_ir schema error', () => {
    const actual = JSON.parse(
      playground.parse_to_ir(MALFORMED_SCHEMA, DOCUMENT),
    );
    expect(actual.Err).toEqual({
      SchemaDiagnostics: [
        {
          // Schema diagnostics don't have location info :(
          column_end: 0,
          column_start: 0,
          line_end: 1,
          line_start: 1,
          message:
            "Reference to undefined type 'InvalidType'.:<generated>:0:0\n",
        },
      ],
    });
  });

  test('parse_to_reader_ast', () => {
    const actual = JSON.parse(
      playground.parse_to_reader_ast(SCHEMA, INVALID_DOCUMENT),
    );
    expect(actual.Err).toEqual({
      DocumentDiagnostics: [
        {
          column_end: 0,
          column_start: 8,
          line_end: 4,
          line_start: 3,
          message:
            'The type `User` has no field `does_not_exist`:<generated>:34:48\n',
        },
      ],
    });
  });

  test('transform', () => {
    const actual = JSON.parse(playground.transform(SCHEMA, INVALID_DOCUMENT));
    expect(actual.Err).toEqual({
      DocumentDiagnostics: [
        {
          column_end: 0,
          column_start: 8,
          line_end: 4,
          line_start: 3,
          message:
            'The type `User` has no field `does_not_exist`:<generated>:34:48\n',
        },
      ],
    });
  });
});
