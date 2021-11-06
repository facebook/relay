/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ca077712c35d918f3512110dcac713dd>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type Component_node$ref: FragmentReference;
declare export opaque type Component_node$fragmentType: Component_node$ref;
export type Component_node = {|
  +id: string,
  +$refType: Component_node$ref,
|};
export type Component_node$data = Component_node;
export type Component_node$key = {
  +$data?: Component_node$data,
  +$fragmentRefs: Component_node$ref,
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

if (__DEV__) {
  (node/*: any*/).hash = "c1076fdf6414be9f597194edf35d01a0";
}

module.exports = node;
