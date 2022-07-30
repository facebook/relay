/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<7821d69698d15058c1a5745ce776024d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type readUpdatableFragmentEXPERIMENTALTest_2_user$fragmentType = any;
type readUpdatableFragmentEXPERIMENTALTest_user$fragmentType = any;
export type readUpdatableFragmentEXPERIMENTALTestRegularQuery$variables = {|
  if2?: ?boolean,
  if3?: ?boolean,
|};
export type readUpdatableFragmentEXPERIMENTALTestRegularQuery$data = {|
  +me: ?{|
    +$updatableFragmentSpreads: readUpdatableFragmentEXPERIMENTALTest_2_user$fragmentType & readUpdatableFragmentEXPERIMENTALTest_user$fragmentType,
    +firstName: ?string,
    +firstName2: ?string,
    +firstName3: ?string,
  |},
|};
export type readUpdatableFragmentEXPERIMENTALTestRegularQuery = {|
  response: readUpdatableFragmentEXPERIMENTALTestRegularQuery$data,
  variables: readUpdatableFragmentEXPERIMENTALTestRegularQuery$variables,
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
    "name": "readUpdatableFragmentEXPERIMENTALTestRegularQuery",
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
            "name": "readUpdatableFragmentEXPERIMENTALTest_user"
          },
          {
            "args": null,
            "kind": "FragmentSpread",
            "name": "readUpdatableFragmentEXPERIMENTALTest_2_user"
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
    "name": "readUpdatableFragmentEXPERIMENTALTestRegularQuery",
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
    "cacheID": "1b4bfc80599b384d83872eb0aea657ab",
    "id": null,
    "metadata": {},
    "name": "readUpdatableFragmentEXPERIMENTALTestRegularQuery",
    "operationKind": "query",
    "text": "query readUpdatableFragmentEXPERIMENTALTestRegularQuery(\n  $if2: Boolean\n  $if3: Boolean\n) {\n  me {\n    __typename\n    firstName\n    firstName2: firstName(if: $if2)\n    firstName3: firstName(if: $if3)\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "7246306333eabc00f92117b5faf95307";
}

module.exports = ((node/*: any*/)/*: Query<
  readUpdatableFragmentEXPERIMENTALTestRegularQuery$variables,
  readUpdatableFragmentEXPERIMENTALTestRegularQuery$data,
>*/);
