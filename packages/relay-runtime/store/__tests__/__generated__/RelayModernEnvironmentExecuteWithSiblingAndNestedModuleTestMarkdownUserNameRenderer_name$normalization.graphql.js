/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c5b912300b63c12ec6af19872ad27e51>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

import type { Local3DPayload } from "relay-runtime";
type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization = any;
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name = {|
  ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name$normalization,
|};
export type RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization = {|
  +__typename: string,
  +markdown: ?string,
  +user: ?{|
    +name: ?string,
    +innerRenderer: ?({|
      +__typename: "PlainUserNameRenderer",
      +__module_operation_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name: ?any,
      +__module_component_RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name: ?any,
      ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name,
    |} | Local3DPayload<"RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name", {|
      +__typename: "PlainUserNameRenderer",
      ...RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name,
    |}> | {|
      +__typename: string,
    |}),
    +id: string,
  |},
|};

*/

var node/*: NormalizationSplitOperation*/ = (function(){
var v0 = {
  "alias": null,
  "args": null,
  "kind": "ScalarField",
  "name": "__typename",
  "storageKey": null
};
return {
  "kind": "SplitOperation",
  "metadata": {},
  "name": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name$normalization",
  "selections": [
    (v0/*: any*/),
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "markdown",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "User",
      "kind": "LinkedField",
      "name": "user",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "name",
          "storageKey": null
        },
        {
          "alias": "innerRenderer",
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "nameRenderer",
          "plural": false,
          "selections": [
            (v0/*: any*/),
            {
              "kind": "InlineFragment",
              "selections": [
                {
                  "args": null,
                  "documentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestMarkdownUserNameRenderer_name",
                  "fragmentName": "RelayModernEnvironmentExecuteWithSiblingAndNestedModuleTestPlainUserNameRenderer_name",
                  "fragmentPropName": "name",
                  "kind": "ModuleImport"
                }
              ],
              "type": "PlainUserNameRenderer",
              "abstractKey": null
            }
          ],
          "storageKey": null
        },
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ]
};
})();

if (__DEV__) {
  (node/*: any*/).hash = "e1edea1a63722ab6ea297694773c329c";
}

module.exports = node;
