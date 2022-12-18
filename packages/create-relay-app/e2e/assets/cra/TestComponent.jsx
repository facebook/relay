import { Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";

export const TestComponent = () => {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <InnerTestComponent />
    </Suspense>
  );
};

export const InnerTestComponent = () => {
  const data = useLazyLoadQuery(
    graphql`
      query TestComponentQuery {
        field
      }
    `,
    {}
  );

  return <div id="test-data">{data.field}</div>;
};
