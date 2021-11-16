/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<b457295020bbd14d538c5d10faf83380>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name$ref = RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType;
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
  +$fragmentType: RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
|};
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name = RelayReferenceMarkerTest2PlainUserNameRenderer_name$data;
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name$key = {
  +$data?: RelayReferenceMarkerTest2PlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
  +$fragmentSpreads: RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTest2PlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "text",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "57fc559e5802e30be989ef2d66506b47";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType,
  RelayReferenceMarkerTest2PlainUserNameRenderer_name$data,
>*/);
