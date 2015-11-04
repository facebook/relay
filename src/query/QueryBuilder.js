/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule QueryBuilder
 * @flow
 * @typechecks
 */

'use strict';

import type {
  BatchCallVariable,
  Call,
  CallValue,
  CallVariable,
  Directive,
  Field,
  Fragment,
  Mutation,
  Query,
  Selection,
  Value,
} from 'ConcreteQuery';
const RelayNodeInterface = require('RelayNodeInterface');

const invariant = require('invariant');

const EMPTY_CALLS: Array<Call> = [];
const EMPTY_CHILDREN: Array<?Selection> = [];
const EMPTY_DIRECTIVES: Array<Directive> = [];
const EMPTY_METADATA = {};

if (__DEV__) {
  Object.freeze(EMPTY_CALLS);
  Object.freeze(EMPTY_CHILDREN);
  Object.freeze(EMPTY_DIRECTIVES);
  Object.freeze(EMPTY_METADATA);
}

/**
 * @internal
 *
 * Helper methods for constructing concrete query objects.
 */
const QueryBuilder = {
  createBatchCallVariable(
    sourceQueryID: string,
    jsonPath: string
  ): BatchCallVariable {
    return {
      kind: 'BatchCallVariable',
      sourceQueryID,
      jsonPath,
    };
  },

  createCall(
    name: string,
    value: ?Value,
    type?: string
  ): Call {
    return {
      kind: 'Call',
      name,
      metadata: {
        type: type || null,
      },
      value: value || null,
    };
  },

  createCallValue(
    callValue: mixed
  ): CallValue {
    return {
      kind: 'CallValue',
      callValue,
    };
  },

  createCallVariable(
    callVariableName: string
  ): CallVariable {
    return {
      kind: 'CallVariable',
      callVariableName,
    };
  },

  createField(partialField: {
    alias?: ?string;
    calls?: ?Array<Call>;
    children?: ?Array<?Selection>;
    directives?: ?Array<Directive>;
    fieldName: string;
    metadata?: ?{
      inferredRootCallName?: ?string;
      inferredPrimaryKey?: ?string;
      isConnection?: boolean;
      isFindable?: boolean;
      isGenerated?: boolean;
      isPlural?: boolean;
      isRequisite?: boolean;
      isUnionOrInterface?: boolean;
      parentType?: ?string;
    };
  }): Field {
    const partialMetadata = partialField.metadata || EMPTY_METADATA;
    return {
      alias: partialField.alias,
      calls: partialField.calls || EMPTY_CALLS,
      children: partialField.children || EMPTY_CHILDREN,
      directives: partialField.directives || EMPTY_DIRECTIVES,
      fieldName: partialField.fieldName,
      kind: 'Field',
      metadata: {
        inferredRootCallName: partialMetadata.inferredRootCallName,
        inferredPrimaryKey: partialMetadata.inferredPrimaryKey,
        isConnection: !!partialMetadata.isConnection,
        isFindable: !!partialMetadata.isFindable,
        isGenerated: !!partialMetadata.isGenerated,
        isPlural: !!partialMetadata.isPlural,
        isRequisite: !!partialMetadata.isRequisite,
        isUnionOrInterface: !!partialMetadata.isUnionOrInterface,
        parentType: partialMetadata.parentType,
      },
    };
  },

  createFragment(partialFragment: {
    children?: ?Array<?Selection>;
    directives?: ?Array<Directive>;
    isPlural?: boolean;
    metadata?: ?{
      plural?: boolean;
    };
    name: string;
    type: string;
  }): Fragment {
    const metadata = partialFragment.metadata || EMPTY_METADATA;
    return {
      children: partialFragment.children || EMPTY_CHILDREN,
      directives: partialFragment.directives || EMPTY_DIRECTIVES,
      kind: 'Fragment',
      metadata: {
        plural: !!metadata.plural, // match the `@relay` argument name
      },
      name: partialFragment.name,
      type: partialFragment.type,
    };
  },

  createMutation(partialMutation: {
    calls?: ?Array<Call>;
    children?: ?Array<?Selection>;
    directives?: ?Array<Directive>;
    metadata?: ?{
      inputType?: string;
    };
    name: string;
    responseType: string;
  }): Mutation {
    const metadata = partialMutation.metadata || EMPTY_METADATA;
    return {
      calls: partialMutation.calls || EMPTY_CALLS,
      children: partialMutation.children || EMPTY_CHILDREN,
      directives: partialMutation.directives || EMPTY_DIRECTIVES,
      kind: 'Mutation',
      metadata: {
        inputType: metadata.inputType,
      },
      name: partialMutation.name,
      responseType: partialMutation.responseType,
    };
  },

  createQuery(partialQuery: {
    children?: ?Array<?Selection>;
    directives?: ?Array<Directive>;
    fieldName: string;
    identifyingArgValue: ?Value;
    isDeferred?: boolean;
    metadata?: ?{
      identifyingArgName?: ?string;
      identifyingArgType?: ?string;
      isDeferred?: ?boolean;
    };
    name: string;
  }): Query {
    const metadata = partialQuery.metadata || EMPTY_METADATA;
    let calls = [];
    let identifyingArgName = metadata.identifyingArgName;
    if (
      identifyingArgName == null &&
      RelayNodeInterface.isNodeRootCall(partialQuery.fieldName)
    ) {
      identifyingArgName = RelayNodeInterface.ID;
    }
    if (identifyingArgName != null) {
      invariant(
        partialQuery.identifyingArgValue != null,
        'QueryBuilder.createQuery(): An argument value is required for ' +
        'query `%s(%s: ???)`.',
        partialQuery.fieldName,
        identifyingArgName
      );
      calls = [QueryBuilder.createCall(
        identifyingArgName,
        (partialQuery.identifyingArgValue: Value)
      )];
    }
    return {
      calls,
      children: partialQuery.children || EMPTY_CHILDREN,
      directives: partialQuery.directives || EMPTY_DIRECTIVES,
      fieldName: partialQuery.fieldName,
      isDeferred: !!(partialQuery.isDeferred || metadata.isDeferred),
      kind: 'Query',
      metadata: {
        identifyingArgName,
        identifyingArgType: metadata.identifyingArgType,
      },
      name: partialQuery.name,
    };
  },
};

module.exports = QueryBuilder;
