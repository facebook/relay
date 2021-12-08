/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<539c22f9d23f78f7115c3652841dac07>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType = any;
export type RelayModernEnvironmentNoInlineTestStreamQuery$variables = {|
  cond: boolean,
|};
export type RelayModernEnvironmentNoInlineTestStreamQueryVariables = RelayModernEnvironmentNoInlineTestStreamQuery$variables;
export type RelayModernEnvironmentNoInlineTestStreamQuery$data = {|
  +node: ?{|
    +$fragmentSpreads: RelayModernEnvironmentNoInlineTestStream_feedback$fragmentType,
  |},
|};
export type RelayModernEnvironmentNoInlineTestStreamQueryResponse = RelayModernEnvironmentNoInlineTestStreamQuery$data;
export type RelayModernEnvironmentNoInlineTestStreamQuery = {|
  variables: RelayModernEnvironmentNoInlineTestStreamQueryVariables,
  response: RelayModernEnvironmentNoInlineTestStreamQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "cond"
  }
],
v1 = [
  {
    "kind": "Literal",
    "name": "id",
    "value": "1"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentNoInlineTestStreamQuery",
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
            "args": [
              {
                "kind": "Variable",
                "name": "cond",
                "variableName": "cond"
              }
            ],
            "kind": "FragmentSpread",
            "name": "RelayModernEnvironmentNoInlineTestStream_feedback"
          }
        ],
        "storageKey": "node(id:\"1\")"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentNoInlineTestStreamQuery",
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
            "args": [
              {
                "kind": "Variable",
                "name": "RelayModernEnvironmentNoInlineTestStream_feedback$cond",
                "variableName": "cond"
              }
            ],
            "fragment": require('./RelayModernEnvironmentNoInlineTestStream_feedback$normalization.graphql'),
            "kind": "FragmentSpread"
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "id",
            "storageKey": null
          }
        ],
        "storageKey": "node(id:\"1\")"
      }
    ]
  },
  "params": {
    "cacheID": "8fc97cd294d6932de54434bbab273bbf",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentNoInlineTestStreamQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentNoInlineTestStreamQuery(\n  $cond: Boolean!\n) {\n  node(id: \"1\") {\n    __typename\n    ...RelayModernEnvironmentNoInlineTestStream_feedback_yuQoQ\n    id\n  }\n}\n\nfragment RelayModernEnvironmentNoInlineTestStream_feedback_yuQoQ on Feedback {\n  actors @stream(label: \"RelayModernEnvironmentNoInlineTestStream_feedback$stream$actors\", initial_count: 0) {\n    __typename\n    __isActor: __typename @include(if: $cond)\n    name @include(if: $cond)\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "07e00f103682c152c4770a0e200cd6e7";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentNoInlineTestStreamQuery$variables,
  RelayModernEnvironmentNoInlineTestStreamQuery$data,
>*/);
