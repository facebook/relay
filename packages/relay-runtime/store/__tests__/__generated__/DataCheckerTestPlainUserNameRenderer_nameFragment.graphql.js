/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<6632298f0bf652a1b1d76a29c34557fe>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType: FragmentType;
export type DataCheckerTestPlainUserNameRenderer_nameFragment$data = {
  readonly data: ?{
    readonly text: ?string,
  },
  readonly plaintext: ?string,
  readonly $fragmentType: DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType,
};
export type DataCheckerTestPlainUserNameRenderer_nameFragment$key = {
  readonly $data?: DataCheckerTestPlainUserNameRenderer_nameFragment$data,
  readonly $fragmentSpreads: DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType,
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
  (node/*:: as any*/).hash = "57da6cf1bef83797671946fdc38aa25d";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  DataCheckerTestPlainUserNameRenderer_nameFragment$fragmentType,
  DataCheckerTestPlainUserNameRenderer_nameFragment$data,
>*/);
