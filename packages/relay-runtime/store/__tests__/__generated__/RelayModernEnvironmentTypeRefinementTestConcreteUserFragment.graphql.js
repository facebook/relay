/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<0d96eabc205ff59e42e5cdb058de629d>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$ref: FragmentReference;
declare export opaque type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$fragmentType: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$ref;
export type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment = {|
  +id: string,
  +name: ?string,
  +missing: ?string,
  +$refType: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$ref,
|};
export type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data = RelayModernEnvironmentTypeRefinementTestConcreteUserFragment;
export type RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$key = {
  +$data?: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$data,
  +$fragmentRefs: RelayModernEnvironmentTypeRefinementTestConcreteUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "RelayModernEnvironmentTypeRefinementTestConcreteUserFragment",
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
    },
    {
      "alias": "missing",
      "args": null,
      "kind": "ScalarField",
      "name": "lastName",
      "storageKey": null
    }
  ],
  "type": "User",
  "abstractKey": null
};

if (__DEV__) {
  (node/*: any*/).hash = "3384ae039348799f581d1701a046fd8a";
}

module.exports = node;
