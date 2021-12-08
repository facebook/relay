/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0d9727d16187b1dd785936f636247d51>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ConcreteRequest, Mutation } from 'relay-runtime';
type RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType = any;
export type CommentCreateInput = {|
  clientMutationId?: ?string,
  feedbackId?: ?string,
  feedback?: ?CommentfeedbackFeedback,
|};
export type CommentfeedbackFeedback = {|
  comment?: ?FeedbackcommentComment,
|};
export type FeedbackcommentComment = {|
  feedback?: ?CommentfeedbackFeedback,
|};
export type RelayModernEnvironmentWithOperationTrackerTestMutation$variables = {|
  input?: ?CommentCreateInput,
|};
export type RelayModernEnvironmentWithOperationTrackerTestMutationVariables = RelayModernEnvironmentWithOperationTrackerTestMutation$variables;
export type RelayModernEnvironmentWithOperationTrackerTestMutation$data = {|
  +commentCreate: ?{|
    +feedback: ?{|
      +$fragmentSpreads: RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment$fragmentType,
    |},
  |},
|};
export type RelayModernEnvironmentWithOperationTrackerTestMutationResponse = RelayModernEnvironmentWithOperationTrackerTestMutation$data;
export type RelayModernEnvironmentWithOperationTrackerTestMutation = {|
  variables: RelayModernEnvironmentWithOperationTrackerTestMutationVariables,
  response: RelayModernEnvironmentWithOperationTrackerTestMutation$data,
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
  "name": "id",
  "storageKey": null
},
v3 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
},
v4 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "String"
},
v5 = {
  "enumValues": null,
  "nullable": false,
  "plural": false,
  "type": "ID"
},
v6 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "UserNameRenderer"
},
v7 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "JSDependency"
},
v8 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "PlainUserNameData"
},
v9 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "ID"
},
v10 = {
  "enumValues": null,
  "nullable": true,
  "plural": false,
  "type": "String"
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "RelayModernEnvironmentWithOperationTrackerTestMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Feedback",
            "kind": "LinkedField",
            "name": "feedback",
            "plural": false,
            "selections": [
              {
                "args": null,
                "kind": "FragmentSpread",
                "name": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment"
              }
            ],
            "storageKey": null
          }
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
    "name": "RelayModernEnvironmentWithOperationTrackerTestMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": "CommentCreateResponsePayload",
        "kind": "LinkedField",
        "name": "commentCreate",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "concreteType": "Feedback",
            "kind": "LinkedField",
            "name": "feedback",
            "plural": false,
            "selections": [
              (v2/*: any*/),
              {
                "alias": null,
                "args": null,
                "concreteType": "Text",
                "kind": "LinkedField",
                "name": "body",
                "plural": false,
                "selections": [
                  {
                    "alias": null,
                    "args": null,
                    "kind": "ScalarField",
                    "name": "text",
                    "storageKey": null
                  }
                ],
                "storageKey": null
              },
              {
                "alias": null,
                "args": null,
                "concreteType": "User",
                "kind": "LinkedField",
                "name": "author",
                "plural": false,
                "selections": [
                  (v3/*: any*/),
                  {
                    "alias": null,
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "supported",
                        "value": [
                          "PlainUserNameRenderer",
                          "MarkdownUserNameRenderer"
                        ]
                      }
                    ],
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "nameRenderer",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "args": null,
                            "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment",
                            "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
                            "fragmentPropName": "name",
                            "kind": "ModuleImport"
                          }
                        ],
                        "type": "PlainUserNameRenderer",
                        "abstractKey": null
                      },
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "args": null,
                            "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment",
                            "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name",
                            "fragmentPropName": "name",
                            "kind": "ModuleImport"
                          }
                        ],
                        "type": "MarkdownUserNameRenderer",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\",\"MarkdownUserNameRenderer\"])"
                  },
                  {
                    "alias": "plainNameRenderer",
                    "args": [
                      {
                        "kind": "Literal",
                        "name": "supported",
                        "value": [
                          "PlainUserNameRenderer"
                        ]
                      }
                    ],
                    "concreteType": null,
                    "kind": "LinkedField",
                    "name": "nameRenderer",
                    "plural": false,
                    "selections": [
                      (v3/*: any*/),
                      {
                        "kind": "InlineFragment",
                        "selections": [
                          {
                            "args": null,
                            "documentName": "RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer",
                            "fragmentName": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
                            "fragmentPropName": "name",
                            "kind": "ModuleImport"
                          }
                        ],
                        "type": "PlainUserNameRenderer",
                        "abstractKey": null
                      }
                    ],
                    "storageKey": "nameRenderer(supported:[\"PlainUserNameRenderer\"])"
                  },
                  (v2/*: any*/)
                ],
                "storageKey": null
              }
            ],
            "storageKey": null
          }
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "4ffdf5c6b4605a5f69203d05ef683c35",
    "id": null,
    "metadata": {
      "relayTestingSelectionTypeInfo": {
        "commentCreate": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "CommentCreateResponsePayload"
        },
        "commentCreate.feedback": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Feedback"
        },
        "commentCreate.feedback.author": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "User"
        },
        "commentCreate.feedback.author.__typename": (v4/*: any*/),
        "commentCreate.feedback.author.id": (v5/*: any*/),
        "commentCreate.feedback.author.nameRenderer": (v6/*: any*/),
        "commentCreate.feedback.author.nameRenderer.__module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment": (v7/*: any*/),
        "commentCreate.feedback.author.nameRenderer.__module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment": (v7/*: any*/),
        "commentCreate.feedback.author.nameRenderer.__typename": (v4/*: any*/),
        "commentCreate.feedback.author.nameRenderer.data": (v8/*: any*/),
        "commentCreate.feedback.author.nameRenderer.data.id": (v9/*: any*/),
        "commentCreate.feedback.author.nameRenderer.data.markup": (v10/*: any*/),
        "commentCreate.feedback.author.nameRenderer.data.text": (v10/*: any*/),
        "commentCreate.feedback.author.nameRenderer.markdown": (v10/*: any*/),
        "commentCreate.feedback.author.nameRenderer.plaintext": (v10/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer": (v6/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer.__module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer": (v7/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer.__module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer": (v7/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer.__typename": (v4/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer.data": (v8/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer.data.id": (v9/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer.data.text": (v10/*: any*/),
        "commentCreate.feedback.author.plainNameRenderer.plaintext": (v10/*: any*/),
        "commentCreate.feedback.body": {
          "enumValues": null,
          "nullable": true,
          "plural": false,
          "type": "Text"
        },
        "commentCreate.feedback.body.text": (v10/*: any*/),
        "commentCreate.feedback.id": (v5/*: any*/)
      }
    },
    "name": "RelayModernEnvironmentWithOperationTrackerTestMutation",
    "operationKind": "mutation",
    "text": "mutation RelayModernEnvironmentWithOperationTrackerTestMutation(\n  $input: CommentCreateInput\n) {\n  commentCreate(input: $input) {\n    feedback {\n      ...RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment\n      id\n    }\n  }\n}\n\nfragment RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment on Feedback {\n  id\n  body {\n    text\n  }\n  author {\n    __typename\n    nameRenderer(supported: [\"PlainUserNameRenderer\", \"MarkdownUserNameRenderer\"]) {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n        __module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n      }\n      ... on MarkdownUserNameRenderer {\n        ...RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n        __module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment: js(module: \"MarkdownUserNameRenderer.react\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.nameRenderer\")\n      }\n    }\n    plainNameRenderer: nameRenderer(supported: [\"PlainUserNameRenderer\"]) {\n      __typename\n      ... on PlainUserNameRenderer {\n        ...RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name\n        __module_operation_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer: js(module: \"RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$normalization.graphql\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.plainNameRenderer\")\n        __module_component_RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment_plainNameRenderer: js(module: \"PlainUserNameRenderer.react\", id: \"RelayModernEnvironmentWithOperationTrackerTestFeedbackFragment.author.plainNameRenderer\")\n      }\n    }\n    id\n  }\n}\n\nfragment RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name on MarkdownUserNameRenderer {\n  markdown\n  data {\n    markup\n    id\n  }\n}\n\nfragment RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name on PlainUserNameRenderer {\n  plaintext\n  data {\n    text\n    id\n  }\n}\n"
  }
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "a992f5cbffecf3ebece24d038d91c0a2";
}

module.exports = ((node/*: any*/)/*: Mutation<
  RelayModernEnvironmentWithOperationTrackerTestMutation$variables,
  RelayModernEnvironmentWithOperationTrackerTestMutation$data,
>*/);
