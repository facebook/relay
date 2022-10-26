/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<0f2c4b3531bb258aa6556a7536fa2eb8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest1PlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayResponseNormalizerTest1PlainUserNameRenderer_name$data = {|
  +data: ?{|
    +text: ?string,
  |},
  +plaintext: ?string,
  +$fragmentType: RelayResponseNormalizerTest1PlainUserNameRenderer_name$fragmentType,
|};
export type RelayResponseNormalizerTest1PlainUserNameRenderer_name$key = {
  +$data?: RelayResponseNormalizerTest1PlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayResponseNormalizerTest1PlainUserNameRenderer_name$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest1PlainUserNameRenderer_name$fragmentType,
  RelayResponseNormalizerTest1PlainUserNameRenderer_name$data,
>*/);
