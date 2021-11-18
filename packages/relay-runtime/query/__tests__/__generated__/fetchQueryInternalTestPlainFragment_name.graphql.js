/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<243d3db20b925c29693e8bfe258bb7e8>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryInternalTestPlainFragment_name$fragmentType: FragmentType;
export type fetchQueryInternalTestPlainFragment_name$ref = fetchQueryInternalTestPlainFragment_name$fragmentType;
export type fetchQueryInternalTestPlainFragment_name$data = {|
  +plaintext: ?string,
  +data: ?{|
    +text: ?string,
  |},
  +$fragmentType: fetchQueryInternalTestPlainFragment_name$fragmentType,
|};
export type fetchQueryInternalTestPlainFragment_name = fetchQueryInternalTestPlainFragment_name$data;
export type fetchQueryInternalTestPlainFragment_name$key = {
  +$data?: fetchQueryInternalTestPlainFragment_name$data,
  +$fragmentSpreads: fetchQueryInternalTestPlainFragment_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestPlainFragment_name",
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
  (node/*: any*/).hash = "28987f688adc6c61dc29867c5efdef79";
}

module.exports = ((node/*: any*/)/*: Fragment<
  fetchQueryInternalTestPlainFragment_name$fragmentType,
  fetchQueryInternalTestPlainFragment_name$data,
>*/);
