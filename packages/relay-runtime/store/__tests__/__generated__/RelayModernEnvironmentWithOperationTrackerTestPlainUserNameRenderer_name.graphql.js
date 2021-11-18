/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<c66bb09f75af39e7d7ce78893e7da905>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType: FragmentType;
export type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$ref = RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType;
export type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
|};
export type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name = RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$data;
export type RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$key = {
  +$data?: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$data,
  +$fragmentSpreads: RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name",
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
  (node/*: any*/).hash = "101296fb740d1eaff68fffbae7e2ed82";
}

module.exports = ((node/*: any*/)/*: Fragment<
  RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$fragmentType,
  RelayModernEnvironmentWithOperationTrackerTestPlainUserNameRenderer_name$data,
>*/);
