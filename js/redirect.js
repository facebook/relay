/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noformat
 */

// File to help with client-side redirect. No-op on relay.dev

'use strict';

// redirect all paths of the form /docs/en/... to docs/...
if (window.location.pathname.startsWith('/docs/en/')) {
  const newPath = window.location.pathname.replace(/^\/docs\/en\//, '/docs/');
  window.location.pathname = newPath;
}
