/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

import * as React from 'react';
import * as LZString from 'lz-string';

const {useReducer, useCallback, useMemo, useEffect} = React;

const DEFAULT_SCHEMA = `
type User {
  name: String
  age: Int
  best_friend: User
}

type Query {
  me: User
}
 `.trim();

const DEFAULT_DOCUMENT = `
query MyQuery {
  me {
    name
    ...AgeFragment
    best_friend {
      ...AgeFragment
    }
  }
}

fragment AgeFragment on User {
  age
}
 `.trim();

export const FEAUTRE_FLAGS = [
  {
    key: 'enable_flight_transform',
    label: 'Flight Transforms',
    kind: 'bool',
    default: true,
  },
  {
    key: 'hash_supported_argument',
    label: 'Hash Supported Argument',
    kind: 'enum',
    default: true,
  },
  {key: 'no_inline', label: '@no_inline', kind: 'enum', default: true},
  {
    key: 'enable_3d_branch_arg_generation',
    label: '3D Branch Arg Generation',
    kind: 'bool',
    default: true,
  },
  {
    key: 'actor_change_support',
    label: 'Actor Change Support',
    kind: 'enum',
    default: true,
  },
  {
    key: 'text_artifacts',
    label: 'Text Artifacts',
    kind: 'enum',
    default: true,
  },
  {
    key: 'enable_client_edges',
    label: 'Client Edges',
    kind: 'enum',
    default: true,
  },
];

// Current version indicating our URL encoding scheme.
// If we change this scheme in the future, we can use this to detect
// old versions of the URL and transform them into the new format.
const ENCODING_VERSION = '1';

const DEFAULT_STATE = {
  schemaText: DEFAULT_SCHEMA,
  documentText: DEFAULT_DOCUMENT,
  outputType: 'operation',
  featureFlags: Object.fromEntries(
    FEAUTRE_FLAGS.map((f) => [f.key, f.default]),
  ),
  language: 'typescript',
};

const LOCAL_STORAGE_KEY = 'relayCompilerExplorerLastContent';

export function useExplorerState() {
  const [state, dispatch] = useReducer(reducer, null, initializeState);

  // Persist the current state to the URL hash and local storage.
  useEffect(() => {
    const serialized = serializeState(state);
    const hash = `#${serialized}`;
    window.history.replaceState(null, null, hash);
    localStorage.setItem(LOCAL_STORAGE_KEY, hash);
  }, [state]);

  const actionHandlers = useMemo(() => {
    return {
      setSchemaText: (schemaText) =>
        dispatch({type: 'UPDATE_SCHEMA', schemaText}),
      setDocumentText: (documentText) =>
        dispatch({type: 'UPDATE_DOCUMENT', documentText}),
      setFeatureFlag: (flag, value) =>
        dispatch({type: 'SET_FEATURE_FLAG', flag, value}),
      setLanguage: (language) => dispatch({type: 'SET_LANGUAGE', language}),
      setOutputType: (outputType) =>
        dispatch({type: 'SET_OUTPUT_TYPE', outputType}),
    };
  }, []);
  return {
    state,
    ...actionHandlers,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'UPDATE_SCHEMA':
      return {...state, schemaText: action.schemaText};
    case 'UPDATE_DOCUMENT':
      return {...state, documentText: action.documentText};
    case 'SET_OUTPUT_TYPE':
      return {...state, outputType: action.outputType};
    case 'SET_FEATURE_FLAG':
      const featureFlags = {
        ...state.featureFlags,
        [action.flag]: action.value,
      };
      return {...state, featureFlags};
    case 'SET_LANGUAGE':
      return {...state, language: action.language};
    default:
      throw new Error('Unexpected action type: ' + action.type);
  }
}

// Get the initial state. Either from the URL hash, local storage, or the default state.
function initializeState() {
  const hash = window.location.hash || localStorage.getItem(LOCAL_STORAGE_KEY);
  if (hash[0] === '#' && hash.length > 1) {
    const serialized = hash.slice(1);
    try {
      return deserializeState(new URLSearchParams(serialized)) || DEFAULT_STATE;
    } catch (e) {
      console.warn('Failed to decode previous state: ', e);
      return DEFAULT_STATE;
    }
  }
  return DEFAULT_STATE;
}

// Serialize the state of the explorer into a string, using query param style
// encoding to make the string more understandable to humans.
function serializeState(state) {
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
        params.set(flag, enabled);
      }
    } else {
      params.set(key, value);
    }
  }
  return params.toString();
}

function deserializeState(params) {
  // Here
  if (params.get('enc') !== ENCODING_VERSION) {
    console.warn('Unexpected encoding version: ' + params.get('enc'));
    return null;
  }
  const state = {};
  for (const key of Object.keys(DEFAULT_STATE)) {
    const value = params.get(key);
    if (key == 'schemaText' || key == 'documentText') {
      state[key] = LZString.decompressFromEncodedURIComponent(value);
    } else if (key == 'featureFlags') {
      const featureFlags = {};
      for (const {key} of FEAUTRE_FLAGS) {
        featureFlags[key] = Boolean(params.get(key));
      }
      state[key] = featureFlags;
    } else {
      state[key] = params.get(key);
    }
  }
  return state;
}

// The wasm compiler expects feature flags as a JSON string with some flags modeled as an enum.
// this hook derives that value.
export function useSerializedFeatureFlags(state) {
  return useMemo(() => {
    const normalized = Object.fromEntries(
      FEAUTRE_FLAGS.map(({key, kind}) => {
        const value = state.featureFlags[key];
        switch (kind) {
          case 'enum':
            return [key, {kind: value ? 'enabled' : 'disabled'}];
          case 'bool':
            return [key, value];
          default:
            throw new Error(`Unexpected feature flag kind: ${kind}`);
        }
      }),
    );
    return JSON.stringify(normalized, null, 2);
  }, [state.featureFlags]);
}
