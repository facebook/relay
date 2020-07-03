/**
 * @generated SignedSource<<634bc5a99a55c606ff46b6f37ab46b12>>
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
