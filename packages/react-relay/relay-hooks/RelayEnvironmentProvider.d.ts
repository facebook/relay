/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {ProviderProps, ReactElement, ReactNode} from 'react';
import {IEnvironment, RelayContext} from 'relay-runtime';
import {ActorIdentifier, IActorEnvironment} from 'relay-runtime/multi-actor-environment/index';

export interface Props {
    children: ReactNode;
    environment: IEnvironment;
    getEnvironmentForActor?: ((actorIdentifier: ActorIdentifier) => IActorEnvironment) | null | undefined;
}

export function RelayEnvironmentProvider(props: Props): ReactElement<ProviderProps<RelayContext>>;
