/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e85f72321280ba279fc3229bd1a004b4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +name: string,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery = {|
  response: RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery$data,
  variables: RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery$variables,
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
    "name": "RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery",
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
    "name": "RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery",
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
    "cacheID": "19d00fef41311258e38e300f11e87deb",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on MaybeNodeInterface {\n      __isMaybeNodeInterface: __typename\n      name\n    }\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "aff0ceafe68ed986ef0bc31c1c56854d";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery$variables,
  RelayReaderAliasedFragmentsTestRequiredBubblesOnAbstractTypeQuery$data,
>*/);
