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

'use strict';

const GraphQLCompilerContext = require('../GraphQLCompilerContext');
const GraphQLIRTransformer = require('../GraphQLIRTransformer');
const GraphQLIRValidator = require('../GraphQLIRValidator');
const Schema = require('../Schema');

const {transformASTSchema} = require('../ASTConvert');
const {TestSchema, parseGraphQLText} = require('relay-test-utils-internal');

describe('GraphQLIRValidator', () => {
  it('should have same behavior as the GraphQLIRTransformer', () => {
    const {definitions} = parseGraphQLText(
      transformASTSchema(TestSchema, [
        'directive @test on FRAGMENT_DEFINITION',
      ]),
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
    const context = new GraphQLCompilerContext(
      Schema.DEPRECATED__create(TestSchema),
    ).addAll(definitions);

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
    const validatorSeq = recordSequnce(GraphQLIRValidator.validate);
    const transformerSeq = recordSequnce(GraphQLIRTransformer.transform);
    expect(validatorSeq).toEqual(transformerSeq);
  });
});
