/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const string = `
  ${line1 != null ? `${line1}\n` : ''}
  ${line2 != null ? `${line2}\n` : ''}
  ${city != null && state != null ? `${city}, ${state}\n` : ''}
  ${postalCode != null ? `${postalCode}\n` : ''}
`;

graphql`some graphql`;
