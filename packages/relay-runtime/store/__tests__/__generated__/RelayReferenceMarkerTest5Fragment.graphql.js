/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<02200a17fa23f621f74557809eff7e14>>
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
  +$fragmentType: RelayReferenceMarkerTest5Fragment$fragmentType,
|};
export type RelayReferenceMarkerTest5Fragment = RelayReferenceMarkerTest5Fragment$data;
export type RelayReferenceMarkerTest5Fragment$key = {
  +$data?: RelayReferenceMarkerTest5Fragment$data,
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
