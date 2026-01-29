# docblock-shared

[Relay Resolvers](https://relay.dev/docs/next/guides/relay-resolvers/introduction/)
are extracted from JS code by looking for annotations in docblocks and
extracting schema definitions. These schema definitions need extra metadata so
that Relay knows which types/fields are backed by resolvers, how to call the
resolver, which resolver features are used, etc.

This metadata is passed using a Schema Definition Language (SDL) directive
attached to the generated schema definitions.

NOTE: The SDL for resolvers is not currently ever written as an `.graphql` file
anywhere. Instead the code analysis that extracts resolvers from JS builds up
in-memory ASTs for that SDL and passes it to the rest of Relay. This has the
benefit of allowing us to populate the SDL location information with spans and
location keys pointing back to the original JS code from which the
names/types/etc were derived.

Read more on this pattern here: https://jordaneldredge.com/notes/compile-to-ast/

The SDL directives act as the implicit contract between the parts of Relay that
extract Resolvers from JS code and the parts of Relay that generate artifacts
that are aware of Resolvers. As such, the names of these directives and
arguments must be shared by multiple crates and thus are pulled out into shared
crate.

This crate also exposes the names of the docblock tags used by Relay Resolvers
today.
