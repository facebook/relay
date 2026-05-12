/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {JSResourceReference, NormalizationSplitOperation} from './NormalizationNode';

export type Local3DPayload<_DocumentName extends string, Response extends Record<string, unknown>> = Response;

export default function createPayloadFor3DField<DocumentName extends string, Response extends Record<string, unknown>>(
    name: DocumentName,
    operation: JSResourceReference<NormalizationSplitOperation>,
    component: JSResourceReference<unknown>,
    response: Response,
): Local3DPayload<DocumentName, Response>;
