/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<c46dbd8f6bc355593185065ad47040d4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserCustomGreetingResolver$key } from "./../resolvers/__generated__/UserCustomGreetingResolver.graphql";
import {custom_greeting as userCustomGreetingResolverType} from "../resolvers/UserCustomGreetingResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userCustomGreetingResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userCustomGreetingResolverType: (
  rootKey: UserCustomGreetingResolver$key,
  args: {|
    salutation: string,
  |},
  context: TestResolverContextType,
) => ?string);
export type RelayReaderResolverTestCustomGreetingDynamicQuery$variables = {|
  salutation: string,
|};
export type RelayReaderResolverTestCustomGreetingDynamicQuery$data = {|
  +me: ?{|
    +dynamic_greeting: ?string,
    +greetz: ?string,
    +willkommen: ?string,
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
v1 = [
  {
    "kind": "Variable",
    "name": "salutation",
    "variableName": "salutation"
  }
],
v2 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "UserCustomGreetingResolver"
},
v3 = [
  {
    "kind": "Literal",
    "name": "salutation",
    "value": "Greetz"
  }
],
v4 = [
  {
    "kind": "Literal",
    "name": "salutation",
    "value": "Willkommen"
  }
],
v5 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
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
            "args": (v1/*: any*/),
            "fragment": (v2/*: any*/),
            "kind": "RelayResolver",
            "name": "custom_greeting",
            "resolverModule": require('../resolvers/UserCustomGreetingResolver').custom_greeting,
            "path": "me.dynamic_greeting"
          },
          {
            "alias": "greetz",
            "args": (v3/*: any*/),
            "fragment": (v2/*: any*/),
            "kind": "RelayResolver",
            "name": "custom_greeting",
            "resolverModule": require('../resolvers/UserCustomGreetingResolver').custom_greeting,
            "path": "me.greetz"
          },
          {
            "alias": "willkommen",
            "args": (v4/*: any*/),
            "fragment": (v2/*: any*/),
            "kind": "RelayResolver",
            "name": "custom_greeting",
            "resolverModule": require('../resolvers/UserCustomGreetingResolver').custom_greeting,
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
            "name": "custom_greeting",
            "args": (v1/*: any*/),
            "fragment": (v5/*: any*/),
            "kind": "RelayResolver",
            "storageKey": null,
            "isOutputType": true
          },
          {
            "name": "custom_greeting",
            "args": (v3/*: any*/),
            "fragment": (v5/*: any*/),
            "kind": "RelayResolver",
            "storageKey": "custom_greeting(salutation:\"Greetz\")",
            "isOutputType": true
          },
          {
            "name": "custom_greeting",
            "args": (v4/*: any*/),
            "fragment": (v5/*: any*/),
            "kind": "RelayResolver",
            "storageKey": "custom_greeting(salutation:\"Willkommen\")",
            "isOutputType": true
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
