/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule CodegenTypes
 * @flow
 * @format
 */

'use strict';

import type CodegenDirectory from './CodegenDirectory';

export type CompileResult = 'HAS_CHANGES' | 'NO_CHANGES' | 'ERROR';

export type File =
  | {exists: false, relPath: string}
  | {
      exists: true,
      relPath: string,
      hash: string,
    };

export interface FileWriterInterface {
  writeAll(): Promise<Map<string, CodegenDirectory>>;
}
