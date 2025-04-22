/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<623769945819d176c24e3232659b0b2c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @indirectDataDrivenDependency RelayClient3DModuleTestFragment2BasicUser.basicUser {"branches":{"ClientUser":{"component":"ClientUser.react","fragment":"RelayClient3DModuleTestFragmentClientUser_data$normalization.graphql"},"SpecialUser":{"component":"SpecialUser.react","fragment":"RelayClient3DModuleTestFragmentSpecialUser_data$normalization.graphql"}},"plural":false}

/*::
import type { ClientRequest, ClientQuery } from 'relay-runtime';
import type { RelayClient3DModuleTestFragment2BasicUser$fragmentType } from "./RelayClient3DModuleTestFragment2BasicUser.graphql";
export type RelayClient3DModuleTestQuery$variables = {||};
export type RelayClient3DModuleTestQuery$data = {|
  +persona: ?{|
    +$fragmentSpreads: RelayClient3DModuleTestFragment2BasicUser$fragmentType,
  |},
|};
export type RelayClient3DModuleTestQuery = {|
  response: RelayClient3DModuleTestQuery$data,
  variables: RelayClient3DModuleTestQuery$variables,
|};
*/

var node/*: ClientRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "id",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayClient3DModuleTestQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Persona",
            "kind": "LinkedField",
            "name": "persona",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayClient3DModuleTestFragment2BasicUser"
              }
            ],
            "storageKey": null
          }
        ]
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayClient3DModuleTestQuery",
    "selections": [
      {
        "kind": "ClientExtension",
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Persona",
            "kind": "LinkedField",
            "name": "persona",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": null,
                "kind": "LinkedField",
                "name": "basicUser",
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
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": null,
                        "documentName": "RelayClient3DModuleTestFragment2BasicUser",
                        "fragmentName": "RelayClient3DModuleTestFragmentClientUser_data",
                        "fragmentPropName": "data",
                        "kind": "ModuleImport",
                        "componentModuleProvider": () => require('./../ClientUser.react'),
                        "operationModuleProvider": () => require('./RelayClient3DModuleTestFragmentClientUser_data$normalization.graphql')
                      }
                    ],
                    "type": "ClientUser",
                    "abstractKey": null
                  },
                  {
                    "kind": "InlineFragment",
                    "selections": [
                      {
                        "args": null,
                        "documentName": "RelayClient3DModuleTestFragment2BasicUser",
                        "fragmentName": "RelayClient3DModuleTestFragmentSpecialUser_data",
                        "fragmentPropName": "data",
                        "kind": "ModuleImport",
                        "componentModuleProvider": () => require('./../SpecialUser.react'),
                        "operationModuleProvider": () => require('./RelayClient3DModuleTestFragmentSpecialUser_data$normalization.graphql')
                      }
                    ],
                    "type": "SpecialUser",
                    "abstractKey": null
                  },
                  (v0/*: any*/)
                ],
                "storageKey": null
              },
              (v0/*: any*/)
            ],
            "storageKey": null
          }
        ]
      }
    ]
  },
  "params": {
    "cacheID": "f11a7e533c2d7991804909d834ae071c",
    "id": null,
    "metadata": {},
    "name": "RelayClient3DModuleTestQuery",
    "operationKind": "query",
    "text": null
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "8dbcbcf741954b447de47b29ffdc8244";
}

module.exports = ((node/*: any*/)/*: ClientQuery<
  RelayClient3DModuleTestQuery$variables,
  RelayClient3DModuleTestQuery$data,
>*/);
