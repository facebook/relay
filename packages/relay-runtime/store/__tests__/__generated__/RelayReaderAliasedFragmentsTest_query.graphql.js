/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1df90bf28ea19446d8c5eff90d81c22e>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTest_query$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTest_query$data = {|
  +me: ?{|
    +name: ?string,
  |},
  +$fragmentType: RelayReaderAliasedFragmentsTest_query$fragmentType,
|};
export type RelayReaderAliasedFragmentsTest_query$key = {
  +$data?: RelayReaderAliasedFragmentsTest_query$data,
  +$fragmentSpreads: RelayReaderAliasedFragmentsTest_query$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayReaderAliasedFragmentsTest_query",
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
  (node/*: any*/).hash = "c442096e6c48bef9b9aaa887f69db1b3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayReaderAliasedFragmentsTest_query$fragmentType,
  RelayReaderAliasedFragmentsTest_query$data,
>*/);
