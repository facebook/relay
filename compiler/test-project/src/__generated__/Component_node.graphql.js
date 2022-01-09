/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7c0e57fbb893f2377269c8836573bb71>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type Component_node$fragmentType: FragmentType;
export type Component_node$data = {|
  +id: string,
  +$fragmentType: Component_node$fragmentType,
|};
export type Component_node$key = {
  +$data?: Component_node$data,
  +$fragmentSpreads: Component_node$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "Component_node",
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

(node/*: any*/).hash = "c1076fdf6414be9f597194edf35d01a0";

module.exports = ((node/*: any*/)/*: Fragment<
  Component_node$fragmentType,
  Component_node$data,
>*/);
