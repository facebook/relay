/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<fc4c07be416308932739b764c1da6679>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest3Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest3Fragment$fragmentType: RelayResponseNormalizerTest3Fragment$ref;
export type RelayResponseNormalizerTest3Fragment = {|
  +id: string,
  +name: ?string,
  +$refType: RelayResponseNormalizerTest3Fragment$ref,
|};
export type RelayResponseNormalizerTest3Fragment$data = RelayResponseNormalizerTest3Fragment;
export type RelayResponseNormalizerTest3Fragment$key = {
  +$data?: RelayResponseNormalizerTest3Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest3Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest3Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
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
  (node/*: any*/).hash = "561328cf17808941f0e564b834c019dc";
}

module.exports = node;
