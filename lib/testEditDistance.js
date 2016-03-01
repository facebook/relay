/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule testEditDistance
 * 
 * @typechecks
 *
 */

/**
 * @internal
 *
 * Determines whether the edit distance between two strings is at or below the
 * specified threshold distance, using the approach described by Ukkonen (1985)
 * in "Algorithms for Approximate String Matching"[0] and then improved upon by
 * Berghel and Roach (1996) in "An Extension of Ukkonen's Enhanced Dynamic
 * Programming ASM Algorithm"[1].
 *
 * Given two strings of length `m` and `n` respectively, and threshold `t`,
 * uses `O(t*min(m,n))` time and `O(min(t,m,n))` space.
 *
 * @see [0]: http://www.cs.helsinki.fi/u/ukkonen/InfCont85.PDF
 * @see [1]: http://berghel.net/publications/asm/asm.pdf
 */
"use strict";

var _Array$from = require("babel-runtime/core-js/array/from")["default"];

function testEditDistance(a, b, threshold) {
  // Ensure `b` is at least as long as `a`, swapping if necessary.
  var m = a.length;
  var n = b.length;
  if (n < m) {
    var _ref = [m, n];
    n = _ref[0];
    m = _ref[1];
    var _ref2 = [a, b];
    b = _ref2[0];
    a = _ref2[1];
  }
  if (!m) {
    return n <= threshold;
  }

  var zeroK = n;
  var maxK = zeroK * 2 + 1;
  var fkp = _Array$from(Array(maxK), function () {
    return [];
  });

  for (var k = -zeroK; k < 0; k++) {
    var _p = -k - 1;
    fkp[k + zeroK][_p + 1] = -k - 1;
    fkp[k + zeroK][_p] = -Infinity;
  }
  fkp[zeroK][0] = -1;
  for (var k = 1; k <= zeroK; k++) {
    var _p2 = k - 1;
    fkp[k + zeroK][_p2 + 1] = -1;
    fkp[k + zeroK][_p2] = -Infinity;
  }

  // This loop is the alternative form suggested in the afterword of Berghel &
  // Roach.
  var p = n - m - 1;
  do {
    if (p > threshold) {
      return false;
    }
    p++;
    for (var i = Math.floor((p - (n - m)) / 2); i >= 1; i--) {
      f(n - m + i, p - i);
    }
    for (var i = Math.floor((n - m + p) / 2); i >= 1; i--) {
      f(n - m - i, p - i);
    }
    f(n - m, p);
  } while (fkp[n - m + zeroK][p] !== m);

  return true;

  function f(k, p) {
    var t = fkp[k + zeroK][p] + 1;
    var t2 = t;

    // Check for transposed characters.
    if (a[t - 1] === b[k + t] && a[t] === b[k + t - 1]) {
      t2 = t + 1;
    }

    t = Math.max(t, fkp[k - 1 + zeroK][p], fkp[k + 1 + zeroK][p] + 1, t2);

    while (a[t] === b[t + k] && t < Math.min(m, n - k)) {
      t++;
    }
    fkp[k + zeroK][p + 1] = t;
  }
}

module.exports = testEditDistance;