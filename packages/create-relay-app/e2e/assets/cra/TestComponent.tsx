import { Suspense } from "react";
import { useLazyLoadQuery } from "react-relay";
import graphql from "babel-plugin-relay/macro";
import { TestComponentQuery } from "./__generated__/TestComponentQuery.graphql";

export const TestComponent = () => {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <InnerTestComponent />
    </Suspense>
  );
};

export const InnerTestComponent = () => {
  const data = useLazyLoadQuery<TestComponentQuery>(
    graphql`
      query TestComponentQuery {
        field
      }
    `,
    {}
  );

  return <div id="test-data">{data.field}</div>;
};
