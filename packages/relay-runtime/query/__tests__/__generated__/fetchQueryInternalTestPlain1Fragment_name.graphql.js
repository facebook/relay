/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<486aa230c447350bdf8b484ea4cbdc1f>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { Fragment, ReaderFragment } from 'relay-runtime';
import type { FragmentType } from "relay-runtime";
declare export opaque type fetchQueryInternalTestPlain1Fragment_name$fragmentType: FragmentType;
export type fetchQueryInternalTestPlain1Fragment_name$data = {|
  +data: ?{|
    +text: ?string,
  |},
  +plaintext: ?string,
  +$fragmentType: fetchQueryInternalTestPlain1Fragment_name$fragmentType,
|};
export type fetchQueryInternalTestPlain1Fragment_name$key = {
  +$data?: fetchQueryInternalTestPlain1Fragment_name$data,
  +$fragmentSpreads: fetchQueryInternalTestPlain1Fragment_name$fragmentType,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "fetchQueryInternalTestPlain1Fragment_name",
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
  (node/*: any*/).hash = "9139e547ef85f3488c8201562db74a98";
}

module.exports = ((node/*: any*/)/*: Fragment<
  fetchQueryInternalTestPlain1Fragment_name$fragmentType,
  fetchQueryInternalTestPlain1Fragment_name$data,
>*/);
