/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayQuery = require('RelayQuery');
const RelayRecord = require('RelayRecord');

const forEachObject = require('forEachObject');
const invariant = require('invariant');
const warning = require('warning');

const ARGUMENTS = /^(\w+)(?:\((.+?)\))?$/;
const ARGUMENT_NAME = /(\w+)(?=\s*:)/;
const DEPRECATED_CALLS = /^\w+(?:\.\w+\(.*?\))+$/;
const DEPRECATED_CALL = /^(\w+)\((.*?)\)$/;
const {NODE, EDGES} = RelayConnectionInterface;
const {ANY_TYPE, ID} = RelayNodeInterface;

const idField = RelayQuery.Field.build({
  fieldName: ID,
  type: 'String',
});
const cursorField = RelayQuery.Field.build({
  fieldName: 'cursor',
  type: 'String',
});

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
  const fields = [];
  forEachObject(data, (value, key) => {
    if (!RelayRecord.isMetadataKey(key)) {
      fields.push(inferField(value, key));
    }
  });
  return fields;
}

function inferField(value: mixed, key: string): RelayQuery.Field {
  const metadata = {
    canHaveSubselections: true,
    isPlural: false,
  };
  let children;
  if (Array.isArray(value)) {
    const element = value[0];
    if (element && typeof element === 'object') {
      children = inferRelayFieldsFromData(element);
    } else {
      metadata.canHaveSubselections = false;
      children = [];
    }
    metadata.isPlural = true;
  } else if (typeof value === 'object' && value !== null) {
    children = inferRelayFieldsFromData(value);
  } else {
    metadata.canHaveSubselections = false;
    children = [];
  }
  if (key === NODE) {
    children.push(idField);
  } else if (key === EDGES) {
    children.push(cursorField);
  }
  return buildField(key, children, metadata);
}

function buildField(
  key: string,
  children: Array<RelayQuery.Field>,
  /* $FlowIssue(>=0.23.0) #10620219 - After fixing some unsoundness in
   * dictionary types, we've come to realize we need a safer object supertype
   * than Object. */
  metadata: ?{[key: string]: mixed}
): RelayQuery.Field {
  let fieldName = key;
  let calls = null;
  if (DEPRECATED_CALLS.test(key)) {
    warning(
      false,
      'inferRelayFieldsFromData(): Encountered an optimistic payload with ' +
      'a deprecated field call string, `%s`. Use valid GraphQL OSS syntax.',
      key
    );
    const parts = key.split('.');
    if (parts.length > 1) {
      fieldName = parts.shift();
      calls = parts.map(callString => {
        const captures = callString.match(DEPRECATED_CALL);
        invariant(
          captures,
          'inferRelayFieldsFromData(): Malformed data key, `%s`.',
          key
        );
        const value = captures[2].split(',');
        return {
          name: captures[1],
          value: value.length === 1 ? value[0] : (value: any),
        };
      });
    }
  } else {
    const captures = key.match(ARGUMENTS);
    invariant(
      captures,
      'inferRelayFieldsFromData(): Malformed data key, `%s`.',
      key
    );
    fieldName = captures[1];
    if (captures[2]) {
      try {
        // Relay does not currently have a GraphQL argument parser, so...
        const args = JSON.parse(
          '{' + captures[2].replace(ARGUMENT_NAME, '"$1"') + '}'
        );
        calls = Object.keys(args).map(name => ({name, value: args[name]}));
      } catch (error) {
        invariant(
          false,
          'inferRelayFieldsFromData(): Malformed or unsupported data key, ' +
          '`%s`. Only booleans, strings, and numbers are currenly supported, ' +
          'and commas are required. Parse failure reason was `%s`.',
          key,
          error.message
        );
      }
    }
  }
  return RelayQuery.Field.build({
    calls,
    children,
    fieldName,
    metadata,
    type: ANY_TYPE,
  });
}

module.exports = inferRelayFieldsFromData;
