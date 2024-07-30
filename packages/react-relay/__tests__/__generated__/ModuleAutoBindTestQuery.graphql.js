/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<558930766ba6f8463b1f2ba2dde8b7ef>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency ModuleAutoBindTestQuery.me {"branches":{"User":{"component":"ModuleAutoBindTestFragment","fragment":"ModuleAutoBindTestFragment_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { ModuleAutoBindTestFragment_user$fragmentType } from "./ModuleAutoBindTestFragment_user.graphql";
export type ModuleAutoBindTestQuery$variables = {||};
export type ModuleAutoBindTestQuery$data = {|
  +me: ?{|
    +__fragmentPropName: ?string,
    +__module_component: ?string,
    +$fragmentSpreads: ModuleAutoBindTestFragment_user$fragmentType,
  |},
|};
export type ModuleAutoBindTestQuery = {|
  response: ModuleAutoBindTestQuery$data,
  variables: ModuleAutoBindTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "args": null,
  "documentName": "ModuleAutoBindTestQuery",
  "fragmentName": "ModuleAutoBindTestFragment_user",
  "fragmentPropName": "user",
  "kind": "ModuleImport"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "ModuleAutoBindTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "ModuleAutoBindTestQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v0/*: any*/),
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
    "cacheID": "1a92b2cbf65ce3ab050ff3365c0ef1b6",
    "id": null,
    "metadata": {},
    "name": "ModuleAutoBindTestQuery",
    "operationKind": "query",
    "text": "query ModuleAutoBindTestQuery {\n  me {\n    ...ModuleAutoBindTestFragment_user\n    __module_operation_ModuleAutoBindTestQuery: js(module: \"ModuleAutoBindTestFragment_user$normalization.graphql\", id: \"ModuleAutoBindTestQuery.me\")\n    __module_component_ModuleAutoBindTestQuery: js(module: \"ModuleAutoBindTestFragment\", id: \"ModuleAutoBindTestQuery.me\")\n    id\n  }\n}\n\nfragment ModuleAutoBindTestFragment_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c7c696cc0f66ba15ba76e40e841fc2a1";
}

module.exports = ((node/*: any*/)/*: Query<
  ModuleAutoBindTestQuery$variables,
  ModuleAutoBindTestQuery$data,
>*/);
