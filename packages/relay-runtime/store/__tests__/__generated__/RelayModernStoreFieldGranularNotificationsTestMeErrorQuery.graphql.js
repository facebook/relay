/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<1e999c9a064c0aee1717aefb7edc6468>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayModernStoreFieldGranularNotificationsTestMeErrorQuery$variables = {|
  size?: ?ReadonlyArray<?number>,
|};
export type RelayModernStoreFieldGranularNotificationsTestMeErrorQuery$data = {|
  +me: ?{|
    +emailAddresses: ?ReadonlyArray<?string>,
    +name: ?string,
    +profilePicture: ?{|
      +uri: ?string,
    |},
  |},
|};
export type RelayModernStoreFieldGranularNotificationsTestMeErrorQuery = {|
  response: RelayModernStoreFieldGranularNotificationsTestMeErrorQuery$data,
  variables: RelayModernStoreFieldGranularNotificationsTestMeErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "size"
  }
],
v1 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "name",
  "storageKey": null
},
v2 = {
  "alias": null,
  "args": [
    {
      "kind": "Variable",
      "name": "size",
      "variableName": "size"
    }
  ],
  "concreteType": "Image",
  "kind": "LinkedField",
  "name": "profilePicture",
  "plural": false,
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "uri",
      "storageKey": null
    }
  ],
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "emailAddresses",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernStoreFieldGranularNotificationsTestMeErrorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernStoreFieldGranularNotificationsTestMeErrorQuery",
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "User",
        "kind": "LinkedField",
        "name": "me",
        "plural": false,
        "selections": [
          (v1/*:: as any*/),
          (v2/*:: as any*/),
          (v3/*:: as any*/),
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
    "cacheID": "038e0a90da9403dcc37a67de22742660",
    "id": null,
    "metadata": {},
    "name": "RelayModernStoreFieldGranularNotificationsTestMeErrorQuery",
    "operationKind": "query",
    "text": "query RelayModernStoreFieldGranularNotificationsTestMeErrorQuery(\n  $size: [Int]\n) {\n  me {\n    name\n    profilePicture(size: $size) {\n      uri\n    }\n    emailAddresses\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "ba52736dd23af3db0ccc7cb8052bebba";
}

module.exports = ((node/*:: as any*/)/*:: as Query<
  RelayModernStoreFieldGranularNotificationsTestMeErrorQuery$variables,
  RelayModernStoreFieldGranularNotificationsTestMeErrorQuery$data,
>*/);
