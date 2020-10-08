/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const compiler = require('../lib');

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

    const result = compiler.compile(schema, documents);

    expect(Array.isArray(result.artifacts)).toBe(true);
    expect(result.artifacts[0].name).toBe('User_name');
    expect(result.artifacts[0].path).toBe('__generated__/User_name.graphql.js');
    expect(result.artifacts[0].content).toContain(
      '1c46bf17659f42c63d533bcffa16df06',
    );
    expect(result.artifacts[1].name).toBe('Node_id');
    expect(result.artifacts[1].path).toBe('__generated__/Node_id.graphql.js');
    expect(result.artifacts[1].content).toContain(
      'c065f4f3649ff2cf218b956f2cb5ee13',
    );
  });

  it('should throw for invalid documents', () => {
    expect(() =>
      compiler.compile('type User { name: String }', ['fragment User ....']),
    ).toThrow("Expected a non-variable identifier");
  });
});
