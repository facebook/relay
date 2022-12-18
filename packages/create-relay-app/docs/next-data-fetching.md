## Client-side data fetching

If you only want to start fetching data, once the JS is executed in the browser, you can stick to `useLazyLoadQuery` and `preloadQuery` without any additional setup:

```tsx
import { graphql, useLazyLoadQuery } from "react-relay";

const query = graphql`
  query MyComponentQuery {
    field
  }
`;

export default function MyComponent() {
  const data = useLazyLoadQuery(query, {});

  // ...
}
```

## Server Components

If you're using Next.js v13 with the experimental `app` directory, the Relay Team put together a full example featuring Server Components [here](https://github.com/relayjs/relay-examples/tree/main/issue-tracker-next-v13).

## Server-side data fetching

The solution I'm describing below is to my knowledge the only valid approach without using experimental features at the moment. The Relay Team put togehter a [more comprehensive example](https://github.com/relayjs/relay-examples/tree/main/data-driven-dependencies) that uses query preloading, but it's depending on experimental features.

### Without hydration

You can use [getServerSideProps](https://nextjs.org/docs/basic-features/data-fetching/get-server-side-props) and [getStaticProps](https://nextjs.org/docs/basic-features/data-fetching/get-static-props) to fetch data and pass that data as props to your component.

Combining these approaches with Relay is pretty straightforward:

```tsx
import { graphql, fetchQuery } from "relay-runtime";
import { initRelayEnvironment } from "../src/RelayEnvironment";
import type { NextPage, GetServerSideProps, GetStaticProps } from "next";
import type { MyComponentQuery, MyComponentQuery$data } from "../__generated__/MyComponentQuery.graphql";

const query = graphql`
  query MyComponentQuery {
    field
  }
`;

type Props = {
  data: MyComponentQuery$data;
};

const MyComponent: NextPage<Props> = ({ data }) => {
  // ...
};

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  // Get a fresh environment.
  const environment = initRelayEnvironment();

  // Execute the query.
  const observable = fetchQuery<MyComponentQuery>(environment, query, {});
  const data = await observable.toPromise();

  return {
    props: {
      // Pass the result of the query to your component
      data: data!,
    },
  };
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  // The code from getServerSideProps can just be copied here.
};

export default MyComponent;
```

### With hydration

To hydrate the fetched entities into the Relay store on the client, we need to change the code a little (applies to both `getServerSideProps` and `getStatisProps`):

```tsx
import type { GetRelayServerSideProps } from "../src/relay-types";

// ...

export const getServerSideProps: GetRelayServerSideProps<Props> = async () => {
  const environment = initRelayEnvironment();

  const observable = fetchQuery<MyComponentQuery>(environment, query, {});
  const data = await observable.toPromise();

  // Get the records that the query added to the store.
  const initialRecords = environment.getStore().getSource().toJSON();

  return {
    props: {
      data: data!,
      // This is not intended for your component,
      // but it will be used by the _app component
      // to hydrate the Relay store on the client.
      //
      // IMPORTANT: The property name needs to be
      // `initialRecords`, otherwise the _app
      // component can not extract it.
      initialRecords,
    },
  };
};
```

For TypeScript users I have created the types `GetRelayServerSideProps` and `GetRelayStaticProps` that will force you to return the `initialRecords`.

The `initialRecords` are then processed by the `_app` component, which should have already been setup to handle these records, if you used `create-relay-app` to setup the project.
