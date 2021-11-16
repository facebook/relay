/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<881883a2b56430c6a61dc511f43b1eb4>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Query } from 'relay-runtime';
export type RelayMockPayloadGeneratorTest20Query$variables = {||};
export type RelayMockPayloadGeneratorTest20QueryVariables = RelayMockPayloadGeneratorTest20Query$variables;
export type RelayMockPayloadGeneratorTest20Query$data = {|
  +me: ?{|
    +id: string,
    +name: ?string,
    +emailAddresses: ?$ReadOnlyArray<?string>,
    +profile_picture: ?{|
      +uri: ?string,
      +width: ?number,
      +height: ?number,
    |},
  |},
|};
export type RelayMockPayloadGeneratorTest20QueryResponse = RelayMockPayloadGeneratorTest20Query$data;
export type RelayMockPayloadGeneratorTest20Query = {|
  variables: RelayMockPayloadGeneratorTest20QueryVariables,
  response: RelayMockPayloadGeneratorTest20Query$data,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "alias": null,
    "args": null,
    "concreteType": "User",
    "kind": "LinkedField",
    "name": "me",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "id",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "name",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "emailAddresses",
        "storageKey": null
      },
      {
        "alias": null,
        "args": [
          {
            "kind": "Literal",
            "name": "scale",
            "value": 1
          }
        ],
        "concreteType": "Image",
        "kind": "LinkedField",
        "name": "profile_picture",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "uri",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "width",
            "storageKey": null
          },
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "height",
            "storageKey": null
          }
        ],
        "storageKey": "profile_picture(scale:1)"
      }
    ],
    "storageKey": null
  }
],
v1 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
},
v2 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "Int"
};
return {
  "fragment": {
    "argumentDefinitions": [],
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayMockPayloadGeneratorTest20Query",
    "selections": (v0/*: any*/),
    "type": "Query",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": [],
    "kind": "Operation",
    "name": "RelayMockPayloadGeneratorTest20Query",
    "selections": (v0/*: any*/)
  },
  "params": {
    "cacheID": "e3c605af3e0f446bb15989e90814ba9d",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "me": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "me.emailAddresses": {
          "enumValues": null,
          "nullable": true,
          "plural": true,
          "type": "String"
        },
        "me.id": {
          "enumValues": null,
          "nullable": false,
          "plural": false,
          "type": "ID"
        },
        "me.name": (v1/*: any*/),
        "me.profile_picture": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Image"
        },
        "me.profile_picture.height": (v2/*: any*/),
        "me.profile_picture.uri": (v1/*: any*/),
        "me.profile_picture.width": (v2/*: any*/)
      }
    },
    "name": "RelayMockPayloadGeneratorTest20Query",
    "operationKind": "query",
    "text": "query RelayMockPayloadGeneratorTest20Query {\n  me {\n    id\n    name\n    emailAddresses\n    profile_picture(scale: 1) {\n      uri\n      width\n      height\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "3e2952398f2727b26b7dda64597486e0";
}

module.exports = ((node/*: any*/)/*: Query<
  RelayMockPayloadGeneratorTest20Query$variables,
  RelayMockPayloadGeneratorTest20Query$data,
>*/);
