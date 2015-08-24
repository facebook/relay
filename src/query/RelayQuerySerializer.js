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

type Query = {
  kind: 'Query';
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
    var {alias, calls, children, kind, metadata, name, type} = data;

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
      var field = RelayQuery.Node.buildField(
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
      var fragment = RelayQuery.Node.buildFragment(
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
    } else {
      invariant(
        kind === QUERY,
        'RelayQuerySerializer.fromJSON(): invalid kind %s.',
        kind
      );
      var rootCall = calls[0];
      var root = RelayQuery.Node.buildRoot(
        rootCall.name,
        rootCall.value,
        children,
        metadata,
        name
      );
      invariant(
        root != null,
        'RelayQuerySerializer.fromJSON(): expected a `Root`.'
      );
      return root;
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
          isReferenceFragment: node.isReferenceFragment(),
        },
      };
    } else {
      invariant(
        node instanceof RelayQuery.Root,
        'RelayQuerySerializer.toJSON(): invalid node type, only `Field`, ' +
        '`Fragment`, and `Root` are supported, got `%s`.',
        node.constructor.name
      );
      var rootCall = node.getRootCall();
      return {
        kind: QUERY,
        name: node.getName(),
        calls: [rootCall],
        children,
        metadata: node.__concreteNode__.__metadata__,
      };
    }
  },
};

module.exports = RelayQuerySerializer;
