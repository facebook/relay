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

const GraphQLCompilerContext = require('GraphQLCompilerContext');
const RelayCodeGenerator = require('RelayCodeGenerator');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');

describe('RelayCodeGenerator', () => {
  generateTestsFromFixtures(`${__dirname}/fixtures/code-generator`, text => {
    try {
      const {definitions} = parseGraphQLText(RelayTestSchema, text);
      const context = new GraphQLCompilerContext(RelayTestSchema).addAll(
        definitions,
      );
      return context
        .documents()
        .map(doc => {
          const node =
            doc.kind === 'Fragment'
              ? doc
              : {
                  fragment: null,
                  kind: 'Batch',
                  metadata: {},
                  name: doc.name,
                  requests: [
                    {
                      kind: 'Request',
                      name: doc.name,
                      id: null,
                      text: null,
                      argumentDependencies: [],
                      root: doc,
                    },
                  ],
                };
          return JSON.stringify(RelayCodeGenerator.generate(node), null, 2);
        })
        .join('\n\n');
    } catch (e) {
      return 'ERROR:\n' + e;
    }
  });

  generateTestsFromFixtures(
    `${__dirname}/fixtures/code-generator-batch`,
    text => {
      try {
        const {definitions} = parseGraphQLText(RelayTestSchema, text);
        const context = new GraphQLCompilerContext(RelayTestSchema).addAll(
          definitions,
        );
        return context
          .documents()
          .map(doc => {
            const node = {
              fragment: null,
              kind: 'Batch',
              metadata: {},
              name: doc.name,
              requests: [1, 2, 3].map(() => ({
                kind: 'Request',
                name: doc.name,
                id: null,
                text: null,
                argumentDependencies: [],
                root: doc,
              })),
            };
            return JSON.stringify(RelayCodeGenerator.generate(node), null, 2);
          })
          .join('\n\n');
      } catch (e) {
        return 'ERROR:\n' + e.stack;
      }
    },
  );
});
