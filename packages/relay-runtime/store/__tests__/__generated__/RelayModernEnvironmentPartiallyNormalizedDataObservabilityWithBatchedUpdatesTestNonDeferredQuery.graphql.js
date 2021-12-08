/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c844be386da7e8fe2029f6ca1f4494a8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

// @dataDrivenDependency RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery.me {"branches":{"User":{"component":"User.react","fragment":"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$normalization.graphql"}},"plural":false}

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$fragmentType = any;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery$variables = {||};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQueryVariables = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery$variables;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery$data = {|
  +me: ?{|
    +name: ?string,
    +__fragmentPropName: ?string,
    +__module_component: ?string,
    +$fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$fragmentType,
  |},
|};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQueryResponse = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery$data;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery = {|
  variables: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQueryVariables,
  response: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v1 = {
  "args": null,
  "documentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery",
  "fragmentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user",
  "fragmentPropName": "module_user",
  "kind": "ModuleImport"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery",
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
          (v1/*: any*/)
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
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery",
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
          (v1/*: any*/),
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
    "cacheID": "b2244910db2369ed8ebe5ade86697010",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery {\n  me {\n    name\n    ...RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user\n    __module_operation_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery: js(module: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user$normalization.graphql\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery.me\")\n    __module_component_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery: js(module: \"User.react\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery.me\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferred_module_user on User {\n  lastName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "1fe9685903092a2c8506661640d3ca05";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery$variables,
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestNonDeferredQuery$data,
>*/);
