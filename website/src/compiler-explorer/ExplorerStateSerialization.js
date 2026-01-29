/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @oncall relay
 */

import {DEFAULT_STATE, FEATURE_FLAGS} from './ExplorerStateConstants';
import * as LZString from 'lz-string';

// Current version indicating our URL encoding scheme.
// If we change this scheme in the future, we can use this to detect
// old versions of the URL and transform them into the new format.
const ENCODING_VERSION = '1';

// Serialize the state of the explorer into a string, using query param style
// encoding to make the string more understandable to humans.
export function serializeState(state) {
  const params = new URLSearchParams();
  params.set('enc', ENCODING_VERSION);
  for (const [key, value] of Object.entries(state)) {
    if (key == 'schemaText' || key == 'documentText') {
      params.set(key, LZString.compressToEncodedURIComponent(value));
    } else if (key == 'featureFlags') {
      for (const [flag, enabled] of Object.entries(value)) {
        // Note: We flatten feature flags into the same namespace as top level state.
        // If we ever have a feature flag which conflicts with a top-level state value
        // we will need to find a way to deal with that. However, it's unlikely
        // and it makes the URL easier to read.
        //
        // Note: URLSearchParam values are always strings, so this will be "true" or "false".
        params.set(flag, enabled);
      }
    } else {
      params.set(key, value);
    }
  }
  return params.toString();
}

export function deserializeState(params) {
  if (params.get('enc') !== ENCODING_VERSION) {
    console.warn('Unexpected encoding version: ' + params.get('enc'));
    return null;
  }
  const state = DEFAULT_STATE;
  for (const key of Object.keys(DEFAULT_STATE)) {
    const value = params.get(key);
    if (key == 'schemaText' || key == 'documentText') {
      state[key] = LZString.decompressFromEncodedURIComponent(value);
    } else if (key == 'featureFlags') {
      const featureFlags = {};
      for (const {key} of FEATURE_FLAGS) {
        // Decode string boolean values into boolean.
        featureFlags[key] = params.get(key) === 'true';
      }
      state[key] = featureFlags;
    } else {
      state[key] = params.get(key);
    }
  }
  return state;
}
