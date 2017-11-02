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

const getGoldenMatchers = require('getGoldenMatchers');
const parseGraphQLText = require('parseGraphQLText');
const prettyStringify = require('prettyStringify');

describe('RelayCodeGenerator', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('matches expected output', () => {
    expect('fixtures/code-generator').toMatchGolden(text => {
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
                    id: null,
                    kind: 'Batch',
                    metadata: {},
                    name: doc.name,
                    operation: doc,
                    text: null,
                  };
            return prettyStringify(RelayCodeGenerator.generate(node));
          })
          .join('\n\n');
      } catch (e) {
        return 'ERROR:\n' + e;
      }
    });
  });
});
