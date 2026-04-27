# useMutationAction_EXPERIMENTAL — Form Action

Uses `useMutationAction_EXPERIMENTAL` inside a `<form action={...}>`
handler. React 19 form actions automatically wrap in `startTransition`, so
the mutation integrates naturally with the form submission lifecycle and
`useActionState`.

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
  return "Enter your name";
}

/** @gqlMutationField */
export async function greetUser(args: { name: string }): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return `Hello, ${args.name}!`;
}
```

## App

```tsx title="App.tsx"
import { Suspense, useActionState } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutationAction_EXPERIMENTAL,
} from "react-relay";
import { graphql, Environment } from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppTestQuery } from "./__generated__/AppTestQuery.graphql";
import { AppGreetUserMutation } from "./__generated__/AppGreetUserMutation.graphql";

const testEnvironment = new Environment({ network: gratsNetwork });

function GreetingForm() {
  const data = useLazyLoadQuery<AppTestQuery>(
    graphql`
      query AppTestQuery {
        greeting
      }
    `,
    {},
  );

  const commitAction =
    useMutationAction_EXPERIMENTAL<AppGreetUserMutation>(
      graphql`
        mutation AppGreetUserMutation($name: String!) {
          greetUser(name: $name)
        }
      `,
    );

  const [message, formAction, isPending] = useActionState(
    async (_prev: string, formData: FormData) => {
      const name = formData.get("name") as string;
      const response = await commitAction({ name });
      return response.greetUser;
    },
    data.greeting,
  );

  return (
    <div>
      <div>{message}</div>
      <form action={formAction}>
        <input name="name" defaultValue="Alice" />
        <button type="submit" disabled={isPending}>
          Greet
        </button>
      </form>
      {isPending && <div>Submitting...</div>}
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <GreetingForm />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait "Enter your name"
click button "Greet"
wait "Submitting..."
wait "Hello, Alice!"
```
