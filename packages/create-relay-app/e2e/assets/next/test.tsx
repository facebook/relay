import { Suspense } from "react";
import { useLazyLoadQuery, graphql } from "react-relay";
import { testQuery } from "../__generated__/testQuery.graphql";

export default function Test() {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <InnerTestComponent />
    </Suspense>
  );
}

export const InnerTestComponent = () => {
  const data = useLazyLoadQuery<testQuery>(
    graphql`
      query testQuery {
        field
      }
    `,
    {}
  );

  return <div id="test-data">{data.field}</div>;
};
