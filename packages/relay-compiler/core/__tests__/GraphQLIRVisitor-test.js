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

import type {
  Argument,
  ArgumentDefinition,
  Condition,
  Directive,
  Field,
  Fragment,
  FragmentSpread,
  InlineFragment,
  Literal,
  Root,
  Variable,
} from 'GraphQLIR';

const RelayParser = require('RelayParser');
const GraphQLIRPrinter = require('GraphQLIRPrinter');
const RelayTestSchema = require('RelayTestSchema');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');
const {visit} = require('GraphQLIRVisitor');

type VisitNodeWithName =
  | Root
  | Fragment
  | Field
  | FragmentSpread
  | Argument
  | Directive
  | ArgumentDefinition;

describe('GraphQLIRVisitor', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/visitor/no-op-visit`,
    text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const sameAst = ast.map(fragment => visit(fragment, {}));
      return sameAst.map(doc => GraphQLIRPrinter.print(doc)).join('\n');
    },
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/visitor/mutate-visit`,
    text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const mutateNameVisitor = {
        leave: (node: VisitNodeWithName) => {
          return {
            ...node,
            name: node.name + '_mutated',
          };
        },
      };

      const mutatedAst = ast.map(fragment =>
        visit(fragment, {
          Argument: mutateNameVisitor,
          Directive: mutateNameVisitor,
          Fragment: mutateNameVisitor,
          FragmentSpread: mutateNameVisitor,
          ImportArgumentDefinition: mutateNameVisitor,
          LinkedField: mutateNameVisitor,
          LocalArgumentDefinition: mutateNameVisitor,
          Root: mutateNameVisitor,
          ScalarField: mutateNameVisitor,

          Condition: {
            leave(node: Condition) {
              return {
                ...node,
                passingValue: !node.passingValue,
              };
            },
          },
          InlineFragment: {
            leave(node: InlineFragment) {
              return {
                ...node,
                typeCondition: 'Mutated',
              };
            },
          },
          Literal: {
            leave(node: Literal) {
              return {
                ...node,
                value: Array.isArray(node.value)
                  ? node.value.map(item => String(node.value) + '_mutated')
                  : String(node.value) + '_mutated',
              };
            },
          },
          Variable: {
            leave(node: Variable) {
              return {
                ...node,
                variableName: node.variableName + '_mutated',
              };
            },
          },
        }),
      );

      return mutatedAst.map(doc => GraphQLIRPrinter.print(doc)).join('\n');
    },
  );
});
