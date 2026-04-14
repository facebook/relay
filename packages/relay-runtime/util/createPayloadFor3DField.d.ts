/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type { JSResourceReference, NormalizationSplitOperation } from "./NormalizationNode";

export type Local3DPayload<DocumentName extends string, Response extends {}> = Response;

export default function createPayloadFor3DField<DocumentName extends string, Response extends {}>(
    name: DocumentName,
    operation: JSResourceReference<NormalizationSplitOperation>,
    component: JSResourceReference<unknown>,
    response: Response,
): Local3DPayload<DocumentName, Response>;
