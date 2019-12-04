/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @emails oncall+relay
 */

// flowlint ambiguous-object-type:error

'use strict';

const CompilerContext = require('../CompilerContext');
const IRTransformer = require('../IRTransformer');
const IRValidator = require('../IRValidator');

const {TestSchema, parseGraphQLText} = require('relay-test-utils-internal');

describe('IRValidator', () => {
  it('should have same behavior as the IRTransformer', () => {
    const {definitions, schema: extendedSchema} = parseGraphQLText(
      TestSchema.extend(['directive @test on FRAGMENT_DEFINITION']),
      `
   query TestQuery($id: ID!, $condition: Boolean = false) {
     node(id: $id) {
       ...on User {
         id
         ...UserProfile @include(if: $condition)
       }
       ...Foo @arguments(localId: $id)
     }
   }

   query ListArgumentQuery {
     route(waypoints: [{
       lat: "0.0"
       lon: "0.0"
     }]) {
       steps {
         note
       }
     }
   }

   fragment UserProfile on User @test {
     profilePicture(size: $ProfilePicture_SIZE) {
       ...PhotoFragment
     }
   }

   fragment PhotoFragment on Image @argumentDefinitions(
     id: {type: "ID"}
     sizes: {type: "[Int]", defaultValue: [32, 64, 128]}
     scale: {type: "Int"}
   ) {
     uri
   }

   fragment Foo on User @argumentDefinitions(localId: {type: "ID!"}){
     id
   }
 `,
    );
    const context = new CompilerContext(extendedSchema).addAll(definitions);

    const astKinds = [
      'Argument',
      'Condition',
      'Directive',
      'Fragment',
      'FragmentSpread',
      'InlineFragment',
      'LinkedField',
      'Literal',
      'LocalArgumentDefinition',
      'Root',
      'ScalarField',
      'Variable',
    ];

    function recordSequnce(func) {
      const sequence = [];
      const seenKinds = new Set();
      function createRecorder(kind) {
        return function(node, state) {
          expect(node.kind).toBe(kind);
          sequence.push(kind);
          seenKinds.add(kind);
          this.traverse(node, state);
        };
      }

      const visitors = {};

      astKinds.forEach(kind => {
        visitors[kind] = createRecorder(kind);
      });
      // $FlowFixMe: Cannot call `func` with `visitors` bound to `visitor`
      func(context, visitors, node => {
        sequence.push(`${node.kind} ${node.name}`);
        return {};
      });
      expect(Array.from(astKinds).sort()).toEqual(Array.from(seenKinds).sort());
      return sequence;
    }
    const validatorSeq = recordSequnce(IRValidator.validate);
    const transformerSeq = recordSequnce(IRTransformer.transform);
    expect(validatorSeq).toEqual(transformerSeq);
  });
});
