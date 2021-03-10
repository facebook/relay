/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<124f99c9f18ad3078c8d1c6b69a7ec28>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type requestSubscriptionTestConfigCreateSubscriptionVariables = {||};
export type requestSubscriptionTestConfigCreateSubscriptionResponse = {|
  +configCreateSubscribe: ?{|
    +config: ?{|
      +name: ?string,
    |},
  |},
|};
export type requestSubscriptionTestConfigCreateSubscription = {|
  variables: requestSubscriptionTestConfigCreateSubscriptionVariables,
  response: requestSubscriptionTestConfigCreateSubscriptionResponse,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "ConfigCreateSubscriptResponsePayload",
    "kind": "LinkedField",
    "name": "configCreateSubscribe",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "concreteType": "Config",
        "kind": "LinkedField",
        "name": "config",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "name",
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
    "name": "requestSubscriptionTestConfigCreateSubscription",
    "selections": (v0/*: any*/),
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "requestSubscriptionTestConfigCreateSubscription",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "36c326050b83dafd66df29fd5f3fcf48",
    "id": null,
    "metadata": {
      "subscriptionName": "configCreateSubscribe"
    },
    "name": "requestSubscriptionTestConfigCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription requestSubscriptionTestConfigCreateSubscription {\n  configCreateSubscribe {\n    config {\n      name\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "fa3a7ee3c0d4bd8282b692d2c1075dc0";
}

module.exports = node;
