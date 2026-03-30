/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<84695ddffb89f8a3fb2d9410d2a29cc5>>
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
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation$variables = {|
  connections: ReadonlyArray<string>,
  input?: ?CommentDeleteInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation$data = {|
  +commentDelete: ?{|
    +deletedCommentId: ?string,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation = {|
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation$data,
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation$variables,
|};
*/

var node/*: ConcreteRequest*/ = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "connections"
  },
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "input"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "input",
    "variableName": "input"
  }
],
v2 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "deletedCommentId",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CommentDeleteResponsePayload",
        "kind": "LinkedField",
        "name": "commentDelete",
        "plural": false,
        "selections": [
          (v2/*:: as any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*:: as any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*:: as any*/),
        "concreteType": "CommentDeleteResponsePayload",
        "kind": "LinkedField",
        "name": "commentDelete",
        "plural": false,
        "selections": [
          (v2/*:: as any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedCommentId",
            "handleArgs": [
              {
                "kind": "Variable",
                "name": "connections",
                "variableName": "connections"
              }
            ]
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "b585a8f08708ce5edb0a3bfbf44b2326",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation(\n  $input: CommentDeleteInput\n) {\n  commentDelete(input: $input) {\n    deletedCommentId\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*:: as any*/).hash = "a4a81aece0ad22e38a090c8d3a59bc95";
}

module.exports = ((node/*:: as any*/)/*:: as Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentMutation$data,
>*/);
