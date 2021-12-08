/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<57fde5e8bc51937ae0e7188653d889af>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$fragmentType = any;
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType: FragmentType;
export type RelayModernEnvironmentNoInlineTestDeferredStreamParent$ref = RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType;
export type RelayModernEnvironmentNoInlineTestDeferredStreamParent$data = {|
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$fragmentType,
  +$fragmentType: RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType,
|};
export type RelayModernEnvironmentNoInlineTestDeferredStreamParent = RelayModernEnvironmentNoInlineTestDeferredStreamParent$data;
export type RelayModernEnvironmentNoInlineTestDeferredStreamParent$key = {
  +$data?: RelayModernEnvironmentNoInlineTestDeferredStreamParent$data,
  +$fragmentSpreads: RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType,
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
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentNoInlineTestDeferredStreamParent",
  "selections": [
    {
      "kind": "Defer",
      "selections": [
        {
          "args": [
            {
              "kind": "Variable",
              "name": "cond",
              "variableName": "cond"
            },
            {
              "kind": "Variable",
              "name": "enableStream",
              "variableName": "enableStream"
            }
          ],
          "kind": "FragmentSpread",
          "name": "RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed"
        }
      ]
    }
  ],
  "type": "Viewer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "8586d6ae88ead0a1f26e619046f3a398";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType,
  RelayModernEnvironmentNoInlineTestDeferredStreamParent$data,
>*/);
