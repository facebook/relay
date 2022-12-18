import { Suspense } from "react";
import { useLazyLoadQuery, graphql } from "react-relay";

export default function Test() {
  return (
    <Suspense fallback={<div>Loading</div>}>
      <InnerTestComponent />
    </Suspense>
  );
}

export const InnerTestComponent = () => {
  const data = useLazyLoadQuery(
    graphql`
      query testQuery {
        field
      }
    `,
    {}
  );

  return <div id="test-data">{data.field}</div>;
};
