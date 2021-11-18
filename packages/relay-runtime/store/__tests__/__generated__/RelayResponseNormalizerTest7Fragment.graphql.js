/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<88dd576d4747ab8aa0c384aa475bc553>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type RelayResponseNormalizerTest7Fragment$fragmentType: FragmentType;
export type RelayResponseNormalizerTest7Fragment$ref = RelayResponseNormalizerTest7Fragment$fragmentType;
export type RelayResponseNormalizerTest7Fragment$data = {|
  +id: string,
  +actors: ?$ReadOnlyArray<?{|
    +name: ?string,
  |}>,
  +$fragmentType: RelayResponseNormalizerTest7Fragment$fragmentType,
|};
export type RelayResponseNormalizerTest7Fragment = RelayResponseNormalizerTest7Fragment$data;
export type RelayResponseNormalizerTest7Fragment$key = {
  +$data?: RelayResponseNormalizerTest7Fragment$data,
  +$fragmentSpreads: RelayResponseNormalizerTest7Fragment$fragmentType,
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

module.exports = ((node/*: any*/)/*: Fragment<
  RelayResponseNormalizerTest7Fragment$fragmentType,
  RelayResponseNormalizerTest7Fragment$data,
>*/);
