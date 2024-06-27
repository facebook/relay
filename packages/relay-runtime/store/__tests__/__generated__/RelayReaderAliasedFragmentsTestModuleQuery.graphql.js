/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<8b62361e8f91cc9a7b8f369c8fcadc07>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayReaderAliasedFragmentsTestModuleQuery.node {"branches":{"User":{"component":"SomeModuleName","fragment":"RelayReaderAliasedFragmentsTestModule_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
import type { RelayReaderAliasedFragmentsTestModule_user$fragmentType } from "./RelayReaderAliasedFragmentsTestModule_user.graphql";
export type RelayReaderAliasedFragmentsTestModuleQuery$variables = {|
  id: string,
|};
export type RelayReaderAliasedFragmentsTestModuleQuery$data = {|
  +node: ?{|
    +aliased_fragment: ?{|
      +__fragmentPropName: ?string,
      +__module_component: ?string,
      +$fragmentSpreads: RelayReaderAliasedFragmentsTestModule_user$fragmentType,
    |},
  |},
|};
export type RelayReaderAliasedFragmentsTestModuleQuery = {|
  response: RelayReaderAliasedFragmentsTestModuleQuery$data,
  variables: RelayReaderAliasedFragmentsTestModuleQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
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
    "name": "id",
    "variableName": "id"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "args": null,
      "documentName": "RelayReaderAliasedFragmentsTestModuleQuery",
      "fragmentName": "RelayReaderAliasedFragmentsTestModule_user",
      "fragmentPropName": "user",
      "kind": "ModuleImport"
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
    "name": "RelayReaderAliasedFragmentsTestModuleQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "fragment": (v2/*: any*/),
            "kind": "AliasedInlineFragmentSpread",
            "name": "aliased_fragment"
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
    "name": "RelayReaderAliasedFragmentsTestModuleQuery",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "node",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
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
    "cacheID": "747f1fdb5be4d1a2a3bfdef5dffe06da",
    "id": null,
    "metadata": {},
    "name": "RelayReaderAliasedFragmentsTestModuleQuery",
    "operationKind": "query",
    "text": "query RelayReaderAliasedFragmentsTestModuleQuery(\n  $id: ID!\n) {\n  node(id: $id) {\n    __typename\n    ... on User {\n      ...RelayReaderAliasedFragmentsTestModule_user\n      __module_operation_RelayReaderAliasedFragmentsTestModuleQuery: js(module: \"RelayReaderAliasedFragmentsTestModule_user$normalization.graphql\", id: \"RelayReaderAliasedFragmentsTestModuleQuery.node\")\n      __module_component_RelayReaderAliasedFragmentsTestModuleQuery: js(module: \"SomeModuleName\", id: \"RelayReaderAliasedFragmentsTestModuleQuery.node\")\n    }\n    id\n  }\n}\n\nfragment RelayReaderAliasedFragmentsTestModule_user on User {\n  name\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "211c16be30e2643789caea611a3b1e95";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderAliasedFragmentsTestModuleQuery$variables,
  RelayReaderAliasedFragmentsTestModuleQuery$data,
>*/);
