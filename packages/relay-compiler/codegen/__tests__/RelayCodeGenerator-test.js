/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 * @emails oncall+relay
 */

'use strict';

const CodeMarker = require('../../util/CodeMarker');
const RelayCodeGenerator = require('../RelayCodeGenerator');
const RelayMatchTransform = require('../../transforms/RelayMatchTransform');
const RelayRelayDirectiveTransform = require('../../transforms/RelayRelayDirectiveTransform');
const RelayTestSchema = require('RelayTestSchema');

const parseGraphQLText = require('parseGraphQLText');

const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const {ASTConvert, CompilerContext} = require('graphql-compiler');

describe('RelayCodeGenerator', () => {
  const schema = ASTConvert.transformASTSchema(RelayTestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
    RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(`${__dirname}/fixtures/code-generator`, text => {
    try {
      const {definitions} = parseGraphQLText(schema, text);
      return new CompilerContext(RelayTestSchema, schema)
        .addAll(definitions)
        .applyTransforms([
          // Requires Relay directive transform first.
          RelayRelayDirectiveTransform.transform,
          RelayMatchTransform.transform,
        ])
        .documents()
        .map(doc => {
          const node =
            doc.kind === 'Fragment'
              ? doc
              : {
                  kind: 'Request',
                  fragment: (null: $FlowFixMe),
                  id: null,
                  metadata: {},
                  name: doc.name,
                  root: doc,
                  text: null,
                };
          return CodeMarker.postProcess(
            JSON.stringify(RelayCodeGenerator.generate(node), null, 2),
            moduleName => `require('${moduleName}')`,
          );
        })
        .join('\n\n');
    } catch (e) {
      return 'ERROR:\n' + e;
    }
  });
});
