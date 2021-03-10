/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<beb02d2a282d23a76357b6cdf85b6877>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest } from 'relay-runtime';
export type CommentsDeleteInput = {|
  clientMutationId?: ?string,
  commentIds?: ?$ReadOnlyArray<?string>,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutationVariables = {|
  input?: ?CommentsDeleteInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutationResponse = {|
  +commentsDelete: ?{|
    +deletedCommentIds: ?$ReadOnlyArray<?string>,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutationVariables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutationResponse,
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
  "name": "deletedCommentIds",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentsDeleteResponsePayload",
        "kind": "LinkedField",
        "name": "commentsDelete",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentsDeleteResponsePayload",
        "kind": "LinkedField",
        "name": "commentsDelete",
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
            "name": "deletedCommentIds"
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "14cee022a1d6bd082b743d4d5f635cad",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsMutation(\n  $input: CommentsDeleteInput\n) {\n  commentsDelete(input: $input) {\n    deletedCommentIds\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "b5238896d960787f8900c1bc830b1d71";
}

module.exports = node;
