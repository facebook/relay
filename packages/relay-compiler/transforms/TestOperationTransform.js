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

const IRTransformer = require('../core/GraphQLIRTransformer');

import type CompilerContext from '../core/GraphQLCompilerContext';
import type {Fragment, Root} from '../core/GraphQLIR';
import type {Schema, TypeID} from '../core/Schema';

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

function getTypeDetails(schema: Schema, fieldType: TypeID): TypeDetails {
  const nullableType = schema.getNullableType(fieldType);
  const isNullable = !schema.isNonNull(fieldType);
  const isPlural = schema.isList(nullableType);
  const type = schema.getRawType(nullableType);

  return {
    type: schema.getTypeString(type),
    enumValues: schema.isEnum(type)
      ? schema.getEnumValues(schema.assertEnumType(type))
      : null,
    plural: isPlural,
    nullable: isNullable,
  };
}

function visitRoot(node: Root) {
  const schema: Schema = this.getContext().getSchema();
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
      path: null,
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
          const nextPath =
            path === null ? selection.alias : `${path}.${selection.alias}`;
          selectionsTypeInfo[nextPath] = getTypeDetails(schema, selection.type);
          break;
        }
        case 'ConnectionField':
        case 'LinkedField': {
          const nextPath =
            path === null ? selection.alias : `${path}.${selection.alias}`;
          selectionsTypeInfo[nextPath] = getTypeDetails(schema, selection.type);
          queue.unshift({
            selections: selection.selections,
            path: nextPath,
          });
          break;
        }
        case 'Condition':
        case 'Connection':
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
