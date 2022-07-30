/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<1335e668fe603e64506c76f04dc7e47c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType: FragmentType;
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$data = {|
  +name: ?string,
  +$fragmentType: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType,
|};
export type RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$key = {
  +$data?: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$data,
  +$fragmentSpreads: RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType,
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
  (node/*: any*/).hash = "5a1a718971af524df78d8d28e261da8c";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$fragmentType,
  RelayModernEnvironmentExecuteWithModuleOnConcreteFieldTestFeedbackAuthor_author$data,
>*/);
