import { Network, Observable, GraphQLResponse } from "relay-runtime";
import type { RelayObservable } from "relay-runtime/lib/network/RelayObservable";
import type { ExecutionResult } from "graphql";
import type { PromiseOrValue } from "graphql/jsutils/PromiseOrValue";
import { execute, subscribe, parse } from "graphql";
import { getSchema } from "./schema";

const executableSchema = getSchema();

type GraphQLResult = PromiseOrValue<
  ExecutionResult | AsyncIterable<ExecutionResult>
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
