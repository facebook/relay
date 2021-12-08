/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<95b1ea94f5396a27e242f9e72df89ae7>>
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
export type commitMutationTestRequiredRootFieldMutation$variables = {|
  input?: ?CommentDeleteInput,
|};
export type commitMutationTestRequiredRootFieldMutationVariables = commitMutationTestRequiredRootFieldMutation$variables;
export type commitMutationTestRequiredRootFieldMutation$data = {|
  +commentDelete: {|
    +deletedCommentId: ?string,
  |},
|};
export type commitMutationTestRequiredRootFieldMutationResponse = commitMutationTestRequiredRootFieldMutation$data;
export type commitMutationTestRequiredRootFieldMutation = {|
  variables: commitMutationTestRequiredRootFieldMutationVariables,
  response: commitMutationTestRequiredRootFieldMutation$data,
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
v1 = {
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
    }
  ],
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "commitMutationTestRequiredRootFieldMutation",
    "selections": [
      {
        "kind": "RequiredField",
        "field": (v1/*: any*/),
        "action": "THROW",
        "path": "commentDelete"
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "commitMutationTestRequiredRootFieldMutation",
    "selections": [
      (v1/*: any*/)
    ]
  },
  "params": {
    "cacheID": "19f1e1c50328f89205857394403b5d9b",
    "id": null,
    "metadata": {},
    "name": "commitMutationTestRequiredRootFieldMutation",
    "operationKind": "mutation",
    "text": "mutation commitMutationTestRequiredRootFieldMutation(\n  $input: CommentDeleteInput\n) {\n  commentDelete(input: $input) {\n    deletedCommentId\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "c0ee6bcae636236c0564c8da132daeac";
}

module.exports = ((node/*: any*/)/*: Mutation<
  commitMutationTestRequiredRootFieldMutation$variables,
  commitMutationTestRequiredRootFieldMutation$data,
>*/);
