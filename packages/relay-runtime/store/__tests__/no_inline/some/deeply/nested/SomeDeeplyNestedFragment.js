const {graphql} = require('relay-runtime/query/GraphQLTag');

graphql`
fragment SomeDeeplyNestedFragment on User @no_inline {
    name
}
`;