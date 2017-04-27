/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @providesModule RelayViewerHandleTransform
 */

'use strict';

const RelayCompilerContext = require('RelayCompilerContext');
const RelayIRTransformer = require('RelayIRTransformer');

const {DEFAULT_HANDLE_KEY} = require('RelayDefaultHandleKey');
const {getRawType} = require('RelaySchemaUtils');

import type {LinkedField} from 'RelayIR';
import type {GraphQLSchema} from 'graphql';

type State = {};

const VIEWER_HANDLE = 'viewer';
const VIEWER_TYPE = 'Viewer';

/**
 * A transform that adds a "viewer" handle to all fields whose type is `Viewer`.
 */
function transform(
  context: RelayCompilerContext,
  schema: GraphQLSchema
): RelayCompilerContext {
  const viewerType = schema.getType(VIEWER_TYPE);
  if (viewerType == null) {
    return context;
  }
  return RelayIRTransformer.transform(
    context,
    {
      LinkedField: visitLinkedField,
    },
    () => ({})
  );
}

function visitLinkedField(field: LinkedField, state: State): ?LinkedField {
  const transformedNode = this.traverse(field, state);
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
  return handles !== transformedNode.handles ?
    {...transformedNode, handles} :
    transformedNode;
}

module.exports = {transform};
