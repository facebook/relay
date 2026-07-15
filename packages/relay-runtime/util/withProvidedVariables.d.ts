/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ProvidedVariablesType } from './RelayConcreteNode';
import { Variables } from './RelayRuntimeTypes';

interface WithProvidedVariablesFn {
    (
        userSuppliedVariables: Variables,
        providedVariables: ProvidedVariablesType | null | undefined,
    ): Variables;
    tests_only_resetDebugCache: undefined | (() => void);
}
declare const withProvidedVariables: WithProvidedVariablesFn;
export default withProvidedVariables;
