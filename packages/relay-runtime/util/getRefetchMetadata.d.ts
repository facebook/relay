/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ReaderFragment, ReaderRefetchMetadata, RefetchableIdentifierInfo} from './ReaderNode';
import { ConcreteRequest } from './RelayConcreteNode';

export default function getRefetchMetadata(
    fragmentNode: ReaderFragment,
    componentDisplayName: string,
): {
    fragmentRefPathInResponse: ReadonlyArray<string | number>;
    identifierInfo: RefetchableIdentifierInfo | null | undefined;
    refetchableRequest: ConcreteRequest;
    refetchMetadata: ReaderRefetchMetadata;
};
