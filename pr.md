For the more precise discriminated union behavior, I think we can start from these assumptions:

1. Abstract type conditions should be resolved against the schema to determine the compatible concrete runtime types.

2. Concrete types that result in the same generated shape can share the same union arm, for example `__typename: "User" | "Admin"`.

3. Fragment spreads on abstract types should follow the same compatibility rules as abstract inline fragments. The fragment reference should only be available on concrete types compatible with the fragment type condition.

4. `%other` should remain minimal, as it is today. Concrete types affected by selected abstract or concrete refinements should already be represented by the explicit union arms.


