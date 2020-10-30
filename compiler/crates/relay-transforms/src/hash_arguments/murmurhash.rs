/*
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

use std::ptr::copy_nonoverlapping;

const C1: u32 = 0xcc9e_2d51;
const C2: u32 = 0x1b87_3593;
const R1: u32 = 15;
const R2: u32 = 13;
const M: u32 = 5;
const N: u32 = 0xe654_6b64;
const CHARSET: [char; 62] = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B',
    'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U',
    'V', 'W', 'X', 'Y', 'Z',
];

// An implmentation of murmurHash.js of relay-compiler that produces the same output excepet for non-alphanumeric strings
// It does the 32bit murmurhash3 with seed 0, and applies a base62 to get the final string hash
pub fn murmurhash(data: &str) -> String {
    let bytes = data.as_bytes();
    let nbytes = bytes.len();
    let mut hash = 0; // Hardcoded seed 0
    let mut i = 0;

    let iterations = nbytes / 4;
    for _ in 0..iterations {
        hash = (hash ^ calculate_k(read_u32(&bytes[i..i + 4])))
            .rotate_left(R2)
            .wrapping_mul(M)
            .wrapping_add(N);
        i += 4;
    }

    match nbytes - i {
        1 => {
            hash ^= calculate_k(bytes[i] as u32);
        }
        2 => {
            hash ^= calculate_k((bytes[i] as u32) | ((bytes[i + 1] as u32) << 8));
        }
        3 => {
            hash ^= calculate_k(
                (bytes[i] as u32) | ((bytes[i + 1] as u32) << 8) | ((bytes[i + 2] as u32) << 16),
            );
        }
        _ => {}
    }

    hash ^= nbytes as u32;
    hash ^= hash.wrapping_shr(16);
    hash = hash.wrapping_mul(0x85eb_ca6b);
    hash ^= hash.wrapping_shr(13);
    hash = hash.wrapping_mul(0xc2b2_ae35);
    hash ^= hash.wrapping_shr(16);

    if hash == 0 {
        return "0".to_owned();
    }

    let mut chars = Vec::with_capacity(6);
    while hash > 0 {
        let d = hash % 62;
        chars.push(CHARSET[d as usize]);
        hash = (hash - d) / 62;
    }

    chars.iter().rev().collect()
}

// From byte_order::LittleEndian::read_u32
fn read_u32(src: &[u8]) -> u32 {
    let mut data: u32 = 0;
    unsafe {
        copy_nonoverlapping(src.as_ptr(), &mut data as *mut u32 as *mut u8, 4);
    }
    data.to_le()
}

fn calculate_k(k: u32) -> u32 {
    k.wrapping_mul(C1).rotate_left(R1).wrapping_mul(C2)
}

#[test]
fn test_murmurhash() {
    assert_eq!(murmurhash("{count: 20, start: 0, end: 5}"), "31sjku");
    assert_eq!(
        murmurhash("{arg: \"{arg: {count: 20, start: 0, end: 5}}\"}"),
        "3RGiWM"
    );
    assert_eq!(
        murmurhash(&str::repeat(
            "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
            40
        )),
        "3OKbT6"
    );
    assert_eq!(murmurhash("{}"), "2wIPj2");
    assert_eq!(murmurhash(""), "0");
}
