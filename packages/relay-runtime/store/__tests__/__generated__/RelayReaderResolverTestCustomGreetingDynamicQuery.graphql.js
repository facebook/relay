/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fa3ea6df938336ffeb6f13d87f7e9fa6>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type UserCustomGreetingResolver$key = any;
import userCustomGreetingResolver from "../resolvers/UserCustomGreetingResolver.js";
// Type assertion validating that `userCustomGreetingResolver` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userCustomGreetingResolver: (
  rootKey: UserCustomGreetingResolver$key, 
  args: {|
    salutation: string,
  |}, 
) => mixed);
export type RelayReaderResolverTestCustomGreetingDynamicQuery$variables = {|
  salutation: string,
|};
export type RelayReaderResolverTestCustomGreetingDynamicQuery$data = {|
  +me: ?{|
    +dynamic_greeting: ?$Call<<R>((...empty[]) => R) => R, typeof userCustomGreetingResolver>,
    +greetz: ?$Call<<R>((...empty[]) => R) => R, typeof userCustomGreetingResolver>,
    +willkommen: ?$Call<<R>((...empty[]) => R) => R, typeof userCustomGreetingResolver>,
  |},
|};
export type RelayReaderResolverTestCustomGreetingDynamicQuery = {|
  response: RelayReaderResolverTestCustomGreetingDynamicQuery$data,
  variables: RelayReaderResolverTestCustomGreetingDynamicQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "salutation"
  }
],
v1 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "UserCustomGreetingResolver"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTestCustomGreetingDynamicQuery",
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
            "alias": "dynamic_greeting",
            "args": [
              {
                "kind": "Variable",
                "name": "salutation",
                "variableName": "salutation"
              }
            ],
            "fragment": (v1/*: any*/),
            "kind": "RelayResolver",
            "name": "custom_greeting",
            "resolverModule": require('./../resolvers/UserCustomGreetingResolver'),
            "path": "me.dynamic_greeting"
          },
          {
            "alias": "greetz",
            "args": [
              {
                "kind": "Literal",
                "name": "salutation",
                "value": "Greetz"
              }
            ],
            "fragment": (v1/*: any*/),
            "kind": "RelayResolver",
            "name": "custom_greeting",
            "resolverModule": require('./../resolvers/UserCustomGreetingResolver'),
            "path": "me.greetz"
          },
          {
            "alias": "willkommen",
            "args": [
              {
                "kind": "Literal",
                "name": "salutation",
                "value": "Willkommen"
              }
            ],
            "fragment": (v1/*: any*/),
            "kind": "RelayResolver",
            "name": "custom_greeting",
            "resolverModule": require('./../resolvers/UserCustomGreetingResolver'),
            "path": "me.willkommen"
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
    "name": "RelayReaderResolverTestCustomGreetingDynamicQuery",
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
            "name": "name",
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
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "d531ee7ec8d062c94b16cdb2821cb2c9",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTestCustomGreetingDynamicQuery",
    "operationKind": "query",
    "text": "query RelayReaderResolverTestCustomGreetingDynamicQuery {\n  me {\n    ...UserCustomGreetingResolver\n    id\n  }\n}\n\nfragment UserCustomGreetingResolver on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8c67182e4793c86d528dbe4b8cf94a87";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTestCustomGreetingDynamicQuery$variables,
  RelayReaderResolverTestCustomGreetingDynamicQuery$data,
>*/);
