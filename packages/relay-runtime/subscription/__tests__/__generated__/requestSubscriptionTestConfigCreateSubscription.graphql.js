/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<3c926e98935889539873547e23374abb>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, GraphQLSubscription } from 'relay-runtime';
type requestSubscriptionTestExtraFragment$fragmentType = any;
export type requestSubscriptionTestConfigCreateSubscription$variables = {||};
export type requestSubscriptionTestConfigCreateSubscriptionVariables = requestSubscriptionTestConfigCreateSubscription$variables;
export type requestSubscriptionTestConfigCreateSubscription$data = {|
  +configCreateSubscribe: ?{|
    +config: ?{|
      +name: ?string,
      +$fragmentSpreads: requestSubscriptionTestExtraFragment$fragmentType,
    |},
  |},
|};
export type requestSubscriptionTestConfigCreateSubscriptionResponse = requestSubscriptionTestConfigCreateSubscription$data;
export type requestSubscriptionTestConfigCreateSubscription = {|
  variables: requestSubscriptionTestConfigCreateSubscriptionVariables,
  response: requestSubscriptionTestConfigCreateSubscription$data,
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
    "name": "requestSubscriptionTestConfigCreateSubscription",
    "selections": [
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
              (v0/*: any*/),
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "requestSubscriptionTestExtraFragment"
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ],
    "type": "Subscription",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "requestSubscriptionTestConfigCreateSubscription",
    "selections": [
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
              (v0/*: any*/),
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "isEnabled",
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "1b69adfae158cc6f1ccf259d412d1bf3",
    "id": null,
    "metadata": {
      "subscriptionName": "configCreateSubscribe"
    },
    "name": "requestSubscriptionTestConfigCreateSubscription",
    "operationKind": "subscription",
    "text": "subscription requestSubscriptionTestConfigCreateSubscription {\n  configCreateSubscribe {\n    config {\n      name\n      ...requestSubscriptionTestExtraFragment\n    }\n  }\n}\n\nfragment requestSubscriptionTestExtraFragment on Config {\n  isEnabled\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6b2edf520dcf571dde1465c394f0a52e";
}

module.exports = ((node/*: any*/)/*: GraphQLSubscription<
  requestSubscriptionTestConfigCreateSubscription$variables,
  requestSubscriptionTestConfigCreateSubscription$data,
>*/);
