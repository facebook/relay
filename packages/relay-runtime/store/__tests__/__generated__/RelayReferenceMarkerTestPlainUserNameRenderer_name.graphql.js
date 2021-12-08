/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7bd6b5aa961f670f4f32a92f5e519574>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayReferenceMarkerTestPlainUserNameRenderer_name$ref = RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType;
export type RelayReferenceMarkerTestPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayReferenceMarkerTestPlainUserNameRenderer_name = RelayReferenceMarkerTestPlainUserNameRenderer_name$data;
export type RelayReferenceMarkerTestPlainUserNameRenderer_name$key = {
  +$data?: RelayReferenceMarkerTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReferenceMarkerTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "673e4e6c0b40cff68532b5fb08a29a58";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType,
  RelayReferenceMarkerTestPlainUserNameRenderer_name$data,
>*/);
