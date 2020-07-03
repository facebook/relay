graphql`
    query AppQuery {
        node(id: "test") {
            ...Component_node
        }
    }
`;
