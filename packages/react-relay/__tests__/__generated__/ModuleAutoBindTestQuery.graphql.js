/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9e57a8ca72114faed80cc22fb7936cd5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency ModuleAutoBindTestQuery.me.UserNameComponent {"branches":{"User":{"component":"UserNameComponent","fragment":"UserNameComponentFragment_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { UserNameComponentFragment_user$fragmentType } from "./UserNameComponentFragment_user.graphql";

// HACKED: If we enforce fragment colocation, Relay can know where this module is defined.
import typeof UserNameComponent from "../UserNameComponent";
export type ModuleAutoBindTestQuery$variables = {||};
export type ModuleAutoBindTestQuery$data = {|
  +me: ?{|
    // HACKED: We know the prop name, so we can infer the type of a React component with the fragment prop pre-bound.
    // CONCERN: This type magic is clever and correct, but makes for lousy type errors.
    // CONCERN: Would this work for component syntax?
    +UserNameComponent: (Omit<Parameters<UserNameComponent>[0], "user">) => ReturnType<UserNameComponent>,
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
  "documentName": "ModuleAutoBindTestQuery_UserNameComponent",
  "fragmentName": "UserNameComponentFragment_user",
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
          {
            "fragment": {
              "kind": "InlineFragment",
              "selections": [
                // HACKED: This is just a ModuleImport node with a different name.
                {
                  "args": null,
                  "documentName": "ModuleAutoBindTestQuery_UserNameComponent",
                  "fragmentName": "UserNameComponentFragment_user",
                  "fragmentPropName": "user",
                  "kind": "AutoBindModuleImport"
                }
              ],
              "type": "User",
              "abstractKey": null
            },
            "kind": "AliasedInlineFragmentSpread",
            "name": "UserNameComponent"
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
    "cacheID": "e24ef18e086aa7de574571390450c41a",
    "id": null,
    "metadata": {},
    "name": "ModuleAutoBindTestQuery",
    "operationKind": "query",
    "text": "query ModuleAutoBindTestQuery {\n  me {\n    ...UserNameComponentFragment_user\n    __module_operation_ModuleAutoBindTestQuery_UserNameComponent: js(module: \"UserNameComponentFragment_user$normalization.graphql\", id: \"ModuleAutoBindTestQuery.me.UserNameComponent\")\n    __module_component_ModuleAutoBindTestQuery_UserNameComponent: js(module: \"UserNameComponent\", id: \"ModuleAutoBindTestQuery.me.UserNameComponent\")\n    id\n  }\n}\n\nfragment UserNameComponentFragment_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fb1c8809fb144cba23abafa0ad8103a1";
}

module.exports = ((node/*: any*/)/*: Query<
  ModuleAutoBindTestQuery$variables,
  ModuleAutoBindTestQuery$data,
>*/);
