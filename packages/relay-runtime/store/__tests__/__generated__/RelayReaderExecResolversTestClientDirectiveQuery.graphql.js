/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<e961375f64e7aa4d3fa8171b9584a08d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { RelayReaderExecResolversTestUser____relay_model_instance$data } from "./RelayReaderExecResolversTestUser____relay_model_instance.graphql";
import {RelayReaderExecResolversTest_user_one as queryRelayReaderExecResolversTestUserOneResolverType} from "../RelayReader-ExecResolvers-test.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryRelayReaderExecResolversTestUserOneResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryRelayReaderExecResolversTestUserOneResolverType: (
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
import {best_friend as relayReaderExecResolversTestUserBestFriendResolverType} from "../RelayReader-ExecResolvers-test.js";
// Type assertion validating that `relayReaderExecResolversTestUserBestFriendResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(relayReaderExecResolversTestUserBestFriendResolverType: (
  __relay_model_instance: RelayReaderExecResolversTestUser____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
import {friends as relayReaderExecResolversTestUserFriendsResolverType} from "../RelayReader-ExecResolvers-test.js";
// Type assertion validating that `relayReaderExecResolversTestUserFriendsResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(relayReaderExecResolversTestUserFriendsResolverType: (
  __relay_model_instance: RelayReaderExecResolversTestUser____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?ReadonlyArray<?{|
  +id: DataID,
|}>);
import {name as relayReaderExecResolversTestUserNameResolverType} from "../RelayReader-ExecResolvers-test.js";
// Type assertion validating that `relayReaderExecResolversTestUserNameResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(relayReaderExecResolversTestUserNameResolverType: (
  __relay_model_instance: RelayReaderExecResolversTestUser____relay_model_instance$data['__relay_model_instance'],
  args: void,
  context: TestResolverContextType,
) => ?string);
export type RelayReaderExecResolversTestClientDirectiveQuery$variables = {||};
export type RelayReaderExecResolversTestClientDirectiveQuery$data = {|
  +RelayReaderExecResolversTest_user_one: ?{|
    +best_friend: ?{|
      +name: ?string,
    |},
    +friends: ?ReadonlyArray<?{|
      +name: ?string,
    |}>,
    +name: NonNullable<?string>,
  |},
|};
export type RelayReaderExecResolversTestClientDirectiveQuery = {|
  response: RelayReaderExecResolversTestClientDirectiveQuery$data,
  variables: RelayReaderExecResolversTestClientDirectiveQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "RelayReaderExecResolversTestUser__id"
},
v1 = {
  "args": null,
  "kind": "FragmentSpread",
  "name": "RelayReaderExecResolversTestUser____relay_model_instance"
},
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "name": "__relay_model_instance",
      "args": null,
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": false,
      "resolverInfo": {
        "resolverFunction": require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser,
        "rootFragment": null
      },
      "fragment": {
        "kind": "InlineFragment",
        "selections": [
          (v2/*: any*/)
        ],
        "type": "RelayReaderExecResolversTestUser",
        "abstractKey": null
      }
    }
  ],
  "type": "RelayReaderExecResolversTestUser",
  "abstractKey": null
},
v4 = {
  "name": "name",
  "args": null,
  "kind": "RelayResolver",
  "storageKey": null,
  "isOutputType": true,
  "resolverInfo": {
    "resolverFunction": require('../RelayReader-ExecResolvers-test').name,
    "rootFragment": null
  },
  "fragment": (v3/*: any*/)
},
v5 = [
  (v4/*: any*/),
  (v2/*: any*/)
];
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayReaderExecResolversTestClientDirectiveQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "RelayReaderExecResolversTestUser",
        "modelResolvers": {
          "RelayReaderExecResolversTestUser": {
            "alias": null,
            "args": null,
            "fragment": (v0/*: any*/),
            "kind": "RelayResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser__id.graphql'), require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser, 'id', true),
            "path": "RelayReaderExecResolversTest_user_one.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": null,
          "fragment": null,
          "kind": "RelayResolver",
          "name": "RelayReaderExecResolversTest_user_one",
          "resolverModule": require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTest_user_one,
          "path": "RelayReaderExecResolversTest_user_one"
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "RelayReaderExecResolversTestUser",
          "kind": "LinkedField",
          "name": "RelayReaderExecResolversTest_user_one",
          "plural": false,
          "selections": [
            {
              "kind": "RequiredField",
              "field": {
                "alias": null,
                "args": null,
                "fragment": (v1/*: any*/),
                "kind": "RelayResolver",
                "name": "name",
                "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser____relay_model_instance.graphql'), require('../RelayReader-ExecResolvers-test').name, '__relay_model_instance', true),
                "path": "RelayReaderExecResolversTest_user_one.name"
              },
              "action": "THROW"
            },
            {
              "kind": "ClientEdgeToClientObject",
              "concreteType": "RelayReaderExecResolversTestUser",
              "modelResolvers": {
                "RelayReaderExecResolversTestUser": {
                  "alias": null,
                  "args": null,
                  "fragment": (v0/*: any*/),
                  "kind": "RelayResolver",
                  "name": "__relay_model_instance",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser__id.graphql'), require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser, 'id', true),
                  "path": "RelayReaderExecResolversTest_user_one.best_friend.__relay_model_instance"
                }
              },
              "backingField": {
                "alias": null,
                "args": null,
                "fragment": (v1/*: any*/),
                "kind": "RelayResolver",
                "name": "best_friend",
                "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser____relay_model_instance.graphql'), require('../RelayReader-ExecResolvers-test').best_friend, '__relay_model_instance', true),
                "path": "RelayReaderExecResolversTest_user_one.best_friend"
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "RelayReaderExecResolversTestUser",
                "kind": "LinkedField",
                "name": "best_friend",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "fragment": (v1/*: any*/),
                    "kind": "RelayResolver",
                    "name": "name",
                    "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser____relay_model_instance.graphql'), require('../RelayReader-ExecResolvers-test').name, '__relay_model_instance', true),
                    "path": "RelayReaderExecResolversTest_user_one.best_friend.name"
                  }
                ],
                "storageKey": null
              }
            },
            {
              "kind": "ClientEdgeToClientObject",
              "concreteType": "RelayReaderExecResolversTestUser",
              "modelResolvers": {
                "RelayReaderExecResolversTestUser": {
                  "alias": null,
                  "args": null,
                  "fragment": (v0/*: any*/),
                  "kind": "RelayResolver",
                  "name": "__relay_model_instance",
                  "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser__id.graphql'), require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser, 'id', true),
                  "path": "RelayReaderExecResolversTest_user_one.friends.__relay_model_instance"
                }
              },
              "backingField": {
                "alias": null,
                "args": null,
                "fragment": (v1/*: any*/),
                "kind": "RelayResolver",
                "name": "friends",
                "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser____relay_model_instance.graphql'), require('../RelayReader-ExecResolvers-test').friends, '__relay_model_instance', true),
                "path": "RelayReaderExecResolversTest_user_one.friends"
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "RelayReaderExecResolversTestUser",
                "kind": "LinkedField",
                "name": "friends",
                "plural": true,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "fragment": (v1/*: any*/),
                    "kind": "RelayResolver",
                    "name": "name",
                    "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./RelayReaderExecResolversTestUser____relay_model_instance.graphql'), require('../RelayReader-ExecResolvers-test').name, '__relay_model_instance', true),
                    "path": "RelayReaderExecResolversTest_user_one.friends.name"
                  }
                ],
                "storageKey": null
              }
            }
          ],
          "storageKey": null
        }
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderExecResolversTestClientDirectiveQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "modelResolvers": {
          "RelayReaderExecResolversTestUser": {
            "resolverModule": require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser
          }
        },
        "backingField": {
          "name": "RelayReaderExecResolversTest_user_one",
          "args": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false,
          "resolverInfo": {
            "resolverFunction": require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTest_user_one,
            "rootFragment": null
          },
          "fragment": null
        },
        "linkedField": {
          "alias": null,
          "args": null,
          "concreteType": "RelayReaderExecResolversTestUser",
          "kind": "LinkedField",
          "name": "RelayReaderExecResolversTest_user_one",
          "plural": false,
          "selections": [
            (v4/*: any*/),
            {
              "kind": "ClientEdgeToClientObject",
              "modelResolvers": {
                "RelayReaderExecResolversTestUser": {
                  "resolverModule": require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser
                }
              },
              "backingField": {
                "name": "best_friend",
                "args": null,
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": false,
                "resolverInfo": {
                  "resolverFunction": require('../RelayReader-ExecResolvers-test').best_friend,
                  "rootFragment": null
                },
                "fragment": (v3/*: any*/)
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "RelayReaderExecResolversTestUser",
                "kind": "LinkedField",
                "name": "best_friend",
                "plural": false,
                "selections": (v5/*: any*/),
                "storageKey": null
              }
            },
            {
              "kind": "ClientEdgeToClientObject",
              "modelResolvers": {
                "RelayReaderExecResolversTestUser": {
                  "resolverModule": require('../RelayReader-ExecResolvers-test').RelayReaderExecResolversTestUser
                }
              },
              "backingField": {
                "name": "friends",
                "args": null,
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": false,
                "resolverInfo": {
                  "resolverFunction": require('../RelayReader-ExecResolvers-test').friends,
                  "rootFragment": null
                },
                "fragment": (v3/*: any*/)
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "RelayReaderExecResolversTestUser",
                "kind": "LinkedField",
                "name": "friends",
                "plural": true,
                "selections": (v5/*: any*/),
                "storageKey": null
              }
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        }
      }
    ],
    "exec_time_resolvers_enabled_provider": require('../relayReaderTestExecTimeResolversTrueProvider')
  },
  "params": {
    "cacheID": "93766bd16ee00d3863eac4f5873050f1",
    "id": null,
    "metadata": {},
    "name": "RelayReaderExecResolversTestClientDirectiveQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6a6cebf94e46a5bc998e01e8c6a67718";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayReaderExecResolversTestClientDirectiveQuery$variables,
  RelayReaderExecResolversTestClientDirectiveQuery$data,
>*/);
