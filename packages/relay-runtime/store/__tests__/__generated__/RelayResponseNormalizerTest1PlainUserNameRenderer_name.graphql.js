/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<a831a7ef2c2cb2d76392577e3328df17>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest1PlainUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest1PlainUserNameRenderer_name$fragmentType: RelayResponseNormalizerTest1PlainUserNameRenderer_name$ref;
export type RelayResponseNormalizerTest1PlainUserNameRenderer_name = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: RelayResponseNormalizerTest1PlainUserNameRenderer_name$ref,
|};
export type RelayResponseNormalizerTest1PlainUserNameRenderer_name$data = RelayResponseNormalizerTest1PlainUserNameRenderer_name;
export type RelayResponseNormalizerTest1PlainUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTest1PlainUserNameRenderer_name$data,
  +$fragmentRefs: RelayResponseNormalizerTest1PlainUserNameRenderer_name$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest1PlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "4d17987489283c69926eb8c56fe413bb";
}

module.exports = node;
