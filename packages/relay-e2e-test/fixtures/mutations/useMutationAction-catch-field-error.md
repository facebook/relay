# useMutationAction_EXPERIMENTAL — @catch Field Error

When a mutation uses `@catch(to: RESULT)`, field-level errors are captured
in the response type as `{ok: false, errors: [...]}` instead of silently
returning `null`. This lets the caller distinguish "null because error" from
"null because null" without try/catch — network errors still reject the
promise, so try/catch handles only network failures.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

The mutation return type is nullable (`String`). When the resolver throws,
the server returns `{data: {failingMutation: null}, errors: [...]}`.

```ts title="server.ts"
/** @gqlQueryField */
export function greeting(): string {
  return "Ready";
}

/** @gqlMutationField */
export function failingMutation(args: { input: string }): string | null {
  throw new Error("Something went wrong on the server");
}
```

## App

The mutation uses `@catch(to: RESULT)` on the failing field. The response
type wraps the field as `{ok: true, value: string} | {ok: false, errors: [...]}`,
so the component can inspect `result.ok` to detect field errors without
try/catch.

```tsx title="App.tsx"
import { Suspense, useState, useTransition } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutationAction_EXPERIMENTAL,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";
import { AppFailingMutationMutation } from "./__generated__/AppFailingMutationMutation.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function Content() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        greeting
      }
    `,
    {},
  );

  const commitAction =
    useMutationAction_EXPERIMENTAL<AppFailingMutationMutation>(
      graphql`
        mutation AppFailingMutationMutation($input: String!) {
          failingMutation(input: $input) @catch(to: RESULT)
        }
      `,
    );

  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div>{data.greeting}</div>
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            try {
              const response = await commitAction({ input: "test" });
              const result = response.failingMutation;
              if (result.ok) {
                setMessage("Success: " + result.value);
              } else {
                setMessage("Field error caught via @catch");
              }
            } catch (err) {
              setMessage("Network error: " + (err as Error).message);
            }
          });
        }}
      >
        Submit
      </button>
      {message != null && <div>{message}</div>}
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <Content />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Ready"
click button "Submit"
wait "Field error caught via @catch"
```
