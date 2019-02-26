/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

const GraphQLIRPrinter = require('../GraphQLIRPrinter');
const RelayParser = require('../RelayParser');
const RelayTestSchema = require('RelayTestSchema');

const {visit} = require('../GraphQLIRVisitor');
const {generateTestsFromFixtures} = require('RelayModernTestUtils');

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
          MatchBranch: mutateNameVisitor,
          ImportArgumentDefinition: mutateNameVisitor,
          LinkedField: mutateNameVisitor,
          MatchField: mutateNameVisitor,
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
              const mutator = value => {
                // Keep enums valid
                if (value === 'WEB') {
                  return 'MOBILE';
                } else if (value === 'HELPFUL') {
                  return 'DERISIVE';
                } else if (typeof value === 'number') {
                  return value + 10;
                } else {
                  return String(value) + '_mutated';
                }
              };
              return {
                ...node,
                value: Array.isArray(node.value)
                  ? node.value.map(mutator)
                  : mutator(node.value),
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
