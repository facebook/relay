/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<7fb7ab01b17b6667200fcea0a37feb54>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment, RefetchableFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$fragmentType: FragmentType;
type ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$variables = any;
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$data = {
  readonly id: string,
  readonly legs: ?number,
  readonly $fragmentType: RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$fragmentType,
};
export type RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$key = {
  readonly $data?: RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$data,
  readonly $fragmentSpreads: RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": {
    "refetch": {
      "connection": null,
      "fragmentPathInResult": [
        "fetch__Chicken"
      ],
      "operation": require('./ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals.graphql'),
      "identifierInfo": {
        "identifierField": "id",
        "identifierQueryVariableName": "id"
      }
    }
  },
  "name": "RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "legs",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    }
  ],
  "type": "Chicken",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "c269150bc8b81e02f100dad3641bbd60";
}

module.exports = ((node/*:: as any*/)/*:: as RefetchableFragment<
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$fragmentType,
  RefetchableClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$data,
  ClientEdgeQuery_RelayReaderClientEdgesTestPluralMixedEdgeQuery_animals$variables,
>*/);
