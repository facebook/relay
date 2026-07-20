/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<94259f8788980f0b57387b59a098cbc9>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type useFragmentMissingDataOwnerRefetchTestUserFragment$fragmentType: FragmentType;
export type useFragmentMissingDataOwnerRefetchTestUserFragment$data = {
  readonly birthdate: ?{
    readonly day: ?number,
  },
  readonly $fragmentType: useFragmentMissingDataOwnerRefetchTestUserFragment$fragmentType,
};
export type useFragmentMissingDataOwnerRefetchTestUserFragment$key = {
  readonly $data?: useFragmentMissingDataOwnerRefetchTestUserFragment$data,
  readonly $fragmentSpreads: useFragmentMissingDataOwnerRefetchTestUserFragment$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "useFragmentMissingDataOwnerRefetchTestUserFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Date",
      "kind": "LinkedField",
      "name": "birthdate",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "day",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*:: as any*/).hash = "55efb5537c658de35c05222a4d876973";
}

module.exports = ((node/*:: as any*/)/*:: as Fragment<
  useFragmentMissingDataOwnerRefetchTestUserFragment$fragmentType,
  useFragmentMissingDataOwnerRefetchTestUserFragment$data,
>*/);
