/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3f5e476e44ef5618f28b5a79950d2259>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayReaderAliasedFragmentsTest_query$fragmentType: FragmentType;
export type RelayReaderAliasedFragmentsTest_query$data = {
  readonly me: ?{
    readonly name: ?string,
  },
  readonly $fragmentType: RelayReaderAliasedFragmentsTest_query$fragmentType,
};
export type RelayReaderAliasedFragmentsTest_query$key = {
  readonly $data?: RelayReaderAliasedFragmentsTest_query$data,
  readonly $fragmentSpreads: RelayReaderAliasedFragmentsTest_query$fragmentType,
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
  (node/*:: as any*/).hash = "c442096e6c48bef9b9aaa887f69db1b3";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayReaderAliasedFragmentsTest_query$fragmentType,
  RelayReaderAliasedFragmentsTest_query$data,
>*/);
