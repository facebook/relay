/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const {CompilerContext} = require('graphql-compiler');
const requestsForOperation = require('../requestsForOperation');
const RelayTestSchema = require('RelayTestSchema');
const parseGraphQLText = require('parseGraphQLText');

describe('requestsForOperation', () => {
  it('generates nested requests', () => {
    const {definitions} = parseGraphQLText(
      RelayTestSchema,
      `
      query A {
        node(id: 1) {id}
      }
      query B {
        node(id: 1) {id}
      }
      query C {
        node(id: 1) {id}
      }
    `,
    );
    // Multiple dependencies
    definitions[0].dependentRequests = [
      {
        operationName: 'B',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'a.b.c',
          },
        ],
      },
      {
        operationName: 'B',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'x.y.z',
          },
        ],
      },
    ];
    // Multiple dependencies with multiple back-references
    definitions[1].dependentRequests = [
      {
        operationName: 'C',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'back.ref',
          },
          {
            kind: 'ArgumentDependency',
            argumentName: 'bar',
            fromName: 'B',
            fromPath: 'a.b.c',
          },
        ],
      },
      {
        operationName: 'C',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'back.ref',
          },
          {
            kind: 'ArgumentDependency',
            argumentName: 'bar',
            fromName: 'B',
            fromPath: 'x.y.z',
          },
        ],
      },
    ];

    const context = new CompilerContext(RelayTestSchema).addAll(definitions);
    const requests = requestsForOperation(context, context, 'A');
    expect(
      requests.map(({name, argumentDependencies}) => ({
        name,
        argumentDependencies,
      })),
    ).toEqual([
      {name: 'A', argumentDependencies: []},
      {
        name: 'B',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'a.b.c',
          },
        ],
      },
      {
        name: 'C',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'back.ref',
          },
          {
            kind: 'ArgumentDependency',
            argumentName: 'bar',
            fromName: 'B',
            fromPath: 'a.b.c',
          },
        ],
      },
      {
        name: 'C2',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'back.ref',
          },
          {
            kind: 'ArgumentDependency',
            argumentName: 'bar',
            fromName: 'B',
            fromPath: 'x.y.z',
          },
        ],
      },
      {
        name: 'B2',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'x.y.z',
          },
        ],
      },
      {
        name: 'C3',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'back.ref',
          },
          {
            kind: 'ArgumentDependency',
            argumentName: 'bar',
            fromName: 'B2',
            fromPath: 'a.b.c',
          },
        ],
      },
      {
        name: 'C4',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'back.ref',
          },
          {
            kind: 'ArgumentDependency',
            argumentName: 'bar',
            fromName: 'B2',
            fromPath: 'x.y.z',
          },
        ],
      },
    ]);
  });

  it('generates self-referencing requests', () => {
    const {definitions} = parseGraphQLText(
      RelayTestSchema,
      `
      query A {
        node(id: 1) {id}
      }
    `,
    );

    // Self-reference
    definitions[0].dependentRequests = [
      {
        operationName: 'A',
        argumentDependencies: [
          {
            kind: 'ArgumentDependency',
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'a.b.c',
          },
        ],
      },
    ];

    const context = new CompilerContext(RelayTestSchema).addAll(definitions);
    const requests = requestsForOperation(context, context, 'A');
    expect(
      requests.map(({name, argumentDependencies}) => ({
        name,
        argumentDependencies,
      })),
    ).toEqual([
      {
        name: 'A',
        argumentDependencies: [
          {
            argumentName: 'foo',
            fromName: 'A',
            fromPath: 'a.b.c',
            kind: 'ArgumentDependency',
          },
        ],
      },
    ]);
  });
});
