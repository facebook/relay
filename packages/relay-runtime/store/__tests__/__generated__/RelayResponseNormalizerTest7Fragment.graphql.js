/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<d221e52988ca786ee6eb0f079013117c>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest7Fragment$ref: FragmentReference;
declare export opaque type RelayResponseNormalizerTest7Fragment$fragmentType: RelayResponseNormalizerTest7Fragment$ref;
export type RelayResponseNormalizerTest7Fragment = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string
  |}>,
  +$refType: RelayResponseNormalizerTest7Fragment$ref,
|};
export type RelayResponseNormalizerTest7Fragment$data = RelayResponseNormalizerTest7Fragment;
export type RelayResponseNormalizerTest7Fragment$key = {
  +$data?: RelayResponseNormalizerTest7Fragment$data,
  +$fragmentRefs: RelayResponseNormalizerTest7Fragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [
    {
      "kind": "RootArgument",
      "name": "enableStream"
    }
  ],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayResponseNormalizerTest7Fragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "kind": "Stream",
      "selections": [
        {
          "alias": null,
          "args": null,
          "concreteType": null,
          "kind": "LinkedField",
          "name": "actors",
          "plural": true,
          "selections": [
            {
              "alias": null,
              "args": null,
              "kind": "ScalarField",
              "name": "name",
              "storageKey": null
            }
          ],
          "storageKey": null
        }
      ]
    }
  ],
  "type": "Feedback",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "ba5674ce1e46a27aebd198f03e252010";
}

module.exports = node;
