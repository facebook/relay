/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1f688d08b47859d7571dcd2fee9208b9>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTest5PlainUserNameRenderer_name$fragmentType: FragmentType;
export type DataCheckerTest5PlainUserNameRenderer_name$data = {|
  +data: ?{|
    +text: ?string,
  |},
  +plaintext: ?string,
  +$fragmentType: DataCheckerTest5PlainUserNameRenderer_name$fragmentType,
|};
export type DataCheckerTest5PlainUserNameRenderer_name$key = {
  +$data?: DataCheckerTest5PlainUserNameRenderer_name$data,
  +$fragmentSpreads: DataCheckerTest5PlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTest5PlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "ac8ff6d1542a39373dd84ad4f75d4898";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTest5PlainUserNameRenderer_name$fragmentType,
  DataCheckerTest5PlainUserNameRenderer_name$data,
>*/);
