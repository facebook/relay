/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<f85e09b50d729bafdefaa2d1b2c19856>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user$fragmentType } from "./RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user.graphql";
export type RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery = {|
  response: RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery$data,
  variables: RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "id"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "id",
    "variableName": "id"
  }
],
v2 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "name",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user",
                  "selections": (v2/*: any*/),
                  "args": null,
                  "argumentDefinitions": []
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "aliased_fragment"
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          {
            "kind": "InlineFragment",
            "selections": (v2/*: any*/),
            "type": "User",
            "abstractKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "9b52132d7d5d7e38331def439fb9ca1b",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ...RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestInlineDoesNotMatch_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "78df70e98da304fff465c4dd1c836848";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery$variables,
  RelayReaderAliasedFragmentsTestInlineDoesNotMatchQuery$data,
>*/);
