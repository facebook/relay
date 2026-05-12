/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ReaderFragment, ReaderPaginationMetadata} from './ReaderNode';
import { ConcreteRequest } from './RelayConcreteNode';

export default function getPaginationMetadata(
    fragmentNode: ReaderFragment,
    componentDisplayName: string,
): {
    connectionPathInFragmentData: ReadonlyArray<string | number>;
    identifierField: string | null | undefined;
    paginationRequest: ConcreteRequest;
    paginationMetadata: ReaderPaginationMetadata;
    stream: boolean;
};
