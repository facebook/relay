# Subscription

Demonstrates a GraphQL subscription that notifies when a mutation is made. A
module-scoped event emitter connects the mutation resolver to the subscription
resolver: calling the `addMessage` mutation pushes the new message into the
subscription stream, and the component receives it via `requestSubscription`.

The initial query fetches the current list of messages (empty). After render, a
subscription is started. Clicking "Send" fires a mutation that adds a message and
triggers the subscription, which appends the message to the displayed list.

## Relay Config

```json title="relay.config.json"
{
  "src": "./",
  "schema": "./schema.graphql",
  "language": "typescript"
}
```

## Server

A module-scoped pub/sub connects the `addMessage` mutation to the
`messageAdded` subscription stream.

```ts title="server.ts"
const messages: string[] = [];
const listeners = new Set<(msg: string) => void>();

/** @gqlType */
type MessageEvent = {
  /** @gqlField */
  text: string;
};

/** @gqlQueryField */
export function allMessages(): string[] {
  return [...messages];
}

/** @gqlMutationField */
export function addMessage(args: { text: string }): string {
  messages.push(args.text);
  listeners.forEach((cb) => cb(args.text));
  return args.text;
}

/** @gqlSubscriptionField */
export function messageAdded(): AsyncIterable<MessageEvent> {
  return {
    [Symbol.asyncIterator]() {
      const queue: MessageEvent[] = [];
      let resolve: (() => void) | null = null;

      const handler = (text: string) => {
        queue.push({ text });
        if (resolve) {
          resolve();
          resolve = null;
        }
      };
      listeners.add(handler);

      return {
        async next() {
          while (queue.length === 0) {
            await new Promise<void>((r) => {
              resolve = r;
            });
          }
          return { value: queue.shift()!, done: false };
        },
        async return() {
          listeners.delete(handler);
          return { value: undefined, done: true };
        },
        [Symbol.asyncIterator]() {
          return this;
        },
      };
    },
  };
}
```

## App

```tsx title="App.tsx"
import { Suspense, useEffect, useState, useCallback } from "react";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  useMutation,
} from "react-relay";
import {
  graphql,
  Environment,
  requestSubscription,
} from "relay-runtime";
import { gratsNetwork } from "../GratsNetwork";
import { AppSubscriptionQuery } from "./__generated__/AppSubscriptionQuery.graphql";
import { AppSubscriptionAddMutation } from "./__generated__/AppSubscriptionAddMutation.graphql";
import { AppSubscriptionMessageAddedSubscription } from "./__generated__/AppSubscriptionMessageAddedSubscription.graphql";

const testEnvironment = new Environment({
  network: gratsNetwork,
});

function MessageBoard() {
  const data = useLazyLoadQuery<AppSubscriptionQuery>(
    graphql`
      query AppSubscriptionQuery {
        allMessages
      }
    `,
    {},
  );

  const [received, setReceived] = useState<string[]>([]);

  useEffect(() => {
    const sub = requestSubscription<AppSubscriptionMessageAddedSubscription>(
      testEnvironment,
      {
        subscription: graphql`
          subscription AppSubscriptionMessageAddedSubscription {
            messageAdded {
              text
            }
          }
        `,
        variables: {},
        onNext: (response) => {
          if (response?.messageAdded?.text) {
            setReceived((prev) => [...prev, response.messageAdded.text]);
          }
        },
      },
    );
    return () => sub.dispose();
  }, []);

  const [commit] = useMutation<AppSubscriptionAddMutation>(
    graphql`
      mutation AppSubscriptionAddMutation($text: String!) {
        addMessage(text: $text)
      }
    `,
  );

  const handleSend = useCallback(() => {
    commit({ variables: { text: "Hello from subscription!" } });
  }, [commit]);

  const allMessages = [...(data.allMessages ?? []), ...received];

  return (
    <div>
      <ul>
        {allMessages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </ul>
      <button onClick={handleSend}>Send</button>
    </div>
  );
}

export default function TestApp() {
  return (
    <RelayEnvironmentProvider environment={testEnvironment}>
      <Suspense fallback={<div>Loading...</div>}>
        <MessageBoard />
      </Suspense>
    </RelayEnvironmentProvider>
  );
}
```

## Steps

```steps
wait button "Send"
click button "Send"
```
