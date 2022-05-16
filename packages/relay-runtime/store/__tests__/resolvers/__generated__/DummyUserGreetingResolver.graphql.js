/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c67e5c39a4168bb82d06c32457c73e93>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DummyUserGreetingResolver$fragmentType: FragmentType;
export type DummyUserGreetingResolver$data = {|
  +name: ?string,
  +$fragmentType: DummyUserGreetingResolver$fragmentType,
|};
export type DummyUserGreetingResolver$key = {
  +$data?: DummyUserGreetingResolver$data,
  +$fragmentSpreads: DummyUserGreetingResolver$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DummyUserGreetingResolver",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "47f92b5ef5ff5c70f9a79584b7f6ff8b";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DummyUserGreetingResolver$fragmentType,
  DummyUserGreetingResolver$data,
>*/);
