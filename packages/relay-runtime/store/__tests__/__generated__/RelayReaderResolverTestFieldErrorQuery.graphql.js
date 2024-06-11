/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<2b5cbbd3caa82db632145b4bfb7266cc>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayReaderResolverTestFieldErrorQuery$variables = {||};
export type RelayReaderResolverTestFieldErrorQuery$data = {|
  +me: ?{|
    +lastName: ?string,
  |},
|};
export type RelayReaderResolverTestFieldErrorQuery = {|
  response: RelayReaderResolverTestFieldErrorQuery$data,
  variables: RelayReaderResolverTestFieldErrorQuery$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "lastName",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayReaderResolverTestFieldErrorQuery",
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
    "name": "RelayReaderResolverTestFieldErrorQuery",
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
    "cacheID": "9b12f6b94bffe358cb62ac3f2216ae87",
    "id": null,
    "metadata": {},
    "name": "RelayReaderResolverTestFieldErrorQuery",
    "operationKind": "query",
    "text": "query RelayReaderResolverTestFieldErrorQuery {\n  me {\n    lastName\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "ae22a10c004b68bb5d7df6f516619f83";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayReaderResolverTestFieldErrorQuery$variables,
  RelayReaderResolverTestFieldErrorQuery$data,
>*/);
