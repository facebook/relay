/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 * 
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @generated SignedSource<<03a4763a868d1c0b0dd103907cd90e2a>>
 * @flow
 * @lightSyntaxTransform
 * @nogrep
 */

/* eslint-disable */

'use strict';

/*::
import type { ReaderFragment } from 'relay-runtime';
import type { FragmentReference } from "relay-runtime";
declare export opaque type ReactRelayLocalQueryRendererTestUserFragment$ref: FragmentReference;
declare export opaque type ReactRelayLocalQueryRendererTestUserFragment$fragmentType: ReactRelayLocalQueryRendererTestUserFragment$ref;
export type ReactRelayLocalQueryRendererTestUserFragment = {|
  +name: ?string,
  +$refType: ReactRelayLocalQueryRendererTestUserFragment$ref,
|};
export type ReactRelayLocalQueryRendererTestUserFragment$data = ReactRelayLocalQueryRendererTestUserFragment;
export type ReactRelayLocalQueryRendererTestUserFragment$key = {
  +$data?: ReactRelayLocalQueryRendererTestUserFragment$data,
  +$fragmentRefs: ReactRelayLocalQueryRendererTestUserFragment$ref,
  ...
};
*/

var node/*: ReaderFragment*/ = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ReactRelayLocalQueryRendererTestUserFragment",
  "selections": [
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
  (node/*: any*/).hash = "ddc7f8cccfd6dfe3505da3973a3e046f";
}

module.exports = node;
