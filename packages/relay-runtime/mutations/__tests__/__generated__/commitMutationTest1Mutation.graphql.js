/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c2c0ff64913083e25e872b39b0688fec>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type CommentDeleteInput = {|
  commentId?: ?string,
|};
export type commitMutationTest1Mutation$variables = {|
  input?: ?CommentDeleteInput,
|};
export type commitMutationTest1Mutation$data = {|
  +commentDelete: ?{|
    +deletedCommentId: ?string,
    +feedback: ?{|
      +id: string,
      +topLevelComments: ?{|
        +count: ?number,
      |},
    |},
  |},
|};
export type commitMutationTest1Mutation = {|
  response: commitMutationTest1Mutation$data,
  variables: commitMutationTest1Mutation$variables,
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
    "concreteType": "CommentDeleteResponsePayload",
    "kind": "LinkedField",
    "name": "commentDelete",
    "plural": false,
    "selections": [
      {
        "alias": null,
        "args": null,
        "kind": "ScalarField",
        "name": "deletedCommentId",
        "storageKey": null
      },
      {
        "alias": null,
        "args": null,
        "concreteType": "Feedback",
        "kind": "LinkedField",
        "name": "feedback",
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
            "concreteType": "TopLevelCommentsConnection",
            "kind": "LinkedField",
            "name": "topLevelComments",
            "plural": false,
            "selections": [
              {
                "alias": null,
                "args": null,
                "kind": "ScalarField",
                "name": "count",
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
    "name": "commitMutationTest1Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "commitMutationTest1Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "4bdb9209ea14f9100a88983ba4f76194",
    "id": null,
    "metadata": {},
    "name": "commitMutationTest1Mutation",
    "operationKind": "mutation",
    "text": "mutation commitMutationTest1Mutation(\n  $input: CommentDeleteInput\n) {\n  commentDelete(input: $input) {\n    deletedCommentId\n    feedback {\n      id\n      topLevelComments {\n        count\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "582fcc177e4a23328995e1d14ca9b8cb";
}

module.exports = ((node/*: any*/)/*: Mutation<
  commitMutationTest1Mutation$variables,
  commitMutationTest1Mutation$data,
>*/);
