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
// `IShadowWeakDuo`; its sibling is `ShadowWeakBeta`. A weak value is read INLINE
// off `__relay_model_instance`. (One resolver module per type, the field resolver
// exported by field name, mirrors `RedOctopusResolvers`.)
/**
 * @relayType ShadowWeakAlpha implements IShadowWeakDuo
 * @weak
 */
export type ShadowWeakAlpha = {
  label: string,
};

/**
 * @relayField ShadowWeakAlpha.label: String
 */
function label(model: ?ShadowWeakAlpha): ?string {
  return model?.label;
}

module.exports = {
  label,
};
