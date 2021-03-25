/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8fb69835f068423df0141bb11b19ab0c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type UserGreeting$ref: FragmentReference;
declare export opaque type UserGreeting$fragmentType: UserGreeting$ref;
export type UserGreeting = {|
  +name: ?string,
  +$refType: UserGreeting$ref,
|};
export type UserGreeting$data = UserGreeting;
export type UserGreeting$key = {
  +$data?: UserGreeting$data,
  +$fragmentRefs: UserGreeting$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "UserGreeting",
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
  (node/*: any*/).hash = "ce926cff7d9f8ebc6ac8e03f220da358";
}

module.exports = node;
