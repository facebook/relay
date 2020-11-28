/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const compiler = require('../');

describe('compiler extensions', () => {
  it('it should compile', () => {
    const schema = `
        interface Node {
            id: ID!
        }
        type User implements Node {
            id: ID!
            name: String
        }
    `;

    const documents = [
      `
        fragment User_name on User {
            id
            name
        }
    `,
      `
        fragment Node_id on Node {
            __typename
            id
        }
    `,
    ];

    compiler.compile(schema, documents);

    // TODO: Validate the output of the compiler
    // Currently compiler will just print the schema - but won't actually compile anything
    // This test will just ensure that the API isn't throwing.
  });

  it('should throw for invalid documents', () => {
    expect(() =>
      compiler.compile('type User { name: String }', ['fragment User ....']),
    ).toThrow();
  });
});
