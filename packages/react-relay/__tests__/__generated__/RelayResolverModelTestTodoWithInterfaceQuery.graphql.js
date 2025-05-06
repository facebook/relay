/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6523c180ad17f819d7fc6ca1b41d7b20>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { DataID } from "relay-runtime";
import type { RelayResolverModelTestInterfaceFragment$fragmentType } from "./RelayResolverModelTestInterfaceFragment.graphql";
import {todo_model as queryTodoModelResolverType} from "../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel.js";
import type { TestResolverContextType } from "../../../relay-runtime/mutations/__tests__/TestResolverContextType";
// Type assertion validating that `queryTodoModelResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(queryTodoModelResolverType: (
  args: {|
    todoID: string,
  |},
  context: TestResolverContextType,
) => ?{|
  +id: DataID,
|});
export type RelayResolverModelTestTodoWithInterfaceQuery$variables = {|
  id: string,
|};
export type RelayResolverModelTestTodoWithInterfaceQuery$data = {|
  +todo_model: ?{|
    +$fragmentSpreads: RelayResolverModelTestInterfaceFragment$fragmentType,
  |},
|};
export type RelayResolverModelTestTodoWithInterfaceQuery = {|
  response: RelayResolverModelTestTodoWithInterfaceQuery$data,
  variables: RelayResolverModelTestTodoWithInterfaceQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
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
    "name": "todoID",
    "variableName": "id"
  }
],
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
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "__relay_model_instance",
      "storageKey": null
    }
  ],
  "type": "TodoDescription",
  "abstractKey": null
},
v4 = [
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "__typename",
    "storageKey": null
  },
  {
    "alias": null,
    "args": null,
    "kind": "ScalarField",
    "name": "description",
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true
    },
    "name": "RelayResolverModelTestTodoWithInterfaceQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "concreteType": "TodoModel",
        "modelResolvers": {
          "TodoModel": {
            "alias": null,
            "args": null,
            "fragment": {
              "args": null,
              "kind": "FragmentSpread",
              "name": "TodoModel__id"
            },
            "kind": "RelayLiveResolver",
            "name": "__relay_model_instance",
            "resolverModule": require('relay-runtime/experimental').resolverDataInjector(require('./../../../relay-runtime/store/__tests__/resolvers/__generated__/TodoModel__id.graphql'), require('../../../relay-runtime/store/__tests__/resolvers/TodoModel').TodoModel, 'id', true),
            "path": "todo_model.__relay_model_instance"
          }
        },
        "backingField": {
          "alias": null,
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "name": "todo_model",
          "resolverModule": require('../../../relay-runtime/store/__tests__/resolvers/QueryTodoModel').todo_model,
          "path": "todo_model"
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "TodoModel",
          "kind": "LinkedField",
          "name": "todo_model",
          "plural": false,
          "selections": [
            {
              "args": null,
              "kind": "FragmentSpread",
              "name": "RelayResolverModelTestInterfaceFragment"
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayResolverModelTestTodoWithInterfaceQuery",
    "selections": [
      {
        "kind": "ClientEdgeToClientObject",
        "backingField": {
          "name": "todo_model",
          "args": (v1/*: any*/),
          "fragment": null,
          "kind": "RelayResolver",
          "storageKey": null,
          "isOutputType": false
        },
        "linkedField": {
          "alias": null,
          "args": (v1/*: any*/),
          "concreteType": "TodoModel",
          "kind": "LinkedField",
          "name": "todo_model",
          "plural": false,
          "selections": [
            {
              "kind": "ClientEdgeToClientObject",
              "backingField": {
                "name": "fancy_description",
                "args": null,
                "fragment": {
                  "kind": "InlineFragment",
                  "selections": [
                    {
                      "name": "__relay_model_instance",
                      "args": null,
                      "fragment": {
                        "kind": "InlineFragment",
                        "selections": [
                          (v2/*: any*/)
                        ],
                        "type": "TodoModel",
                        "abstractKey": null
                      },
                      "kind": "RelayResolver",
                      "storageKey": null,
                      "isOutputType": false
                    }
                  ],
                  "type": "TodoModel",
                  "abstractKey": null
                },
                "kind": "RelayResolver",
                "storageKey": null,
                "isOutputType": true
              },
              "linkedField": {
                "alias": null,
                "args": null,
                "concreteType": "TodoDescription",
                "kind": "LinkedField",
                "name": "fancy_description",
                "plural": false,
                "selections": [
                  {
                    "kind": "ClientEdgeToClientObject",
                    "backingField": {
                      "name": "some_interface",
                      "args": null,
                      "fragment": (v3/*: any*/),
                      "kind": "RelayResolver",
                      "storageKey": null,
                      "isOutputType": true
                    },
                    "linkedField": {
                      "alias": null,
                      "args": null,
                      "concreteType": null,
                      "kind": "LinkedField",
                      "name": "some_interface",
                      "plural": false,
                      "selections": (v4/*: any*/),
                      "storageKey": null
                    }
                  },
                  {
                    "kind": "ClientEdgeToClientObject",
                    "backingField": {
                      "name": "some_client_type_with_interface",
                      "args": null,
                      "fragment": (v3/*: any*/),
                      "kind": "RelayResolver",
                      "storageKey": null,
                      "isOutputType": true
                    },
                    "linkedField": {
                      "alias": null,
                      "args": null,
                      "concreteType": "ClientTypeWithNestedClientInterface",
                      "kind": "LinkedField",
                      "name": "some_client_type_with_interface",
                      "plural": false,
                      "selections": [
                        {
                          "alias": null,
                          "args": null,
                          "concreteType": null,
                          "kind": "LinkedField",
                          "name": "client_interface",
                          "plural": false,
                          "selections": (v4/*: any*/),
                          "storageKey": null
                        }
                      ],
                      "storageKey": null
                    }
                  }
                ],
                "storageKey": null
              }
            },
            (v2/*: any*/)
          ],
          "storageKey": null
        }
      }
    ]
  },
  "params": {
    "cacheID": "7db3bd26ebae6aa35ff94c31e5efa078",
    "id": null,
    "metadata": {},
    "name": "RelayResolverModelTestTodoWithInterfaceQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a8b583e7d4f18358def854c5ee431bba";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayResolverModelTestTodoWithInterfaceQuery$variables,
  RelayResolverModelTestTodoWithInterfaceQuery$data,
>*/);
