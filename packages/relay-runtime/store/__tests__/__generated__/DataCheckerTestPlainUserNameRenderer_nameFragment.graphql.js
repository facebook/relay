/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<df9fecfb107d0a93b064903330f3b2ee>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type DataCheckerTestPlainUserNameRenderer_nameFragment$ref: FragmentReference;
declare export opaque type DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType: DataCheckerTestPlainUserNameRenderer_nameFragment$ref;
export type DataCheckerTestPlainUserNameRenderer_nameFragment = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$refType: DataCheckerTestPlainUserNameRenderer_nameFragment$ref,
|};
export type DataCheckerTestPlainUserNameRenderer_nameFragment$data = DataCheckerTestPlainUserNameRenderer_nameFragment;
export type DataCheckerTestPlainUserNameRenderer_nameFragment$key = {
  +$data?: DataCheckerTestPlainUserNameRenderer_nameFragment$data,
  +$fragmentRefs: DataCheckerTestPlainUserNameRenderer_nameFragment$ref,
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

module.exports = node;
