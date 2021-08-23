/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<5c0a962151598d07b7d827a7e3ca4cee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTest_nestedNoInline$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$fragmentType: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$ref;
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent = {|
  +mark: ?{|
    +$fragmentRefs: RelayModernEnvironmentNoInlineTest_nestedNoInline$ref,
  |},
  +zuck: ?{|
    +$fragmentRefs: RelayModernEnvironmentNoInlineTest_nestedNoInline$ref,
  |},
  +joe: ?{|
    +$fragmentRefs: RelayModernEnvironmentNoInlineTest_nestedNoInline$ref,
  |},
  +$refType: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$ref,
|};
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data = RelayModernEnvironmentNoInlineTest_nestedNoInlineParent;
export type RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$key = {
  +$data?: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTest_nestedNoInlineParent$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "cond"
    },
    {
      "kind": "RootArgument",
      "name": "global_cond"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTest_nestedNoInlineParent",
  "selections": [
    {
      "alias": "mark",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Mark"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        {
          "args": [
            {
              "kind": "Variable",
              "name": "cond",
              "variableName": "global_cond"
            }
          ],
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline"
        }
      ],
      "storageKey": "username(name:\"Mark\")"
    },
    {
      "alias": "zuck",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Zuck"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        {
          "args": [
            {
              "kind": "Literal",
              "name": "cond",
              "value": false
            }
          ],
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline"
        }
      ],
      "storageKey": "username(name:\"Zuck\")"
    },
    {
      "alias": "joe",
      "args": [
        {
          "kind": "Literal",
          "name": "name",
          "value": "Joe"
        }
      ],
      "concreteType": null,
      "kind": "LinkedField",
      "name": "username",
      "plural": false,
      "selections": [
        {
          "args": [
            {
              "kind": "Variable",
              "name": "cond",
              "variableName": "cond"
            }
          ],
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentNoInlineTest_nestedNoInline"
        }
      ],
      "storageKey": "username(name:\"Joe\")"
    }
  ],
  "type": "Query",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "d674bb7d0e482ecdd681a2e8574ff5fe";
}

module.exports = node;
