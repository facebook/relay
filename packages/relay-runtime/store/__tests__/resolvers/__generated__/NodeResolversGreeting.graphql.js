/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<df6559926344fcd42eba9647baf0c43b>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type NodeResolversGreeting$fragmentType: FragmentType;
export type NodeResolversGreeting$data = {
  readonly id: string,
  readonly $fragmentType: NodeResolversGreeting$fragmentType,
};
export type NodeResolversGreeting$key = {
  readonly $data?: NodeResolversGreeting$data,
  readonly $fragmentSpreads: NodeResolversGreeting$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "NodeResolversGreeting",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

if (__DEV__) {
  (node/*:: as any*/).hash = "d331274a92b58d1de6941541d745b6ae";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  NodeResolversGreeting$fragmentType,
  NodeResolversGreeting$data,
>*/);
