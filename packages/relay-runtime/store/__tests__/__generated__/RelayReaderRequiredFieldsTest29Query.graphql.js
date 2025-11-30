/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9dcb393db8a3a7adfa8202c9ed3e6614>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { Result } from "relay-runtime";
import {client_object as userClientObjectResolverType} from "../resolvers/UserClientEdgeClientObjectResolver.js";
import type { TestResolverContextType } from "../../../mutations/__tests__/TestResolverContextType";
// Type assertion validating that `userClientObjectResolverType` resolver is correctly implemented.
// A type error here indicates that the type signature of the resolver module is incorrect.
(userClientObjectResolverType: (
  args: {|
    return_null: boolean,
  |},
  context: TestResolverContextType,
) => ?User__client_object$normalization);
import type { User__client_object$normalization } from "./../resolvers/__generated__/User__client_object$normalization.graphql";
export type RelayReaderRequiredFieldsTest29Query$variables = {||};
export type RelayReaderRequiredFieldsTest29Query$data = {|
  +me: Result<?{|
    +client_object: {|
      +description: ?string,
    |},
  |}, unknown>,
|};
export type RelayReaderRequiredFieldsTest29Query = {|
  response: RelayReaderRequiredFieldsTest29Query$data,
  variables: RelayReaderRequiredFieldsTest29Query$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "kind": "Literal",
    "name": "return_null",
    "value": true
  }
],
v1 = {
  "alias": null,
  "args": (v0/*: any*/),
  "concreteType": "ClientObject",
  "kind": "LinkedField",
  "name": "client_object",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    }
  ],
  "storageKey": "client_object(return_null:true)"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": {
      "hasClientEdges": true,
      "throwOnFieldError": true
    },
    "name": "RelayReaderRequiredFieldsTest29Query",
    "selections": [
      {
        "kind": "CatchField",
        "field": {
          "alias": null,
          "args": null,
          "concreteType": "User",
          "kind": "LinkedField",
          "name": "me",
          "plural": false,
          "selections": [
            {
              "kind": "RequiredField",
              "field": {
                "kind": "ClientEdgeToClientObject",
                "concreteType": "ClientObject",
                "modelResolvers": null,
                "backingField": {
                  "alias": null,
                  "args": (v0/*: any*/),
                  "fragment": null,
                  "kind": "RelayResolver",
                  "name": "client_object",
                  "resolverModule": require('../resolvers/UserClientEdgeClientObjectResolver').client_object,
                  "path": "me.client_object",
                  "normalizationInfo": {
                    "kind": "OutputType",
                    "concreteType": "ClientObject",
                    "plural": false,
                    "normalizationNode": require('./../resolvers/__generated__/User__client_object$normalization.graphql')
                  }
                },
                "linkedField": (v1/*: any*/)
              },
              "action": "THROW"
            }
          ],
          "storageKey": null
        },
        "to": "RESULT"
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayReaderRequiredFieldsTest29Query",
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
            "kind": "ClientEdgeToClientObject",
            "backingField": {
              "name": "client_object",
              "args": (v0/*: any*/),
              "fragment": null,
              "kind": "RelayResolver",
              "storageKey": "client_object(return_null:true)",
              "isOutputType": true
            },
            "linkedField": (v1/*: any*/)
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
    "cacheID": "c830fe404502bd8a8b9e049eaae2c560",
    "id": null,
    "metadata": {},
    "name": "RelayReaderRequiredFieldsTest29Query",
    "operationKind": "query",
    "text": "query RelayReaderRequiredFieldsTest29Query {\n  me {\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "aee36dea6de9874bcda584fda87b1e8c";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderRequiredFieldsTest29Query$variables,
  RelayReaderRequiredFieldsTest29Query$data,
>*/);
