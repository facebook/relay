/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<217872eb665ae04a7521efe6ac219c42>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user$fragmentType = any;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$variables = {||};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQueryVariables = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$variables;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$data = {|
  +me: ?{|
    +name: ?string,
    +$fragmentSpreads: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user$fragmentType,
  |},
|};
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQueryResponse = RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$data;
export type RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery = {|
  variables: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQueryVariables,
  response: RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery",
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
            "kind": "Defer",
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user"
              }
            ]
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
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery",
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
            "if": null,
            "kind": "Defer",
            "label": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$defer$RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user",
            "selections": [
              {
                "args": null,
                "documentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user",
                "fragmentName": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user",
                "fragmentPropName": "module_user",
                "kind": "ModuleImport"
              }
            ]
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
    "cacheID": "cff9871243068c1ddd2afba5fbf44f7a",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery {\n  me {\n    name\n    ...RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user @defer(label: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$defer$RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user\")\n    id\n  }\n}\n\nfragment RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user on User {\n  ...RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user\n  __module_operation_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user: js(module: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user$normalization.graphql\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user\")\n  __module_component_RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user: js(module: \"User.react\", id: \"RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_deferred_user\")\n}\n\nfragment RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferred_module_user on User {\n  lastName\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "79d1fc27ef1866f918de0778df7c5bb5";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$variables,
  RelayModernEnvironmentPartiallyNormalizedDataObservabilityWithBatchedUpdatesTestDeferredQuery$data,
>*/);
