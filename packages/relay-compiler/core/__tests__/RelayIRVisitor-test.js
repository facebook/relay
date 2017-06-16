/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
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
} from 'RelayIR';

const RelayParser = require('RelayParser');
const RelayPrinter = require('RelayPrinter');
const RelayTestSchema = require('RelayTestSchema');
const getGoldenMatchers = require('getGoldenMatchers');
const {visit} = require('RelayIRVisitor');

type VisitNodeWithName =
  | Root
  | Fragment
  | Field
  | FragmentSpread
  | Argument
  | Directive
  | ArgumentDefinition;

describe('RelayIRVisitor', () => {
  beforeEach(() => {
    expect.extend(getGoldenMatchers(__filename));
  });

  it('visits and does nothing with each node', () => {
    expect('fixtures/visitor/no-op-visit').toMatchGolden(text => {
      const ast = RelayParser.parse(RelayTestSchema, text);
      const sameAst = ast.map(fragment => visit(fragment, {}));
      return sameAst.map(doc => RelayPrinter.print(doc)).join('\n');
    });
  });
  it('visits and mutates each type of node', () => {
    expect('fixtures/visitor/mutate-visit').toMatchGolden(text => {
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
                value: String(node.value) + '_mutated',
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

      return mutatedAst.map(doc => RelayPrinter.print(doc)).join('\n');
    });
  });
});
