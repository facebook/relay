/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<73b8605ac3760044029fbbdb5d24fd6a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestInline_user$fragmentType } from "./RelayReaderAliasedFragmentsTestInline_user.graphql";
export type RelayReaderAliasedFragmentsTestInlineQuery$variables = {||};
export type RelayReaderAliasedFragmentsTestInlineQuery$data = {|
  +me: ?{|
    +aliased_fragment: {|
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestInline_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestInlineQuery = {|
  response: RelayReaderAliasedFragmentsTestInlineQuery$data,
  variables: RelayReaderAliasedFragmentsTestInlineQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestInlineQuery",
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
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                {
                  "kind": "InlineDataFragmentSpread",
                  "name": "RelayReaderAliasedFragmentsTestInline_user",
                  "selections": [
                    (v0/*: any*/)
                  ],
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
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderAliasedFragmentsTestInlineQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "940c1f970c9b37323a52acc6f0aca305",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestInlineQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestInlineQuery {\n  me {\n    ...RelayReaderAliasedFragmentsTestInline_user\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestInline_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3af78f20037ecd47cd47a2996051cb67";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestInlineQuery$variables,
  RelayReaderAliasedFragmentsTestInlineQuery$data,
>*/);
