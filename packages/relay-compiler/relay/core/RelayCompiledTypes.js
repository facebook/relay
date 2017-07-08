/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCompiledTypes
 * @flow
 * @format
 */
'use strict';

import type {ConcreteFragment} from 'RelayConcreteNode';

/* eslint-disable no-unused-vars */

/**
 * A compiled fragment type is wrapped in the identity Fragment<T>. This allows
 * us to have Flow differentiate between fragment and non-fragment parameters.
 */
export type Fragment<T: {}> = T;

/**
 * Helper type for extracting the T from a Fragment<T>.
 */
type $ExtractFragment<T, _Fragment: Fragment<T>> = T;

/**
 * The compiled JSON object is typed in the phantom type CompiledFragment<T>.
 * This enables us to extract the Fragment<T> specifying its shape when the
 * fragment is used in code via `graphql`, though that's currently unsupported
 * in Flow.
 */
export type CompiledFragment<T: Fragment<*>> = ConcreteFragment;

/**
 * Fragments that are spread inside of a parent fragment are wrapped in the
 * empty and opaque FragmentReference<> type. This prevents you from accessing
 * fields that you did not explicitly request, while allowing your fragment
 * to be passed down when a spread fragment is used.
 */
declare class _FragmentReferenceClass<T> {}
export type FragmentReference<T> = _FragmentReferenceClass<
  $ExtractFragment<T, *>,
>;

/**
 * ObjectWithMaskedFragments<T> takes an object type and converts any top-level
 * fields of type Fragment<T> to FragmentReference<T>, leaving other fields
 * unchanged. This is primarily useful for Higher Order Components whose input
 * will be a FragmentReference<> when used.
 */
declare var _MaskFragments: <U>(
  u: Fragment<U>,
) => FragmentReference<U> | (<U>(u: U) => U);
export type ObjectWithMaskedFragments<T> = $ObjMapi<T, _MaskFragments<T>>;
