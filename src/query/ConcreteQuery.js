/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ConcreteQuery
 * @flow
 * @typechecks
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
  arguments: Array<{
    name: string;
    value: ?ConcreteDirectiveValue;
  }>;
  kind: 'Directive';
  name: string;
};

export type ConcreteField = {
  alias?: ?string;
  calls?: ?Array<ConcreteCall>;
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
  fieldName: string;
  kind: 'Field';
  metadata: {
    inferredRootCallName?: ?string;
    inferredPrimaryKey?: ?string;
    isConnection?: boolean;
    isFindable?: boolean;
    isGenerated?: boolean;
    isPlural?: boolean;
    isRequisite?: boolean;
    isAbstract?: boolean;
  };
  type: string;
};

export type ConcreteFragment = {
  children?: ?Array<?ConcreteSelection>;
  directives?: ?Array<ConcreteDirective>;
  kind: 'Fragment';
  metadata: {
    isAbstract?: boolean;
    isPlural?: boolean; // FB Printer
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
