/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8fbdcd01b590dd1fbe6ecea4d3bb09e2>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { EmptyCheckerTestArgumentFragment$fragmentType } from "./EmptyCheckerTestArgumentFragment.graphql";
export type EmptyCheckerTestFragmentArgumentQuery$variables = {|
  includeMe: boolean,
|};
export type EmptyCheckerTestFragmentArgumentQuery$data = {|
  +$fragmentSpreads: EmptyCheckerTestArgumentFragment$fragmentType,
|};
export type EmptyCheckerTestFragmentArgumentQuery = {|
  response: EmptyCheckerTestFragmentArgumentQuery$data,
  variables: EmptyCheckerTestFragmentArgumentQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "includeMe"
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "EmptyCheckerTestFragmentArgumentQuery",
    "selections": [
      {
        "args": [
          {
            "kind": "Variable",
            "name": "includeMeField",
            "variableName": "includeMe"
          }
        ],
        "kind": "FragmentSpread",
        "name": "EmptyCheckerTestArgumentFragment"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "EmptyCheckerTestFragmentArgumentQuery",
    "selections": [
      {
        "condition": "includeMe",
        "kind": "Condition",
        "passingValue": true,
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
                "name": "id",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "7a717f13b435ce71b357d94ea6ec2eb8",
    "id": null,
    "metadata": {},
    "name": "EmptyCheckerTestFragmentArgumentQuery",
    "operationKind": "query",
    "text": "query EmptyCheckerTestFragmentArgumentQuery(\n  $includeMe: Boolean!\n) {\n  ...EmptyCheckerTestArgumentFragment_4vFgHb\n}\n\nfragment EmptyCheckerTestArgumentFragment_4vFgHb on Query {\n  me @include(if: $includeMe) {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5182a257fcd207f373eba76e5dfec160";
}

module.exports = ((node/*: any*/)/*: Query<
  EmptyCheckerTestFragmentArgumentQuery$variables,
  EmptyCheckerTestFragmentArgumentQuery$data,
>*/);
