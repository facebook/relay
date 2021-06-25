# Relay Compiler Playground

Compile parts of the Rust Relay compiler to Wasm and expose them as a web-based
playground.

## Build The Wasm Module

To build the wasm module:

```bash
cd relay-compiler-playground
wasm-pack build --target web
```

I had to do `rustup component add rust-src` as well.

This will create the NPM module in `relay-compiler-playground/pkg`.

## Publishing

Bump the version in `cargo.toml`. This will be used for the generated
`package.json`.

Build (see above)

Fix:

_Note:_ Wasm-pack has a bug which has been resolved, but not yet shipped in a
release which meanst he `files` array in the generated `package.json` file is
missing an entry. You'll need to manually that arry to include
`"relay_compiler_playground_bg.js"` before publishing:

```json
  "files": [
    "relay_compiler_playground_bg.wasm",
    "relay_compiler_playground_bg.js",
    "relay_compiler_playground.js",
    "relay_compiler_playground.d.ts"
  ],
```

More info: https://github.com/rustwasm/wasm-pack/issues/837

Finally, publish: `npm publish`

## Testing

```bash
cd relay-compiler-playground
wasm-pack build --target nodejs # NOTE: We build for node in tests and web to publish
yarn
yarn test
```
