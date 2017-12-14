/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @providesModule RelayViewerHandleTransform
 * @format
 */

'use strict';

// TODO T21875029 ../../../relay-runtime/util/RelayDefaultHandleKey
const {DEFAULT_HANDLE_KEY} = require('RelayDefaultHandleKey');
const {GraphQLObjectType} = require('graphql');
const {IRTransformer, SchemaUtils} = require('graphql-compiler');

import type {CompilerContext, LinkedField} from 'graphql-compiler';

const {getRawType} = SchemaUtils;

const ID = 'id';
const VIEWER_HANDLE = 'viewer';
const VIEWER_TYPE = 'Viewer';

/**
 * A transform that adds a "viewer" handle to all fields whose type is `Viewer`.
 */
function relayViewerHandleTransform(context: CompilerContext): CompilerContext {
  const viewerType = context.serverSchema.getType(VIEWER_TYPE);
  if (
    viewerType == null ||
    !(viewerType instanceof GraphQLObjectType) ||
    viewerType.getFields()[ID] != null
  ) {
    return context;
  }
  return IRTransformer.transform(context, {
    LinkedField: visitLinkedField,
  });
}

function visitLinkedField(field: LinkedField): ?LinkedField {
  const transformedNode = this.traverse(field);
  if (getRawType(field.type).name !== VIEWER_TYPE) {
    return transformedNode;
  }
  let handles = transformedNode.handles;
  const viewerHandle = {
    name: VIEWER_HANDLE,
    key: DEFAULT_HANDLE_KEY,
    filters: null,
  };

  if (handles && !handles.find(handle => handle.name === VIEWER_HANDLE)) {
    handles = [...handles, viewerHandle];
  } else if (!handles) {
    handles = [viewerHandle];
  }
  return handles !== transformedNode.handles
    ? {...transformedNode, handles}
    : transformedNode;
}

module.exports = {
  transform: relayViewerHandleTransform,
};
