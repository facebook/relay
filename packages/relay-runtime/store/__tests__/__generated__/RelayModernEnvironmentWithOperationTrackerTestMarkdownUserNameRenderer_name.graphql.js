/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<537fa7d047d199ee833fc2f591d0f576>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$ref = RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$data = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name = RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$data;
export type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name",
  "selections": [
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
      "concreteType": "MarkdownUserNameData",
      "kind": "LinkedField",
      "name": "data",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "markup",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "MarkdownUserNameRenderer",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "fecad5decddfe4726a301238dbbdd2b3";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
>*/);
