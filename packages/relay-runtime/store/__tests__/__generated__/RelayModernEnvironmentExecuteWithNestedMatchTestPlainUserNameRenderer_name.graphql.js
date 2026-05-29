/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<12d634c71d070fe82652909892165260>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$data = {
  readonly data: ?{
    readonly text: ?string,
  },
  readonly plaintext: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$fragmentType,
};
export type RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "plaintext",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "concreteType": "PlainUserNameData",
      "kind": "LinkedField",
      "name": "data",
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
    }
  ],
  "type": "PlainUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "dd2b6c85ca9c2117be434b42864ff560";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentExecuteWithNestedMatchTestPlainUserNameRenderer_name$data,
>*/);
