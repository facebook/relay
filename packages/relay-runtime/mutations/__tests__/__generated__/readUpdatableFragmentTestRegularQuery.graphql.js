/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<898b14df672e4da8057ab584282aad1b>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { readUpdatableFragmentTest_2_user$fragmentType } from "./readUpdatableFragmentTest_2_user.graphql";
import type { readUpdatableFragmentTest_user$fragmentType } from "./readUpdatableFragmentTest_user.graphql";
export type readUpdatableFragmentTestRegularQuery$variables = {|
  if2?: ?boolean,
  if3?: ?boolean,
|};
export type readUpdatableFragmentTestRegularQuery$data = {|
  +me: ?{|
    +$updatableFragmentSpreads: readUpdatableFragmentTest_2_user$fragmentType & readUpdatableFragmentTest_user$fragmentType,
    +firstName: ?string,
    +firstName2: ?string,
    +firstName3: ?string,
  |},
|};
export type readUpdatableFragmentTestRegularQuery = {|
  response: readUpdatableFragmentTestRegularQuery$data,
  variables: readUpdatableFragmentTestRegularQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "if2"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "if3"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
},
v2 = {
  "alias": "firstName2",
  "args": [
    {
      "kind": "Variable",
      "name": "if",
      "variableName": "if2"
    }
  ],
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
},
v3 = {
  "alias": "firstName3",
  "args": [
    {
      "kind": "Variable",
      "name": "if",
      "variableName": "if3"
    }
  ],
  "kind": "ScalarField",
  "name": "firstName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "readUpdatableFragmentTestRegularQuery",
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
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableFragmentTest_user"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableFragmentTest_2_user"
          },
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/)
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
    "name": "readUpdatableFragmentTestRegularQuery",
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
            "name": "__typename",
            "storageKey": null
          },
          (v1/*: any*/),
          (v2/*: any*/),
          (v3/*: any*/),
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
    "cacheID": "ec6cc7c4d9efd732034dbc01a14d8346",
    "id": null,
    "metadata": {},
    "name": "readUpdatableFragmentTestRegularQuery",
    "operationKind": "query",
    "text": "query readUpdatableFragmentTestRegularQuery(\n  $if2: Boolean\n  $if3: Boolean\n) {\n  me {\n    __typename\n    firstName\n    firstName2: firstName(if: $if2)\n    firstName3: firstName(if: $if3)\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1fcec5ea959f10501f187ab122841d2e";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableFragmentTestRegularQuery$variables,
  readUpdatableFragmentTestRegularQuery$data,
>*/);
