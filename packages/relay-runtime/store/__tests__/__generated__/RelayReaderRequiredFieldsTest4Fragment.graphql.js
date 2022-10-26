/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e29e7790a574b18e2cb355f00ee3970c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderRequiredFieldsTest4Fragment$fragmentType: FragmentType;
export type RelayReaderRequiredFieldsTest4Fragment$data = ?{|
  +me: {|
    +lastName: string,
  |},
  +$fragmentType: RelayReaderRequiredFieldsTest4Fragment$fragmentType,
|};
export type RelayReaderRequiredFieldsTest4Fragment$key = {
  +$data?: RelayReaderRequiredFieldsTest4Fragment$data,
  +$fragmentSpreads: RelayReaderRequiredFieldsTest4Fragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderRequiredFieldsTest4Fragment",
  "selections": [
    {
      "kind": "RequiredField",
      "field": {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          {
            "kind": "RequiredField",
            "field": {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "lastName",
              "storageKey": null
            },
            "action": "LOG",
            "path": "me.lastName"
          }
        ],
        "storageKey": null
      },
      "action": "LOG",
      "path": "me"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d7f205cf08433933dc07eab03eb39cee";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderRequiredFieldsTest4Fragment$fragmentType,
  RelayReaderRequiredFieldsTest4Fragment$data,
>*/);
