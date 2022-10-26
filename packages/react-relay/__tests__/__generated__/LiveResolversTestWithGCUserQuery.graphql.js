/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<d5b4622300a406f82a03e6cdf15ccbca>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type LiveResolversTestWithGCUserQuery$variables = {||};
export type LiveResolversTestWithGCUserQuery$data = {|
  +me: ?{|
    +id: string,
  |},
|};
export type LiveResolversTestWithGCUserQuery = {|
  response: LiveResolversTestWithGCUserQuery$data,
  variables: LiveResolversTestWithGCUserQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
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
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "LiveResolversTestWithGCUserQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "LiveResolversTestWithGCUserQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "ff92e813e833002678a8f48ca7382b3e",
    "id": null,
    "metadata": {},
    "name": "LiveResolversTestWithGCUserQuery",
    "operationKind": "query",
    "text": "query LiveResolversTestWithGCUserQuery {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "aa6a9402484f9565a635ead00203176b";
}

module.exports = ((node/*: any*/)/*: Query<
  LiveResolversTestWithGCUserQuery$variables,
  LiveResolversTestWithGCUserQuery$data,
>*/);
