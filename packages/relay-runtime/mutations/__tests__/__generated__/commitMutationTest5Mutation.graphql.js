/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<56551485e808a116876020cfffd13ac5>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type CommentDeleteInput = {|
  clientMutationId?: ?string,
  commentId?: ?string,
|};
export type commitMutationTest5Mutation$variables = {|
  input?: ?CommentDeleteInput,
|};
export type commitMutationTest5MutationVariables = commitMutationTest5Mutation$variables;
export type commitMutationTest5Mutation$data = {|
  +alias: ?{|
    +deletedCommentId: ?string,
    +feedback: ?{|
      +id: string,
      +topLevelComments: ?{|
        +count: ?number,
      |},
    |},
  |},
|};
export type commitMutationTest5MutationResponse = commitMutationTest5Mutation$data;
export type commitMutationTest5Mutation = {|
  variables: commitMutationTest5MutationVariables,
  response: commitMutationTest5Mutation$data,
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
    "alias": "alias",
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
    "name": "commitMutationTest5Mutation",
    "selections": (v1/*: any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "commitMutationTest5Mutation",
    "selections": (v1/*: any*/)
  },
  "params": {
    "cacheID": "8da0367054fc6f08318311260e48a9d7",
    "id": null,
    "metadata": {},
    "name": "commitMutationTest5Mutation",
    "operationKind": "mutation",
    "text": "mutation commitMutationTest5Mutation(\n  $input: CommentDeleteInput\n) {\n  alias: commentDelete(input: $input) {\n    deletedCommentId\n    feedback {\n      id\n      topLevelComments {\n        count\n      }\n    }\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "5b576021209fcdaa50fd7d1d9f09fcf8";
}

module.exports = ((node/*: any*/)/*: Mutation<
  commitMutationTest5Mutation$variables,
  commitMutationTest5Mutation$data,
>*/);
