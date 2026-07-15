/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<9e9e3ecc92cf5d0db3a4f0cda3705108>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$data = {
  readonly name: ?string,
  readonly $fragmentType: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType,
};
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$key = {
  readonly $data?: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$data,
  readonly $fragmentSpreads: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "name",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "5a1a718971af524df78d8d28e261da8c";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType,
  RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$data,
>*/);
