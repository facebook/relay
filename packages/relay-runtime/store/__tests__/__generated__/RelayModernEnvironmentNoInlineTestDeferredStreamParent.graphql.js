/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<83f1ea15a3d5e2562bd54867ab2f56df>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
type RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$ref = any;
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentNoInlineTestDeferredStreamParent$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentNoInlineTestDeferredStreamParent$fragmentType: RelayModernEnvironmentNoInlineTestDeferredStreamParent$ref;
export type RelayModernEnvironmentNoInlineTestDeferredStreamParent = {|
  +$fragmentRefs: RelayModernEnvironmentNoInlineTestDeferredStream_newsFeed$ref,
  +$refType: RelayModernEnvironmentNoInlineTestDeferredStreamParent$ref,
|};
export type RelayModernEnvironmentNoInlineTestDeferredStreamParent$data = RelayModernEnvironmentNoInlineTestDeferredStreamParent;
export type RelayModernEnvironmentNoInlineTestDeferredStreamParent$key = {
  +$data?: RelayModernEnvironmentNoInlineTestDeferredStreamParent$data,
  +$fragmentRefs: RelayModernEnvironmentNoInlineTestDeferredStreamParent$ref,
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

module.exports = node;
