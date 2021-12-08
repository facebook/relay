/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<83128882bd12e3375c45d5eaea68a989>>
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
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation$variables = {|
  input?: ?CommentDeleteInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1MutationVariables = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation$variables;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation$data = {|
  +commentDelete: ?{|
    +deletedCommentId: ?string,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1MutationResponse = RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation$data;
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1MutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation$data,
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
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentDeleteResponsePayload",
        "kind": "LinkedField",
        "name": "commentDelete",
        "plural": false,
        "selections": [
          (v2/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentDeleteResponsePayload",
        "kind": "LinkedField",
        "name": "commentDelete",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          {
            "alias": null,
            "args": null,
            "filters": null,
            "handle": "deleteRecord",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedCommentId"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "0e1407cfc0a47c6b8fc818e910a69983",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation(\n  $input: CommentDeleteInput\n) {\n  commentDelete(input: $input) {\n    deletedCommentId\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "6dd6bbeff21be11c6924398144dbbeed";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteComment1Mutation$data,
>*/);
