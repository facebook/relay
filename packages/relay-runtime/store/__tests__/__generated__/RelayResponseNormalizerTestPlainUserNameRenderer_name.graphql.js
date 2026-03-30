/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c62326b4e8cc4b9fc2d6c7b79f9a851e>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayResponseNormalizerTestPlainUserNameRenderer_name$data = {|
  +data: ?{|
    +text: ?string,
  |},
  +plaintext: ?string,
  +$fragmentType: RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayResponseNormalizerTestPlainUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType,
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
  (node/*:: as any*/).hash = "6b434d25ec11ad6889207fddbd01b89e";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayResponseNormalizerTestPlainUserNameRenderer_name$fragmentType,
  RelayResponseNormalizerTestPlainUserNameRenderer_name$data,
>*/);
