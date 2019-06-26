/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
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

const CompilerContext = require('../core/GraphQLCompilerContext');
const IRTransformer = require('../core/GraphQLIRTransformer');

const {
  getNullableType,
  isEnumType,
  isNullableType,
  isListType,
} = require('graphql');

import type {Fragment, Root} from '../core/GraphQLIR';
import type {GraphQLOutputType, GraphQLList} from 'graphql';

// The purpose of this directive is to add GraphQL type inform for fields in
// the operation selection in order to use in in RelayMockPayloadGenerator
// to generate better mock values, and expand the API of MockResolvers
const SCHEMA_EXTENSION =
  'directive @relay_test_operation on QUERY | MUTATION | SUBSCRIPTION';

function testOperationDirective(context: CompilerContext): CompilerContext {
  return IRTransformer.transform(context, {
    Fragment: node => node,
    Root: visitRoot,
    SplitOperation: node => node,
  });
}

type TypeDetails = {|
  +type: string,
  +plural: boolean,
  +nullable: boolean,
  +enumValues: null | $ReadOnlyArray<string>,
|};

function getTypeDetails(
  fieldType: GraphQLOutputType | GraphQLList<GraphQLOutputType>,
): TypeDetails {
  const nullableType = getNullableType(fieldType);
  const isNullable = isNullableType(fieldType);
  const isPlural = isListType(nullableType);
  const type = isListType(nullableType)
    ? getNullableType(nullableType.ofType)
    : nullableType;

  return {
    type: isListType(type) ? String(type) : type != null ? type.name : 'String',
    enumValues: isEnumType(type)
      ? type.getValues().map(val => val.value)
      : null,
    plural: isPlural,
    nullable: isNullable,
  };
}

function visitRoot(node: Root) {
  const testDirective = node.directives.find(
    directive => directive.name === 'relay_test_operation',
  );
  if (testDirective == null) {
    return node;
  }

  const context = this.getContext();
  const queue = [
    {
      selections: node.selections,
      path: [],
    },
  ];
  const selectionsTypeInfo = {};
  while (queue.length > 0) {
    const {selections: currentSelections, path} = queue.pop();
    currentSelections.forEach(selection => {
      switch (selection.kind) {
        case 'FragmentSpread':
          const fragment: ?Fragment = context.get(selection.name);
          if (fragment != null) {
            queue.unshift({
              selections: fragment.selections,
              path,
            });
          }
          break;
        case 'ScalarField': {
          const nextPath = [...path, selection.alias ?? selection.name];
          selectionsTypeInfo[nextPath.join('.')] = getTypeDetails(
            selection.type,
          );
          break;
        }
        case 'ConnectionField':
        case 'LinkedField': {
          const nextPath = [...path, selection.alias ?? selection.name];
          selectionsTypeInfo[nextPath.join('.')] = getTypeDetails(
            selection.type,
          );
          queue.unshift({
            selections: selection.selections,
            path: nextPath,
          });
          break;
        }
        case 'Condition':
        case 'ClientExtension':
        case 'Defer':
        case 'InlineDataFragmentSpread':
        case 'InlineFragment':
        case 'ModuleImport':
        case 'Stream':
          queue.unshift({
            selections: selection.selections,
            path,
          });
          break;
        default:
          (selection: empty);
          break;
      }
    });
  }
  return {
    ...node,
    directives: node.directives.filter(
      directive => directive !== testDirective,
    ),
    metadata: {
      ...(node.metadata || {}),
      relayTestingSelectionTypeInfo: selectionsTypeInfo,
    },
  };
}

module.exports = {
  SCHEMA_EXTENSION,
  transform: testOperationDirective,
};
