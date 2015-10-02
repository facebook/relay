/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule inferRelayFieldsFromData
 * @typechecks
 * @flow
 */

'use strict';

var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayNodeInterface = require('RelayNodeInterface');
var RelayQuery = require('RelayQuery');

var forEachObject = require('forEachObject');
var invariant = require('invariant');

var FIELD_ARGUMENT_ENCODING = /^(\w+)\((.*?)\)$/;
var {NODE, EDGES} = RelayConnectionInterface;
var {ID, NODE_TYPE} = RelayNodeInterface;

/**
 * @internal
 *
 * Given a record-like object, infers fields that could be used to fetch them.
 * Properties that are fetched via fields with arguments can be encoded by
 * serializing the arguments in property keys.
 */
function inferRelayFieldsFromData(
  data: Object
): Array<RelayQuery.Field> {
  var fields = [];
  forEachObject(data, (value, key) => {
    if (!GraphQLStoreDataHandler.isMetadataKey(key)) {
      fields.push(inferField(value, key));
    }
  });
  return fields;
}

function inferField(value: mixed, key: string): RelayQuery.Field {
  var children;
  var metadata;
  if (Array.isArray(value)) {
    var element = value[0];
    if (element && typeof element === 'object') {
      children = inferRelayFieldsFromData(element);
    } else {
      children = [];
    }
    metadata = {plural: true};
  } else if (typeof value === 'object' && value !== null) {
    children = inferRelayFieldsFromData(value);
  } else {
    children = [];
  }
  if (key === NODE) {
    children.push(RelayQuery.Field.build('id', null, null, {
      parentType: NODE_TYPE,
    }));
  } else if (key === EDGES) {
    children.push(RelayQuery.Field.build('cursor'));
  } else if (key === ID) {
    metadata = {
      parentType: NODE_TYPE,
    };
  }
  return buildField(key, children, metadata);
}

function buildField(
  key: string,
  children: Array<RelayQuery.Field>,
  metadata: ?{[key: string]: mixed}
): RelayQuery.Field {
  var fieldName = key;
  var calls = null;
  var parts = key.split('.');
  if (parts.length > 1) {
    fieldName = parts.shift();
    calls = parts.map(callString => {
      var captures = callString.match(FIELD_ARGUMENT_ENCODING);
      invariant(
        captures,
        'inferRelayFieldsFromData(): Malformed data key, `%s`.',
        key
      );
      var value = captures[2].split(',');
      return {
        name: captures[1],
        value: value.length === 1 ? value[0] : value,
      };
    });
  }
  return RelayQuery.Field.build(
    fieldName,
    calls,
    children,
    metadata
  );
}

module.exports = inferRelayFieldsFromData;
