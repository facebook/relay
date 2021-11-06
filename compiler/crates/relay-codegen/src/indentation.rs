/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const INDENTS: [&str; 48] = [
    "",
    "  ",
    "    ",
    "      ",
    "        ",
    "          ",
    "            ",
    "              ",
    "                ",
    "                  ",
    "                    ",
    "                      ",
    "                        ",
    "                          ",
    "                            ",
    "                              ",
    "                                ",
    "                                  ",
    "                                    ",
    "                                      ",
    "                                        ",
    "                                          ",
    "                                            ",
    "                                              ",
    "                                                ",
    "                                                  ",
    "                                                    ",
    "                                                      ",
    "                                                        ",
    "                                                          ",
    "                                                            ",
    "                                                              ",
    "                                                                ",
    "                                                                  ",
    "                                                                    ",
    "                                                                      ",
    "                                                                        ",
    "                                                                          ",
    "                                                                            ",
    "                                                                              ",
    "                                                                                ",
    "                                                                                  ",
    "                                                                                    ",
    "                                                                                      ",
    "                                                                                        ",
    "                                                                                          ",
    "                                                                                            ",
    "                                                                                              ",
];

pub fn print_indentation(dest_buffer: &mut String, indent: usize) {
    match INDENTS.get(indent) {
        Some(str) => dest_buffer.push_str(str),
        None => print_raw_indentation(dest_buffer, indent),
    }
}

fn print_raw_indentation(dest_buffer: &mut String, indent: usize) {
    for _ in 0..indent {
        dest_buffer.push_str("  ");
    }
}
