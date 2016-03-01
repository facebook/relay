/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayInternalTypes
 * 
 * @typechecks
 */

'use strict';

/**
 * @internal
 *
 * These are types shared across multiple files within Relay internals.
 */

// Maps root calls to a single data ID through an indentifying arg (or EMPTY)
// eg. username(name: "joe")   => '123'
//     username(name: "steve") => '456'
//     viewer                  => '456'

// maps node IDs to the IDs of the connections that contain them
Object.defineProperty(exports, '__esModule', {
  value: true
});