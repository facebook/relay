/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @oncall relay
 *
 * @generated SignedSource<<3bab4f57b8ae8fe555ce7098b8e4f77a>>
 * @flow
 * @lightSyntaxTransform
 */

/* eslint-disable */

'use strict';

/*::
import type { NormalizationSplitOperation } from 'relay-runtime';

*/

var node/*: NormalizationSplitOperation*/ = {
  "argumentDefinitions": [
    {
      "defaultValue": null,
      "kind": "LocalArgument",
      "name": "scale"
    }
  ],
  "kind": "SplitOperation",
  "metadata": {
    "hasServerField": true
  },
  "name": "UserProfilePictureUriSuspendsWhenTheCounterIsOdd$normalization",
  "selections": [
    {
      "name": "greeting",
      "args": null,
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../UserGreetingResolver').greeting,
        "rootFragment": require('./UserGreetingResolver$normalization.graphql')
      }
    },
    {
      "name": "user_profile_picture_uri_with_scale",
      "args": [
        {
          "kind": "Variable",
          "name": "scale",
          "variableName": "scale"
        }
      ],
      "kind": "RelayResolver",
      "storageKey": null,
      "isOutputType": true,
      "resolverInfo": {
        "resolverFunction": require('../UserProfilePictureResolver').user_profile_picture_uri_with_scale,
        "rootFragment": require('./UserProfilePictureResolver$normalization.graphql')
      }
    }
  ]
};

if (__DEV__) {
  (node/*:: as any*/).hash = "ffbdc95f51d0e268ac8d325a890fcadb";
}

module.exports = node;
