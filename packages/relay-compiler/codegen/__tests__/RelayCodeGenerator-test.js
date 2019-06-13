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

const ASTConvert = require('../../core/ASTConvert');
const CodeMarker = require('../../util/CodeMarker');
const CompilerContext = require('../../core/GraphQLCompilerContext');
const RelayCodeGenerator = require('../RelayCodeGenerator');
const RelayMatchTransform = require('../../transforms/RelayMatchTransform');
const RelayRelayDirectiveTransform = require('../../transforms/RelayRelayDirectiveTransform');

const {
  TestSchema,
  generateTestsFromFixtures,
  parseGraphQLText,
} = require('relay-test-utils-internal');

describe('RelayCodeGenerator', () => {
  const schema = ASTConvert.transformASTSchema(TestSchema, [
    RelayMatchTransform.SCHEMA_EXTENSION,
    RelayRelayDirectiveTransform.SCHEMA_EXTENSION,
  ]);

  generateTestsFromFixtures(`${__dirname}/fixtures/code-generator`, text => {
    try {
      const {definitions} = parseGraphQLText(schema, text);
      return new CompilerContext(TestSchema, schema)
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
                  loc: doc.loc,
                  metadata: {},
                  name: doc.name,
                  root: doc,
                  text: null,
                };
          return CodeMarker.postProcess(
            /* $FlowFixMe(>=0.98.0 site=react_native_fb,oss) This comment
             * suppresses an error found when Flow v0.98 was deployed. To see
             * the error delete this comment and run Flow. */
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
