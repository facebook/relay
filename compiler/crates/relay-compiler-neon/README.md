# relay-compiler-neon

Relay Compiler - native extension for nodejs

Before running this you'll need to setup `neon` locally (https://neon-bindings.com/docs/getting-started)

First, `npm install`.

Later, when updating `native/lib.rs`:

- `neon build` - to build the extension
- `npm test` - for unit-tests
