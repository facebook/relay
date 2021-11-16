/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<e7b298836128eb77f9264dd890e17ea8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest5Fragment$fragmentType: FragmentType;
export type RelayReferenceMarkerTest5Fragment$ref = RelayReferenceMarkerTest5Fragment$fragmentType;
export type RelayReferenceMarkerTest5Fragment$data = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$refType: RelayReferenceMarkerTest5Fragment$fragmentType,
  +$fragmentType: RelayReferenceMarkerTest5Fragment$fragmentType,
|};
export type RelayReferenceMarkerTest5Fragment = RelayReferenceMarkerTest5Fragment$data;
export type RelayReferenceMarkerTest5Fragment$key = {
  +$data?: RelayReferenceMarkerTest5Fragment$data,
  +$fragmentRefs: RelayReferenceMarkerTest5Fragment$fragmentType,
  +$fragmentSpreads: RelayReferenceMarkerTest5Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReferenceMarkerTest5Fragment$fragmentType,
  RelayReferenceMarkerTest5Fragment$data,
>*/);
