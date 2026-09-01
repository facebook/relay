/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Network, Observable, GraphQLResponse } from "relay-runtime";
import type { RelayObservable } from "relay-runtime/lib/network/RelayObservable";
import type { AsyncExecutionResult, ExecutionResult } from "graphql";
import type { PromiseOrValue } from "graphql/jsutils/PromiseOrValue";
import { execute, subscribe, parse } from "graphql";
import { getSchema } from "./schema";

const executableSchema = getSchema();

// The async branch yields `AsyncExecutionResult`, not `ExecutionResult`: under
// incremental delivery each payload after the first is an `ExecutionPatchResult`,
// whose `data` is `unknown` rather than an object map. Narrowing this to
// `ExecutionResult` would not typecheck against what `execute`/`subscribe`
// actually return from this graphql build.
type GraphQLResult = PromiseOrValue<
  ExecutionResult | AsyncIterable<AsyncExecutionResult>
>;

function toObservable(result: GraphQLResult): RelayObservable<GraphQLResponse> {
  return Observable.create<GraphQLResponse>((sink) => {
    (async () => {
      const resolved = await result;
      if (Symbol.asyncIterator in resolved) {
        for await (const value of resolved) {
          sink.next(value as GraphQLResponse);
        }
      } else {
        sink.next(resolved as GraphQLResponse);
      }
      sink.complete();
    })().catch((err) => sink.error(err));
  });
}

export const gratsNetwork = Network.create(
  (request, variables) =>
    toObservable(
      execute({
        schema: executableSchema,
        document: parse(request.text!),
        variableValues: variables,
      }),
    ),
  (request, variables) =>
    toObservable(
      subscribe({
        schema: executableSchema,
        document: parse(request.text!),
        variableValues: variables,
      }),
    ),
);
