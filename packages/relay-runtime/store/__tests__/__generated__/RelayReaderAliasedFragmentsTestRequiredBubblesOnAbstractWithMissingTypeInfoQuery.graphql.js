/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1983f10f1c6152238cf99fb1f78e2fff>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +name: string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery = {|
  response: RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery$data,
  variables: RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery$variables,
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
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery",
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
                  "kind": "RequiredField",
                  "field": (v2/*: any*/),
                  "action": "LOG"
                }
              ],
              "type": "MaybeNodeInterface",
              "abstractKey": "__isMaybeNodeInterface"
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
    "name": "RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery",
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
            "selections": [
              (v2/*: any*/)
            ],
            "type": "MaybeNodeInterface",
            "abstractKey": "__isMaybeNodeInterface"
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
    "cacheID": "27dc1a6eb4ad58667a59eba2126c4417",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on MaybeNodeInterface {\n      __isMaybeNodeInterface: __typename\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "43f8b10410f96ddf1bf9e9b901c8c626";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery$variables,
  RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractWithMissingTypeInfoQuery$data,
>*/);
