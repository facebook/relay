/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8f3a81b8bacd29aee057be70c69f3793>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type InnerResolver$fragmentType: FragmentType;
export type InnerResolver$data = {|
  +me: ?{|
    +name: ?string,
  |},
  +$fragmentType: InnerResolver$fragmentType,
|};
export type InnerResolver$key = {
  +$data?: InnerResolver$data,
  +$fragmentSpreads: InnerResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "InnerResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "me",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8f996f9ead6680e3b3bb106bb87a1fb5";
}

module.exports = ((node/*: any*/)/*: Fragment<
  InnerResolver$fragmentType,
  InnerResolver$data,
>*/);
