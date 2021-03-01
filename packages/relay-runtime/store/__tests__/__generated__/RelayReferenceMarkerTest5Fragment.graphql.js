/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<ef2dd283288a7ea8d450643a125c0aae>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest5Fragment$ref: FragmentReference;
declare export opaque type RelayReferenceMarkerTest5Fragment$fragmentType: RelayReferenceMarkerTest5Fragment$ref;
export type RelayReferenceMarkerTest5Fragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayReferenceMarkerTest5Fragment$ref,
|};
export type RelayReferenceMarkerTest5Fragment$data = RelayReferenceMarkerTest5Fragment;
export type RelayReferenceMarkerTest5Fragment$key = {
  +$data?: RelayReferenceMarkerTest5Fragment$data,
  +$fragmentRefs: RelayReferenceMarkerTest5Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest5Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": null,
      "kind": "LinkedField",
      "name": "actors",
      "plural": true,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ea3af862c9563568daa659d013921790";
}

module.exports = node;
