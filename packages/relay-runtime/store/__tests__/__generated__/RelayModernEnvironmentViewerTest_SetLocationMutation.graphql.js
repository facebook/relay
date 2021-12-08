/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<2b4afa8e0bcff9d2f0aaf42e052e7d34>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type LocationInput = {|
  longitude?: ?number,
  latitude?: ?number,
|};
export type RelayModernEnvironmentViewerTest_SetLocationMutation$variables = {|
  input: LocationInput,
|};
export type RelayModernEnvironmentViewerTest_SetLocationMutationVariables = RelayModernEnvironmentViewerTest_SetLocationMutation$variables;
export type RelayModernEnvironmentViewerTest_SetLocationMutation$data = {|
  +setLocation: ?{|
    +viewer: ?{|
      +marketplace_settings: ?{|
        +location: ?{|
          +latitude: ?number,
          +longitude: ?number,
        |},
      |},
    |},
  |},
|};
export type RelayModernEnvironmentViewerTest_SetLocationMutationResponse = RelayModernEnvironmentViewerTest_SetLocationMutation$data;
export type RelayModernEnvironmentViewerTest_SetLocationMutation = {|
  variables: RelayModernEnvironmentViewerTest_SetLocationMutationVariables,
  response: RelayModernEnvironmentViewerTest_SetLocationMutation$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "alias": null,
    "args": [
      {
        "kind": "Variable",
        "name": "input",
        "variableName": "input"
      }
    ],
    "concreteType": "setLocationResponsePayload",
    "kind": "LinkedField",
    "name": "setLocation",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Viewer",
        "kind": "LinkedField",
        "name": "viewer",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "MarketPlaceSettings",
            "kind": "LinkedField",
            "name": "marketplace_settings",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "concreteType": "MarketPlaceSellLocation",
                "kind": "LinkedField",
                "name": "location",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "latitude",
                    "storageKey": null
                  },
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "longitude",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentViewerTest_SetLocationMutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentViewerTest_SetLocationMutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "9914988669278d6412b22158ffc20501",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentViewerTest_SetLocationMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentViewerTest_SetLocationMutation(\n  $input: LocationInput!\n) {\n  setLocation(input: $input) {\n    viewer {\n      marketplace_settings {\n        location {\n          latitude\n          longitude\n        }\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "eb0479436163e3d7e09b56e7a65fe412";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentViewerTest_SetLocationMutation$variables,
  RelayModernEnvironmentViewerTest_SetLocationMutation$data,
>*/);
