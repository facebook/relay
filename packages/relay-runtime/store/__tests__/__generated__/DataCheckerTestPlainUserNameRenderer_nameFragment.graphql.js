/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<442f82df1f8331ef9186cc6145d88b09>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType: FragmentType;
export type DataCheckerTestPlainUserNameRenderer_nameFragment$ref = DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType;
export type DataCheckerTestPlainUserNameRenderer_nameFragment$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType,
|};
export type DataCheckerTestPlainUserNameRenderer_nameFragment = DataCheckerTestPlainUserNameRenderer_nameFragment$data;
export type DataCheckerTestPlainUserNameRenderer_nameFragment$key = {
  +$data?: DataCheckerTestPlainUserNameRenderer_nameFragment$data,
  +$fragmentSpreads: DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "DataCheckerTestPlainUserNameRenderer_nameFragment",
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
  (node/*: any*/).hash = "57da6cf1bef83797671946fdc38aa25d";
}

module.exports = ((node/*: any*/)/*: Fragment<
  DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType,
  DataCheckerTestPlainUserNameRenderer_nameFragment$data,
>*/);
