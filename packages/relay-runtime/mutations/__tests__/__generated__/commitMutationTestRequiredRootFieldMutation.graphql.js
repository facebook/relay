/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<37fb1864a158f9338c5edf7733aa0a89>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type CommentDeleteInput = {|
  commentId?: ?string,
|};
export type commitMutationTestRequiredRootFieldMutation$variables = {|
  input?: ?CommentDeleteInput,
|};
export type commitMutationTestRequiredRootFieldMutation$data = {|
  +commentDelete: ?{|
    +deletedCommentId: ?string,
  |},
|};
export type commitMutationTestRequiredRootFieldMutation = {|
  response: commitMutationTestRequiredRootFieldMutation$data,
  variables: commitMutationTestRequiredRootFieldMutation$variables,
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
      }
    ],
    "storageKey": null
  }
];
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "commitMutationTestRequiredRootFieldMutation",
    "selections": (v1/*:: as any*/),
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "commitMutationTestRequiredRootFieldMutation",
    "selections": (v1/*:: as any*/)
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
  (node/*:: as any*/).hash = "b75215ee7b976cd4f043bc5a88b05931";
}

module.exports = ((node/*:: as any*/)/*:: as Mutation<
  commitMutationTestRequiredRootFieldMutation$variables,
  commitMutationTestRequiredRootFieldMutation$data,
>*/);
