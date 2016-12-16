/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule QueryBuilder
 * @flow
 */

'use strict';

const RelayNodeInterface = require('RelayNodeInterface');

const generateConcreteFragmentID = require('generateConcreteFragmentID');
const warning = require('warning');

import type {
  ConcreteBatchCallVariable,
  ConcreteCall,
  ConcreteCallValue,
  ConcreteCallVariable,
  ConcreteDirective,
  ConcreteDirectiveArgument,
  ConcreteDirectiveValue,
  ConcreteField,
  ConcreteFieldMetadata,
  ConcreteFragment,
  ConcreteFragmentDefinition,
  ConcreteFragmentMetadata,
  ConcreteFragmentReference,
  ConcreteFragmentSpread,
  ConcreteMutation,
  ConcreteOperationDefinition,
  ConcreteOperationMetadata,
  ConcreteQuery,
  ConcreteQueryMetadata,
  ConcreteSelection,
  ConcreteSubscription,
  ConcreteValue,
} from 'ConcreteQuery';

const EMPTY_CALLS: Array<ConcreteCall> = [];
const EMPTY_CHILDREN: Array<?ConcreteSelection> = [];
const EMPTY_DIRECTIVES: Array<ConcreteDirective> = [];
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
  ): ConcreteBatchCallVariable {
    return {
      kind: 'BatchCallVariable',
      sourceQueryID,
      jsonPath,
    };
  },

  createCall(
    name: string,
    value: ?ConcreteValue,
    type?: ?string
  ): ConcreteCall {
    return {
      kind: 'Call',
      name,
      metadata: {
        type: type || null,
      },
      value,
    };
  },

  createCallValue(
    callValue: mixed
  ): ConcreteCallValue {
    return {
      kind: 'CallValue',
      callValue,
    };
  },

  createCallVariable(
    callVariableName: string
  ): ConcreteCallVariable {
    return {
      kind: 'CallVariable',
      callVariableName,
    };
  },

  createDirective(
    name: string,
    args: Array<ConcreteDirectiveArgument>
  ): ConcreteDirective {
    return {
      args,
      kind: 'Directive',
      name,
    };
  },

  createDirectiveArgument(
    name: string,
    value: ?ConcreteDirectiveValue
  ): ConcreteDirectiveArgument {
    return {
      name,
      value,
    };
  },

  createField(partialField: {
    alias?: ?string,
    calls?: ?Array<ConcreteCall>,
    children?: ?Array<?ConcreteSelection>,
    directives?: ?Array<ConcreteDirective>,
    fieldName: string,
    metadata?: ?ConcreteFieldMetadata,
    type: string,
  }): ConcreteField {
    const partialMetadata = partialField.metadata || EMPTY_METADATA;
    return {
      alias: partialField.alias,
      calls: partialField.calls || EMPTY_CALLS,
      children: partialField.children || EMPTY_CHILDREN,
      directives: partialField.directives || EMPTY_DIRECTIVES,
      fieldName: partialField.fieldName,
      kind: 'Field',
      metadata: {
        canHaveSubselections: !!partialMetadata.canHaveSubselections,
        inferredRootCallName: partialMetadata.inferredRootCallName,
        inferredPrimaryKey: partialMetadata.inferredPrimaryKey,
        isConnection: !!partialMetadata.isConnection,
        isFindable: !!partialMetadata.isFindable,
        isGenerated: !!partialMetadata.isGenerated,
        isPlural: !!partialMetadata.isPlural,
        isRequisite: !!partialMetadata.isRequisite,
        isAbstract: !!partialMetadata.isAbstract,
      },
      type: partialField.type,
    };
  },

  createFragment(partialFragment: {
    children?: ?Array<?ConcreteSelection>,
    directives?: ?Array<ConcreteDirective>,
    isPlural?: boolean,
    metadata?: ?ConcreteFragmentMetadata,
    name: string,
    type: string,
  }): ConcreteFragment {
    const metadata = partialFragment.metadata || EMPTY_METADATA;
    return {
      children: partialFragment.children || EMPTY_CHILDREN,
      directives: partialFragment.directives || EMPTY_DIRECTIVES,
      id: generateConcreteFragmentID(),
      kind: 'Fragment',
      metadata: {
        isAbstract: !!metadata.isAbstract,
        pattern: !!metadata.pattern,
        plural: !!metadata.plural, // match the `@relay` argument name
      },
      name: partialFragment.name,
      type: partialFragment.type,
    };
  },

  createFragmentReference(
    fragment: ConcreteFragment
  ): ConcreteFragmentReference {
    return {
      kind: 'FragmentReference',
      fragment,
    };
  },

  createMutation(partialMutation: {
    calls?: ?Array<ConcreteCall>,
    children?: ?Array<?ConcreteSelection>,
    directives?: ?Array<ConcreteDirective>,
    metadata?: ?ConcreteOperationMetadata,
    name: string,
    responseType: string,
  }): ConcreteMutation {
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
    children?: ?Array<?ConcreteSelection>,
    directives?: ?Array<ConcreteDirective>,
    fieldName: string,
    identifyingArgValue: ?ConcreteValue,
    isDeferred?: boolean,
    metadata?: ?ConcreteQueryMetadata,
    name: string,
    type: string,
  }): ConcreteQuery {
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
      warning(
        partialQuery.identifyingArgValue != null,
        'QueryBuilder.createQuery(): An argument value may be required for ' +
        'query `%s(%s: ???)`.',
        partialQuery.fieldName,
        identifyingArgName
      );
      calls = [QueryBuilder.createCall(
        identifyingArgName,
        partialQuery.identifyingArgValue,
        metadata.identifyingArgType
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
        isAbstract: !!metadata.isAbstract,
        isPlural: !!metadata.isPlural,
      },
      name: partialQuery.name,
      type: partialQuery.type,
    };
  },

  createSubscription(partialSubscription: {
    calls?: ?Array<ConcreteCall>,
    children?: ?Array<?ConcreteSelection>,
    directives?: ?Array<ConcreteDirective>,
    metadata?: ?ConcreteOperationMetadata,
    name: string,
    responseType: string,
  }): ConcreteSubscription {
    const metadata = partialSubscription.metadata || EMPTY_METADATA;
    return {
      calls: partialSubscription.calls || EMPTY_CALLS,
      children: partialSubscription.children || EMPTY_CHILDREN,
      directives: partialSubscription.directives || EMPTY_DIRECTIVES,
      kind: 'Subscription',
      metadata: {
        inputType: metadata.inputType,
      },
      name: partialSubscription.name,
      responseType: partialSubscription.responseType,
    };
  },

  getBatchCallVariable(node: mixed): ?ConcreteBatchCallVariable {
    if (isConcreteKind(node, 'BatchCallVariable')) {
      return (node: any);
    }
  },

  getCallVariable(node: mixed): ?ConcreteCallVariable {
    if (isConcreteKind(node, 'CallVariable')) {
      return (node: any);
    }
  },

  getField(node: mixed): ?ConcreteField {
    if (isConcreteKind(node, 'Field')) {
      return (node: any);
    }
  },

  getFragment(node: mixed): ?ConcreteFragment {
    if (isConcreteKind(node, 'Fragment')) {
      return (node: any);
    }
  },

  getFragmentDefinition(node: mixed): ?ConcreteFragmentDefinition {
    if (isConcreteKind(node, 'FragmentDefinition')) {
      return (node: any);
    }
  },

  getFragmentReference(node: mixed): ?ConcreteFragmentReference {
    if (isConcreteKind(node, 'FragmentReference')) {
      return (node: any);
    }
  },

  getFragmentSpread(node: mixed): ?ConcreteFragmentSpread {
    if (isConcreteKind(node, 'FragmentSpread')) {
      return (node: any);
    }
  },

  getOperationDefinition(node: mixed): ?ConcreteOperationDefinition {
    if (isConcreteKind(node, 'OperationDefinition')) {
      return (node: any);
    }
  },

  getMutation(node: mixed): ?ConcreteMutation {
    if (isConcreteKind(node, 'Mutation')) {
      return (node: any);
    }
  },

  getQuery(node: mixed): ?ConcreteQuery {
    if (isConcreteKind(node, 'Query')) {
      return (node: any);
    }
  },

  getSubscription(node: mixed): ?ConcreteSubscription {
    if (isConcreteKind(node, 'Subscription')) {
      return (node: any);
    }
  },
};

function isConcreteKind(node: mixed, kind: string): boolean {
  return (
    typeof node === 'object' &&
    node !== null &&
    node.kind === kind
  );
}

module.exports = QueryBuilder;
