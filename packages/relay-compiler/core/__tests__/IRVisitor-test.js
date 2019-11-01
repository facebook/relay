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

const IRPrinter = require('../IRPrinter');
const RelayParser = require('../RelayParser');
const Schema = require('../Schema');

const {visit} = require('../IRVisitor');
const {
  TestSchema,
  generateTestsFromFixtures,
} = require('relay-test-utils-internal');

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
} from '../IR';

type VisitNodeWithName =
  | Root
  | Fragment
  | Field
  | FragmentSpread
  | Argument
  | Directive
  | ArgumentDefinition;

const schema = Schema.DEPRECATED__create(TestSchema);

describe('IRVisitor', () => {
  generateTestsFromFixtures(
    `${__dirname}/fixtures/visitor/no-op-visit`,
    text => {
      const ast = RelayParser.parse(schema, text);
      const sameAst = ast.map(fragment => visit(fragment, {}));
      return sameAst.map(doc => IRPrinter.print(schema, doc)).join('\n');
    },
  );

  generateTestsFromFixtures(
    `${__dirname}/fixtures/visitor/mutate-visit`,
    text => {
      const ast = RelayParser.parse(schema, text);
      const mutateNameVisitor = {
        leave: (node: VisitNodeWithName) => {
          return {
            ...node,
            name: node.name + '_mutated',
          };
        },
      };
      const mutatedAst = ast.map(fragment =>
        // $FlowFixMe: Cannot call `visit` with object literal bound to `visitor`
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

      return mutatedAst.map(doc => IRPrinter.print(schema, doc)).join('\n');
    },
  );
});
