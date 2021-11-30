/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<dfa498d9a01eb655381031922b7dcbe8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery.me {"branches":{"User":{"component":"User.react","fragment":"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$fragmentType = any;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery$variables = {||};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQueryVariables = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery$variables;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery$data = {|
  +me: ?{|
    +__fragmentPropName: ?string,
    +__module_component: ?string,
    +$fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$fragmentType,
  |},
|};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQueryResponse = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery$data;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery = {|
  variables: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQueryVariables,
  response: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "args": null,
  "documentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery",
  "fragmentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user",
  "fragmentPropName": "module_user",
  "kind": "ModuleImport"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery",
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
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery",
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
    "cacheID": "772183a42d28dbab2bfe2745d58f8fbb",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery {\n  me {\n    ...RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user\n    __module_operation_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery: js(module: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user$normalization.graphql\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery.me\")\n    __module_component_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery: js(module: \"User.react\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery.me\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user on User {\n  ...RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_nestedModule_user\n  __module_operation_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user: js(module: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_nestedModule_user$normalization.graphql\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user\")\n  __module_component_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user: js(module: \"User.react\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_module_user\")\n  name\n}\n\nfragment RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModule_nestedModule_user on User {\n  lastName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b434befceff784339e980ff85befcedd";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery$variables,
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNestedModuleQuery$data,
>*/);
