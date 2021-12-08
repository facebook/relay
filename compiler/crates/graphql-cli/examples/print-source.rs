/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use graphql_cli::SourcePrinter;
use std::ops::Range;

const EXAMPLE: &str = "fragment Example on User {
  photo(size: 40) {
    url
  }
}
some
more
lines

fragment Test on User {
  photo @
}
";

fn main() {
    // println!("char index, byte index, char");
    // for (ci, (bi, chr)) in EXAMPLE.char_indices().enumerate() {
    //     println!("{:>2}, {:>2}: {:?}", ci, bi, chr);
    // }

    let test_cases: Vec<Range<usize>> = vec![
        // first char
        0..1,
        // second char
        1..2,
        // photo
        29..34,
        // new line
        46..47,
        // outer {} block
        25..60,
        // @
        111..111,
    ];
    let printer = SourcePrinter::default();
    for test_case in test_cases.into_iter() {
        let mut res = String::new();
        printer
            .write_span(&mut res, &test_case.into(), EXAMPLE)
            .unwrap();
        println!("{}\n ---------\n", res);
    }
}
