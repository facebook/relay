/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ConcreteQuery
 * @flow
 */

'use strict';

/**
 * @internal
 *
 * Types representing the transformed output of Relay.QL queries.
 */

/**
 * Ideally this would be a union of Field/Fragment/Mutation/Query/Subscription,
 * but that causes lots of Flow errors.
 */
export type ConcreteNode = {
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
};

export type ConcreteSelection =
  ConcreteField |
  ConcreteFragment |
  ConcreteFragmentReference;

export type ConcreteValue =
  ConcreteBatchCallVariable |
  ConcreteCallValue |
  ConcreteCallVariable |
  Array<ConcreteCallValue | ConcreteCallVariable>;

export type ConcreteDirectiveValue =
  ConcreteCallValue |
  ConcreteCallVariable |
  Array<ConcreteCallValue | ConcreteCallVariable>;

export type ConcreteBatchCallVariable = {
  jsonPath: string;
  kind: 'BatchCallVariable';
  sourceQueryID: string;
};

export type ConcreteCall = {
  kind: 'Call';
  metadata: {
    type?: ?string;
  };
  name: string;
  value: ?ConcreteValue;
};

export type ConcreteCallValue = {
  callValue: mixed;
  kind: 'CallValue';
}

export type ConcreteCallVariable = {
  callVariableName: string;
  kind: 'CallVariable';
};

export type ConcreteDirective = {
  args: Array<ConcreteDirectiveArgument>;
  kind: 'Directive';
  name: string;
};

export type ConcreteDirectiveArgument = {
  name: string;
  value: ?ConcreteDirectiveValue;
};

export type ConcreteFieldMetadata = {
  canHaveSubselections?: ?boolean;
  inferredPrimaryKey?: ?string;
  inferredRootCallName?: ?string;
  isAbstract?: boolean;
  isConnection?: boolean;
  isConnectionWithoutNodeID?: boolean;
  isFindable?: boolean;
  isGenerated?: boolean;
  isPlural?: boolean;
  isRequisite?: boolean;
};

export type ConcreteField = {
  alias?: ?string;
  calls?: ?Array<ConcreteCall>;
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
  fieldName: string;
  kind: 'Field';
  metadata: ConcreteFieldMetadata;
  type: string;
};

export type ConcreteFragmentMetadata = {
  isAbstract?: boolean;
  pattern?: boolean;
  plural?: boolean;
};

export type ConcreteFragment = {
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
  id: string;
  kind: 'Fragment';
  metadata: {
    isAbstract?: boolean;
    isPlural?: boolean; // FB Printer
    isTrackingEnabled?: boolean;
    pattern?: boolean;  // from @relay directive
    plural?: boolean;   // OSS Printer from `@relay`
  };
  name: string;
  type: string;
};

export type ConcreteFragmentReference = {
  kind: 'FragmentReference';
  fragment: ConcreteFragment;
};

export type ConcreteMutation = {
  calls: Array<ConcreteCall>;
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
  kind: 'Mutation';
  metadata: {
    inputType?: ?string;
  };
  name: string;
  responseType: string;
};

export type ConcreteOperationMetadata = {
  inputType?: ?string;
};

export type ConcreteQueryMetadata = {
  identifyingArgName: ?string;
  identifyingArgType: ?string;
  isAbstract: ?boolean;
  isDeferred: ?boolean;
  isPlural: ?boolean;
};

export type ConcreteQuery = {
  calls?: ?Array<ConcreteCall>;
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
  fieldName: string;
  isDeferred?: boolean;
  kind: 'Query';
  metadata: {
    identifyingArgName?: ?string;
    identifyingArgType?: ?string;
    isAbstract?: ?boolean;
    isPlural?: ?boolean;
  };
  name: string;
  type: string;
};

export type ConcreteSubscription = {
  calls: Array<ConcreteCall>;
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
  kind: 'Subscription';
  name: string;
  responseType: string;
  metadata: {
    inputType?: ?string;
  };
};
