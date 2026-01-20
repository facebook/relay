/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<65d3cfa934e7852b8f03a5fab85b131b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type NodeResolversGreeting$fragmentType: FragmentType;
export type NodeResolversGreeting$data = {|
  +id: string,
  +$fragmentType: NodeResolversGreeting$fragmentType,
|};
export type NodeResolversGreeting$key = {
  +$data?: NodeResolversGreeting$data,
  +$fragmentSpreads: NodeResolversGreeting$fragmentType,
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
  (node/*: any*/).hash = "d331274a92b58d1de6941541d745b6ae";
}

module.exports = ((node/*: any*/)/*: Fragment<
  NodeResolversGreeting$fragmentType,
  NodeResolversGreeting$data,
>*/);
