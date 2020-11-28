# relay-compiler-wasm

Expose relay compiler (Rust) functionality via wasm (https://rustwasm.github.io/docs/wasm-bindgen/)

Setup:
- https://rustwasm.github.io/wasm-pack/installer/

Build:
- `wasm-pack build --target nodejs`

Test:
- `node index.js`


TODO: Figure out how to make it work with `rayon`.
