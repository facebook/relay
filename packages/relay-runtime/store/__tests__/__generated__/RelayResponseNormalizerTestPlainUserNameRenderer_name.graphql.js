/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8f8ed9a7aa03f8e25847d077e3c51fc4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestPlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType: RelayResponseNormalizerTestPlainUserNameRenderer_name$ref;
export type RelayResponseNormalizerTestPlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayResponseNormalizerTestPlainUserNameRenderer_name$ref,
|};
export type RelayResponseNormalizerTestPlainUserNameRenderer_name$data = RelayResponseNormalizerTestPlainUserNameRenderer_name;
export type RelayResponseNormalizerTestPlainUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTestPlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayResponseNormalizerTestPlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "6b434d25ec11ad6889207fddbd01b89e";
}

module.exports = node;
