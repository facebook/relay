/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

// One CLIENT `@weak` implementor of the magic-fragment return interface
// `IShadowWeakDuo`; its sibling is `ShadowWeakAlpha`. A weak value is read INLINE
// off `__relay_model_instance`. (One resolver module per type, the field resolver
// exported by field name, mirrors `RedOctopusResolvers`.)
/**
 * @relayType ShadowWeakBeta implements IShadowWeakDuo
 * @weak
 */
export type ShadowWeakBeta = {
  label: string,
};

/**
 * @relayField ShadowWeakBeta.label: String
 */
function label(model: ?ShadowWeakBeta): ?string {
  return model?.label;
}

module.exports = {
  label,
};
