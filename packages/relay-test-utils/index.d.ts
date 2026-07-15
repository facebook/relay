/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import type {
  CacheConfig,
  ConcreteRequest,
  EnvironmentConfig,
  GraphQLResponse,
  GraphQLSingularResponse,
  GraphQLTaggedNode,
  IEnvironment,
  OperationDescriptor,
  Variables,
} from 'relay-runtime';

export type MockResolverContext = Readonly<{
  parentType: string | null | undefined;
  name: string | null | undefined;
  alias: string | null | undefined;
  path: readonly string[] | null | undefined;
  args: Readonly<Record<string, unknown>> | null | undefined;
}>;

export type MockResolver = (context: MockResolverContext, generateId: () => number) => unknown;

export type MockResolvers = Readonly<Record<string, MockResolver>>;

export type MockPayloadGeneratorOptions = Readonly<{
  mockClientData?: boolean | undefined;
}>;

export type MockPayloadGeneratorDeferOptions = MockPayloadGeneratorOptions &
  Readonly<{
    generateDeferredPayload?: boolean | undefined;
  }>;

export interface RelayMockPayloadGenerator {
  generate(
    operation: OperationDescriptor,
    mockResolvers?: MockResolvers | null | undefined,
    options?: MockPayloadGeneratorOptions | null | undefined,
  ): GraphQLSingularResponse;
  generateWithDefer(
    operation: OperationDescriptor,
    mockResolvers: MockResolvers | null | undefined,
    options: MockPayloadGeneratorOptions & Readonly<{ generateDeferredPayload: true }>,
  ): readonly GraphQLSingularResponse[];
  generateWithDefer(
    operation: OperationDescriptor,
    mockResolvers?: MockResolvers | null | undefined,
    options?: MockPayloadGeneratorDeferOptions | null | undefined,
  ): GraphQLResponse;
}

export const MockPayloadGenerator: RelayMockPayloadGenerator;

type ConcreteRequestOrOperation = ConcreteRequest | OperationDescriptor;

export type OperationMockResolver = (
  operation: OperationDescriptor,
) => GraphQLSingularResponse | Error | null | undefined;

export interface MockFunctions {
  clearCache(): void;
  cachePayload(
    request: ConcreteRequestOrOperation,
    variables: Variables,
    payload: GraphQLSingularResponse,
  ): void;
  isLoading(
    request: ConcreteRequestOrOperation,
    variables: Variables,
    cacheConfig?: CacheConfig,
  ): boolean;
  reject(request: ConcreteRequestOrOperation, error: Error | string): void;
  nextValue(request: ConcreteRequestOrOperation, payload: GraphQLSingularResponse): void;
  complete(request: ConcreteRequestOrOperation): void;
  resolve(
    request: ConcreteRequestOrOperation,
    payload: readonly GraphQLSingularResponse[] | GraphQLSingularResponse,
  ): void;
  getAllOperations(): readonly OperationDescriptor[];
  findOperation(findFn: (operation: OperationDescriptor) => boolean): OperationDescriptor;
  queuePendingOperation(query: GraphQLTaggedNode, variables: Variables): void;
  getMostRecentOperation(): OperationDescriptor;
  resolveMostRecentOperation(
    payload: GraphQLResponse | ((operation: OperationDescriptor) => GraphQLResponse),
  ): void;
  rejectMostRecentOperation(
    error: Error | string | ((operation: OperationDescriptor) => Error | string),
  ): void;
  queueOperationResolver(resolver: OperationMockResolver): void;
}

export interface RelayMockEnvironment extends IEnvironment {
  readonly mock: MockFunctions;
  readonly mockClear: () => void;
}

export interface RelayModernMockEnvironment {
  createMockEnvironment(config?: Partial<EnvironmentConfig>): RelayMockEnvironment;
}

export const MockEnvironment: RelayModernMockEnvironment;

export function createMockEnvironment(config?: Partial<EnvironmentConfig>): RelayMockEnvironment;

export function unwrapContainer<TComponent>(ComponentClass: {
  readonly __ComponentClass?: TComponent | undefined;
  readonly displayName?: string | undefined;
  readonly name?: string | undefined;
}): TComponent;

type FragmentDataFromResolverArgument<T> = T extends {
  readonly ' $data'?: infer Data | undefined;
}
  ? NonNullable<Data>
  : T extends {
      readonly $data?: infer Data | undefined;
    }
  ? NonNullable<Data>
  : unknown;

type StripFragmentType<T> = Omit<T, ' $fragmentType' | '$fragmentType'>;

export function testResolver<TKey, TRet>(
  resolver: (rootKey: TKey) => TRet,
  fragmentData: StripFragmentType<FragmentDataFromResolverArgument<TKey>>,
): TRet;
