/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noformat
 */

// Relay.dev currently does not ship with React.

'use strict';

(function () {
    function addListeners() {
        function provideFeedback(value) {
            if (window.ga) {
                window.ga('send', {
                    hitType: 'event',
                    eventCategory: 'button',
                    eventAction: 'feedback',
                    eventValue: value,
                });
            }
            document.querySelector('#docsRating').innerHTML = 'Thank you for letting us know!';
        }

        document.querySelector('#docsRating-like').onclick = function () {
            provideFeedback(1);
        };
        document.querySelector('#docsRating-dislike').onclick = function () {
            provideFeedback(0);
        };
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        addListeners();
    } else {
        document.addEventListener('DOMContentLoaded', addListeners);
    }
})();
