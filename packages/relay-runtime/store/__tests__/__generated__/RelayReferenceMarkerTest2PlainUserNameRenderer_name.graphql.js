/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2be60920aac583d0b352a2111365d201>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTest2PlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayReferenceMarkerTest2PlainUserNameRenderer_name$fragmentType: RelayReferenceMarkerTest2PlainUserNameRenderer_name$ref;
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayReferenceMarkerTest2PlainUserNameRenderer_name$ref,
|};
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name$data = RelayReferenceMarkerTest2PlainUserNameRenderer_name;
export type RelayReferenceMarkerTest2PlainUserNameRenderer_name$key = {
  +$data?: RelayReferenceMarkerTest2PlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayReferenceMarkerTest2PlainUserNameRenderer_name$ref,
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

module.exports = node;
