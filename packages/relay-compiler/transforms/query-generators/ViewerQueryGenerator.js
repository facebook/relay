/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const {createUserError} = require('../../core/RelayCompilerError');
const {
  buildFragmentSpread,
  buildOperationArgumentDefinitions,
} = require('./utils');

import type {Fragment} from '../../core/GraphQLIR';
import type {Schema} from '../../core/Schema';
import type {QueryGenerator, RefetchRoot} from '.';

const VIEWER_TYPE_NAME = 'Viewer';
const VIEWER_FIELD_NAME = 'viewer';

function buildRefetchOperation(
  schema: Schema,
  fragment: Fragment,
  queryName: string,
): ?RefetchRoot {
  if (schema.getTypeString(fragment.type) !== VIEWER_TYPE_NAME) {
    return null;
  }
  // Handle fragments on viewer
  const queryType = schema.expectQueryType();
  const viewerType = schema.getTypeFromString(VIEWER_TYPE_NAME);
  const viewerField = schema.getFieldConfig(
    schema.expectField(queryType, VIEWER_FIELD_NAME),
  );
  if (
    !(
      viewerType &&
      schema.isObject(viewerType) &&
      schema.isObject(viewerField.type) &&
      schema.areEqualTypes(viewerField.type, viewerType) &&
      viewerField.args.length === 0 &&
      schema.areEqualTypes(fragment.type, viewerType)
    )
  ) {
    throw createUserError(
      `Invalid use of @refetchable on fragment '${fragment.name}', check ` +
        "that your schema defines a 'Viewer' object type and has a " +
        "'viewer: Viewer' field on the query type.",
      [fragment.loc],
    );
  }
  return {
    path: [VIEWER_FIELD_NAME],
    node: {
      argumentDefinitions: buildOperationArgumentDefinitions(
        fragment.argumentDefinitions,
      ),
      directives: [],
      kind: 'Root',
      loc: {kind: 'Derived', source: fragment.loc},
      metadata: null,
      name: queryName,
      operation: 'query',
      selections: [
        {
          alias: VIEWER_FIELD_NAME,
          args: [],
          connection: false,
          directives: [],
          handles: null,
          kind: 'LinkedField',
          loc: {kind: 'Derived', source: fragment.loc},
          metadata: null,
          name: VIEWER_FIELD_NAME,
          selections: [buildFragmentSpread(fragment)],
          type: schema.assertLinkedFieldType(viewerType),
        },
      ],
      type: queryType,
    },
    transformedFragment: fragment,
  };
}

module.exports = ({
  description: 'the Viewer type',
  buildRefetchOperation,
}: QueryGenerator);
