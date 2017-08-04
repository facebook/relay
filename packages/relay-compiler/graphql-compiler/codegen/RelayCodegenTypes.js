/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayCodegenTypes
 * @flow
 * @format
 */

'use strict';

import type CodegenDirectory from './CodegenDirectory';

export type CompileResult = 'HAS_CHANGES' | 'NO_CHANGES' | 'ERROR';

export type File = {
  relPath: string,
  hash: string,
};

export interface FileWriterInterface {
  writeAll(): Promise<Map<string, CodegenDirectory>>,
}
