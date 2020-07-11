# interner

Traits and utilities for efficiently interning arbitrary Rust types. The intended usage is to provide a small, cheap-to-copy/compare value that can be substituted for a larger value. A common example is for symbols in source code (e.g. identifiers, field names, argument names in GraphQL), but also other identifier-like information such as structs that might map a File+NameWithinFile struct.
