/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

declare const RelayError: {
    create(name: string, messageFormat: string, ...messageParams: Array<string | number | boolean>): Error;
    createWarning(name: string, messageFormat: string, ...messageParams: Array<string | number | boolean>): Error;
};

export default RelayError;
