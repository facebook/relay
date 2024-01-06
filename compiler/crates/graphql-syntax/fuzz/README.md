# Fuzzing the relay compiler
Relay makes use of the [cargo-fuzz](https://github.com/rust-fuzz/cargo-fuzz) to 
automate building fuzz-harnesses with the appropriate instrumentation required
for high performance fuzzing. To get started with fuzzing you'll need to install
`cargo-fuzz`.

`cargo install cargo-fuzz`

## Building a fuzzer
To build and run a fuzzer you'll need to `cd` into a crate that contains a suite
of fuzz-harnesses and run cargo fuzz.

```
$ cd compiler/crates/graphql-syntax
$ # List the fuzzer's that are available.
$ cargo +nightly fuzz list
fuzz_parser
$ # Run the fuzzer.
$ cargo +nightly fuzz run fuzz_parser
```

You should expect the fuzzer to run indefinetely or until;
- It finds a bug and crashes.
- You manually stop executing e.g. ctrl-C.
- You manually set a timeout. See the 
  [libfuzzer docs for more details](https://www.llvm.org/docs/LibFuzzer.html).

## Further reading
Beyond this brief intro you will find the following resources invaluable when
writing your own fuzzers.

- The [cargo-fuzz book](https://rust-fuzz.github.io/book/cargo-fuzz.html).
- The [libfuzzer docs](https://www.llvm.org/docs/LibFuzzer.html).

