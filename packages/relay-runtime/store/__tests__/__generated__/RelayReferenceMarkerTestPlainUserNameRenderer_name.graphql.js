/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fffdc4713e2059dd7f3cd53712e3411a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayReferenceMarkerTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayReferenceMarkerTestPlainUserNameRenderer_name$fragmentType: RelayReferenceMarkerTestPlainUserNameRenderer_name$ref;
export type RelayReferenceMarkerTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayReferenceMarkerTestPlainUserNameRenderer_name$ref,
|};
export type RelayReferenceMarkerTestPlainUserNameRenderer_name$data = RelayReferenceMarkerTestPlainUserNameRenderer_name;
export type RelayReferenceMarkerTestPlainUserNameRenderer_name$key = {
  +$data?: RelayReferenceMarkerTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayReferenceMarkerTestPlainUserNameRenderer_name$ref,
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

module.exports = node;
