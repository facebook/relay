/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQuerySerializer
 * @flow
 * @typechecks
 */

'use strict';

import type {Call} from 'RelayInternalTypes';
var RelayQuery = require('RelayQuery');

var invariant = require('invariant');

type Field = {
  kind: 'Field';
  alias: string;
  name: string;
  calls: Array<Call>;
  children: Array<Selection>;
  metadata: {[key: string]: mixed}
};

type FragmentDefinition = {
  kind: 'FragmentDefinition';
  name: string;
  type: string;
  children: Array<Selection>;
  metadata: {[key: string]: mixed}
};

type Selection = Field | FragmentDefinition;

var FIELD = 'Field';
var FRAGMENT_DEFINITION = 'FragmentDefinition';
var QUERY = 'Query';
var MUTATION = 'Mutation';

/**
 * @internal
 *
 * Methods for (de)serializing `RelayQueryNode`s to/from JSON.
 */
var RelayQuerySerializer = {
  fromJSON(data: mixed): RelayQuery.Node {
    invariant(
      typeof data === 'object' && data !== null && !Array.isArray(data),
      'RelayQuerySerializer.fromJSON(): expected an object.'
    );
    var {
      alias,
      calls,
      children,
      fieldName,
      kind,
      metadata,
      name,
      type,
    } = data;

    invariant(
      alias == null || typeof alias === 'string',
      'RelayQuerySerializer.fromJSON(): expected `alias` to be a string, got ' +
      '`%s`.',
      alias
    );
    invariant(
      calls == null || Array.isArray(calls),
      'RelayQuerySerializer.fromJSON(): expected `calls` to be an array.'
    );
    invariant(
      typeof kind === 'string',
      'RelayQuerySerializer.fromJSON(): expected `kind` to be a string.'
    );
    invariant(
      !metadata || (typeof metadata === 'object' && !Array.isArray(metadata)),
      'RelayQuerySerializer.fromJSON(): expected `metadata` to be an object.'
    );
    invariant(
      typeof name === 'string',
      'RelayQuerySerializer.fromJSON(): expected `name` to be a string.'
    );
    invariant(
      !children || Array.isArray(children),
      'RelayQuerySerializer.fromJSON(): expected `children` to be an array.'
    );
    children = children.map(RelayQuerySerializer.fromJSON);

    if (kind === FIELD) {
      var field = RelayQuery.Field.build(
        name,
        calls,
        children,
        metadata,
        alias
      );
      invariant(
        field != null,
        'RelayQuerySerializer.fromJSON(): expected a `Field`.'
      );
      return field;
    } else if (kind === FRAGMENT_DEFINITION) {
      invariant(
        typeof type === 'string',
        'RelayQuerySerializer.fromJSON(): expected `type` to be a string.'
      );
      var fragment = RelayQuery.Fragment.build(
        name,
        type,
        children,
        metadata
      );
      invariant(
        fragment != null,
        'RelayQuerySerializer.fromJSON(): expected a `Fragment`.'
      );
      return fragment;
    } else if (kind === QUERY) {
      invariant(
        fieldName != null,
        'RelayQuerySerializer.fromJSON(): expected `fieldName` to be ' +
        'non-null for a root node'
      );
      var root = RelayQuery.Root.build(
        fieldName,
        (calls[0] && calls[0].value) || null,
        children,
        metadata,
        name
      );
      invariant(
        root != null,
        'RelayQuerySerializer.fromJSON(): expected a `Root`.'
      );
      return root;
    } else if (kind === MUTATION) {
      invariant(
        typeof type === 'string',
        'RelayQuerySerializer.fromJSON(): expected `type` to be a string.'
      );
      var mutationCall = calls[0];
      var mutation = RelayQuery.Mutation.build(
        name,
        type,
        mutationCall.name,
        mutationCall.value,
        children,
      );
      invariant(
        mutation != null,
        'RelayQuerySerializer.fromJSON(): expected a `Mutation`.'
      );
      return mutation;
    } else {
      invariant(
        false,
        'RelayQuerySerializer.fromJSON(): invalid kind %s.',
        kind
      );
    }
  },

  toJSON(node: RelayQuery.Node): mixed {
    var children = node.getChildren().map(RelayQuerySerializer.toJSON);
    if (node instanceof RelayQuery.Field) {
      var name = node.getSchemaName();
      var alias = node.getApplicationName();
      return {
        kind: FIELD,
        name,
        alias: alias !== name ? alias : null,
        calls: node.getCallsWithValues(),
        children,
        metadata: node.__concreteNode__.__metadata__,
      };
    } else if (node instanceof RelayQuery.Fragment) {
      return {
        kind: FRAGMENT_DEFINITION,
        name: node.getDebugName(),
        type: node.getType(),
        children,
        metadata: {
          ...node.__concreteNode__.__metadata__,
          isDeferred: node.isDeferred(),
          isContainerFragment: node.isContainerFragment(),
        },
      };
    } else if (node instanceof RelayQuery.Root) {
      return {
        kind: QUERY,
        name: node.getName(),
        fieldName: node.getFieldName(),
        calls: node.getCallsWithValues(),
        children,
        metadata: node.__concreteNode__.__metadata__,
      };
    } else if (node instanceof RelayQuery.Mutation) {
      var mutationCall = node.getCall();
      return {
        kind: MUTATION,
        name: node.getName(),
        calls: [mutationCall],
        children,
        type: node.getResponseType(),
      };
    } else {
      invariant(
        false,
        'RelayQuerySerializer.toJSON(): invalid node type, only `Field`, ' +
        '`Fragment`, `Mutation`, and `Root` are supported, got `%s`.',
        node.constructor.name
      );
    }
  },
};

module.exports = RelayQuerySerializer;
