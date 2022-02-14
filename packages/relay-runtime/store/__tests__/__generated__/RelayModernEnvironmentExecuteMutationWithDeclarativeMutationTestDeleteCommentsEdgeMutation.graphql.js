/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<8bf60ce256563cc2603854bf9f7ba77f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
export type CommentsDeleteInput = {|
  clientMutationId?: ?string,
  commentIds?: ?$ReadOnlyArray<?string>,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation$variables = {|
  connections: $ReadOnlyArray<string>,
  input?: ?CommentsDeleteInput,
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation$data = {|
  +commentsDelete: ?{|
    +deletedCommentIds: ?$ReadOnlyArray<?string>,
  |},
|};
export type RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation = {|
  variables: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation$variables,
  response: RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation$data,
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
  "name": "deletedCommentIds",
  "storageKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation",
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
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation",
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
            "handle": "deleteEdge",
            "key": "",
            "kind": "ScalarHandle",
            "name": "deletedCommentIds",
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
    "cacheID": "57143c782b5b2622d367f493b33bdc4d",
    "id": null,
    "metadata": {},
    "name": "RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation(\n  $input: CommentsDeleteInput\n) {\n  commentsDelete(input: $input) {\n    deletedCommentIds\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "f410f0b0506c3c9095e8f81db6afad6d";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation$variables,
  RelayModernEnvironmentExecuteMutationWithDeclarativeMutationTestDeleteCommentsEdgeMutation$data,
>*/);
