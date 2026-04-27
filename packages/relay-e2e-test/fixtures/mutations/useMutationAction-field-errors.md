# useMutationAction_EXPERIMENTAL — Field Errors

When a mutation resolver throws on a nullable field, GraphQL returns `null`
for that field in the response. The `commitAction` promise resolves with
the response data directly — the caller checks for `null` fields or uses
`@catch(to: RESULT)` to detect field-level errors.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

```ts title="server.ts"
/** @gqlQueryField */
export function greeting(): string {
  return "Ready";
}

/** @gqlMutationField */
export function failingMutation(args: { input: string }): string {
  throw new Error("Something went wrong on the server");
}
```

## App

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
          failingMutation(input: $input)
        }
      `,
    );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <div>{data.greeting}</div>
      <button
        disabled={isPending}
        onClick={() => {
          startTransition(async () => {
            const response = await commitAction({ input: "test" });
            if (response.failingMutation == null) {
              setErrorMessage("Field returned null");
            }
          });
        }}
      >
        Submit
      </button>
      {errorMessage != null && <div>{errorMessage}</div>}
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
wait "Field returned null"
```
