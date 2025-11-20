/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9655e96f00f5e500c4b0c867db7d544f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernEnvironmentViewerTestQuery$variables = {||};
export type RelayModernEnvironmentViewerTestQuery$data = {|
  +viewer: ?{|
    +marketplace_settings: ?{|
      +categories: ?ReadonlyArray<?string>,
    |},
  |},
|};
export type RelayModernEnvironmentViewerTestQuery = {|
  response: RelayModernEnvironmentViewerTestQuery$data,
  variables: RelayModernEnvironmentViewerTestQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
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
            "kind": "ScalarField",
            "name": "categories",
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
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentViewerTestQuery",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayModernEnvironmentViewerTestQuery",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "d472c65ccec7c0489dff8fcf03362d4e",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentViewerTestQuery",
    "operationKind": "query",
    "text": "query RelayModernEnvironmentViewerTestQuery {\n  viewer {\n    marketplace_settings {\n      categories\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "2d8f31179e51dbb804c2c7db7bb1d972";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayModernEnvironmentViewerTestQuery$variables,
  RelayModernEnvironmentViewerTestQuery$data,
>*/);
