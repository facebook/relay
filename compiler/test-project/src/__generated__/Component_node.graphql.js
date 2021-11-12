/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8299662582ae1d793f05b980be26623e>>
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
  +_id: string,
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
      "name": "_id",
      "storageKey": null
    }
  ],
  "type": "Node",
  "abstractKey": "__isNode"
};

(node/*: any*/).hash = "3ade66f248d95607a4894213db92b2f5";

module.exports = node;
