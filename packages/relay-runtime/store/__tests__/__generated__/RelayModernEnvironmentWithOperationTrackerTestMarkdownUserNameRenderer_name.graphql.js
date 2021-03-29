/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c2961b8307eab9dbdc957ab7bfba0a2a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$fragmentType: RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$ref;
export type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name = {|
  +markdown: ?string,
  +data: ?{|
    +markup: ?string,
  |},
  +$refType: RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$ref,
|};
export type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$data = RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name;
export type RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$data,
  +$fragmentRefs: RelayModernEnvironmentWithOperationTrackerTestMarkdownUserNameRenderer_name$ref,
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

module.exports = node;
