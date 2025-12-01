"use strict";
exports.id = 676;
exports.ids = [676];
exports.modules = {

/***/ 43349:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a": () => (/* binding */ addHtmlLabel)
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(96225);




function addHtmlLabel(root, node) {
  var fo = root.append('foreignObject').attr('width', '100000');

  var div = fo.append('xhtml:div');
  div.attr('xmlns', 'http://www.w3.org/1999/xhtml');

  var label = node.label;
  switch (typeof label) {
    case 'function':
      div.insert(label);
      break;
    case 'object':
      // Currently we assume this is a DOM object.
      div.insert(function () {
        return label;
      });
      break;
    default:
      div.html(label);
  }

  _util_js__WEBPACK_IMPORTED_MODULE_0__/* .applyStyle */ .bg(div, node.labelStyle);
  div.style('display', 'inline-block');
  // Fix for firefox
  div.style('white-space', 'nowrap');

  var client = div.node().getBoundingClientRect();
  fo.attr('width', client.width).attr('height', client.height);

  return fo;
}


/***/ }),

/***/ 96225:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "$p": () => (/* binding */ applyClass),
/* harmony export */   "O1": () => (/* binding */ edgeToId),
/* harmony export */   "WR": () => (/* binding */ applyTransition),
/* harmony export */   "bF": () => (/* binding */ isSubgraph),
/* harmony export */   "bg": () => (/* binding */ applyStyle)
/* harmony export */ });
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(37514);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(73234);


// Public utility functions


/*
 * Returns true if the specified node in the graph is a subgraph node. A
 * subgraph node is one that contains other nodes.
 */
function isSubgraph(g, v) {
  return !!g.children(v).length;
}

function edgeToId(e) {
  return escapeId(e.v) + ':' + escapeId(e.w) + ':' + escapeId(e.name);
}

var ID_DELIM = /:/g;
function escapeId(str) {
  return str ? String(str).replace(ID_DELIM, '\\:') : '';
}

function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr('style', styleFn);
  }
}

function applyClass(dom, classFn, otherClasses) {
  if (classFn) {
    dom.attr('class', classFn).attr('class', otherClasses + ' ' + dom.attr('class'));
  }
}

function applyTransition(selection, g) {
  var graph = g.graph();

  if (lodash_es__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z(graph)) {
    var transition = graph.transition;
    if (lodash_es__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z(transition)) {
      return transition(selection);
    }
  }

  return selection;
}


/***/ }),

/***/ 62865:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "bK": () => (/* reexport */ layout)
});

// UNUSED EXPORTS: acyclic, normalize, rank

// EXTERNAL MODULE: ./node_modules/lodash-es/forEach.js
var forEach = __webpack_require__(70870);
// EXTERNAL MODULE: ./node_modules/lodash-es/uniqueId.js
var uniqueId = __webpack_require__(66749);
// EXTERNAL MODULE: ./node_modules/lodash-es/constant.js
var constant = __webpack_require__(62002);
// EXTERNAL MODULE: ./node_modules/lodash-es/flatten.js
var flatten = __webpack_require__(27961);
// EXTERNAL MODULE: ./node_modules/lodash-es/map.js
var map = __webpack_require__(43836);
// EXTERNAL MODULE: ./node_modules/lodash-es/range.js + 2 modules
var range = __webpack_require__(74379);
// EXTERNAL MODULE: ./node_modules/dagre-d3-es/src/graphlib/index.js
var graphlib = __webpack_require__(45625);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/data/list.js
/*
 * Simple doubly linked list implementation derived from Cormen, et al.,
 * "Introduction to Algorithms".
 */



class List {
  constructor() {
    var sentinel = {};
    sentinel._next = sentinel._prev = sentinel;
    this._sentinel = sentinel;
  }
  dequeue() {
    var sentinel = this._sentinel;
    var entry = sentinel._prev;
    if (entry !== sentinel) {
      unlink(entry);
      return entry;
    }
  }
  enqueue(entry) {
    var sentinel = this._sentinel;
    if (entry._prev && entry._next) {
      unlink(entry);
    }
    entry._next = sentinel._next;
    sentinel._next._prev = entry;
    sentinel._next = entry;
    entry._prev = sentinel;
  }
  toString() {
    var strs = [];
    var sentinel = this._sentinel;
    var curr = sentinel._prev;
    while (curr !== sentinel) {
      strs.push(JSON.stringify(curr, filterOutLinks));
      curr = curr._prev;
    }
    return '[' + strs.join(', ') + ']';
  }
}

function unlink(entry) {
  entry._prev._next = entry._next;
  entry._next._prev = entry._prev;
  delete entry._next;
  delete entry._prev;
}

function filterOutLinks(k, v) {
  if (k !== '_next' && k !== '_prev') {
    return v;
  }
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/greedy-fas.js




/*
 * A greedy heuristic for finding a feedback arc set for a graph. A feedback
 * arc set is a set of edges that can be removed to make a graph acyclic.
 * The algorithm comes from: P. Eades, X. Lin, and W. F. Smyth, "A fast and
 * effective heuristic for the feedback arc set problem." This implementation
 * adjusts that from the paper to allow for weighted edges.
 */


var DEFAULT_WEIGHT_FN = constant/* default */.Z(1);

function greedyFAS(g, weightFn) {
  if (g.nodeCount() <= 1) {
    return [];
  }
  var state = buildState(g, weightFn || DEFAULT_WEIGHT_FN);
  var results = doGreedyFAS(state.graph, state.buckets, state.zeroIdx);

  // Expand multi-edges
  return flatten/* default */.Z(
    map/* default */.Z(results, function (e) {
      return g.outEdges(e.v, e.w);
    }),
  );
}

function doGreedyFAS(g, buckets, zeroIdx) {
  var results = [];
  var sources = buckets[buckets.length - 1];
  var sinks = buckets[0];

  var entry;
  while (g.nodeCount()) {
    while ((entry = sinks.dequeue())) {
      removeNode(g, buckets, zeroIdx, entry);
    }
    while ((entry = sources.dequeue())) {
      removeNode(g, buckets, zeroIdx, entry);
    }
    if (g.nodeCount()) {
      for (var i = buckets.length - 2; i > 0; --i) {
        entry = buckets[i].dequeue();
        if (entry) {
          results = results.concat(removeNode(g, buckets, zeroIdx, entry, true));
          break;
        }
      }
    }
  }

  return results;
}

function removeNode(g, buckets, zeroIdx, entry, collectPredecessors) {
  var results = collectPredecessors ? [] : undefined;

  forEach/* default */.Z(g.inEdges(entry.v), function (edge) {
    var weight = g.edge(edge);
    var uEntry = g.node(edge.v);

    if (collectPredecessors) {
      results.push({ v: edge.v, w: edge.w });
    }

    uEntry.out -= weight;
    assignBucket(buckets, zeroIdx, uEntry);
  });

  forEach/* default */.Z(g.outEdges(entry.v), function (edge) {
    var weight = g.edge(edge);
    var w = edge.w;
    var wEntry = g.node(w);
    wEntry['in'] -= weight;
    assignBucket(buckets, zeroIdx, wEntry);
  });

  g.removeNode(entry.v);

  return results;
}

function buildState(g, weightFn) {
  var fasGraph = new graphlib/* Graph */.k();
  var maxIn = 0;
  var maxOut = 0;

  forEach/* default */.Z(g.nodes(), function (v) {
    fasGraph.setNode(v, { v: v, in: 0, out: 0 });
  });

  // Aggregate weights on nodes, but also sum the weights across multi-edges
  // into a single edge for the fasGraph.
  forEach/* default */.Z(g.edges(), function (e) {
    var prevWeight = fasGraph.edge(e.v, e.w) || 0;
    var weight = weightFn(e);
    var edgeWeight = prevWeight + weight;
    fasGraph.setEdge(e.v, e.w, edgeWeight);
    maxOut = Math.max(maxOut, (fasGraph.node(e.v).out += weight));
    maxIn = Math.max(maxIn, (fasGraph.node(e.w)['in'] += weight));
  });

  var buckets = range/* default */.Z(maxOut + maxIn + 3).map(function () {
    return new List();
  });
  var zeroIdx = maxIn + 1;

  forEach/* default */.Z(fasGraph.nodes(), function (v) {
    assignBucket(buckets, zeroIdx, fasGraph.node(v));
  });

  return { graph: fasGraph, buckets: buckets, zeroIdx: zeroIdx };
}

function assignBucket(buckets, zeroIdx, entry) {
  if (!entry.out) {
    buckets[0].enqueue(entry);
  } else if (!entry['in']) {
    buckets[buckets.length - 1].enqueue(entry);
  } else {
    buckets[entry.out - entry['in'] + zeroIdx].enqueue(entry);
  }
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/acyclic.js





function run(g) {
  var fas = g.graph().acyclicer === 'greedy' ? greedyFAS(g, weightFn(g)) : dfsFAS(g);
  forEach/* default */.Z(fas, function (e) {
    var label = g.edge(e);
    g.removeEdge(e);
    label.forwardName = e.name;
    label.reversed = true;
    g.setEdge(e.w, e.v, label, uniqueId/* default */.Z('rev'));
  });

  function weightFn(g) {
    return function (e) {
      return g.edge(e).weight;
    };
  }
}

function dfsFAS(g) {
  var fas = [];
  var stack = {};
  var visited = {};

  function dfs(v) {
    if (Object.prototype.hasOwnProperty.call(visited, v)) {
      return;
    }
    visited[v] = true;
    stack[v] = true;
    forEach/* default */.Z(g.outEdges(v), function (e) {
      if (Object.prototype.hasOwnProperty.call(stack, e.w)) {
        fas.push(e);
      } else {
        dfs(e.w);
      }
    });
    delete stack[v];
  }

  forEach/* default */.Z(g.nodes(), dfs);
  return fas;
}

function undo(g) {
  forEach/* default */.Z(g.edges(), function (e) {
    var label = g.edge(e);
    if (label.reversed) {
      g.removeEdge(e);

      var forwardName = label.forwardName;
      delete label.reversed;
      delete label.forwardName;
      g.setEdge(e.w, e.v, label, forwardName);
    }
  });
}

// EXTERNAL MODULE: ./node_modules/lodash-es/merge.js + 6 modules
var merge = __webpack_require__(59236);
// EXTERNAL MODULE: ./node_modules/lodash-es/pick.js + 4 modules
var pick = __webpack_require__(61666);
// EXTERNAL MODULE: ./node_modules/lodash-es/defaults.js
var defaults = __webpack_require__(3688);
// EXTERNAL MODULE: ./node_modules/lodash-es/isSymbol.js
var isSymbol = __webpack_require__(72714);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseExtremum.js


/**
 * The base implementation of methods like `_.max` and `_.min` which accepts a
 * `comparator` to determine the extremum value.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} iteratee The iteratee invoked per iteration.
 * @param {Function} comparator The comparator used to compare values.
 * @returns {*} Returns the extremum value.
 */
function baseExtremum(array, iteratee, comparator) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    var value = array[index],
        current = iteratee(value);

    if (current != null && (computed === undefined
          ? (current === current && !(0,isSymbol/* default */.Z)(current))
          : comparator(current, computed)
        )) {
      var computed = current,
          result = value;
    }
  }
  return result;
}

/* harmony default export */ const _baseExtremum = (baseExtremum);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseGt.js
/**
 * The base implementation of `_.gt` which doesn't coerce arguments.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is greater than `other`,
 *  else `false`.
 */
function baseGt(value, other) {
  return value > other;
}

/* harmony default export */ const _baseGt = (baseGt);

// EXTERNAL MODULE: ./node_modules/lodash-es/identity.js
var identity = __webpack_require__(69203);
;// CONCATENATED MODULE: ./node_modules/lodash-es/max.js




/**
 * Computes the maximum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the maximum value.
 * @example
 *
 * _.max([4, 2, 8, 6]);
 * // => 8
 *
 * _.max([]);
 * // => undefined
 */
function max(array) {
  return (array && array.length)
    ? _baseExtremum(array, identity/* default */.Z, _baseGt)
    : undefined;
}

/* harmony default export */ const lodash_es_max = (max);

;// CONCATENATED MODULE: ./node_modules/lodash-es/last.js
/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

/* harmony default export */ const lodash_es_last = (last);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseAssignValue.js
var _baseAssignValue = __webpack_require__(74752);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseForOwn.js
var _baseForOwn = __webpack_require__(2693);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseIteratee.js + 16 modules
var _baseIteratee = __webpack_require__(74765);
;// CONCATENATED MODULE: ./node_modules/lodash-es/mapValues.js




/**
 * Creates an object with the same keys as `object` and values generated
 * by running each own enumerable string keyed property of `object` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, key, object).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns the new mapped object.
 * @see _.mapKeys
 * @example
 *
 * var users = {
 *   'fred':    { 'user': 'fred',    'age': 40 },
 *   'pebbles': { 'user': 'pebbles', 'age': 1 }
 * };
 *
 * _.mapValues(users, function(o) { return o.age; });
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 *
 * // The `_.property` iteratee shorthand.
 * _.mapValues(users, 'age');
 * // => { 'fred': 40, 'pebbles': 1 } (iteration order is not guaranteed)
 */
function mapValues(object, iteratee) {
  var result = {};
  iteratee = (0,_baseIteratee/* default */.Z)(iteratee, 3);

  (0,_baseForOwn/* default */.Z)(object, function(value, key, object) {
    (0,_baseAssignValue/* default */.Z)(result, key, iteratee(value, key, object));
  });
  return result;
}

/* harmony default export */ const lodash_es_mapValues = (mapValues);

// EXTERNAL MODULE: ./node_modules/lodash-es/isUndefined.js
var isUndefined = __webpack_require__(49360);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseLt.js
/**
 * The base implementation of `_.lt` which doesn't coerce arguments.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if `value` is less than `other`,
 *  else `false`.
 */
function baseLt(value, other) {
  return value < other;
}

/* harmony default export */ const _baseLt = (baseLt);

;// CONCATENATED MODULE: ./node_modules/lodash-es/min.js




/**
 * Computes the minimum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the minimum value.
 * @example
 *
 * _.min([4, 2, 8, 6]);
 * // => 2
 *
 * _.min([]);
 * // => undefined
 */
function min(array) {
  return (array && array.length)
    ? _baseExtremum(array, identity/* default */.Z, _baseLt)
    : undefined;
}

/* harmony default export */ const lodash_es_min = (min);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseHas.js
/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _baseHas_hasOwnProperty = objectProto.hasOwnProperty;

/**
 * The base implementation of `_.has` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHas(object, key) {
  return object != null && _baseHas_hasOwnProperty.call(object, key);
}

/* harmony default export */ const _baseHas = (baseHas);

// EXTERNAL MODULE: ./node_modules/lodash-es/_hasPath.js
var _hasPath = __webpack_require__(16174);
;// CONCATENATED MODULE: ./node_modules/lodash-es/has.js



/**
 * Checks if `path` is a direct property of `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = { 'a': { 'b': 2 } };
 * var other = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.has(object, 'a');
 * // => true
 *
 * _.has(object, 'a.b');
 * // => true
 *
 * _.has(object, ['a', 'b']);
 * // => true
 *
 * _.has(other, 'a');
 * // => false
 */
function has(object, path) {
  return object != null && (0,_hasPath/* default */.Z)(object, path, _baseHas);
}

/* harmony default export */ const lodash_es_has = (has);

// EXTERNAL MODULE: ./node_modules/lodash-es/_root.js
var _root = __webpack_require__(66092);
;// CONCATENATED MODULE: ./node_modules/lodash-es/now.js


/**
 * Gets the timestamp of the number of milliseconds that have elapsed since
 * the Unix epoch (1 January 1970 00:00:00 UTC).
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Date
 * @returns {number} Returns the timestamp.
 * @example
 *
 * _.defer(function(stamp) {
 *   console.log(_.now() - stamp);
 * }, _.now());
 * // => Logs the number of milliseconds it took for the deferred invocation.
 */
var now = function() {
  return _root/* default.Date.now */.Z.Date.now();
};

/* harmony default export */ const lodash_es_now = (now);

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/util.js





/*
 * Adds a dummy node to the graph and return v.
 */
function addDummyNode(g, type, attrs, name) {
  var v;
  do {
    v = uniqueId/* default */.Z(name);
  } while (g.hasNode(v));

  attrs.dummy = type;
  g.setNode(v, attrs);
  return v;
}

/*
 * Returns a new graph with only simple edges. Handles aggregation of data
 * associated with multi-edges.
 */
function simplify(g) {
  var simplified = new graphlib/* Graph */.k().setGraph(g.graph());
  forEach/* default */.Z(g.nodes(), function (v) {
    simplified.setNode(v, g.node(v));
  });
  forEach/* default */.Z(g.edges(), function (e) {
    var simpleLabel = simplified.edge(e.v, e.w) || { weight: 0, minlen: 1 };
    var label = g.edge(e);
    simplified.setEdge(e.v, e.w, {
      weight: simpleLabel.weight + label.weight,
      minlen: Math.max(simpleLabel.minlen, label.minlen),
    });
  });
  return simplified;
}

function asNonCompoundGraph(g) {
  var simplified = new graphlib/* Graph */.k({ multigraph: g.isMultigraph() }).setGraph(g.graph());
  forEach/* default */.Z(g.nodes(), function (v) {
    if (!g.children(v).length) {
      simplified.setNode(v, g.node(v));
    }
  });
  forEach/* default */.Z(g.edges(), function (e) {
    simplified.setEdge(e, g.edge(e));
  });
  return simplified;
}

function successorWeights(g) {
  var weightMap = _.map(g.nodes(), function (v) {
    var sucs = {};
    _.forEach(g.outEdges(v), function (e) {
      sucs[e.w] = (sucs[e.w] || 0) + g.edge(e).weight;
    });
    return sucs;
  });
  return _.zipObject(g.nodes(), weightMap);
}

function predecessorWeights(g) {
  var weightMap = _.map(g.nodes(), function (v) {
    var preds = {};
    _.forEach(g.inEdges(v), function (e) {
      preds[e.v] = (preds[e.v] || 0) + g.edge(e).weight;
    });
    return preds;
  });
  return _.zipObject(g.nodes(), weightMap);
}

/*
 * Finds where a line starting at point ({x, y}) would intersect a rectangle
 * ({x, y, width, height}) if it were pointing at the rectangle's center.
 */
function intersectRect(rect, point) {
  var x = rect.x;
  var y = rect.y;

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = rect.width / 2;
  var h = rect.height / 2;

  if (!dx && !dy) {
    throw new Error('Not possible to find intersection inside of the rectangle');
  }

  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = (h * dx) / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = (w * dy) / dx;
  }

  return { x: x + sx, y: y + sy };
}

/*
 * Given a DAG with each node assigned "rank" and "order" properties, this
 * function will produce a matrix with the ids of each node.
 */
function buildLayerMatrix(g) {
  var layering = map/* default */.Z(range/* default */.Z(util_maxRank(g) + 1), function () {
    return [];
  });
  forEach/* default */.Z(g.nodes(), function (v) {
    var node = g.node(v);
    var rank = node.rank;
    if (!isUndefined/* default */.Z(rank)) {
      layering[rank][node.order] = v;
    }
  });
  return layering;
}

/*
 * Adjusts the ranks for all nodes in the graph such that all nodes v have
 * rank(v) >= 0 and at least one node w has rank(w) = 0.
 */
function normalizeRanks(g) {
  var min = lodash_es_min(
    map/* default */.Z(g.nodes(), function (v) {
      return g.node(v).rank;
    }),
  );
  forEach/* default */.Z(g.nodes(), function (v) {
    var node = g.node(v);
    if (lodash_es_has(node, 'rank')) {
      node.rank -= min;
    }
  });
}

function removeEmptyRanks(g) {
  // Ranks may not start at 0, so we need to offset them
  var offset = lodash_es_min(
    map/* default */.Z(g.nodes(), function (v) {
      return g.node(v).rank;
    }),
  );

  var layers = [];
  forEach/* default */.Z(g.nodes(), function (v) {
    var rank = g.node(v).rank - offset;
    if (!layers[rank]) {
      layers[rank] = [];
    }
    layers[rank].push(v);
  });

  var delta = 0;
  var nodeRankFactor = g.graph().nodeRankFactor;
  forEach/* default */.Z(layers, function (vs, i) {
    if (isUndefined/* default */.Z(vs) && i % nodeRankFactor !== 0) {
      --delta;
    } else if (delta) {
      forEach/* default */.Z(vs, function (v) {
        g.node(v).rank += delta;
      });
    }
  });
}

function addBorderNode(g, prefix, rank, order) {
  var node = {
    width: 0,
    height: 0,
  };
  if (arguments.length >= 4) {
    node.rank = rank;
    node.order = order;
  }
  return addDummyNode(g, 'border', node, prefix);
}

function util_maxRank(g) {
  return lodash_es_max(
    map/* default */.Z(g.nodes(), function (v) {
      var rank = g.node(v).rank;
      if (!isUndefined/* default */.Z(rank)) {
        return rank;
      }
    }),
  );
}

/*
 * Partition a collection into two groups: `lhs` and `rhs`. If the supplied
 * function returns true for an entry it goes into `lhs`. Otherwise it goes
 * into `rhs.
 */
function partition(collection, fn) {
  var result = { lhs: [], rhs: [] };
  forEach/* default */.Z(collection, function (value) {
    if (fn(value)) {
      result.lhs.push(value);
    } else {
      result.rhs.push(value);
    }
  });
  return result;
}

/*
 * Returns a new function that wraps `fn` with a timer. The wrapper logs the
 * time it takes to execute the function.
 */
function util_time(name, fn) {
  var start = lodash_es_now();
  try {
    return fn();
  } finally {
    console.log(name + ' time: ' + (lodash_es_now() - start) + 'ms');
  }
}

function notime(name, fn) {
  return fn();
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/add-border-segments.js





function addBorderSegments(g) {
  function dfs(v) {
    var children = g.children(v);
    var node = g.node(v);
    if (children.length) {
      forEach/* default */.Z(children, dfs);
    }

    if (Object.prototype.hasOwnProperty.call(node, 'minRank')) {
      node.borderLeft = [];
      node.borderRight = [];
      for (var rank = node.minRank, maxRank = node.maxRank + 1; rank < maxRank; ++rank) {
        add_border_segments_addBorderNode(g, 'borderLeft', '_bl', v, node, rank);
        add_border_segments_addBorderNode(g, 'borderRight', '_br', v, node, rank);
      }
    }
  }

  forEach/* default */.Z(g.children(), dfs);
}

function add_border_segments_addBorderNode(g, prop, prefix, sg, sgNode, rank) {
  var label = { width: 0, height: 0, rank: rank, borderType: prop };
  var prev = sgNode[prop][rank - 1];
  var curr = addDummyNode(g, 'border', label, prefix);
  sgNode[prop][rank] = curr;
  g.setParent(curr, sg);
  if (prev) {
    g.setEdge(prev, curr, { weight: 1 });
  }
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/coordinate-system.js




function adjust(g) {
  var rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === 'lr' || rankDir === 'rl') {
    swapWidthHeight(g);
  }
}

function coordinate_system_undo(g) {
  var rankDir = g.graph().rankdir.toLowerCase();
  if (rankDir === 'bt' || rankDir === 'rl') {
    reverseY(g);
  }

  if (rankDir === 'lr' || rankDir === 'rl') {
    swapXY(g);
    swapWidthHeight(g);
  }
}

function swapWidthHeight(g) {
  forEach/* default */.Z(g.nodes(), function (v) {
    swapWidthHeightOne(g.node(v));
  });
  forEach/* default */.Z(g.edges(), function (e) {
    swapWidthHeightOne(g.edge(e));
  });
}

function swapWidthHeightOne(attrs) {
  var w = attrs.width;
  attrs.width = attrs.height;
  attrs.height = w;
}

function reverseY(g) {
  forEach/* default */.Z(g.nodes(), function (v) {
    reverseYOne(g.node(v));
  });

  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    forEach/* default */.Z(edge.points, reverseYOne);
    if (Object.prototype.hasOwnProperty.call(edge, 'y')) {
      reverseYOne(edge);
    }
  });
}

function reverseYOne(attrs) {
  attrs.y = -attrs.y;
}

function swapXY(g) {
  forEach/* default */.Z(g.nodes(), function (v) {
    swapXYOne(g.node(v));
  });

  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    forEach/* default */.Z(edge.points, swapXYOne);
    if (Object.prototype.hasOwnProperty.call(edge, 'x')) {
      swapXYOne(edge);
    }
  });
}

function swapXYOne(attrs) {
  var x = attrs.x;
  attrs.x = attrs.y;
  attrs.y = x;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/normalize.js
/**
 * TypeScript type imports:
 *
 * @import { Graph } from '../graphlib/graph.js';
 */





/*
 * Breaks any long edges in the graph into short segments that span 1 layer
 * each. This operation is undoable with the denormalize function.
 *
 * Pre-conditions:
 *
 *    1. The input graph is a DAG.
 *    2. Each node in the graph has a "rank" property.
 *
 * Post-condition:
 *
 *    1. All edges in the graph have a length of 1.
 *    2. Dummy nodes are added where edges have been split into segments.
 *    3. The graph is augmented with a "dummyChains" attribute which contains
 *       the first dummy in each chain of dummy nodes produced.
 */
function normalize_run(g) {
  g.graph().dummyChains = [];
  forEach/* default */.Z(g.edges(), function (edge) {
    normalizeEdge(g, edge);
  });
}

/**
 * @param {Graph} g
 */
function normalizeEdge(g, e) {
  var v = e.v;
  var vRank = g.node(v).rank;
  var w = e.w;
  var wRank = g.node(w).rank;
  var name = e.name;
  var edgeLabel = g.edge(e);
  var labelRank = edgeLabel.labelRank;

  if (wRank === vRank + 1) return;

  g.removeEdge(e);

  /**
   * @typedef {Object} Attrs
   * @property {number} width
   * @property {number} height
   * @property {ReturnType<Graph["node"]>} edgeLabel
   * @property {any} edgeObj
   * @property {ReturnType<Graph["node"]>["rank"]} rank
   * @property {string} [dummy]
   * @property {ReturnType<Graph["node"]>["labelpos"]} [labelpos]
   */

  /** @type {Attrs | undefined} */
  var attrs = undefined;
  var dummy, i;
  for (i = 0, ++vRank; vRank < wRank; ++i, ++vRank) {
    edgeLabel.points = [];
    attrs = {
      width: 0,
      height: 0,
      edgeLabel: edgeLabel,
      edgeObj: e,
      rank: vRank,
    };
    dummy = addDummyNode(g, 'edge', attrs, '_d');
    if (vRank === labelRank) {
      attrs.width = edgeLabel.width;
      attrs.height = edgeLabel.height;
      attrs.dummy = 'edge-label';
      attrs.labelpos = edgeLabel.labelpos;
    }
    g.setEdge(v, dummy, { weight: edgeLabel.weight }, name);
    if (i === 0) {
      g.graph().dummyChains.push(dummy);
    }
    v = dummy;
  }

  g.setEdge(v, w, { weight: edgeLabel.weight }, name);
}

function normalize_undo(g) {
  forEach/* default */.Z(g.graph().dummyChains, function (v) {
    var node = g.node(v);
    var origLabel = node.edgeLabel;
    var w;
    g.setEdge(node.edgeObj, origLabel);
    while (node.dummy) {
      w = g.successors(v)[0];
      g.removeNode(v);
      origLabel.points.push({ x: node.x, y: node.y });
      if (node.dummy === 'edge-label') {
        origLabel.x = node.x;
        origLabel.y = node.y;
        origLabel.width = node.width;
        origLabel.height = node.height;
      }
      v = w;
      node = g.node(v);
    }
  });
}

;// CONCATENATED MODULE: ./node_modules/lodash-es/minBy.js




/**
 * This method is like `_.min` except that it accepts `iteratee` which is
 * invoked for each element in `array` to generate the criterion by which
 * the value is ranked. The iteratee is invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Math
 * @param {Array} array The array to iterate over.
 * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
 * @returns {*} Returns the minimum value.
 * @example
 *
 * var objects = [{ 'n': 1 }, { 'n': 2 }];
 *
 * _.minBy(objects, function(o) { return o.n; });
 * // => { 'n': 1 }
 *
 * // The `_.property` iteratee shorthand.
 * _.minBy(objects, 'n');
 * // => { 'n': 1 }
 */
function minBy(array, iteratee) {
  return (array && array.length)
    ? _baseExtremum(array, (0,_baseIteratee/* default */.Z)(iteratee, 2), _baseLt)
    : undefined;
}

/* harmony default export */ const lodash_es_minBy = (minBy);

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/rank/util.js




/*
 * Initializes ranks for the input graph using the longest path algorithm. This
 * algorithm scales well and is fast in practice, it yields rather poor
 * solutions. Nodes are pushed to the lowest layer possible, leaving the bottom
 * ranks wide and leaving edges longer than necessary. However, due to its
 * speed, this algorithm is good for getting an initial ranking that can be fed
 * into other algorithms.
 *
 * This algorithm does not normalize layers because it will be used by other
 * algorithms in most cases. If using this algorithm directly, be sure to
 * run normalize at the end.
 *
 * Pre-conditions:
 *
 *    1. Input graph is a DAG.
 *    2. Input graph node labels can be assigned properties.
 *
 * Post-conditions:
 *
 *    1. Each node will be assign an (unnormalized) "rank" property.
 */
function longestPath(g) {
  var visited = {};

  function dfs(v) {
    var label = g.node(v);
    if (Object.prototype.hasOwnProperty.call(visited, v)) {
      return label.rank;
    }
    visited[v] = true;

    var rank = lodash_es_min(
      map/* default */.Z(g.outEdges(v), function (e) {
        return dfs(e.w) - g.edge(e).minlen;
      }),
    );

    if (
      rank === Number.POSITIVE_INFINITY || // return value of _.map([]) for Lodash 3
      rank === undefined || // return value of _.map([]) for Lodash 4
      rank === null
    ) {
      // return value of _.map([null])
      rank = 0;
    }

    return (label.rank = rank);
  }

  forEach/* default */.Z(g.sources(), dfs);
}

/*
 * Returns the amount of slack for the given edge. The slack is defined as the
 * difference between the length of the edge and its minimum length.
 */
function slack(g, e) {
  return g.node(e.w).rank - g.node(e.v).rank - g.edge(e).minlen;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/rank/feasible-tree.js






/*
 * Constructs a spanning tree with tight edges and adjusted the input node's
 * ranks to achieve this. A tight edge is one that is has a length that matches
 * its "minlen" attribute.
 *
 * The basic structure for this function is derived from Gansner, et al., "A
 * Technique for Drawing Directed Graphs."
 *
 * Pre-conditions:
 *
 *    1. Graph must be a DAG.
 *    2. Graph must be connected.
 *    3. Graph must have at least one node.
 *    5. Graph nodes must have been previously assigned a "rank" property that
 *       respects the "minlen" property of incident edges.
 *    6. Graph edges must have a "minlen" property.
 *
 * Post-conditions:
 *
 *    - Graph nodes will have their rank adjusted to ensure that all edges are
 *      tight.
 *
 * Returns a tree (undirected graph) that is constructed using only "tight"
 * edges.
 */
function feasibleTree(g) {
  var t = new graphlib/* Graph */.k({ directed: false });

  // Choose arbitrary node from which to start our tree
  var start = g.nodes()[0];
  var size = g.nodeCount();
  t.setNode(start, {});

  var edge, delta;
  while (tightTree(t, g) < size) {
    edge = findMinSlackEdge(t, g);
    delta = t.hasNode(edge.v) ? slack(g, edge) : -slack(g, edge);
    shiftRanks(t, g, delta);
  }

  return t;
}

/*
 * Finds a maximal tree of tight edges and returns the number of nodes in the
 * tree.
 */
function tightTree(t, g) {
  function dfs(v) {
    forEach/* default */.Z(g.nodeEdges(v), function (e) {
      var edgeV = e.v,
        w = v === edgeV ? e.w : edgeV;
      if (!t.hasNode(w) && !slack(g, e)) {
        t.setNode(w, {});
        t.setEdge(v, w, {});
        dfs(w);
      }
    });
  }

  forEach/* default */.Z(t.nodes(), dfs);
  return t.nodeCount();
}

/*
 * Finds the edge with the smallest slack that is incident on tree and returns
 * it.
 */
function findMinSlackEdge(t, g) {
  return lodash_es_minBy(g.edges(), function (e) {
    if (t.hasNode(e.v) !== t.hasNode(e.w)) {
      return slack(g, e);
    }
  });
}

function shiftRanks(t, g, delta) {
  forEach/* default */.Z(t.nodes(), function (v) {
    g.node(v).rank += delta;
  });
}

// EXTERNAL MODULE: ./node_modules/lodash-es/isArrayLike.js
var isArrayLike = __webpack_require__(50585);
// EXTERNAL MODULE: ./node_modules/lodash-es/keys.js
var keys = __webpack_require__(17179);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_createFind.js




/**
 * Creates a `_.find` or `_.findLast` function.
 *
 * @private
 * @param {Function} findIndexFunc The function to find the collection index.
 * @returns {Function} Returns the new find function.
 */
function createFind(findIndexFunc) {
  return function(collection, predicate, fromIndex) {
    var iterable = Object(collection);
    if (!(0,isArrayLike/* default */.Z)(collection)) {
      var iteratee = (0,_baseIteratee/* default */.Z)(predicate, 3);
      collection = (0,keys/* default */.Z)(collection);
      predicate = function(key) { return iteratee(iterable[key], key, iterable); };
    }
    var index = findIndexFunc(collection, predicate, fromIndex);
    return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
  };
}

/* harmony default export */ const _createFind = (createFind);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseFindIndex.js
var _baseFindIndex = __webpack_require__(21692);
// EXTERNAL MODULE: ./node_modules/lodash-es/toFinite.js + 3 modules
var toFinite = __webpack_require__(94099);
;// CONCATENATED MODULE: ./node_modules/lodash-es/toInteger.js


/**
 * Converts `value` to an integer.
 *
 * **Note:** This method is loosely based on
 * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted integer.
 * @example
 *
 * _.toInteger(3.2);
 * // => 3
 *
 * _.toInteger(Number.MIN_VALUE);
 * // => 0
 *
 * _.toInteger(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toInteger('3.2');
 * // => 3
 */
function toInteger(value) {
  var result = (0,toFinite/* default */.Z)(value),
      remainder = result % 1;

  return result === result ? (remainder ? result - remainder : result) : 0;
}

/* harmony default export */ const lodash_es_toInteger = (toInteger);

;// CONCATENATED MODULE: ./node_modules/lodash-es/findIndex.js




/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * This method is like `_.find` except that it returns the index of the first
 * element `predicate` returns truthy for instead of the element itself.
 *
 * @static
 * @memberOf _
 * @since 1.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {number} Returns the index of the found element, else `-1`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'active': false },
 *   { 'user': 'fred',    'active': false },
 *   { 'user': 'pebbles', 'active': true }
 * ];
 *
 * _.findIndex(users, function(o) { return o.user == 'barney'; });
 * // => 0
 *
 * // The `_.matches` iteratee shorthand.
 * _.findIndex(users, { 'user': 'fred', 'active': false });
 * // => 1
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.findIndex(users, ['active', false]);
 * // => 0
 *
 * // The `_.property` iteratee shorthand.
 * _.findIndex(users, 'active');
 * // => 2
 */
function findIndex(array, predicate, fromIndex) {
  var length = array == null ? 0 : array.length;
  if (!length) {
    return -1;
  }
  var index = fromIndex == null ? 0 : lodash_es_toInteger(fromIndex);
  if (index < 0) {
    index = nativeMax(length + index, 0);
  }
  return (0,_baseFindIndex/* default */.Z)(array, (0,_baseIteratee/* default */.Z)(predicate, 3), index);
}

/* harmony default export */ const lodash_es_findIndex = (findIndex);

;// CONCATENATED MODULE: ./node_modules/lodash-es/find.js



/**
 * Iterates over elements of `collection`, returning the first element
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to inspect.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @param {number} [fromIndex=0] The index to search from.
 * @returns {*} Returns the matched element, else `undefined`.
 * @example
 *
 * var users = [
 *   { 'user': 'barney',  'age': 36, 'active': true },
 *   { 'user': 'fred',    'age': 40, 'active': false },
 *   { 'user': 'pebbles', 'age': 1,  'active': true }
 * ];
 *
 * _.find(users, function(o) { return o.age < 40; });
 * // => object for 'barney'
 *
 * // The `_.matches` iteratee shorthand.
 * _.find(users, { 'age': 1, 'active': true });
 * // => object for 'pebbles'
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.find(users, ['active', false]);
 * // => object for 'fred'
 *
 * // The `_.property` iteratee shorthand.
 * _.find(users, 'active');
 * // => object for 'barney'
 */
var find = _createFind(lodash_es_findIndex);

/* harmony default export */ const lodash_es_find = (find);

// EXTERNAL MODULE: ./node_modules/lodash-es/filter.js + 1 modules
var filter = __webpack_require__(13445);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/dijkstra.js





var DEFAULT_WEIGHT_FUNC = constant/* default */.Z(1);

function dijkstra_dijkstra(g, source, weightFn, edgeFn) {
  return runDijkstra(
    g,
    String(source),
    weightFn || DEFAULT_WEIGHT_FUNC,
    edgeFn ||
      function (v) {
        return g.outEdges(v);
      },
  );
}

function runDijkstra(g, source, weightFn, edgeFn) {
  var results = {};
  var pq = new PriorityQueue();
  var v, vEntry;

  var updateNeighbors = function (edge) {
    var w = edge.v !== v ? edge.v : edge.w;
    var wEntry = results[w];
    var weight = weightFn(edge);
    var distance = vEntry.distance + weight;

    if (weight < 0) {
      throw new Error(
        'dijkstra does not allow negative edge weights. ' +
          'Bad edge: ' +
          edge +
          ' Weight: ' +
          weight,
      );
    }

    if (distance < wEntry.distance) {
      wEntry.distance = distance;
      wEntry.predecessor = v;
      pq.decrease(w, distance);
    }
  };

  g.nodes().forEach(function (v) {
    var distance = v === source ? 0 : Number.POSITIVE_INFINITY;
    results[v] = { distance: distance };
    pq.add(v, distance);
  });

  while (pq.size() > 0) {
    v = pq.removeMin();
    vEntry = results[v];
    if (vEntry.distance === Number.POSITIVE_INFINITY) {
      break;
    }

    edgeFn(v).forEach(updateNeighbors);
  }

  return results;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/dijkstra-all.js





function dijkstraAll(g, weightFunc, edgeFunc) {
  return _.transform(
    g.nodes(),
    function (acc, v) {
      acc[v] = dijkstra(g, v, weightFunc, edgeFunc);
    },
    {},
  );
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/floyd-warshall.js




var floyd_warshall_DEFAULT_WEIGHT_FUNC = constant/* default */.Z(1);

function floydWarshall(g, weightFn, edgeFn) {
  return runFloydWarshall(
    g,
    weightFn || floyd_warshall_DEFAULT_WEIGHT_FUNC,
    edgeFn ||
      function (v) {
        return g.outEdges(v);
      },
  );
}

function runFloydWarshall(g, weightFn, edgeFn) {
  var results = {};
  var nodes = g.nodes();

  nodes.forEach(function (v) {
    results[v] = {};
    results[v][v] = { distance: 0 };
    nodes.forEach(function (w) {
      if (v !== w) {
        results[v][w] = { distance: Number.POSITIVE_INFINITY };
      }
    });
    edgeFn(v).forEach(function (edge) {
      var w = edge.v === v ? edge.w : edge.v;
      var d = weightFn(edge);
      results[v][w] = { distance: d, predecessor: v };
    });
  });

  nodes.forEach(function (k) {
    var rowK = results[k];
    nodes.forEach(function (i) {
      var rowI = results[i];
      nodes.forEach(function (j) {
        var ik = rowI[k];
        var kj = rowK[j];
        var ij = rowI[j];
        var altDistance = ik.distance + kj.distance;
        if (altDistance < ij.distance) {
          ij.distance = altDistance;
          ij.predecessor = kj.predecessor;
        }
      });
    });
  });

  return results;
}

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseKeys.js + 1 modules
var _baseKeys = __webpack_require__(39473);
// EXTERNAL MODULE: ./node_modules/lodash-es/_getTag.js + 3 modules
var _getTag = __webpack_require__(83970);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseGetTag.js + 2 modules
var _baseGetTag = __webpack_require__(93589);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
// EXTERNAL MODULE: ./node_modules/lodash-es/isObjectLike.js
var isObjectLike = __webpack_require__(18533);
;// CONCATENATED MODULE: ./node_modules/lodash-es/isString.js




/** `Object#toString` result references. */
var stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString(value) {
  return typeof value == 'string' ||
    (!(0,isArray/* default */.Z)(value) && (0,isObjectLike/* default */.Z)(value) && (0,_baseGetTag/* default */.Z)(value) == stringTag);
}

/* harmony default export */ const lodash_es_isString = (isString);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseProperty.js
var _baseProperty = __webpack_require__(54193);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_asciiSize.js


/**
 * Gets the size of an ASCII `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
var asciiSize = (0,_baseProperty/* default */.Z)('length');

/* harmony default export */ const _asciiSize = (asciiSize);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_hasUnicode.js
/** Used to compose unicode character classes. */
var rsAstralRange = '\\ud800-\\udfff',
    rsComboMarksRange = '\\u0300-\\u036f',
    reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    rsComboSymbolsRange = '\\u20d0-\\u20ff',
    rsComboRange = rsComboMarksRange + reComboHalfMarksRange + rsComboSymbolsRange,
    rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsZWJ = '\\u200d';

/** Used to detect strings with [zero-width joiners or code points from the astral planes](http://eev.ee/blog/2015/09/12/dark-corners-of-unicode/). */
var reHasUnicode = RegExp('[' + rsZWJ + rsAstralRange  + rsComboRange + rsVarRange + ']');

/**
 * Checks if `string` contains Unicode symbols.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {boolean} Returns `true` if a symbol is found, else `false`.
 */
function hasUnicode(string) {
  return reHasUnicode.test(string);
}

/* harmony default export */ const _hasUnicode = (hasUnicode);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_unicodeSize.js
/** Used to compose unicode character classes. */
var _unicodeSize_rsAstralRange = '\\ud800-\\udfff',
    _unicodeSize_rsComboMarksRange = '\\u0300-\\u036f',
    _unicodeSize_reComboHalfMarksRange = '\\ufe20-\\ufe2f',
    _unicodeSize_rsComboSymbolsRange = '\\u20d0-\\u20ff',
    _unicodeSize_rsComboRange = _unicodeSize_rsComboMarksRange + _unicodeSize_reComboHalfMarksRange + _unicodeSize_rsComboSymbolsRange,
    _unicodeSize_rsVarRange = '\\ufe0e\\ufe0f';

/** Used to compose unicode capture groups. */
var rsAstral = '[' + _unicodeSize_rsAstralRange + ']',
    rsCombo = '[' + _unicodeSize_rsComboRange + ']',
    rsFitz = '\\ud83c[\\udffb-\\udfff]',
    rsModifier = '(?:' + rsCombo + '|' + rsFitz + ')',
    rsNonAstral = '[^' + _unicodeSize_rsAstralRange + ']',
    rsRegional = '(?:\\ud83c[\\udde6-\\uddff]){2}',
    rsSurrPair = '[\\ud800-\\udbff][\\udc00-\\udfff]',
    _unicodeSize_rsZWJ = '\\u200d';

/** Used to compose unicode regexes. */
var reOptMod = rsModifier + '?',
    rsOptVar = '[' + _unicodeSize_rsVarRange + ']?',
    rsOptJoin = '(?:' + _unicodeSize_rsZWJ + '(?:' + [rsNonAstral, rsRegional, rsSurrPair].join('|') + ')' + rsOptVar + reOptMod + ')*',
    rsSeq = rsOptVar + reOptMod + rsOptJoin,
    rsSymbol = '(?:' + [rsNonAstral + rsCombo + '?', rsCombo, rsRegional, rsSurrPair, rsAstral].join('|') + ')';

/** Used to match [string symbols](https://mathiasbynens.be/notes/javascript-unicode). */
var reUnicode = RegExp(rsFitz + '(?=' + rsFitz + ')|' + rsSymbol + rsSeq, 'g');

/**
 * Gets the size of a Unicode `string`.
 *
 * @private
 * @param {string} string The string inspect.
 * @returns {number} Returns the string size.
 */
function unicodeSize(string) {
  var result = reUnicode.lastIndex = 0;
  while (reUnicode.test(string)) {
    ++result;
  }
  return result;
}

/* harmony default export */ const _unicodeSize = (unicodeSize);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_stringSize.js




/**
 * Gets the number of symbols in `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the string size.
 */
function stringSize(string) {
  return _hasUnicode(string)
    ? _unicodeSize(string)
    : _asciiSize(string);
}

/* harmony default export */ const _stringSize = (stringSize);

;// CONCATENATED MODULE: ./node_modules/lodash-es/size.js






/** `Object#toString` result references. */
var mapTag = '[object Map]',
    setTag = '[object Set]';

/**
 * Gets the size of `collection` by returning its length for array-like
 * values or the number of own enumerable string keyed properties for objects.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object|string} collection The collection to inspect.
 * @returns {number} Returns the collection size.
 * @example
 *
 * _.size([1, 2, 3]);
 * // => 3
 *
 * _.size({ 'a': 1, 'b': 2 });
 * // => 2
 *
 * _.size('pebbles');
 * // => 7
 */
function size(collection) {
  if (collection == null) {
    return 0;
  }
  if ((0,isArrayLike/* default */.Z)(collection)) {
    return lodash_es_isString(collection) ? _stringSize(collection) : collection.length;
  }
  var tag = (0,_getTag/* default */.Z)(collection);
  if (tag == mapTag || tag == setTag) {
    return collection.size;
  }
  return (0,_baseKeys/* default */.Z)(collection).length;
}

/* harmony default export */ const lodash_es_size = (size);

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/topsort.js




topsort_topsort.CycleException = topsort_CycleException;

function topsort_topsort(g) {
  var visited = {};
  var stack = {};
  var results = [];

  function visit(node) {
    if (Object.prototype.hasOwnProperty.call(stack, node)) {
      throw new topsort_CycleException();
    }

    if (!Object.prototype.hasOwnProperty.call(visited, node)) {
      stack[node] = true;
      visited[node] = true;
      forEach/* default */.Z(g.predecessors(node), visit);
      delete stack[node];
      results.push(node);
    }
  }

  forEach/* default */.Z(g.sinks(), visit);

  if (lodash_es_size(visited) !== g.nodeCount()) {
    throw new topsort_CycleException();
  }

  return results;
}

function topsort_CycleException() {}
topsort_CycleException.prototype = new Error(); // must be an instance of Error to pass testing

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/is-acyclic.js




function isAcyclic(g) {
  try {
    topsort(g);
  } catch (e) {
    if (e instanceof CycleException) {
      return false;
    }
    throw e;
  }
  return true;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/dfs.js




/*
 * A helper that preforms a pre- or post-order traversal on the input graph
 * and returns the nodes in the order they were visited. If the graph is
 * undirected then this algorithm will navigate using neighbors. If the graph
 * is directed then this algorithm will navigate using successors.
 *
 * Order must be one of "pre" or "post".
 */
function dfs(g, vs, order) {
  if (!isArray/* default */.Z(vs)) {
    vs = [vs];
  }

  var navigation = (g.isDirected() ? g.successors : g.neighbors).bind(g);

  var acc = [];
  var visited = {};
  forEach/* default */.Z(vs, function (v) {
    if (!g.hasNode(v)) {
      throw new Error('Graph does not have node: ' + v);
    }

    doDfs(g, v, order === 'post', visited, navigation, acc);
  });
  return acc;
}

function doDfs(g, v, postorder, visited, navigation, acc) {
  if (!Object.prototype.hasOwnProperty.call(visited, v)) {
    visited[v] = true;

    if (!postorder) {
      acc.push(v);
    }
    forEach/* default */.Z(navigation(v), function (w) {
      doDfs(g, w, postorder, visited, navigation, acc);
    });
    if (postorder) {
      acc.push(v);
    }
  }
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/postorder.js




function postorder(g, vs) {
  return dfs(g, vs, 'post');
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/preorder.js




function preorder(g, vs) {
  return dfs(g, vs, 'pre');
}

// EXTERNAL MODULE: ./node_modules/dagre-d3-es/src/graphlib/graph.js + 9 modules
var graph = __webpack_require__(52544);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/prim.js






function prim(g, weightFunc) {
  var result = new Graph();
  var parents = {};
  var pq = new PriorityQueue();
  var v;

  function updateNeighbors(edge) {
    var w = edge.v === v ? edge.w : edge.v;
    var pri = pq.priority(w);
    if (pri !== undefined) {
      var edgeWeight = weightFunc(edge);
      if (edgeWeight < pri) {
        parents[w] = v;
        pq.decrease(w, edgeWeight);
      }
    }
  }

  if (g.nodeCount() === 0) {
    return result;
  }

  _.each(g.nodes(), function (v) {
    pq.add(v, Number.POSITIVE_INFINITY);
    result.setNode(v);
  });

  // Start from an arbitrary node
  pq.decrease(g.nodes()[0], 0);

  var init = false;
  while (pq.size() > 0) {
    v = pq.removeMin();
    if (Object.prototype.hasOwnProperty.call(parents, v)) {
      result.setEdge(v, parents[v]);
    } else if (init) {
      throw new Error('Input graph is not connected: ' + g);
    } else {
      init = true;
    }

    g.nodeEdges(v).forEach(updateNeighbors);
  }

  return result;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/alg/index.js














;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/rank/network-simplex.js








// Expose some internals for testing purposes
networkSimplex.initLowLimValues = initLowLimValues;
networkSimplex.initCutValues = initCutValues;
networkSimplex.calcCutValue = calcCutValue;
networkSimplex.leaveEdge = leaveEdge;
networkSimplex.enterEdge = enterEdge;
networkSimplex.exchangeEdges = exchangeEdges;

/*
 * The network simplex algorithm assigns ranks to each node in the input graph
 * and iteratively improves the ranking to reduce the length of edges.
 *
 * Preconditions:
 *
 *    1. The input graph must be a DAG.
 *    2. All nodes in the graph must have an object value.
 *    3. All edges in the graph must have "minlen" and "weight" attributes.
 *
 * Postconditions:
 *
 *    1. All nodes in the graph will have an assigned "rank" attribute that has
 *       been optimized by the network simplex algorithm. Ranks start at 0.
 *
 *
 * A rough sketch of the algorithm is as follows:
 *
 *    1. Assign initial ranks to each node. We use the longest path algorithm,
 *       which assigns ranks to the lowest position possible. In general this
 *       leads to very wide bottom ranks and unnecessarily long edges.
 *    2. Construct a feasible tight tree. A tight tree is one such that all
 *       edges in the tree have no slack (difference between length of edge
 *       and minlen for the edge). This by itself greatly improves the assigned
 *       rankings by shorting edges.
 *    3. Iteratively find edges that have negative cut values. Generally a
 *       negative cut value indicates that the edge could be removed and a new
 *       tree edge could be added to produce a more compact graph.
 *
 * Much of the algorithms here are derived from Gansner, et al., "A Technique
 * for Drawing Directed Graphs." The structure of the file roughly follows the
 * structure of the overall algorithm.
 */
function networkSimplex(g) {
  g = simplify(g);
  longestPath(g);
  var t = feasibleTree(g);
  initLowLimValues(t);
  initCutValues(t, g);

  var e, f;
  while ((e = leaveEdge(t))) {
    f = enterEdge(t, g, e);
    exchangeEdges(t, g, e, f);
  }
}

/*
 * Initializes cut values for all edges in the tree.
 */
function initCutValues(t, g) {
  var vs = postorder(t, t.nodes());
  vs = vs.slice(0, vs.length - 1);
  forEach/* default */.Z(vs, function (v) {
    assignCutValue(t, g, v);
  });
}

function assignCutValue(t, g, child) {
  var childLab = t.node(child);
  var parent = childLab.parent;
  t.edge(child, parent).cutvalue = calcCutValue(t, g, child);
}

/*
 * Given the tight tree, its graph, and a child in the graph calculate and
 * return the cut value for the edge between the child and its parent.
 */
function calcCutValue(t, g, child) {
  var childLab = t.node(child);
  var parent = childLab.parent;
  // True if the child is on the tail end of the edge in the directed graph
  var childIsTail = true;
  // The graph's view of the tree edge we're inspecting
  var graphEdge = g.edge(child, parent);
  // The accumulated cut value for the edge between this node and its parent
  var cutValue = 0;

  if (!graphEdge) {
    childIsTail = false;
    graphEdge = g.edge(parent, child);
  }

  cutValue = graphEdge.weight;

  forEach/* default */.Z(g.nodeEdges(child), function (e) {
    var isOutEdge = e.v === child,
      other = isOutEdge ? e.w : e.v;

    if (other !== parent) {
      var pointsToHead = isOutEdge === childIsTail,
        otherWeight = g.edge(e).weight;

      cutValue += pointsToHead ? otherWeight : -otherWeight;
      if (isTreeEdge(t, child, other)) {
        var otherCutValue = t.edge(child, other).cutvalue;
        cutValue += pointsToHead ? -otherCutValue : otherCutValue;
      }
    }
  });

  return cutValue;
}

function initLowLimValues(tree, root) {
  if (arguments.length < 2) {
    root = tree.nodes()[0];
  }
  dfsAssignLowLim(tree, {}, 1, root);
}

function dfsAssignLowLim(tree, visited, nextLim, v, parent) {
  var low = nextLim;
  var label = tree.node(v);

  visited[v] = true;
  forEach/* default */.Z(tree.neighbors(v), function (w) {
    if (!Object.prototype.hasOwnProperty.call(visited, w)) {
      nextLim = dfsAssignLowLim(tree, visited, nextLim, w, v);
    }
  });

  label.low = low;
  label.lim = nextLim++;
  if (parent) {
    label.parent = parent;
  } else {
    // TODO should be able to remove this when we incrementally update low lim
    delete label.parent;
  }

  return nextLim;
}

function leaveEdge(tree) {
  return lodash_es_find(tree.edges(), function (e) {
    return tree.edge(e).cutvalue < 0;
  });
}

function enterEdge(t, g, edge) {
  var v = edge.v;
  var w = edge.w;

  // For the rest of this function we assume that v is the tail and w is the
  // head, so if we don't have this edge in the graph we should flip it to
  // match the correct orientation.
  if (!g.hasEdge(v, w)) {
    v = edge.w;
    w = edge.v;
  }

  var vLabel = t.node(v);
  var wLabel = t.node(w);
  var tailLabel = vLabel;
  var flip = false;

  // If the root is in the tail of the edge then we need to flip the logic that
  // checks for the head and tail nodes in the candidates function below.
  if (vLabel.lim > wLabel.lim) {
    tailLabel = wLabel;
    flip = true;
  }

  var candidates = filter/* default */.Z(g.edges(), function (edge) {
    return (
      flip === isDescendant(t, t.node(edge.v), tailLabel) &&
      flip !== isDescendant(t, t.node(edge.w), tailLabel)
    );
  });

  return lodash_es_minBy(candidates, function (edge) {
    return slack(g, edge);
  });
}

function exchangeEdges(t, g, e, f) {
  var v = e.v;
  var w = e.w;
  t.removeEdge(v, w);
  t.setEdge(f.v, f.w, {});
  initLowLimValues(t);
  initCutValues(t, g);
  updateRanks(t, g);
}

function updateRanks(t, g) {
  var root = lodash_es_find(t.nodes(), function (v) {
    return !g.node(v).parent;
  });
  var vs = preorder(t, root);
  vs = vs.slice(1);
  forEach/* default */.Z(vs, function (v) {
    var parent = t.node(v).parent,
      edge = g.edge(v, parent),
      flipped = false;

    if (!edge) {
      edge = g.edge(parent, v);
      flipped = true;
    }

    g.node(v).rank = g.node(parent).rank + (flipped ? edge.minlen : -edge.minlen);
  });
}

/*
 * Returns true if the edge is in the tree.
 */
function isTreeEdge(tree, u, v) {
  return tree.hasEdge(u, v);
}

/*
 * Returns true if the specified node is descendant of the root node per the
 * assigned low and lim attributes in the tree.
 */
function isDescendant(tree, vLabel, rootLabel) {
  return rootLabel.low <= vLabel.lim && vLabel.lim <= rootLabel.lim;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/rank/index.js






/*
 * Assigns a rank to each node in the input graph that respects the "minlen"
 * constraint specified on edges between nodes.
 *
 * This basic structure is derived from Gansner, et al., "A Technique for
 * Drawing Directed Graphs."
 *
 * Pre-conditions:
 *
 *    1. Graph must be a connected DAG
 *    2. Graph nodes must be objects
 *    3. Graph edges must have "weight" and "minlen" attributes
 *
 * Post-conditions:
 *
 *    1. Graph nodes will have a "rank" attribute based on the results of the
 *       algorithm. Ranks can start at any index (including negative), we'll
 *       fix them up later.
 */
function rank(g) {
  switch (g.graph().ranker) {
    case 'network-simplex':
      networkSimplexRanker(g);
      break;
    case 'tight-tree':
      tightTreeRanker(g);
      break;
    case 'longest-path':
      longestPathRanker(g);
      break;
    default:
      networkSimplexRanker(g);
  }
}

// A fast and simple ranker, but results are far from optimal.
var longestPathRanker = longestPath;

function tightTreeRanker(g) {
  longestPath(g);
  feasibleTree(g);
}

function networkSimplexRanker(g) {
  networkSimplex(g);
}

// EXTERNAL MODULE: ./node_modules/lodash-es/values.js + 1 modules
var values = __webpack_require__(34148);
// EXTERNAL MODULE: ./node_modules/lodash-es/reduce.js + 2 modules
var reduce = __webpack_require__(92344);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/nesting-graph.js





/*
 * A nesting graph creates dummy nodes for the tops and bottoms of subgraphs,
 * adds appropriate edges to ensure that all cluster nodes are placed between
 * these boundries, and ensures that the graph is connected.
 *
 * In addition we ensure, through the use of the minlen property, that nodes
 * and subgraph border nodes to not end up on the same rank.
 *
 * Preconditions:
 *
 *    1. Input graph is a DAG
 *    2. Nodes in the input graph has a minlen attribute
 *
 * Postconditions:
 *
 *    1. Input graph is connected.
 *    2. Dummy nodes are added for the tops and bottoms of subgraphs.
 *    3. The minlen attribute for nodes is adjusted to ensure nodes do not
 *       get placed on the same rank as subgraph border nodes.
 *
 * The nesting graph idea comes from Sander, "Layout of Compound Directed
 * Graphs."
 */
function nesting_graph_run(g) {
  var root = addDummyNode(g, 'root', {}, '_root');
  var depths = treeDepths(g);
  var height = lodash_es_max(values/* default */.Z(depths)) - 1; // Note: depths is an Object not an array
  var nodeSep = 2 * height + 1;

  g.graph().nestingRoot = root;

  // Multiply minlen by nodeSep to align nodes on non-border ranks.
  forEach/* default */.Z(g.edges(), function (e) {
    g.edge(e).minlen *= nodeSep;
  });

  // Calculate a weight that is sufficient to keep subgraphs vertically compact
  var weight = sumWeights(g) + 1;

  // Create border nodes and link them up
  forEach/* default */.Z(g.children(), function (child) {
    nesting_graph_dfs(g, root, nodeSep, weight, height, depths, child);
  });

  // Save the multiplier for node layers for later removal of empty border
  // layers.
  g.graph().nodeRankFactor = nodeSep;
}

function nesting_graph_dfs(g, root, nodeSep, weight, height, depths, v) {
  var children = g.children(v);
  if (!children.length) {
    if (v !== root) {
      g.setEdge(root, v, { weight: 0, minlen: nodeSep });
    }
    return;
  }

  var top = addBorderNode(g, '_bt');
  var bottom = addBorderNode(g, '_bb');
  var label = g.node(v);

  g.setParent(top, v);
  label.borderTop = top;
  g.setParent(bottom, v);
  label.borderBottom = bottom;

  forEach/* default */.Z(children, function (child) {
    nesting_graph_dfs(g, root, nodeSep, weight, height, depths, child);

    var childNode = g.node(child);
    var childTop = childNode.borderTop ? childNode.borderTop : child;
    var childBottom = childNode.borderBottom ? childNode.borderBottom : child;
    var thisWeight = childNode.borderTop ? weight : 2 * weight;
    var minlen = childTop !== childBottom ? 1 : height - depths[v] + 1;

    g.setEdge(top, childTop, {
      weight: thisWeight,
      minlen: minlen,
      nestingEdge: true,
    });

    g.setEdge(childBottom, bottom, {
      weight: thisWeight,
      minlen: minlen,
      nestingEdge: true,
    });
  });

  if (!g.parent(v)) {
    g.setEdge(root, top, { weight: 0, minlen: height + depths[v] });
  }
}

function treeDepths(g) {
  var depths = {};
  function dfs(v, depth) {
    var children = g.children(v);
    if (children && children.length) {
      forEach/* default */.Z(children, function (child) {
        dfs(child, depth + 1);
      });
    }
    depths[v] = depth;
  }
  forEach/* default */.Z(g.children(), function (v) {
    dfs(v, 1);
  });
  return depths;
}

function sumWeights(g) {
  return reduce/* default */.Z(
    g.edges(),
    function (acc, e) {
      return acc + g.edge(e).weight;
    },
    0,
  );
}

function cleanup(g) {
  var graphLabel = g.graph();
  g.removeNode(graphLabel.nestingRoot);
  delete graphLabel.nestingRoot;
  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    if (edge.nestingEdge) {
      g.removeEdge(e);
    }
  });
}

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseClone.js + 15 modules
var _baseClone = __webpack_require__(48451);
;// CONCATENATED MODULE: ./node_modules/lodash-es/cloneDeep.js


/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_SYMBOLS_FLAG = 4;

/**
 * This method is like `_.clone` except that it recursively clones `value`.
 *
 * @static
 * @memberOf _
 * @since 1.0.0
 * @category Lang
 * @param {*} value The value to recursively clone.
 * @returns {*} Returns the deep cloned value.
 * @see _.clone
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var deep = _.cloneDeep(objects);
 * console.log(deep[0] === objects[0]);
 * // => false
 */
function cloneDeep(value) {
  return (0,_baseClone/* default */.Z)(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
}

/* harmony default export */ const lodash_es_cloneDeep = (cloneDeep);

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/add-subgraph-constraints.js




function addSubgraphConstraints(g, cg, vs) {
  var prev = {},
    rootPrev;

  forEach/* default */.Z(vs, function (v) {
    var child = g.parent(v),
      parent,
      prevChild;
    while (child) {
      parent = g.parent(child);
      if (parent) {
        prevChild = prev[parent];
        prev[parent] = child;
      } else {
        prevChild = rootPrev;
        rootPrev = child;
      }
      if (prevChild && prevChild !== child) {
        cg.setEdge(prevChild, child);
        return;
      }
      child = parent;
    }
  });

  /*
  function dfs(v) {
    var children = v ? g.children(v) : g.children();
    if (children.length) {
      var min = Number.POSITIVE_INFINITY,
          subgraphs = [];
      _.each(children, function(child) {
        var childMin = dfs(child);
        if (g.children(child).length) {
          subgraphs.push({ v: child, order: childMin });
        }
        min = Math.min(min, childMin);
      });
      _.reduce(_.sortBy(subgraphs, "order"), function(prev, curr) {
        cg.setEdge(prev.v, curr.v);
        return curr;
      });
      return min;
    }
    return g.node(v).order;
  }
  dfs(undefined);
  */
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/build-layer-graph.js





/*
 * Constructs a graph that can be used to sort a layer of nodes. The graph will
 * contain all base and subgraph nodes from the request layer in their original
 * hierarchy and any edges that are incident on these nodes and are of the type
 * requested by the "relationship" parameter.
 *
 * Nodes from the requested rank that do not have parents are assigned a root
 * node in the output graph, which is set in the root graph attribute. This
 * makes it easy to walk the hierarchy of movable nodes during ordering.
 *
 * Pre-conditions:
 *
 *    1. Input graph is a DAG
 *    2. Base nodes in the input graph have a rank attribute
 *    3. Subgraph nodes in the input graph has minRank and maxRank attributes
 *    4. Edges have an assigned weight
 *
 * Post-conditions:
 *
 *    1. Output graph has all nodes in the movable rank with preserved
 *       hierarchy.
 *    2. Root nodes in the movable layer are made children of the node
 *       indicated by the root attribute of the graph.
 *    3. Non-movable nodes incident on movable nodes, selected by the
 *       relationship parameter, are included in the graph (without hierarchy).
 *    4. Edges incident on movable nodes, selected by the relationship
 *       parameter, are added to the output graph.
 *    5. The weights for copied edges are aggregated as need, since the output
 *       graph is not a multi-graph.
 */
function buildLayerGraph(g, rank, relationship) {
  var root = createRootNode(g),
    result = new graphlib/* Graph */.k({ compound: true })
      .setGraph({ root: root })
      .setDefaultNodeLabel(function (v) {
        return g.node(v);
      });

  forEach/* default */.Z(g.nodes(), function (v) {
    var node = g.node(v),
      parent = g.parent(v);

    if (node.rank === rank || (node.minRank <= rank && rank <= node.maxRank)) {
      result.setNode(v);
      result.setParent(v, parent || root);

      // This assumes we have only short edges!
      forEach/* default */.Z(g[relationship](v), function (e) {
        var u = e.v === v ? e.w : e.v,
          edge = result.edge(u, v),
          weight = !isUndefined/* default */.Z(edge) ? edge.weight : 0;
        result.setEdge(u, v, { weight: g.edge(e).weight + weight });
      });

      if (Object.prototype.hasOwnProperty.call(node, 'minRank')) {
        result.setNode(v, {
          borderLeft: node.borderLeft[rank],
          borderRight: node.borderRight[rank],
        });
      }
    }
  });

  return result;
}

function createRootNode(g) {
  var v;
  while (g.hasNode((v = uniqueId/* default */.Z('_root'))));
  return v;
}

// EXTERNAL MODULE: ./node_modules/lodash-es/_assignValue.js
var _assignValue = __webpack_require__(72954);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseZipObject.js
/**
 * This base implementation of `_.zipObject` which assigns values using `assignFunc`.
 *
 * @private
 * @param {Array} props The property identifiers.
 * @param {Array} values The property values.
 * @param {Function} assignFunc The function to assign values.
 * @returns {Object} Returns the new object.
 */
function baseZipObject(props, values, assignFunc) {
  var index = -1,
      length = props.length,
      valsLength = values.length,
      result = {};

  while (++index < length) {
    var value = index < valsLength ? values[index] : undefined;
    assignFunc(result, props[index], value);
  }
  return result;
}

/* harmony default export */ const _baseZipObject = (baseZipObject);

;// CONCATENATED MODULE: ./node_modules/lodash-es/zipObject.js



/**
 * This method is like `_.fromPairs` except that it accepts two arrays,
 * one of property identifiers and one of corresponding values.
 *
 * @static
 * @memberOf _
 * @since 0.4.0
 * @category Array
 * @param {Array} [props=[]] The property identifiers.
 * @param {Array} [values=[]] The property values.
 * @returns {Object} Returns the new object.
 * @example
 *
 * _.zipObject(['a', 'b'], [1, 2]);
 * // => { 'a': 1, 'b': 2 }
 */
function zipObject(props, values) {
  return _baseZipObject(props || [], values || [], _assignValue/* default */.Z);
}

/* harmony default export */ const lodash_es_zipObject = (zipObject);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseFlatten.js + 1 modules
var _baseFlatten = __webpack_require__(10626);
// EXTERNAL MODULE: ./node_modules/lodash-es/_arrayMap.js
var _arrayMap = __webpack_require__(74073);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseGet.js
var _baseGet = __webpack_require__(13317);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseMap.js
var _baseMap = __webpack_require__(21018);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseSortBy.js
/**
 * The base implementation of `_.sortBy` which uses `comparer` to define the
 * sort order of `array` and replaces criteria objects with their corresponding
 * values.
 *
 * @private
 * @param {Array} array The array to sort.
 * @param {Function} comparer The function to define sort order.
 * @returns {Array} Returns `array`.
 */
function baseSortBy(array, comparer) {
  var length = array.length;

  array.sort(comparer);
  while (length--) {
    array[length] = array[length].value;
  }
  return array;
}

/* harmony default export */ const _baseSortBy = (baseSortBy);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseUnary.js
var _baseUnary = __webpack_require__(21162);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_compareAscending.js


/**
 * Compares values to sort them in ascending order.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {number} Returns the sort order indicator for `value`.
 */
function compareAscending(value, other) {
  if (value !== other) {
    var valIsDefined = value !== undefined,
        valIsNull = value === null,
        valIsReflexive = value === value,
        valIsSymbol = (0,isSymbol/* default */.Z)(value);

    var othIsDefined = other !== undefined,
        othIsNull = other === null,
        othIsReflexive = other === other,
        othIsSymbol = (0,isSymbol/* default */.Z)(other);

    if ((!othIsNull && !othIsSymbol && !valIsSymbol && value > other) ||
        (valIsSymbol && othIsDefined && othIsReflexive && !othIsNull && !othIsSymbol) ||
        (valIsNull && othIsDefined && othIsReflexive) ||
        (!valIsDefined && othIsReflexive) ||
        !valIsReflexive) {
      return 1;
    }
    if ((!valIsNull && !valIsSymbol && !othIsSymbol && value < other) ||
        (othIsSymbol && valIsDefined && valIsReflexive && !valIsNull && !valIsSymbol) ||
        (othIsNull && valIsDefined && valIsReflexive) ||
        (!othIsDefined && valIsReflexive) ||
        !othIsReflexive) {
      return -1;
    }
  }
  return 0;
}

/* harmony default export */ const _compareAscending = (compareAscending);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_compareMultiple.js


/**
 * Used by `_.orderBy` to compare multiple properties of a value to another
 * and stable sort them.
 *
 * If `orders` is unspecified, all values are sorted in ascending order. Otherwise,
 * specify an order of "desc" for descending or "asc" for ascending sort order
 * of corresponding values.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {boolean[]|string[]} orders The order to sort by for each property.
 * @returns {number} Returns the sort order indicator for `object`.
 */
function compareMultiple(object, other, orders) {
  var index = -1,
      objCriteria = object.criteria,
      othCriteria = other.criteria,
      length = objCriteria.length,
      ordersLength = orders.length;

  while (++index < length) {
    var result = _compareAscending(objCriteria[index], othCriteria[index]);
    if (result) {
      if (index >= ordersLength) {
        return result;
      }
      var order = orders[index];
      return result * (order == 'desc' ? -1 : 1);
    }
  }
  // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
  // that causes it, under certain circumstances, to provide the same value for
  // `object` and `other`. See https://github.com/jashkenas/underscore/pull/1247
  // for more details.
  //
  // This also ensures a stable sort in V8 and other engines.
  // See https://bugs.chromium.org/p/v8/issues/detail?id=90 for more details.
  return object.index - other.index;
}

/* harmony default export */ const _compareMultiple = (compareMultiple);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseOrderBy.js










/**
 * The base implementation of `_.orderBy` without param guards.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function[]|Object[]|string[]} iteratees The iteratees to sort by.
 * @param {string[]} orders The sort orders of `iteratees`.
 * @returns {Array} Returns the new sorted array.
 */
function baseOrderBy(collection, iteratees, orders) {
  if (iteratees.length) {
    iteratees = (0,_arrayMap/* default */.Z)(iteratees, function(iteratee) {
      if ((0,isArray/* default */.Z)(iteratee)) {
        return function(value) {
          return (0,_baseGet/* default */.Z)(value, iteratee.length === 1 ? iteratee[0] : iteratee);
        }
      }
      return iteratee;
    });
  } else {
    iteratees = [identity/* default */.Z];
  }

  var index = -1;
  iteratees = (0,_arrayMap/* default */.Z)(iteratees, (0,_baseUnary/* default */.Z)(_baseIteratee/* default */.Z));

  var result = (0,_baseMap/* default */.Z)(collection, function(value, key, collection) {
    var criteria = (0,_arrayMap/* default */.Z)(iteratees, function(iteratee) {
      return iteratee(value);
    });
    return { 'criteria': criteria, 'index': ++index, 'value': value };
  });

  return _baseSortBy(result, function(object, other) {
    return _compareMultiple(object, other, orders);
  });
}

/* harmony default export */ const _baseOrderBy = (baseOrderBy);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseRest.js
var _baseRest = __webpack_require__(69581);
// EXTERNAL MODULE: ./node_modules/lodash-es/_isIterateeCall.js
var _isIterateeCall = __webpack_require__(50439);
;// CONCATENATED MODULE: ./node_modules/lodash-es/sortBy.js





/**
 * Creates an array of elements, sorted in ascending order by the results of
 * running each element in a collection thru each iteratee. This method
 * performs a stable sort, that is, it preserves the original sort order of
 * equal elements. The iteratees are invoked with one argument: (value).
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {...(Function|Function[])} [iteratees=[_.identity]]
 *  The iteratees to sort by.
 * @returns {Array} Returns the new sorted array.
 * @example
 *
 * var users = [
 *   { 'user': 'fred',   'age': 48 },
 *   { 'user': 'barney', 'age': 36 },
 *   { 'user': 'fred',   'age': 30 },
 *   { 'user': 'barney', 'age': 34 }
 * ];
 *
 * _.sortBy(users, [function(o) { return o.user; }]);
 * // => objects for [['barney', 36], ['barney', 34], ['fred', 48], ['fred', 30]]
 *
 * _.sortBy(users, ['user', 'age']);
 * // => objects for [['barney', 34], ['barney', 36], ['fred', 30], ['fred', 48]]
 */
var sortBy = (0,_baseRest/* default */.Z)(function(collection, iteratees) {
  if (collection == null) {
    return [];
  }
  var length = iteratees.length;
  if (length > 1 && (0,_isIterateeCall/* default */.Z)(collection, iteratees[0], iteratees[1])) {
    iteratees = [];
  } else if (length > 2 && (0,_isIterateeCall/* default */.Z)(iteratees[0], iteratees[1], iteratees[2])) {
    iteratees = [iteratees[0]];
  }
  return _baseOrderBy(collection, (0,_baseFlatten/* default */.Z)(iteratees, 1), []);
});

/* harmony default export */ const lodash_es_sortBy = (sortBy);

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/cross-count.js




/*
 * A function that takes a layering (an array of layers, each with an array of
 * ordererd nodes) and a graph and returns a weighted crossing count.
 *
 * Pre-conditions:
 *
 *    1. Input graph must be simple (not a multigraph), directed, and include
 *       only simple edges.
 *    2. Edges in the input graph must have assigned weights.
 *
 * Post-conditions:
 *
 *    1. The graph and layering matrix are left unchanged.
 *
 * This algorithm is derived from Barth, et al., "Bilayer Cross Counting."
 */
function crossCount(g, layering) {
  var cc = 0;
  for (var i = 1; i < layering.length; ++i) {
    cc += twoLayerCrossCount(g, layering[i - 1], layering[i]);
  }
  return cc;
}

function twoLayerCrossCount(g, northLayer, southLayer) {
  // Sort all of the edges between the north and south layers by their position
  // in the north layer and then the south. Map these edges to the position of
  // their head in the south layer.
  var southPos = lodash_es_zipObject(
    southLayer,
    map/* default */.Z(southLayer, function (v, i) {
      return i;
    }),
  );
  var southEntries = flatten/* default */.Z(
    map/* default */.Z(northLayer, function (v) {
      return lodash_es_sortBy(
        map/* default */.Z(g.outEdges(v), function (e) {
          return { pos: southPos[e.w], weight: g.edge(e).weight };
        }),
        'pos',
      );
    }),
  );

  // Build the accumulator tree
  var firstIndex = 1;
  while (firstIndex < southLayer.length) firstIndex <<= 1;
  var treeSize = 2 * firstIndex - 1;
  firstIndex -= 1;
  var tree = map/* default */.Z(new Array(treeSize), function () {
    return 0;
  });

  // Calculate the weighted crossings
  var cc = 0;
  forEach/* default */.Z(
    // @ts-expect-error
    southEntries.forEach(function (entry) {
      var index = entry.pos + firstIndex;
      tree[index] += entry.weight;
      var weightSum = 0;
      while (index > 0) {
        if (index % 2) {
          weightSum += tree[index + 1];
        }
        index = (index - 1) >> 1;
        tree[index] += entry.weight;
      }
      cc += entry.weight * weightSum;
    }),
  );

  return cc;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/init-order.js


/*
 * Assigns an initial order value for each node by performing a DFS search
 * starting from nodes in the first rank. Nodes are assigned an order in their
 * rank as they are first visited.
 *
 * This approach comes from Gansner, et al., "A Technique for Drawing Directed
 * Graphs."
 *
 * Returns a layering matrix with an array per layer and each layer sorted by
 * the order of its nodes.
 */
function initOrder(g) {
  var visited = {};
  var simpleNodes = filter/* default */.Z(g.nodes(), function (v) {
    return !g.children(v).length;
  });
  var maxRank = lodash_es_max(
    map/* default */.Z(simpleNodes, function (v) {
      return g.node(v).rank;
    }),
  );
  var layers = map/* default */.Z(range/* default */.Z(maxRank + 1), function () {
    return [];
  });

  function dfs(v) {
    if (lodash_es_has(visited, v)) return;
    visited[v] = true;
    var node = g.node(v);
    layers[node.rank].push(v);
    forEach/* default */.Z(g.successors(v), dfs);
  }

  var orderedVs = lodash_es_sortBy(simpleNodes, function (v) {
    return g.node(v).rank;
  });
  forEach/* default */.Z(orderedVs, dfs);

  return layers;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/barycenter.js




function barycenter(g, movable) {
  return map/* default */.Z(movable, function (v) {
    var inV = g.inEdges(v);
    if (!inV.length) {
      return { v: v };
    } else {
      var result = reduce/* default */.Z(
        inV,
        function (acc, e) {
          var edge = g.edge(e),
            nodeU = g.node(e.v);
          return {
            sum: acc.sum + edge.weight * nodeU.order,
            weight: acc.weight + edge.weight,
          };
        },
        { sum: 0, weight: 0 },
      );

      return {
        v: v,
        barycenter: result.sum / result.weight,
        weight: result.weight,
      };
    }
  });
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/resolve-conflicts.js




/*
 * Given a list of entries of the form {v, barycenter, weight} and a
 * constraint graph this function will resolve any conflicts between the
 * constraint graph and the barycenters for the entries. If the barycenters for
 * an entry would violate a constraint in the constraint graph then we coalesce
 * the nodes in the conflict into a new node that respects the contraint and
 * aggregates barycenter and weight information.
 *
 * This implementation is based on the description in Forster, "A Fast and
 * Simple Hueristic for Constrained Two-Level Crossing Reduction," thought it
 * differs in some specific details.
 *
 * Pre-conditions:
 *
 *    1. Each entry has the form {v, barycenter, weight}, or if the node has
 *       no barycenter, then {v}.
 *
 * Returns:
 *
 *    A new list of entries of the form {vs, i, barycenter, weight}. The list
 *    `vs` may either be a singleton or it may be an aggregation of nodes
 *    ordered such that they do not violate constraints from the constraint
 *    graph. The property `i` is the lowest original index of any of the
 *    elements in `vs`.
 */
function resolveConflicts(entries, cg) {
  var mappedEntries = {};
  forEach/* default */.Z(entries, function (entry, i) {
    var tmp = (mappedEntries[entry.v] = {
      indegree: 0,
      in: [],
      out: [],
      vs: [entry.v],
      i: i,
    });
    if (!isUndefined/* default */.Z(entry.barycenter)) {
      // @ts-expect-error
      tmp.barycenter = entry.barycenter;
      // @ts-expect-error
      tmp.weight = entry.weight;
    }
  });

  forEach/* default */.Z(cg.edges(), function (e) {
    var entryV = mappedEntries[e.v];
    var entryW = mappedEntries[e.w];
    if (!isUndefined/* default */.Z(entryV) && !isUndefined/* default */.Z(entryW)) {
      entryW.indegree++;
      entryV.out.push(mappedEntries[e.w]);
    }
  });

  var sourceSet = filter/* default */.Z(mappedEntries, function (entry) {
    // @ts-expect-error
    return !entry.indegree;
  });

  return doResolveConflicts(sourceSet);
}

function doResolveConflicts(sourceSet) {
  var entries = [];

  function handleIn(vEntry) {
    return function (uEntry) {
      if (uEntry.merged) {
        return;
      }
      if (
        isUndefined/* default */.Z(uEntry.barycenter) ||
        isUndefined/* default */.Z(vEntry.barycenter) ||
        uEntry.barycenter >= vEntry.barycenter
      ) {
        mergeEntries(vEntry, uEntry);
      }
    };
  }

  function handleOut(vEntry) {
    return function (wEntry) {
      wEntry['in'].push(vEntry);
      if (--wEntry.indegree === 0) {
        sourceSet.push(wEntry);
      }
    };
  }

  while (sourceSet.length) {
    var entry = sourceSet.pop();
    entries.push(entry);
    forEach/* default */.Z(entry['in'].reverse(), handleIn(entry));
    forEach/* default */.Z(entry.out, handleOut(entry));
  }

  return map/* default */.Z(
    filter/* default */.Z(entries, function (entry) {
      return !entry.merged;
    }),
    function (entry) {
      return pick/* default */.Z(entry, ['vs', 'i', 'barycenter', 'weight']);
    },
  );
}

function mergeEntries(target, source) {
  var sum = 0;
  var weight = 0;

  if (target.weight) {
    sum += target.barycenter * target.weight;
    weight += target.weight;
  }

  if (source.weight) {
    sum += source.barycenter * source.weight;
    weight += source.weight;
  }

  target.vs = source.vs.concat(target.vs);
  target.barycenter = sum / weight;
  target.weight = weight;
  target.i = Math.min(source.i, target.i);
  source.merged = true;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/sort.js





function sort(entries, biasRight) {
  var parts = partition(entries, function (entry) {
    return Object.prototype.hasOwnProperty.call(entry, 'barycenter');
  });
  var sortable = parts.lhs,
    unsortable = lodash_es_sortBy(parts.rhs, function (entry) {
      return -entry.i;
    }),
    vs = [],
    sum = 0,
    weight = 0,
    vsIndex = 0;

  sortable.sort(compareWithBias(!!biasRight));

  vsIndex = consumeUnsortable(vs, unsortable, vsIndex);

  forEach/* default */.Z(sortable, function (entry) {
    vsIndex += entry.vs.length;
    vs.push(entry.vs);
    sum += entry.barycenter * entry.weight;
    weight += entry.weight;
    vsIndex = consumeUnsortable(vs, unsortable, vsIndex);
  });

  var result = { vs: flatten/* default */.Z(vs) };
  if (weight) {
    result.barycenter = sum / weight;
    result.weight = weight;
  }
  return result;
}

function consumeUnsortable(vs, unsortable, index) {
  var last;
  while (unsortable.length && (last = lodash_es_last(unsortable)).i <= index) {
    unsortable.pop();
    vs.push(last.vs);
    index++;
  }
  return index;
}

function compareWithBias(bias) {
  return function (entryV, entryW) {
    if (entryV.barycenter < entryW.barycenter) {
      return -1;
    } else if (entryV.barycenter > entryW.barycenter) {
      return 1;
    }

    return !bias ? entryV.i - entryW.i : entryW.i - entryV.i;
  };
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/sort-subgraph.js







function sortSubgraph(g, v, cg, biasRight) {
  var movable = g.children(v);
  var node = g.node(v);
  var bl = node ? node.borderLeft : undefined;
  var br = node ? node.borderRight : undefined;
  var subgraphs = {};

  if (bl) {
    movable = filter/* default */.Z(movable, function (w) {
      return w !== bl && w !== br;
    });
  }

  var barycenters = barycenter(g, movable);
  forEach/* default */.Z(barycenters, function (entry) {
    if (g.children(entry.v).length) {
      var subgraphResult = sortSubgraph(g, entry.v, cg, biasRight);
      subgraphs[entry.v] = subgraphResult;
      if (Object.prototype.hasOwnProperty.call(subgraphResult, 'barycenter')) {
        mergeBarycenters(entry, subgraphResult);
      }
    }
  });

  var entries = resolveConflicts(barycenters, cg);
  expandSubgraphs(entries, subgraphs);

  var result = sort(entries, biasRight);

  if (bl) {
    result.vs = flatten/* default */.Z([bl, result.vs, br]);
    if (g.predecessors(bl).length) {
      var blPred = g.node(g.predecessors(bl)[0]),
        brPred = g.node(g.predecessors(br)[0]);
      if (!Object.prototype.hasOwnProperty.call(result, 'barycenter')) {
        result.barycenter = 0;
        result.weight = 0;
      }
      result.barycenter =
        (result.barycenter * result.weight + blPred.order + brPred.order) / (result.weight + 2);
      result.weight += 2;
    }
  }

  return result;
}

function expandSubgraphs(entries, subgraphs) {
  forEach/* default */.Z(entries, function (entry) {
    entry.vs = flatten/* default */.Z(
      entry.vs.map(function (v) {
        if (subgraphs[v]) {
          return subgraphs[v].vs;
        }
        return v;
      }),
    );
  });
}

function mergeBarycenters(target, other) {
  if (!isUndefined/* default */.Z(target.barycenter)) {
    target.barycenter =
      (target.barycenter * target.weight + other.barycenter * other.weight) /
      (target.weight + other.weight);
    target.weight += other.weight;
  } else {
    target.barycenter = other.barycenter;
    target.weight = other.weight;
  }
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/order/index.js











/*
 * Applies heuristics to minimize edge crossings in the graph and sets the best
 * order solution as an order attribute on each node.
 *
 * Pre-conditions:
 *
 *    1. Graph must be DAG
 *    2. Graph nodes must be objects with a "rank" attribute
 *    3. Graph edges must have the "weight" attribute
 *
 * Post-conditions:
 *
 *    1. Graph nodes will have an "order" attribute based on the results of the
 *       algorithm.
 */
function order(g) {
  var maxRank = util_maxRank(g),
    downLayerGraphs = buildLayerGraphs(g, range/* default */.Z(1, maxRank + 1), 'inEdges'),
    upLayerGraphs = buildLayerGraphs(g, range/* default */.Z(maxRank - 1, -1, -1), 'outEdges');

  var layering = initOrder(g);
  assignOrder(g, layering);

  var bestCC = Number.POSITIVE_INFINITY,
    best;

  for (var i = 0, lastBest = 0; lastBest < 4; ++i, ++lastBest) {
    sweepLayerGraphs(i % 2 ? downLayerGraphs : upLayerGraphs, i % 4 >= 2);

    layering = buildLayerMatrix(g);
    var cc = crossCount(g, layering);
    if (cc < bestCC) {
      lastBest = 0;
      best = lodash_es_cloneDeep(layering);
      bestCC = cc;
    }
  }

  assignOrder(g, best);
}

function buildLayerGraphs(g, ranks, relationship) {
  return map/* default */.Z(ranks, function (rank) {
    return buildLayerGraph(g, rank, relationship);
  });
}

function sweepLayerGraphs(layerGraphs, biasRight) {
  var cg = new graphlib/* Graph */.k();
  forEach/* default */.Z(layerGraphs, function (lg) {
    var root = lg.graph().root;
    var sorted = sortSubgraph(lg, root, cg, biasRight);
    forEach/* default */.Z(sorted.vs, function (v, i) {
      lg.node(v).order = i;
    });
    addSubgraphConstraints(lg, cg, sorted.vs);
  });
}

function assignOrder(g, layering) {
  forEach/* default */.Z(layering, function (layer) {
    forEach/* default */.Z(layer, function (v, i) {
      g.node(v).order = i;
    });
  });
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/parent-dummy-chains.js




function parentDummyChains(g) {
  var postorderNums = parent_dummy_chains_postorder(g);

  forEach/* default */.Z(g.graph().dummyChains, function (v) {
    var node = g.node(v);
    var edgeObj = node.edgeObj;
    var pathData = findPath(g, postorderNums, edgeObj.v, edgeObj.w);
    var path = pathData.path;
    var lca = pathData.lca;
    var pathIdx = 0;
    var pathV = path[pathIdx];
    var ascending = true;

    while (v !== edgeObj.w) {
      node = g.node(v);

      if (ascending) {
        while ((pathV = path[pathIdx]) !== lca && g.node(pathV).maxRank < node.rank) {
          pathIdx++;
        }

        if (pathV === lca) {
          ascending = false;
        }
      }

      if (!ascending) {
        while (
          pathIdx < path.length - 1 &&
          g.node((pathV = path[pathIdx + 1])).minRank <= node.rank
        ) {
          pathIdx++;
        }
        pathV = path[pathIdx];
      }

      g.setParent(v, pathV);
      v = g.successors(v)[0];
    }
  });
}

// Find a path from v to w through the lowest common ancestor (LCA). Return the
// full path and the LCA.
function findPath(g, postorderNums, v, w) {
  var vPath = [];
  var wPath = [];
  var low = Math.min(postorderNums[v].low, postorderNums[w].low);
  var lim = Math.max(postorderNums[v].lim, postorderNums[w].lim);
  var parent;
  var lca;

  // Traverse up from v to find the LCA
  parent = v;
  do {
    parent = g.parent(parent);
    vPath.push(parent);
  } while (parent && (postorderNums[parent].low > low || lim > postorderNums[parent].lim));
  lca = parent;

  // Traverse from w to LCA
  parent = w;
  while ((parent = g.parent(parent)) !== lca) {
    wPath.push(parent);
  }

  return { path: vPath.concat(wPath.reverse()), lca: lca };
}

function parent_dummy_chains_postorder(g) {
  var result = {};
  var lim = 0;

  function dfs(v) {
    var low = lim;
    forEach/* default */.Z(g.children(v), dfs);
    result[v] = { low: low, lim: lim++ };
  }
  forEach/* default */.Z(g.children(), dfs);

  return result;
}

// EXTERNAL MODULE: ./node_modules/lodash-es/_castFunction.js
var _castFunction = __webpack_require__(68882);
;// CONCATENATED MODULE: ./node_modules/lodash-es/forOwn.js



/**
 * Iterates over own enumerable string keyed properties of an object and
 * invokes `iteratee` for each property. The iteratee is invoked with three
 * arguments: (value, key, object). Iteratee functions may exit iteration
 * early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @since 0.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns `object`.
 * @see _.forOwnRight
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.forOwn(new Foo, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forOwn(object, iteratee) {
  return object && (0,_baseForOwn/* default */.Z)(object, (0,_castFunction/* default */.Z)(iteratee));
}

/* harmony default export */ const lodash_es_forOwn = (forOwn);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseFor.js + 1 modules
var _baseFor = __webpack_require__(61395);
// EXTERNAL MODULE: ./node_modules/lodash-es/keysIn.js + 2 modules
var keysIn = __webpack_require__(32957);
;// CONCATENATED MODULE: ./node_modules/lodash-es/forIn.js




/**
 * Iterates over own and inherited enumerable string keyed properties of an
 * object and invokes `iteratee` for each property. The iteratee is invoked
 * with three arguments: (value, key, object). Iteratee functions may exit
 * iteration early by explicitly returning `false`.
 *
 * @static
 * @memberOf _
 * @since 0.3.0
 * @category Object
 * @param {Object} object The object to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Object} Returns `object`.
 * @see _.forInRight
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.forIn(new Foo, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a', 'b', then 'c' (iteration order is not guaranteed).
 */
function forIn(object, iteratee) {
  return object == null
    ? object
    : (0,_baseFor/* default */.Z)(object, (0,_castFunction/* default */.Z)(iteratee), keysIn/* default */.Z);
}

/* harmony default export */ const lodash_es_forIn = (forIn);

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/position/bk.js




/*
 * This module provides coordinate assignment based on Brandes and Köpf, "Fast
 * and Simple Horizontal Coordinate Assignment."
 */



/*
 * Marks all edges in the graph with a type-1 conflict with the "type1Conflict"
 * property. A type-1 conflict is one where a non-inner segment crosses an
 * inner segment. An inner segment is an edge with both incident nodes marked
 * with the "dummy" property.
 *
 * This algorithm scans layer by layer, starting with the second, for type-1
 * conflicts between the current layer and the previous layer. For each layer
 * it scans the nodes from left to right until it reaches one that is incident
 * on an inner segment. It then scans predecessors to determine if they have
 * edges that cross that inner segment. At the end a final scan is done for all
 * nodes on the current rank to see if they cross the last visited inner
 * segment.
 *
 * This algorithm (safely) assumes that a dummy node will only be incident on a
 * single node in the layers being scanned.
 */
function findType1Conflicts(g, layering) {
  /** @type {{[nodeId: string | number]: {[nodeId: string | number]: true}}} */
  var conflicts = {};

  function visitLayer(prevLayer, layer) {
    var // last visited node in the previous layer that is incident on an inner
      // segment.
      k0 = 0,
      // Tracks the last node in this layer scanned for crossings with a type-1
      // segment.
      scanPos = 0,
      prevLayerLength = prevLayer.length,
      lastNode = lodash_es_last(layer);

    forEach/* default */.Z(layer, function (v, i) {
      var w = findOtherInnerSegmentNode(g, v),
        k1 = w ? g.node(w).order : prevLayerLength;

      if (w || v === lastNode) {
        forEach/* default */.Z(layer.slice(scanPos, i + 1), function (scanNode) {
          forEach/* default */.Z(g.predecessors(scanNode), function (u) {
            var uLabel = g.node(u),
              uPos = uLabel.order;
            if ((uPos < k0 || k1 < uPos) && !(uLabel.dummy && g.node(scanNode).dummy)) {
              addConflict(conflicts, u, scanNode);
            }
          });
        });
        // @ts-expect-error
        scanPos = i + 1;
        k0 = k1;
      }
    });

    return layer;
  }

  reduce/* default */.Z(layering, visitLayer);
  return conflicts;
}

function findType2Conflicts(g, layering) {
  /** @type {{[nodeId: string | number]: {[nodeId: string | number]: true}}} */
  var conflicts = {};

  function scan(south, southPos, southEnd, prevNorthBorder, nextNorthBorder) {
    var v;
    forEach/* default */.Z(range/* default */.Z(southPos, southEnd), function (i) {
      v = south[i];
      if (g.node(v).dummy) {
        forEach/* default */.Z(g.predecessors(v), function (u) {
          var uNode = g.node(u);
          if (uNode.dummy && (uNode.order < prevNorthBorder || uNode.order > nextNorthBorder)) {
            addConflict(conflicts, u, v);
          }
        });
      }
    });
  }

  function visitLayer(north, south) {
    var prevNorthPos = -1,
      nextNorthPos,
      southPos = 0;

    forEach/* default */.Z(south, function (v, southLookahead) {
      if (g.node(v).dummy === 'border') {
        var predecessors = g.predecessors(v);
        if (predecessors.length) {
          nextNorthPos = g.node(predecessors[0]).order;
          scan(south, southPos, southLookahead, prevNorthPos, nextNorthPos);
          // @ts-expect-error
          southPos = southLookahead;
          prevNorthPos = nextNorthPos;
        }
      }
      scan(south, southPos, south.length, nextNorthPos, north.length);
    });

    return south;
  }

  reduce/* default */.Z(layering, visitLayer);
  return conflicts;
}

function findOtherInnerSegmentNode(g, v) {
  if (g.node(v).dummy) {
    return lodash_es_find(g.predecessors(v), function (u) {
      return g.node(u).dummy;
    });
  }
}

/**
 * Sets `conflicts[v][w] = true`, creating objects if needed.
 *
 * @param {{[nodeId: string | number]: {[nodeId: string | number]: true}}} conflicts - Object to set.
 * @param {string | number} v - First Node ID
 * @param {string | number} w - Second Node ID
 */
function addConflict(conflicts, v, w) {
  if (v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }

  if (!Object.prototype.hasOwnProperty.call(conflicts, v)) {
    // can't use conflicts[v] = {} since it's unsafe if v = `__proto__`
    Object.defineProperty(conflicts, v, {
      enumerable: true,
      configurable: true,
      value: {},
      writable: true,
    });
  }
  var conflictsV = conflicts[v];
  Object.defineProperty(conflictsV, w, {
    enumerable: true,
    configurable: true,
    value: true,
    writable: true,
  });
}

function hasConflict(conflicts, v, w) {
  if (v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  return !!conflicts[v] && Object.prototype.hasOwnProperty.call(conflicts[v], w);
}

/*
 * Try to align nodes into vertical "blocks" where possible. This algorithm
 * attempts to align a node with one of its median neighbors. If the edge
 * connecting a neighbor is a type-1 conflict then we ignore that possibility.
 * If a previous node has already formed a block with a node after the node
 * we're trying to form a block with, we also ignore that possibility - our
 * blocks would be split in that scenario.
 */
function verticalAlignment(g, layering, conflicts, neighborFn) {
  var root = {},
    align = {},
    pos = {};

  // We cache the position here based on the layering because the graph and
  // layering may be out of sync. The layering matrix is manipulated to
  // generate different extreme alignments.
  forEach/* default */.Z(layering, function (layer) {
    forEach/* default */.Z(layer, function (v, order) {
      root[v] = v;
      align[v] = v;
      pos[v] = order;
    });
  });

  forEach/* default */.Z(layering, function (layer) {
    var prevIdx = -1;
    forEach/* default */.Z(layer, function (v) {
      var ws = neighborFn(v);
      if (ws.length) {
        ws = lodash_es_sortBy(ws, function (w) {
          return pos[w];
        });
        var mp = (ws.length - 1) / 2;
        for (var i = Math.floor(mp), il = Math.ceil(mp); i <= il; ++i) {
          var w = ws[i];
          if (align[v] === v && prevIdx < pos[w] && !hasConflict(conflicts, v, w)) {
            align[w] = v;
            align[v] = root[v] = root[w];
            prevIdx = pos[w];
          }
        }
      }
    });
  });

  return { root: root, align: align };
}

function horizontalCompaction(g, layering, root, align, reverseSep) {
  // This portion of the algorithm differs from BK due to a number of problems.
  // Instead of their algorithm we construct a new block graph and do two
  // sweeps. The first sweep places blocks with the smallest possible
  // coordinates. The second sweep removes unused space by moving blocks to the
  // greatest coordinates without violating separation.
  var xs = {},
    blockG = buildBlockGraph(g, layering, root, reverseSep),
    borderType = reverseSep ? 'borderLeft' : 'borderRight';

  function iterate(setXsFunc, nextNodesFunc) {
    var stack = blockG.nodes();
    var elem = stack.pop();
    var visited = {};
    while (elem) {
      if (visited[elem]) {
        setXsFunc(elem);
      } else {
        visited[elem] = true;
        stack.push(elem);
        stack = stack.concat(nextNodesFunc(elem));
      }

      elem = stack.pop();
    }
  }

  // First pass, assign smallest coordinates
  function pass1(elem) {
    xs[elem] = blockG.inEdges(elem).reduce(function (acc, e) {
      return Math.max(acc, xs[e.v] + blockG.edge(e));
    }, 0);
  }

  // Second pass, assign greatest coordinates
  function pass2(elem) {
    var min = blockG.outEdges(elem).reduce(function (acc, e) {
      return Math.min(acc, xs[e.w] - blockG.edge(e));
    }, Number.POSITIVE_INFINITY);

    var node = g.node(elem);
    if (min !== Number.POSITIVE_INFINITY && node.borderType !== borderType) {
      xs[elem] = Math.max(xs[elem], min);
    }
  }

  iterate(pass1, blockG.predecessors.bind(blockG));
  iterate(pass2, blockG.successors.bind(blockG));

  // Assign x coordinates to all nodes
  forEach/* default */.Z(align, function (v) {
    xs[v] = xs[root[v]];
  });

  return xs;
}

function buildBlockGraph(g, layering, root, reverseSep) {
  var blockGraph = new graphlib/* Graph */.k(),
    graphLabel = g.graph(),
    sepFn = sep(graphLabel.nodesep, graphLabel.edgesep, reverseSep);

  forEach/* default */.Z(layering, function (layer) {
    var u;
    forEach/* default */.Z(layer, function (v) {
      var vRoot = root[v];
      blockGraph.setNode(vRoot);
      if (u) {
        var uRoot = root[u],
          prevMax = blockGraph.edge(uRoot, vRoot);
        blockGraph.setEdge(uRoot, vRoot, Math.max(sepFn(g, v, u), prevMax || 0));
      }
      u = v;
    });
  });

  return blockGraph;
}

/*
 * Returns the alignment that has the smallest width of the given alignments.
 */
function findSmallestWidthAlignment(g, xss) {
  return lodash_es_minBy(values/* default */.Z(xss), function (xs) {
    var max = Number.NEGATIVE_INFINITY;
    var min = Number.POSITIVE_INFINITY;

    lodash_es_forIn(xs, function (x, v) {
      var halfWidth = width(g, v) / 2;

      max = Math.max(x + halfWidth, max);
      min = Math.min(x - halfWidth, min);
    });

    return max - min;
  });
}

/*
 * Align the coordinates of each of the layout alignments such that
 * left-biased alignments have their minimum coordinate at the same point as
 * the minimum coordinate of the smallest width alignment and right-biased
 * alignments have their maximum coordinate at the same point as the maximum
 * coordinate of the smallest width alignment.
 */
function alignCoordinates(xss, alignTo) {
  var alignToVals = values/* default */.Z(alignTo),
    alignToMin = lodash_es_min(alignToVals),
    alignToMax = lodash_es_max(alignToVals);

  forEach/* default */.Z(['u', 'd'], function (vert) {
    forEach/* default */.Z(['l', 'r'], function (horiz) {
      var alignment = vert + horiz,
        xs = xss[alignment],
        delta;
      if (xs === alignTo) return;

      var xsVals = values/* default */.Z(xs);
      delta = horiz === 'l' ? alignToMin - lodash_es_min(xsVals) : alignToMax - lodash_es_max(xsVals);

      if (delta) {
        xss[alignment] = lodash_es_mapValues(xs, function (x) {
          return x + delta;
        });
      }
    });
  });
}

function balance(xss, align) {
  return lodash_es_mapValues(xss.ul, function (ignore, v) {
    if (align) {
      return xss[align.toLowerCase()][v];
    } else {
      var xs = lodash_es_sortBy(map/* default */.Z(xss, v));
      return (xs[1] + xs[2]) / 2;
    }
  });
}

function positionX(g) {
  var layering = buildLayerMatrix(g);
  var conflicts = merge/* default */.Z(findType1Conflicts(g, layering), findType2Conflicts(g, layering));

  var xss = {};
  var adjustedLayering;
  forEach/* default */.Z(['u', 'd'], function (vert) {
    adjustedLayering = vert === 'u' ? layering : values/* default */.Z(layering).reverse();
    forEach/* default */.Z(['l', 'r'], function (horiz) {
      if (horiz === 'r') {
        adjustedLayering = map/* default */.Z(adjustedLayering, function (inner) {
          return values/* default */.Z(inner).reverse();
        });
      }

      var neighborFn = (vert === 'u' ? g.predecessors : g.successors).bind(g);
      var align = verticalAlignment(g, adjustedLayering, conflicts, neighborFn);
      var xs = horizontalCompaction(g, adjustedLayering, align.root, align.align, horiz === 'r');
      if (horiz === 'r') {
        xs = lodash_es_mapValues(xs, function (x) {
          return -x;
        });
      }
      xss[vert + horiz] = xs;
    });
  });

  var smallestWidth = findSmallestWidthAlignment(g, xss);
  alignCoordinates(xss, smallestWidth);
  return balance(xss, g.graph().align);
}

function sep(nodeSep, edgeSep, reverseSep) {
  return function (g, v, w) {
    var vLabel = g.node(v);
    var wLabel = g.node(w);
    var sum = 0;
    var delta;

    sum += vLabel.width / 2;
    if (Object.prototype.hasOwnProperty.call(vLabel, 'labelpos')) {
      switch (vLabel.labelpos.toLowerCase()) {
        case 'l':
          delta = -vLabel.width / 2;
          break;
        case 'r':
          delta = vLabel.width / 2;
          break;
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta;
    }
    delta = 0;

    sum += (vLabel.dummy ? edgeSep : nodeSep) / 2;
    sum += (wLabel.dummy ? edgeSep : nodeSep) / 2;

    sum += wLabel.width / 2;
    if (Object.prototype.hasOwnProperty.call(wLabel, 'labelpos')) {
      switch (wLabel.labelpos.toLowerCase()) {
        case 'l':
          delta = wLabel.width / 2;
          break;
        case 'r':
          delta = -wLabel.width / 2;
          break;
      }
    }
    if (delta) {
      sum += reverseSep ? delta : -delta;
    }
    delta = 0;

    return sum;
  };
}

function width(g, v) {
  return g.node(v).width;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/position/index.js






function position(g) {
  g = asNonCompoundGraph(g);

  positionY(g);
  lodash_es_forOwn(positionX(g), function (x, v) {
    g.node(v).x = x;
  });
}

function positionY(g) {
  var layering = buildLayerMatrix(g);
  var rankSep = g.graph().ranksep;
  var prevY = 0;
  forEach/* default */.Z(layering, function (layer) {
    var maxHeight = lodash_es_max(
      map/* default */.Z(layer, function (v) {
        return g.node(v).height;
      }),
    );
    forEach/* default */.Z(layer, function (v) {
      g.node(v).y = prevY + maxHeight / 2;
    });
    prevY += maxHeight + rankSep;
  });
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/layout.js















function layout(g, opts) {
  var time = opts && opts.debugTiming ? util_time : notime;
  time('layout', () => {
    var layoutGraph = time('  buildLayoutGraph', () => buildLayoutGraph(g));
    time('  runLayout', () => runLayout(layoutGraph, time));
    time('  updateInputGraph', () => updateInputGraph(g, layoutGraph));
  });
}

function runLayout(g, time) {
  time('    makeSpaceForEdgeLabels', () => makeSpaceForEdgeLabels(g));
  time('    removeSelfEdges', () => removeSelfEdges(g));
  time('    acyclic', () => run(g));
  time('    nestingGraph.run', () => nesting_graph_run(g));
  time('    rank', () => rank(asNonCompoundGraph(g)));
  time('    injectEdgeLabelProxies', () => injectEdgeLabelProxies(g));
  time('    removeEmptyRanks', () => removeEmptyRanks(g));
  time('    nestingGraph.cleanup', () => cleanup(g));
  time('    normalizeRanks', () => normalizeRanks(g));
  time('    assignRankMinMax', () => assignRankMinMax(g));
  time('    removeEdgeLabelProxies', () => removeEdgeLabelProxies(g));
  time('    normalize.run', () => normalize_run(g));
  time('    parentDummyChains', () => parentDummyChains(g));
  time('    addBorderSegments', () => addBorderSegments(g));
  time('    order', () => order(g));
  time('    insertSelfEdges', () => insertSelfEdges(g));
  time('    adjustCoordinateSystem', () => adjust(g));
  time('    position', () => position(g));
  time('    positionSelfEdges', () => positionSelfEdges(g));
  time('    removeBorderNodes', () => removeBorderNodes(g));
  time('    normalize.undo', () => normalize_undo(g));
  time('    fixupEdgeLabelCoords', () => fixupEdgeLabelCoords(g));
  time('    undoCoordinateSystem', () => coordinate_system_undo(g));
  time('    translateGraph', () => translateGraph(g));
  time('    assignNodeIntersects', () => assignNodeIntersects(g));
  time('    reversePoints', () => reversePointsForReversedEdges(g));
  time('    acyclic.undo', () => undo(g));
}

/*
 * Copies final layout information from the layout graph back to the input
 * graph. This process only copies whitelisted attributes from the layout graph
 * to the input graph, so it serves as a good place to determine what
 * attributes can influence layout.
 */
function updateInputGraph(inputGraph, layoutGraph) {
  forEach/* default */.Z(inputGraph.nodes(), function (v) {
    var inputLabel = inputGraph.node(v);
    var layoutLabel = layoutGraph.node(v);

    if (inputLabel) {
      inputLabel.x = layoutLabel.x;
      inputLabel.y = layoutLabel.y;

      if (layoutGraph.children(v).length) {
        inputLabel.width = layoutLabel.width;
        inputLabel.height = layoutLabel.height;
      }
    }
  });

  forEach/* default */.Z(inputGraph.edges(), function (e) {
    var inputLabel = inputGraph.edge(e);
    var layoutLabel = layoutGraph.edge(e);

    inputLabel.points = layoutLabel.points;
    if (Object.prototype.hasOwnProperty.call(layoutLabel, 'x')) {
      inputLabel.x = layoutLabel.x;
      inputLabel.y = layoutLabel.y;
    }
  });

  inputGraph.graph().width = layoutGraph.graph().width;
  inputGraph.graph().height = layoutGraph.graph().height;
}

var graphNumAttrs = ['nodesep', 'edgesep', 'ranksep', 'marginx', 'marginy'];
var graphDefaults = { ranksep: 50, edgesep: 20, nodesep: 50, rankdir: 'tb' };
var graphAttrs = ['acyclicer', 'ranker', 'rankdir', 'align'];
var nodeNumAttrs = ['width', 'height'];
var nodeDefaults = { width: 0, height: 0 };
var edgeNumAttrs = ['minlen', 'weight', 'width', 'height', 'labeloffset'];
var edgeDefaults = {
  minlen: 1,
  weight: 1,
  width: 0,
  height: 0,
  labeloffset: 10,
  labelpos: 'r',
};
var edgeAttrs = ['labelpos'];

/*
 * Constructs a new graph from the input graph, which can be used for layout.
 * This process copies only whitelisted attributes from the input graph to the
 * layout graph. Thus this function serves as a good place to determine what
 * attributes can influence layout.
 */
function buildLayoutGraph(inputGraph) {
  var g = new graphlib/* Graph */.k({ multigraph: true, compound: true });
  var graph = canonicalize(inputGraph.graph());

  g.setGraph(
    merge/* default */.Z({}, graphDefaults, selectNumberAttrs(graph, graphNumAttrs), pick/* default */.Z(graph, graphAttrs)),
  );

  forEach/* default */.Z(inputGraph.nodes(), function (v) {
    var node = canonicalize(inputGraph.node(v));
    g.setNode(v, defaults/* default */.Z(selectNumberAttrs(node, nodeNumAttrs), nodeDefaults));
    g.setParent(v, inputGraph.parent(v));
  });

  forEach/* default */.Z(inputGraph.edges(), function (e) {
    var edge = canonicalize(inputGraph.edge(e));
    g.setEdge(
      e,
      merge/* default */.Z({}, edgeDefaults, selectNumberAttrs(edge, edgeNumAttrs), pick/* default */.Z(edge, edgeAttrs)),
    );
  });

  return g;
}

/*
 * This idea comes from the Gansner paper: to account for edge labels in our
 * layout we split each rank in half by doubling minlen and halving ranksep.
 * Then we can place labels at these mid-points between nodes.
 *
 * We also add some minimal padding to the width to push the label for the edge
 * away from the edge itself a bit.
 */
function makeSpaceForEdgeLabels(g) {
  var graph = g.graph();
  graph.ranksep /= 2;
  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    edge.minlen *= 2;
    if (edge.labelpos.toLowerCase() !== 'c') {
      if (graph.rankdir === 'TB' || graph.rankdir === 'BT') {
        edge.width += edge.labeloffset;
      } else {
        edge.height += edge.labeloffset;
      }
    }
  });
}

/*
 * Creates temporary dummy nodes that capture the rank in which each edge's
 * label is going to, if it has one of non-zero width and height. We do this
 * so that we can safely remove empty ranks while preserving balance for the
 * label's position.
 */
function injectEdgeLabelProxies(g) {
  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    if (edge.width && edge.height) {
      var v = g.node(e.v);
      var w = g.node(e.w);
      var label = { rank: (w.rank - v.rank) / 2 + v.rank, e: e };
      addDummyNode(g, 'edge-proxy', label, '_ep');
    }
  });
}

function assignRankMinMax(g) {
  var maxRank = 0;
  forEach/* default */.Z(g.nodes(), function (v) {
    var node = g.node(v);
    if (node.borderTop) {
      node.minRank = g.node(node.borderTop).rank;
      node.maxRank = g.node(node.borderBottom).rank;
      // @ts-expect-error
      maxRank = lodash_es_max(maxRank, node.maxRank);
    }
  });
  g.graph().maxRank = maxRank;
}

function removeEdgeLabelProxies(g) {
  forEach/* default */.Z(g.nodes(), function (v) {
    var node = g.node(v);
    if (node.dummy === 'edge-proxy') {
      g.edge(node.e).labelRank = node.rank;
      g.removeNode(v);
    }
  });
}

function translateGraph(g) {
  var minX = Number.POSITIVE_INFINITY;
  var maxX = 0;
  var minY = Number.POSITIVE_INFINITY;
  var maxY = 0;
  var graphLabel = g.graph();
  var marginX = graphLabel.marginx || 0;
  var marginY = graphLabel.marginy || 0;

  function getExtremes(attrs) {
    var x = attrs.x;
    var y = attrs.y;
    var w = attrs.width;
    var h = attrs.height;
    minX = Math.min(minX, x - w / 2);
    maxX = Math.max(maxX, x + w / 2);
    minY = Math.min(minY, y - h / 2);
    maxY = Math.max(maxY, y + h / 2);
  }

  forEach/* default */.Z(g.nodes(), function (v) {
    getExtremes(g.node(v));
  });
  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    if (Object.prototype.hasOwnProperty.call(edge, 'x')) {
      getExtremes(edge);
    }
  });

  minX -= marginX;
  minY -= marginY;

  forEach/* default */.Z(g.nodes(), function (v) {
    var node = g.node(v);
    node.x -= minX;
    node.y -= minY;
  });

  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    forEach/* default */.Z(edge.points, function (p) {
      p.x -= minX;
      p.y -= minY;
    });
    if (Object.prototype.hasOwnProperty.call(edge, 'x')) {
      edge.x -= minX;
    }
    if (Object.prototype.hasOwnProperty.call(edge, 'y')) {
      edge.y -= minY;
    }
  });

  graphLabel.width = maxX - minX + marginX;
  graphLabel.height = maxY - minY + marginY;
}

function assignNodeIntersects(g) {
  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    var nodeV = g.node(e.v);
    var nodeW = g.node(e.w);
    var p1, p2;
    if (!edge.points) {
      edge.points = [];
      p1 = nodeW;
      p2 = nodeV;
    } else {
      p1 = edge.points[0];
      p2 = edge.points[edge.points.length - 1];
    }
    edge.points.unshift(intersectRect(nodeV, p1));
    edge.points.push(intersectRect(nodeW, p2));
  });
}

function fixupEdgeLabelCoords(g) {
  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    if (Object.prototype.hasOwnProperty.call(edge, 'x')) {
      if (edge.labelpos === 'l' || edge.labelpos === 'r') {
        edge.width -= edge.labeloffset;
      }
      switch (edge.labelpos) {
        case 'l':
          edge.x -= edge.width / 2 + edge.labeloffset;
          break;
        case 'r':
          edge.x += edge.width / 2 + edge.labeloffset;
          break;
      }
    }
  });
}

function reversePointsForReversedEdges(g) {
  forEach/* default */.Z(g.edges(), function (e) {
    var edge = g.edge(e);
    if (edge.reversed) {
      edge.points.reverse();
    }
  });
}

function removeBorderNodes(g) {
  forEach/* default */.Z(g.nodes(), function (v) {
    if (g.children(v).length) {
      var node = g.node(v);
      var t = g.node(node.borderTop);
      var b = g.node(node.borderBottom);
      var l = g.node(lodash_es_last(node.borderLeft));
      var r = g.node(lodash_es_last(node.borderRight));

      node.width = Math.abs(r.x - l.x);
      node.height = Math.abs(b.y - t.y);
      node.x = l.x + node.width / 2;
      node.y = t.y + node.height / 2;
    }
  });

  forEach/* default */.Z(g.nodes(), function (v) {
    if (g.node(v).dummy === 'border') {
      g.removeNode(v);
    }
  });
}

function removeSelfEdges(g) {
  forEach/* default */.Z(g.edges(), function (e) {
    if (e.v === e.w) {
      var node = g.node(e.v);
      if (!node.selfEdges) {
        node.selfEdges = [];
      }
      node.selfEdges.push({ e: e, label: g.edge(e) });
      g.removeEdge(e);
    }
  });
}

function insertSelfEdges(g) {
  var layers = buildLayerMatrix(g);
  forEach/* default */.Z(layers, function (layer) {
    var orderShift = 0;
    forEach/* default */.Z(layer, function (v, i) {
      var node = g.node(v);
      node.order = i + orderShift;
      forEach/* default */.Z(node.selfEdges, function (selfEdge) {
        addDummyNode(
          g,
          'selfedge',
          {
            width: selfEdge.label.width,
            height: selfEdge.label.height,
            rank: node.rank,
            order: i + ++orderShift,
            e: selfEdge.e,
            label: selfEdge.label,
          },
          '_se',
        );
      });
      delete node.selfEdges;
    });
  });
}

function positionSelfEdges(g) {
  forEach/* default */.Z(g.nodes(), function (v) {
    var node = g.node(v);
    if (node.dummy === 'selfedge') {
      var selfNode = g.node(node.e.v);
      var x = selfNode.x + selfNode.width / 2;
      var y = selfNode.y;
      var dx = node.x - x;
      var dy = selfNode.height / 2;
      g.setEdge(node.e, node.label);
      g.removeNode(v);
      node.label.points = [
        { x: x + (2 * dx) / 3, y: y - dy },
        { x: x + (5 * dx) / 6, y: y - dy },
        { x: x + dx, y: y },
        { x: x + (5 * dx) / 6, y: y + dy },
        { x: x + (2 * dx) / 3, y: y + dy },
      ];
      node.label.x = node.x;
      node.label.y = node.y;
    }
  });
}

function selectNumberAttrs(obj, attrs) {
  return lodash_es_mapValues(pick/* default */.Z(obj, attrs), Number);
}

function canonicalize(attrs) {
  var newAttrs = {};
  forEach/* default */.Z(attrs, function (v, k) {
    newAttrs[k.toLowerCase()] = v;
  });
  return newAttrs;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre/index.js








/***/ }),

/***/ 52544:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "k": () => (/* binding */ Graph)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/constant.js
var constant = __webpack_require__(62002);
// EXTERNAL MODULE: ./node_modules/lodash-es/isFunction.js
var isFunction = __webpack_require__(73234);
// EXTERNAL MODULE: ./node_modules/lodash-es/keys.js
var keys = __webpack_require__(17179);
// EXTERNAL MODULE: ./node_modules/lodash-es/filter.js + 1 modules
var filter = __webpack_require__(13445);
// EXTERNAL MODULE: ./node_modules/lodash-es/isEmpty.js
var isEmpty = __webpack_require__(79697);
// EXTERNAL MODULE: ./node_modules/lodash-es/forEach.js
var forEach = __webpack_require__(70870);
// EXTERNAL MODULE: ./node_modules/lodash-es/isUndefined.js
var isUndefined = __webpack_require__(49360);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseFlatten.js + 1 modules
var _baseFlatten = __webpack_require__(10626);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseRest.js
var _baseRest = __webpack_require__(69581);
// EXTERNAL MODULE: ./node_modules/lodash-es/_SetCache.js + 2 modules
var _SetCache = __webpack_require__(63001);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseFindIndex.js
var _baseFindIndex = __webpack_require__(21692);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIsNaN.js
/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/* harmony default export */ const _baseIsNaN = (baseIsNaN);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_strictIndexOf.js
/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/* harmony default export */ const _strictIndexOf = (strictIndexOf);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIndexOf.js




/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? _strictIndexOf(array, value, fromIndex)
    : (0,_baseFindIndex/* default */.Z)(array, _baseIsNaN, fromIndex);
}

/* harmony default export */ const _baseIndexOf = (baseIndexOf);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_arrayIncludes.js


/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && _baseIndexOf(array, value, 0) > -1;
}

/* harmony default export */ const _arrayIncludes = (arrayIncludes);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_arrayIncludesWith.js
/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/* harmony default export */ const _arrayIncludesWith = (arrayIncludesWith);

// EXTERNAL MODULE: ./node_modules/lodash-es/_cacheHas.js
var _cacheHas = __webpack_require__(59548);
// EXTERNAL MODULE: ./node_modules/lodash-es/_Set.js
var _Set = __webpack_require__(93203);
;// CONCATENATED MODULE: ./node_modules/lodash-es/noop.js
/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

/* harmony default export */ const lodash_es_noop = (noop);

// EXTERNAL MODULE: ./node_modules/lodash-es/_setToArray.js
var _setToArray = __webpack_require__(6545);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_createSet.js




/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(_Set/* default */.Z && (1 / (0,_setToArray/* default */.Z)(new _Set/* default */.Z([,-0]))[1]) == INFINITY) ? lodash_es_noop : function(values) {
  return new _Set/* default */.Z(values);
};

/* harmony default export */ const _createSet = (createSet);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseUniq.js







/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = _arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = _arrayIncludesWith;
  }
  else if (length >= LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : _createSet(array);
    if (set) {
      return (0,_setToArray/* default */.Z)(set);
    }
    isCommon = false;
    includes = _cacheHas/* default */.Z;
    seen = new _SetCache/* default */.Z;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/* harmony default export */ const _baseUniq = (baseUniq);

// EXTERNAL MODULE: ./node_modules/lodash-es/isArrayLikeObject.js
var isArrayLikeObject = __webpack_require__(836);
;// CONCATENATED MODULE: ./node_modules/lodash-es/union.js





/**
 * Creates an array of unique values, in order, from all given arrays using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {...Array} [arrays] The arrays to inspect.
 * @returns {Array} Returns the new array of combined values.
 * @example
 *
 * _.union([2], [1, 2]);
 * // => [2, 1]
 */
var union = (0,_baseRest/* default */.Z)(function(arrays) {
  return _baseUniq((0,_baseFlatten/* default */.Z)(arrays, 1, isArrayLikeObject/* default */.Z, true));
});

/* harmony default export */ const lodash_es_union = (union);

// EXTERNAL MODULE: ./node_modules/lodash-es/values.js + 1 modules
var values = __webpack_require__(34148);
// EXTERNAL MODULE: ./node_modules/lodash-es/reduce.js + 2 modules
var reduce = __webpack_require__(92344);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/graphlib/graph.js


var DEFAULT_EDGE_NAME = '\x00';
var GRAPH_NODE = '\x00';
var EDGE_KEY_DELIM = '\x01';

// Implementation notes:
//
//  * Node id query functions should return string ids for the nodes
//  * Edge id query functions should return an "edgeObj", edge object, that is
//    composed of enough information to uniquely identify an edge: {v, w, name}.
//  * Internally we use an "edgeId", a stringified form of the edgeObj, to
//    reference edges. This is because we need a performant way to look these
//    edges up and, object properties, which have string keys, are the closest
//    we're going to get to a performant hashtable in JavaScript.

// Implementation notes:
//
//  * Node id query functions should return string ids for the nodes
//  * Edge id query functions should return an "edgeObj", edge object, that is
//    composed of enough information to uniquely identify an edge: {v, w, name}.
//  * Internally we use an "edgeId", a stringified form of the edgeObj, to
//    reference edges. This is because we need a performant way to look these
//    edges up and, object properties, which have string keys, are the closest
//    we're going to get to a performant hashtable in JavaScript.
class Graph {
  constructor(opts = {}) {
    this._isDirected = Object.prototype.hasOwnProperty.call(opts, 'directed')
      ? opts.directed
      : true;
    this._isMultigraph = Object.prototype.hasOwnProperty.call(opts, 'multigraph')
      ? opts.multigraph
      : false;
    this._isCompound = Object.prototype.hasOwnProperty.call(opts, 'compound')
      ? opts.compound
      : false;

    // Label for the graph itself
    this._label = undefined;

    // Defaults to be set when creating a new node
    this._defaultNodeLabelFn = constant/* default */.Z(undefined);

    // Defaults to be set when creating a new edge
    this._defaultEdgeLabelFn = constant/* default */.Z(undefined);

    // v -> label
    this._nodes = {};

    if (this._isCompound) {
      // v -> parent
      this._parent = {};

      // v -> children
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }

    // v -> edgeObj
    this._in = {};

    // u -> v -> Number
    this._preds = {};

    // v -> edgeObj
    this._out = {};

    // v -> w -> Number
    this._sucs = {};

    // e -> edgeObj
    this._edgeObjs = {};

    // e -> label
    this._edgeLabels = {};
  }
  /* === Graph functions ========= */
  isDirected() {
    return this._isDirected;
  }
  isMultigraph() {
    return this._isMultigraph;
  }
  isCompound() {
    return this._isCompound;
  }
  setGraph(label) {
    this._label = label;
    return this;
  }
  graph() {
    return this._label;
  }
  /* === Node functions ========== */
  setDefaultNodeLabel(newDefault) {
    if (!isFunction/* default */.Z(newDefault)) {
      newDefault = constant/* default */.Z(newDefault);
    }
    this._defaultNodeLabelFn = newDefault;
    return this;
  }
  nodeCount() {
    return this._nodeCount;
  }
  nodes() {
    return keys/* default */.Z(this._nodes);
  }
  sources() {
    var self = this;
    return filter/* default */.Z(this.nodes(), function (v) {
      return isEmpty/* default */.Z(self._in[v]);
    });
  }
  sinks() {
    var self = this;
    return filter/* default */.Z(this.nodes(), function (v) {
      return isEmpty/* default */.Z(self._out[v]);
    });
  }
  setNodes(vs, value) {
    var args = arguments;
    var self = this;
    forEach/* default */.Z(vs, function (v) {
      if (args.length > 1) {
        self.setNode(v, value);
      } else {
        self.setNode(v);
      }
    });
    return this;
  }
  setNode(v, value) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
      if (arguments.length > 1) {
        this._nodes[v] = value;
      }
      return this;
    }

    // @ts-expect-error
    this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
    if (this._isCompound) {
      this._parent[v] = GRAPH_NODE;
      this._children[v] = {};
      this._children[GRAPH_NODE][v] = true;
    }
    this._in[v] = {};
    this._preds[v] = {};
    this._out[v] = {};
    this._sucs[v] = {};
    ++this._nodeCount;
    return this;
  }
  node(v) {
    return this._nodes[v];
  }
  hasNode(v) {
    return Object.prototype.hasOwnProperty.call(this._nodes, v);
  }
  removeNode(v) {
    if (Object.prototype.hasOwnProperty.call(this._nodes, v)) {
      var removeEdge = (e) => this.removeEdge(this._edgeObjs[e]);
      delete this._nodes[v];
      if (this._isCompound) {
        this._removeFromParentsChildList(v);
        delete this._parent[v];
        forEach/* default */.Z(this.children(v), (child) => {
          this.setParent(child);
        });
        delete this._children[v];
      }
      forEach/* default */.Z(keys/* default */.Z(this._in[v]), removeEdge);
      delete this._in[v];
      delete this._preds[v];
      forEach/* default */.Z(keys/* default */.Z(this._out[v]), removeEdge);
      delete this._out[v];
      delete this._sucs[v];
      --this._nodeCount;
    }
    return this;
  }
  setParent(v, parent) {
    if (!this._isCompound) {
      throw new Error('Cannot set parent in a non-compound graph');
    }

    if (isUndefined/* default */.Z(parent)) {
      parent = GRAPH_NODE;
    } else {
      // Coerce parent to string
      parent += '';
      for (var ancestor = parent; !isUndefined/* default */.Z(ancestor); ancestor = this.parent(ancestor)) {
        if (ancestor === v) {
          throw new Error('Setting ' + parent + ' as parent of ' + v + ' would create a cycle');
        }
      }

      this.setNode(parent);
    }

    this.setNode(v);
    this._removeFromParentsChildList(v);
    this._parent[v] = parent;
    this._children[parent][v] = true;
    return this;
  }
  _removeFromParentsChildList(v) {
    delete this._children[this._parent[v]][v];
  }
  parent(v) {
    if (this._isCompound) {
      var parent = this._parent[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
  }
  children(v) {
    if (isUndefined/* default */.Z(v)) {
      v = GRAPH_NODE;
    }

    if (this._isCompound) {
      var children = this._children[v];
      if (children) {
        return keys/* default */.Z(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v)) {
      return [];
    }
  }
  predecessors(v) {
    var predsV = this._preds[v];
    if (predsV) {
      return keys/* default */.Z(predsV);
    }
  }
  successors(v) {
    var sucsV = this._sucs[v];
    if (sucsV) {
      return keys/* default */.Z(sucsV);
    }
  }
  neighbors(v) {
    var preds = this.predecessors(v);
    if (preds) {
      return lodash_es_union(preds, this.successors(v));
    }
  }
  isLeaf(v) {
    var neighbors;
    if (this.isDirected()) {
      neighbors = this.successors(v);
    } else {
      neighbors = this.neighbors(v);
    }
    return neighbors.length === 0;
  }
  filterNodes(filter) {
    // @ts-expect-error
    var copy = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound,
    });

    copy.setGraph(this.graph());

    var self = this;
    forEach/* default */.Z(this._nodes, function (value, v) {
      if (filter(v)) {
        copy.setNode(v, value);
      }
    });

    forEach/* default */.Z(this._edgeObjs, function (e) {
      // @ts-expect-error
      if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
        copy.setEdge(e, self.edge(e));
      }
    });

    var parents = {};
    function findParent(v) {
      var parent = self.parent(v);
      if (parent === undefined || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      } else if (parent in parents) {
        return parents[parent];
      } else {
        return findParent(parent);
      }
    }

    if (this._isCompound) {
      forEach/* default */.Z(copy.nodes(), function (v) {
        copy.setParent(v, findParent(v));
      });
    }

    return copy;
  }
  /* === Edge functions ========== */
  setDefaultEdgeLabel(newDefault) {
    if (!isFunction/* default */.Z(newDefault)) {
      newDefault = constant/* default */.Z(newDefault);
    }
    this._defaultEdgeLabelFn = newDefault;
    return this;
  }
  edgeCount() {
    return this._edgeCount;
  }
  edges() {
    return values/* default */.Z(this._edgeObjs);
  }
  setPath(vs, value) {
    var self = this;
    var args = arguments;
    reduce/* default */.Z(vs, function (v, w) {
      if (args.length > 1) {
        self.setEdge(v, w, value);
      } else {
        self.setEdge(v, w);
      }
      return w;
    });
    return this;
  }
  /*
   * setEdge(v, w, [value, [name]])
   * setEdge({ v, w, [name] }, [value])
   */
  setEdge() {
    var v, w, name, value;
    var valueSpecified = false;
    var arg0 = arguments[0];

    if (typeof arg0 === 'object' && arg0 !== null && 'v' in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (arguments.length === 2) {
        value = arguments[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = arguments[1];
      name = arguments[3];
      if (arguments.length > 2) {
        value = arguments[2];
        valueSpecified = true;
      }
    }

    v = '' + v;
    w = '' + w;
    if (!isUndefined/* default */.Z(name)) {
      name = '' + name;
    }

    var e = edgeArgsToId(this._isDirected, v, w, name);
    if (Object.prototype.hasOwnProperty.call(this._edgeLabels, e)) {
      if (valueSpecified) {
        this._edgeLabels[e] = value;
      }
      return this;
    }

    if (!isUndefined/* default */.Z(name) && !this._isMultigraph) {
      throw new Error('Cannot set a named edge when isMultigraph = false');
    }

    // It didn't exist, so we need to create it.
    // First ensure the nodes exist.
    this.setNode(v);
    this.setNode(w);

    // @ts-expect-error
    this._edgeLabels[e] = valueSpecified ? value : this._defaultEdgeLabelFn(v, w, name);

    var edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
    // Ensure we add undirected edges in a consistent way.
    v = edgeObj.v;
    w = edgeObj.w;

    Object.freeze(edgeObj);
    this._edgeObjs[e] = edgeObj;
    incrementOrInitEntry(this._preds[w], v);
    incrementOrInitEntry(this._sucs[v], w);
    this._in[w][e] = edgeObj;
    this._out[v][e] = edgeObj;
    this._edgeCount++;
    return this;
  }
  edge(v, w, name) {
    var e =
      arguments.length === 1
        ? edgeObjToId(this._isDirected, arguments[0])
        : edgeArgsToId(this._isDirected, v, w, name);
    return this._edgeLabels[e];
  }
  hasEdge(v, w, name) {
    var e =
      arguments.length === 1
        ? edgeObjToId(this._isDirected, arguments[0])
        : edgeArgsToId(this._isDirected, v, w, name);
    return Object.prototype.hasOwnProperty.call(this._edgeLabels, e);
  }
  removeEdge(v, w, name) {
    var e =
      arguments.length === 1
        ? edgeObjToId(this._isDirected, arguments[0])
        : edgeArgsToId(this._isDirected, v, w, name);
    var edge = this._edgeObjs[e];
    if (edge) {
      v = edge.v;
      w = edge.w;
      delete this._edgeLabels[e];
      delete this._edgeObjs[e];
      decrementOrRemoveEntry(this._preds[w], v);
      decrementOrRemoveEntry(this._sucs[v], w);
      delete this._in[w][e];
      delete this._out[v][e];
      this._edgeCount--;
    }
    return this;
  }
  inEdges(v, u) {
    var inV = this._in[v];
    if (inV) {
      var edges = values/* default */.Z(inV);
      if (!u) {
        return edges;
      }
      return filter/* default */.Z(edges, function (edge) {
        return edge.v === u;
      });
    }
  }
  outEdges(v, w) {
    var outV = this._out[v];
    if (outV) {
      var edges = values/* default */.Z(outV);
      if (!w) {
        return edges;
      }
      return filter/* default */.Z(edges, function (edge) {
        return edge.w === w;
      });
    }
  }
  nodeEdges(v, w) {
    var inEdges = this.inEdges(v, w);
    if (inEdges) {
      return inEdges.concat(this.outEdges(v, w));
    }
  }
}

/* Number of nodes in the graph. Should only be changed by the implementation. */
Graph.prototype._nodeCount = 0;

/* Number of edges in the graph. Should only be changed by the implementation. */
Graph.prototype._edgeCount = 0;

function incrementOrInitEntry(map, k) {
  if (map[k]) {
    map[k]++;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map, k) {
  if (!--map[k]) {
    delete map[k];
  }
}

function edgeArgsToId(isDirected, v_, w_, name) {
  var v = '' + v_;
  var w = '' + w_;
  if (!isDirected && v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  return v + EDGE_KEY_DELIM + w + EDGE_KEY_DELIM + (isUndefined/* default */.Z(name) ? DEFAULT_EDGE_NAME : name);
}

function edgeArgsToObj(isDirected, v_, w_, name) {
  var v = '' + v_;
  var w = '' + w_;
  if (!isDirected && v > w) {
    var tmp = v;
    v = w;
    w = tmp;
  }
  var edgeObj = { v: v, w: w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected, edgeObj) {
  return edgeArgsToId(isDirected, edgeObj.v, edgeObj.w, edgeObj.name);
}


/***/ }),

/***/ 45625:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "k": () => (/* reexport safe */ _graph_js__WEBPACK_IMPORTED_MODULE_0__.k)
/* harmony export */ });
/* unused harmony export version */
/* harmony import */ var _graph_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(52544);
// Includes only the "core" of graphlib



const version = '2.1.9-pre';




/***/ }),

/***/ 46060:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "c": () => (/* binding */ write)
/* harmony export */ });
/* unused harmony export read */
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49360);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(92346);
/* harmony import */ var lodash_es__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(43836);
/* harmony import */ var _graph_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(52544);





function write(g) {
  var json = {
    options: {
      directed: g.isDirected(),
      multigraph: g.isMultigraph(),
      compound: g.isCompound(),
    },
    nodes: writeNodes(g),
    edges: writeEdges(g),
  };
  if (!lodash_es__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z(g.graph())) {
    json.value = lodash_es__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z(g.graph());
  }
  return json;
}

function writeNodes(g) {
  return lodash_es__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z(g.nodes(), function (v) {
    var nodeValue = g.node(v);
    var parent = g.parent(v);
    var node = { v: v };
    if (!lodash_es__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z(nodeValue)) {
      node.value = nodeValue;
    }
    if (!lodash_es__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z(parent)) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g) {
  return lodash_es__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z(g.edges(), function (e) {
    var edgeValue = g.edge(e);
    var edge = { v: e.v, w: e.w };
    if (!lodash_es__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z(e.name)) {
      edge.name = e.name;
    }
    if (!lodash_es__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z(edgeValue)) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

function read(json) {
  var g = new Graph(json.options).setGraph(json.value);
  _.each(json.nodes, function (entry) {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  });
  _.each(json.edges, function (entry) {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  });
  return g;
}


/***/ }),

/***/ 59792:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _utils_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(61691);
/* harmony import */ var _color_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(71610);
/* IMPORT */


/* MAIN */
const channel = (color, channel) => {
    return _utils_index_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"].lang.round */ .Z.lang.round(_color_index_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"].parse */ .Z.parse(color)[channel]);
};
/* EXPORT */
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (channel);


/***/ }),

/***/ 63001:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _SetCache)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_MapCache.js + 14 modules
var _MapCache = __webpack_require__(37834);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_setCacheAdd.js
/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, HASH_UNDEFINED);
  return this;
}

/* harmony default export */ const _setCacheAdd = (setCacheAdd);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_setCacheHas.js
/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

/* harmony default export */ const _setCacheHas = (setCacheHas);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_SetCache.js




/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new _MapCache/* default */.Z;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
SetCache.prototype.has = _setCacheHas;

/* harmony default export */ const _SetCache = (SetCache);


/***/ }),

/***/ 76579:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (arrayEach);


/***/ }),

/***/ 68774:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (arrayFilter);


/***/ }),

/***/ 74073:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (arrayMap);


/***/ }),

/***/ 58694:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (arrayPush);


/***/ }),

/***/ 48451:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _baseClone)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_Stack.js + 5 modules
var _Stack = __webpack_require__(31667);
// EXTERNAL MODULE: ./node_modules/lodash-es/_arrayEach.js
var _arrayEach = __webpack_require__(76579);
// EXTERNAL MODULE: ./node_modules/lodash-es/_assignValue.js
var _assignValue = __webpack_require__(72954);
// EXTERNAL MODULE: ./node_modules/lodash-es/_copyObject.js
var _copyObject = __webpack_require__(31899);
// EXTERNAL MODULE: ./node_modules/lodash-es/keys.js
var keys = __webpack_require__(17179);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseAssign.js



/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && (0,_copyObject/* default */.Z)(source, (0,keys/* default */.Z)(source), object);
}

/* harmony default export */ const _baseAssign = (baseAssign);

// EXTERNAL MODULE: ./node_modules/lodash-es/keysIn.js + 2 modules
var keysIn = __webpack_require__(32957);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseAssignIn.js



/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && (0,_copyObject/* default */.Z)(source, (0,keysIn/* default */.Z)(source), object);
}

/* harmony default export */ const _baseAssignIn = (baseAssignIn);

// EXTERNAL MODULE: ./node_modules/lodash-es/_cloneBuffer.js
var _cloneBuffer = __webpack_require__(91050);
// EXTERNAL MODULE: ./node_modules/lodash-es/_copyArray.js
var _copyArray = __webpack_require__(87215);
// EXTERNAL MODULE: ./node_modules/lodash-es/_getSymbols.js
var _getSymbols = __webpack_require__(95695);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_copySymbols.js



/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return (0,_copyObject/* default */.Z)(source, (0,_getSymbols/* default */.Z)(source), object);
}

/* harmony default export */ const _copySymbols = (copySymbols);

// EXTERNAL MODULE: ./node_modules/lodash-es/_arrayPush.js
var _arrayPush = __webpack_require__(58694);
// EXTERNAL MODULE: ./node_modules/lodash-es/_getPrototype.js
var _getPrototype = __webpack_require__(12513);
// EXTERNAL MODULE: ./node_modules/lodash-es/stubArray.js
var stubArray = __webpack_require__(60532);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_getSymbolsIn.js





/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? stubArray/* default */.Z : function(object) {
  var result = [];
  while (object) {
    (0,_arrayPush/* default */.Z)(result, (0,_getSymbols/* default */.Z)(object));
    object = (0,_getPrototype/* default */.Z)(object);
  }
  return result;
};

/* harmony default export */ const _getSymbolsIn = (getSymbolsIn);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_copySymbolsIn.js



/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return (0,_copyObject/* default */.Z)(source, _getSymbolsIn(source), object);
}

/* harmony default export */ const _copySymbolsIn = (copySymbolsIn);

// EXTERNAL MODULE: ./node_modules/lodash-es/_getAllKeys.js
var _getAllKeys = __webpack_require__(1808);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseGetAllKeys.js
var _baseGetAllKeys = __webpack_require__(63327);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_getAllKeysIn.js




/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return (0,_baseGetAllKeys/* default */.Z)(object, keysIn/* default */.Z, _getSymbolsIn);
}

/* harmony default export */ const _getAllKeysIn = (getAllKeysIn);

// EXTERNAL MODULE: ./node_modules/lodash-es/_getTag.js + 3 modules
var _getTag = __webpack_require__(83970);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_initCloneArray.js
/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _initCloneArray_hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && _initCloneArray_hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/* harmony default export */ const _initCloneArray = (initCloneArray);

// EXTERNAL MODULE: ./node_modules/lodash-es/_cloneArrayBuffer.js
var _cloneArrayBuffer = __webpack_require__(41884);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_cloneDataView.js


/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? (0,_cloneArrayBuffer/* default */.Z)(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/* harmony default export */ const _cloneDataView = (cloneDataView);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_cloneRegExp.js
/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/* harmony default export */ const _cloneRegExp = (cloneRegExp);

// EXTERNAL MODULE: ./node_modules/lodash-es/_Symbol.js
var _Symbol = __webpack_require__(17685);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_cloneSymbol.js


/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol/* default */.Z ? _Symbol/* default.prototype */.Z.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/* harmony default export */ const _cloneSymbol = (cloneSymbol);

// EXTERNAL MODULE: ./node_modules/lodash-es/_cloneTypedArray.js
var _cloneTypedArray = __webpack_require__(12701);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_initCloneByTag.js






/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case arrayBufferTag:
      return (0,_cloneArrayBuffer/* default */.Z)(object);

    case boolTag:
    case dateTag:
      return new Ctor(+object);

    case dataViewTag:
      return _cloneDataView(object, isDeep);

    case float32Tag: case float64Tag:
    case int8Tag: case int16Tag: case int32Tag:
    case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
      return (0,_cloneTypedArray/* default */.Z)(object, isDeep);

    case mapTag:
      return new Ctor;

    case numberTag:
    case stringTag:
      return new Ctor(object);

    case regexpTag:
      return _cloneRegExp(object);

    case setTag:
      return new Ctor;

    case symbolTag:
      return _cloneSymbol(object);
  }
}

/* harmony default export */ const _initCloneByTag = (initCloneByTag);

// EXTERNAL MODULE: ./node_modules/lodash-es/_initCloneObject.js + 1 modules
var _initCloneObject = __webpack_require__(73658);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
// EXTERNAL MODULE: ./node_modules/lodash-es/isBuffer.js + 1 modules
var isBuffer = __webpack_require__(77008);
// EXTERNAL MODULE: ./node_modules/lodash-es/isObjectLike.js
var isObjectLike = __webpack_require__(18533);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIsMap.js



/** `Object#toString` result references. */
var _baseIsMap_mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return (0,isObjectLike/* default */.Z)(value) && (0,_getTag/* default */.Z)(value) == _baseIsMap_mapTag;
}

/* harmony default export */ const _baseIsMap = (baseIsMap);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseUnary.js
var _baseUnary = __webpack_require__(21162);
// EXTERNAL MODULE: ./node_modules/lodash-es/_nodeUtil.js
var _nodeUtil = __webpack_require__(98351);
;// CONCATENATED MODULE: ./node_modules/lodash-es/isMap.js




/* Node.js helper references. */
var nodeIsMap = _nodeUtil/* default */.Z && _nodeUtil/* default.isMap */.Z.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? (0,_baseUnary/* default */.Z)(nodeIsMap) : _baseIsMap;

/* harmony default export */ const lodash_es_isMap = (isMap);

// EXTERNAL MODULE: ./node_modules/lodash-es/isObject.js
var isObject = __webpack_require__(77226);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIsSet.js



/** `Object#toString` result references. */
var _baseIsSet_setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return (0,isObjectLike/* default */.Z)(value) && (0,_getTag/* default */.Z)(value) == _baseIsSet_setTag;
}

/* harmony default export */ const _baseIsSet = (baseIsSet);

;// CONCATENATED MODULE: ./node_modules/lodash-es/isSet.js




/* Node.js helper references. */
var nodeIsSet = _nodeUtil/* default */.Z && _nodeUtil/* default.isSet */.Z.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? (0,_baseUnary/* default */.Z)(nodeIsSet) : _baseIsSet;

/* harmony default export */ const lodash_es_isSet = (isSet);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseClone.js























/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    _baseClone_boolTag = '[object Boolean]',
    _baseClone_dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    _baseClone_mapTag = '[object Map]',
    _baseClone_numberTag = '[object Number]',
    objectTag = '[object Object]',
    _baseClone_regexpTag = '[object RegExp]',
    _baseClone_setTag = '[object Set]',
    _baseClone_stringTag = '[object String]',
    _baseClone_symbolTag = '[object Symbol]',
    weakMapTag = '[object WeakMap]';

var _baseClone_arrayBufferTag = '[object ArrayBuffer]',
    _baseClone_dataViewTag = '[object DataView]',
    _baseClone_float32Tag = '[object Float32Array]',
    _baseClone_float64Tag = '[object Float64Array]',
    _baseClone_int8Tag = '[object Int8Array]',
    _baseClone_int16Tag = '[object Int16Array]',
    _baseClone_int32Tag = '[object Int32Array]',
    _baseClone_uint8Tag = '[object Uint8Array]',
    _baseClone_uint8ClampedTag = '[object Uint8ClampedArray]',
    _baseClone_uint16Tag = '[object Uint16Array]',
    _baseClone_uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[argsTag] = cloneableTags[arrayTag] =
cloneableTags[_baseClone_arrayBufferTag] = cloneableTags[_baseClone_dataViewTag] =
cloneableTags[_baseClone_boolTag] = cloneableTags[_baseClone_dateTag] =
cloneableTags[_baseClone_float32Tag] = cloneableTags[_baseClone_float64Tag] =
cloneableTags[_baseClone_int8Tag] = cloneableTags[_baseClone_int16Tag] =
cloneableTags[_baseClone_int32Tag] = cloneableTags[_baseClone_mapTag] =
cloneableTags[_baseClone_numberTag] = cloneableTags[objectTag] =
cloneableTags[_baseClone_regexpTag] = cloneableTags[_baseClone_setTag] =
cloneableTags[_baseClone_stringTag] = cloneableTags[_baseClone_symbolTag] =
cloneableTags[_baseClone_uint8Tag] = cloneableTags[_baseClone_uint8ClampedTag] =
cloneableTags[_baseClone_uint16Tag] = cloneableTags[_baseClone_uint32Tag] = true;
cloneableTags[errorTag] = cloneableTags[funcTag] =
cloneableTags[weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!(0,isObject/* default */.Z)(value)) {
    return value;
  }
  var isArr = (0,isArray/* default */.Z)(value);
  if (isArr) {
    result = _initCloneArray(value);
    if (!isDeep) {
      return (0,_copyArray/* default */.Z)(value, result);
    }
  } else {
    var tag = (0,_getTag/* default */.Z)(value),
        isFunc = tag == funcTag || tag == genTag;

    if ((0,isBuffer/* default */.Z)(value)) {
      return (0,_cloneBuffer/* default */.Z)(value, isDeep);
    }
    if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : (0,_initCloneObject/* default */.Z)(value);
      if (!isDeep) {
        return isFlat
          ? _copySymbolsIn(value, _baseAssignIn(result, value))
          : _copySymbols(value, _baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _Stack/* default */.Z);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (lodash_es_isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (lodash_es_isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? _getAllKeysIn : _getAllKeys/* default */.Z)
    : (isFlat ? keysIn/* default */.Z : keys/* default */.Z);

  var props = isArr ? undefined : keysFunc(value);
  (0,_arrayEach/* default */.Z)(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    (0,_assignValue/* default */.Z)(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

/* harmony default export */ const _baseClone = (baseClone);


/***/ }),

/***/ 49811:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _baseEach)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseForOwn.js
var _baseForOwn = __webpack_require__(2693);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArrayLike.js
var isArrayLike = __webpack_require__(50585);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_createBaseEach.js


/**
 * Creates a `baseEach` or `baseEachRight` function.
 *
 * @private
 * @param {Function} eachFunc The function to iterate over a collection.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseEach(eachFunc, fromRight) {
  return function(collection, iteratee) {
    if (collection == null) {
      return collection;
    }
    if (!(0,isArrayLike/* default */.Z)(collection)) {
      return eachFunc(collection, iteratee);
    }
    var length = collection.length,
        index = fromRight ? length : -1,
        iterable = Object(collection);

    while ((fromRight ? index-- : ++index < length)) {
      if (iteratee(iterable[index], index, iterable) === false) {
        break;
      }
    }
    return collection;
  };
}

/* harmony default export */ const _createBaseEach = (createBaseEach);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseEach.js



/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = _createBaseEach(_baseForOwn/* default */.Z);

/* harmony default export */ const _baseEach = (baseEach);


/***/ }),

/***/ 21692:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (baseFindIndex);


/***/ }),

/***/ 10626:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _baseFlatten)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_arrayPush.js
var _arrayPush = __webpack_require__(58694);
// EXTERNAL MODULE: ./node_modules/lodash-es/_Symbol.js
var _Symbol = __webpack_require__(17685);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArguments.js + 1 modules
var isArguments = __webpack_require__(29169);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_isFlattenable.js




/** Built-in value references. */
var spreadableSymbol = _Symbol/* default */.Z ? _Symbol/* default.isConcatSpreadable */.Z.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return (0,isArray/* default */.Z)(value) || (0,isArguments/* default */.Z)(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/* harmony default export */ const _isFlattenable = (isFlattenable);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseFlatten.js



/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = _isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        (0,_arrayPush/* default */.Z)(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/* harmony default export */ const _baseFlatten = (baseFlatten);


/***/ }),

/***/ 2693:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _baseFor_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(61395);
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17179);



/**
 * The base implementation of `_.forOwn` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Object} Returns `object`.
 */
function baseForOwn(object, iteratee) {
  return object && (0,_baseFor_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(object, iteratee, _keys_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (baseForOwn);


/***/ }),

/***/ 13317:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _castPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22823);
/* harmony import */ var _toKey_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62281);



/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = (0,_castPath_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[(0,_toKey_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (baseGet);


/***/ }),

/***/ 63327:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _arrayPush_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(58694);
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27771);



/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return (0,_isArray_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(object) ? result : (0,_arrayPush_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(result, symbolsFunc(object));
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (baseGetAllKeys);


/***/ }),

/***/ 74765:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _baseIteratee)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_Stack.js + 5 modules
var _Stack = __webpack_require__(31667);
// EXTERNAL MODULE: ./node_modules/lodash-es/_SetCache.js + 2 modules
var _SetCache = __webpack_require__(63001);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_arraySome.js
/**
 * A specialized version of `_.some` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/* harmony default export */ const _arraySome = (arraySome);

// EXTERNAL MODULE: ./node_modules/lodash-es/_cacheHas.js
var _cacheHas = __webpack_require__(59548);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_equalArrays.js




/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `array` and `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
    return false;
  }
  // Check that cyclic values are equal.
  var arrStacked = stack.get(array);
  var othStacked = stack.get(other);
  if (arrStacked && othStacked) {
    return arrStacked == other && othStacked == array;
  }
  var index = -1,
      result = true,
      seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new _SetCache/* default */.Z : undefined;

  stack.set(array, other);
  stack.set(other, array);

  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, arrValue, index, other, array, stack)
        : customizer(arrValue, othValue, index, array, other, stack);
    }
    if (compared !== undefined) {
      if (compared) {
        continue;
      }
      result = false;
      break;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (seen) {
      if (!_arraySome(other, function(othValue, othIndex) {
            if (!(0,_cacheHas/* default */.Z)(seen, othIndex) &&
                (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
        result = false;
        break;
      }
    } else if (!(
          arrValue === othValue ||
            equalFunc(arrValue, othValue, bitmask, customizer, stack)
        )) {
      result = false;
      break;
    }
  }
  stack['delete'](array);
  stack['delete'](other);
  return result;
}

/* harmony default export */ const _equalArrays = (equalArrays);

// EXTERNAL MODULE: ./node_modules/lodash-es/_Symbol.js
var _Symbol = __webpack_require__(17685);
// EXTERNAL MODULE: ./node_modules/lodash-es/_Uint8Array.js
var _Uint8Array = __webpack_require__(84073);
// EXTERNAL MODULE: ./node_modules/lodash-es/eq.js
var eq = __webpack_require__(79651);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_mapToArray.js
/**
 * Converts `map` to its key-value pairs.
 *
 * @private
 * @param {Object} map The map to convert.
 * @returns {Array} Returns the key-value pairs.
 */
function mapToArray(map) {
  var index = -1,
      result = Array(map.size);

  map.forEach(function(value, key) {
    result[++index] = [key, value];
  });
  return result;
}

/* harmony default export */ const _mapToArray = (mapToArray);

// EXTERNAL MODULE: ./node_modules/lodash-es/_setToArray.js
var _setToArray = __webpack_require__(6545);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_equalByTag.js







/** Used to compose bitmasks for value comparisons. */
var _equalByTag_COMPARE_PARTIAL_FLAG = 1,
    _equalByTag_COMPARE_UNORDERED_FLAG = 2;

/** `Object#toString` result references. */
var boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]';

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol/* default */.Z ? _Symbol/* default.prototype */.Z.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
  switch (tag) {
    case dataViewTag:
      if ((object.byteLength != other.byteLength) ||
          (object.byteOffset != other.byteOffset)) {
        return false;
      }
      object = object.buffer;
      other = other.buffer;

    case arrayBufferTag:
      if ((object.byteLength != other.byteLength) ||
          !equalFunc(new _Uint8Array/* default */.Z(object), new _Uint8Array/* default */.Z(other))) {
        return false;
      }
      return true;

    case boolTag:
    case dateTag:
    case numberTag:
      // Coerce booleans to `1` or `0` and dates to milliseconds.
      // Invalid dates are coerced to `NaN`.
      return (0,eq/* default */.Z)(+object, +other);

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings, primitives and objects,
      // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
      // for more details.
      return object == (other + '');

    case mapTag:
      var convert = _mapToArray;

    case setTag:
      var isPartial = bitmask & _equalByTag_COMPARE_PARTIAL_FLAG;
      convert || (convert = _setToArray/* default */.Z);

      if (object.size != other.size && !isPartial) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked) {
        return stacked == other;
      }
      bitmask |= _equalByTag_COMPARE_UNORDERED_FLAG;

      // Recursively compare objects (susceptible to call stack limits).
      stack.set(object, other);
      var result = _equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
      stack['delete'](object);
      return result;

    case symbolTag:
      if (symbolValueOf) {
        return symbolValueOf.call(object) == symbolValueOf.call(other);
      }
  }
  return false;
}

/* harmony default export */ const _equalByTag = (equalByTag);

// EXTERNAL MODULE: ./node_modules/lodash-es/_getAllKeys.js
var _getAllKeys = __webpack_require__(1808);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_equalObjects.js


/** Used to compose bitmasks for value comparisons. */
var _equalObjects_COMPARE_PARTIAL_FLAG = 1;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _equalObjects_hasOwnProperty = objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} stack Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
  var isPartial = bitmask & _equalObjects_COMPARE_PARTIAL_FLAG,
      objProps = (0,_getAllKeys/* default */.Z)(object),
      objLength = objProps.length,
      othProps = (0,_getAllKeys/* default */.Z)(other),
      othLength = othProps.length;

  if (objLength != othLength && !isPartial) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isPartial ? key in other : _equalObjects_hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  // Check that cyclic values are equal.
  var objStacked = stack.get(object);
  var othStacked = stack.get(other);
  if (objStacked && othStacked) {
    return objStacked == other && othStacked == object;
  }
  var result = true;
  stack.set(object, other);
  stack.set(other, object);

  var skipCtor = isPartial;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key];

    if (customizer) {
      var compared = isPartial
        ? customizer(othValue, objValue, key, other, object, stack)
        : customizer(objValue, othValue, key, object, other, stack);
    }
    // Recursively compare objects (susceptible to call stack limits).
    if (!(compared === undefined
          ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
          : compared
        )) {
      result = false;
      break;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (result && !skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      result = false;
    }
  }
  stack['delete'](object);
  stack['delete'](other);
  return result;
}

/* harmony default export */ const _equalObjects = (equalObjects);

// EXTERNAL MODULE: ./node_modules/lodash-es/_getTag.js + 3 modules
var _getTag = __webpack_require__(83970);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
// EXTERNAL MODULE: ./node_modules/lodash-es/isBuffer.js + 1 modules
var isBuffer = __webpack_require__(77008);
// EXTERNAL MODULE: ./node_modules/lodash-es/isTypedArray.js + 1 modules
var isTypedArray = __webpack_require__(18843);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIsEqualDeep.js









/** Used to compose bitmasks for value comparisons. */
var _baseIsEqualDeep_COMPARE_PARTIAL_FLAG = 1;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    objectTag = '[object Object]';

/** Used for built-in method references. */
var _baseIsEqualDeep_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _baseIsEqualDeep_hasOwnProperty = _baseIsEqualDeep_objectProto.hasOwnProperty;

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
 * @param {Function} customizer The function to customize comparisons.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Object} [stack] Tracks traversed `object` and `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
  var objIsArr = (0,isArray/* default */.Z)(object),
      othIsArr = (0,isArray/* default */.Z)(other),
      objTag = objIsArr ? arrayTag : (0,_getTag/* default */.Z)(object),
      othTag = othIsArr ? arrayTag : (0,_getTag/* default */.Z)(other);

  objTag = objTag == argsTag ? objectTag : objTag;
  othTag = othTag == argsTag ? objectTag : othTag;

  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && (0,isBuffer/* default */.Z)(object)) {
    if (!(0,isBuffer/* default */.Z)(other)) {
      return false;
    }
    objIsArr = true;
    objIsObj = false;
  }
  if (isSameTag && !objIsObj) {
    stack || (stack = new _Stack/* default */.Z);
    return (objIsArr || (0,isTypedArray/* default */.Z)(object))
      ? _equalArrays(object, other, bitmask, customizer, equalFunc, stack)
      : _equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
  }
  if (!(bitmask & _baseIsEqualDeep_COMPARE_PARTIAL_FLAG)) {
    var objIsWrapped = objIsObj && _baseIsEqualDeep_hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && _baseIsEqualDeep_hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      var objUnwrapped = objIsWrapped ? object.value() : object,
          othUnwrapped = othIsWrapped ? other.value() : other;

      stack || (stack = new _Stack/* default */.Z);
      return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
    }
  }
  if (!isSameTag) {
    return false;
  }
  stack || (stack = new _Stack/* default */.Z);
  return _equalObjects(object, other, bitmask, customizer, equalFunc, stack);
}

/* harmony default export */ const _baseIsEqualDeep = (baseIsEqualDeep);

// EXTERNAL MODULE: ./node_modules/lodash-es/isObjectLike.js
var isObjectLike = __webpack_require__(18533);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIsEqual.js



/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!(0,isObjectLike/* default */.Z)(value) && !(0,isObjectLike/* default */.Z)(other))) {
    return value !== value && other !== other;
  }
  return _baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
}

/* harmony default export */ const _baseIsEqual = (baseIsEqual);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIsMatch.js



/** Used to compose bitmasks for value comparisons. */
var _baseIsMatch_COMPARE_PARTIAL_FLAG = 1,
    _baseIsMatch_COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.isMatch` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The object to inspect.
 * @param {Object} source The object of property values to match.
 * @param {Array} matchData The property names, values, and compare flags to match.
 * @param {Function} [customizer] The function to customize comparisons.
 * @returns {boolean} Returns `true` if `object` is a match, else `false`.
 */
function baseIsMatch(object, source, matchData, customizer) {
  var index = matchData.length,
      length = index,
      noCustomizer = !customizer;

  if (object == null) {
    return !length;
  }
  object = Object(object);
  while (index--) {
    var data = matchData[index];
    if ((noCustomizer && data[2])
          ? data[1] !== object[data[0]]
          : !(data[0] in object)
        ) {
      return false;
    }
  }
  while (++index < length) {
    data = matchData[index];
    var key = data[0],
        objValue = object[key],
        srcValue = data[1];

    if (noCustomizer && data[2]) {
      if (objValue === undefined && !(key in object)) {
        return false;
      }
    } else {
      var stack = new _Stack/* default */.Z;
      if (customizer) {
        var result = customizer(objValue, srcValue, key, object, source, stack);
      }
      if (!(result === undefined
            ? _baseIsEqual(srcValue, objValue, _baseIsMatch_COMPARE_PARTIAL_FLAG | _baseIsMatch_COMPARE_UNORDERED_FLAG, customizer, stack)
            : result
          )) {
        return false;
      }
    }
  }
  return true;
}

/* harmony default export */ const _baseIsMatch = (baseIsMatch);

// EXTERNAL MODULE: ./node_modules/lodash-es/isObject.js
var isObject = __webpack_require__(77226);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_isStrictComparable.js


/**
 * Checks if `value` is suitable for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` if suitable for strict
 *  equality comparisons, else `false`.
 */
function isStrictComparable(value) {
  return value === value && !(0,isObject/* default */.Z)(value);
}

/* harmony default export */ const _isStrictComparable = (isStrictComparable);

// EXTERNAL MODULE: ./node_modules/lodash-es/keys.js
var keys = __webpack_require__(17179);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_getMatchData.js



/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = (0,keys/* default */.Z)(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, _isStrictComparable(value)];
  }
  return result;
}

/* harmony default export */ const _getMatchData = (getMatchData);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_matchesStrictComparable.js
/**
 * A specialized version of `matchesProperty` for source values suitable
 * for strict equality comparisons, i.e. `===`.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function matchesStrictComparable(key, srcValue) {
  return function(object) {
    if (object == null) {
      return false;
    }
    return object[key] === srcValue &&
      (srcValue !== undefined || (key in Object(object)));
  };
}

/* harmony default export */ const _matchesStrictComparable = (matchesStrictComparable);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseMatches.js




/**
 * The base implementation of `_.matches` which doesn't clone `source`.
 *
 * @private
 * @param {Object} source The object of property values to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatches(source) {
  var matchData = _getMatchData(source);
  if (matchData.length == 1 && matchData[0][2]) {
    return _matchesStrictComparable(matchData[0][0], matchData[0][1]);
  }
  return function(object) {
    return object === source || _baseIsMatch(object, source, matchData);
  };
}

/* harmony default export */ const _baseMatches = (baseMatches);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseGet.js
var _baseGet = __webpack_require__(13317);
;// CONCATENATED MODULE: ./node_modules/lodash-es/get.js


/**
 * Gets the value at `path` of `object`. If the resolved value is
 * `undefined`, the `defaultValue` is returned in its place.
 *
 * @static
 * @memberOf _
 * @since 3.7.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @param {*} [defaultValue] The value returned for `undefined` resolved values.
 * @returns {*} Returns the resolved value.
 * @example
 *
 * var object = { 'a': [{ 'b': { 'c': 3 } }] };
 *
 * _.get(object, 'a[0].b.c');
 * // => 3
 *
 * _.get(object, ['a', '0', 'b', 'c']);
 * // => 3
 *
 * _.get(object, 'a.b.c', 'default');
 * // => 'default'
 */
function get(object, path, defaultValue) {
  var result = object == null ? undefined : (0,_baseGet/* default */.Z)(object, path);
  return result === undefined ? defaultValue : result;
}

/* harmony default export */ const lodash_es_get = (get);

// EXTERNAL MODULE: ./node_modules/lodash-es/hasIn.js + 1 modules
var hasIn = __webpack_require__(75487);
// EXTERNAL MODULE: ./node_modules/lodash-es/_isKey.js
var _isKey = __webpack_require__(99365);
// EXTERNAL MODULE: ./node_modules/lodash-es/_toKey.js
var _toKey = __webpack_require__(62281);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseMatchesProperty.js








/** Used to compose bitmasks for value comparisons. */
var _baseMatchesProperty_COMPARE_PARTIAL_FLAG = 1,
    _baseMatchesProperty_COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if ((0,_isKey/* default */.Z)(path) && _isStrictComparable(srcValue)) {
    return _matchesStrictComparable((0,_toKey/* default */.Z)(path), srcValue);
  }
  return function(object) {
    var objValue = lodash_es_get(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? (0,hasIn/* default */.Z)(object, path)
      : _baseIsEqual(srcValue, objValue, _baseMatchesProperty_COMPARE_PARTIAL_FLAG | _baseMatchesProperty_COMPARE_UNORDERED_FLAG);
  };
}

/* harmony default export */ const _baseMatchesProperty = (baseMatchesProperty);

// EXTERNAL MODULE: ./node_modules/lodash-es/identity.js
var identity = __webpack_require__(69203);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseProperty.js
var _baseProperty = __webpack_require__(54193);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_basePropertyDeep.js


/**
 * A specialized version of `baseProperty` which supports deep paths.
 *
 * @private
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function basePropertyDeep(path) {
  return function(object) {
    return (0,_baseGet/* default */.Z)(object, path);
  };
}

/* harmony default export */ const _basePropertyDeep = (basePropertyDeep);

;// CONCATENATED MODULE: ./node_modules/lodash-es/property.js





/**
 * Creates a function that returns the value at `path` of a given object.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {Array|string} path The path of the property to get.
 * @returns {Function} Returns the new accessor function.
 * @example
 *
 * var objects = [
 *   { 'a': { 'b': 2 } },
 *   { 'a': { 'b': 1 } }
 * ];
 *
 * _.map(objects, _.property('a.b'));
 * // => [2, 1]
 *
 * _.map(_.sortBy(objects, _.property(['a', 'b'])), 'a.b');
 * // => [1, 2]
 */
function property(path) {
  return (0,_isKey/* default */.Z)(path) ? (0,_baseProperty/* default */.Z)((0,_toKey/* default */.Z)(path)) : _basePropertyDeep(path);
}

/* harmony default export */ const lodash_es_property = (property);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseIteratee.js






/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return identity/* default */.Z;
  }
  if (typeof value == 'object') {
    return (0,isArray/* default */.Z)(value)
      ? _baseMatchesProperty(value[0], value[1])
      : _baseMatches(value);
  }
  return lodash_es_property(value);
}

/* harmony default export */ const _baseIteratee = (baseIteratee);


/***/ }),

/***/ 21018:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _baseEach_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(49811);
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(50585);



/**
 * The base implementation of `_.map` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function baseMap(collection, iteratee) {
  var index = -1,
      result = (0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(collection) ? Array(collection.length) : [];

  (0,_baseEach_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(collection, function(value, key, collection) {
    result[++index] = iteratee(value, key, collection);
  });
  return result;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (baseMap);


/***/ }),

/***/ 54193:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new accessor function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (baseProperty);


/***/ }),

/***/ 59548:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (cacheHas);


/***/ }),

/***/ 68882:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _identity_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(69203);


/**
 * Casts `value` to `identity` if it's not a function.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {Function} Returns cast function.
 */
function castFunction(value) {
  return typeof value == 'function' ? value : _identity_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (castFunction);


/***/ }),

/***/ 22823:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ _castPath)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
// EXTERNAL MODULE: ./node_modules/lodash-es/_isKey.js
var _isKey = __webpack_require__(99365);
// EXTERNAL MODULE: ./node_modules/lodash-es/memoize.js
var memoize = __webpack_require__(42454);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_memoizeCapped.js


/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = (0,memoize/* default */.Z)(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

/* harmony default export */ const _memoizeCapped = (memoizeCapped);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_stringToPath.js


/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = _memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/* harmony default export */ const _stringToPath = (stringToPath);

// EXTERNAL MODULE: ./node_modules/lodash-es/toString.js + 1 modules
var lodash_es_toString = __webpack_require__(50751);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_castPath.js





/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if ((0,isArray/* default */.Z)(value)) {
    return value;
  }
  return (0,_isKey/* default */.Z)(value, object) ? [value] : _stringToPath((0,lodash_es_toString/* default */.Z)(value));
}

/* harmony default export */ const _castPath = (castPath);


/***/ }),

/***/ 1808:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _baseGetAllKeys_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(63327);
/* harmony import */ var _getSymbols_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(95695);
/* harmony import */ var _keys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(17179);




/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return (0,_baseGetAllKeys_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(object, _keys_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z, _getSymbols_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getAllKeys);


/***/ }),

/***/ 95695:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _arrayFilter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(68774);
/* harmony import */ var _stubArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(60532);



/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? _stubArray_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return (0,_arrayFilter_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(nativeGetSymbols(object), function(symbol) {
    return propertyIsEnumerable.call(object, symbol);
  });
};

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (getSymbols);


/***/ }),

/***/ 16174:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _castPath_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(22823);
/* harmony import */ var _isArguments_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(29169);
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(27771);
/* harmony import */ var _isIndex_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(56009);
/* harmony import */ var _isLength_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(1656);
/* harmony import */ var _toKey_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(62281);







/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = (0,_castPath_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = (0,_toKey_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && (0,_isLength_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)(length) && (0,_isIndex_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z)(key, length) &&
    ((0,_isArray_js__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z)(object) || (0,_isArguments_js__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z)(object));
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (hasPath);


/***/ }),

/***/ 99365:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27771);
/* harmony import */ var _isSymbol_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(72714);



/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if ((0,_isArray_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || (0,_isSymbol_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isKey);


/***/ }),

/***/ 6545:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (setToArray);


/***/ }),

/***/ 62281:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _isSymbol_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(72714);


/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || (0,_isSymbol_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (toKey);


/***/ }),

/***/ 92346:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _baseClone_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(48451);


/** Used to compose bitmasks for cloning. */
var CLONE_SYMBOLS_FLAG = 4;

/**
 * Creates a shallow clone of `value`.
 *
 * **Note:** This method is loosely based on the
 * [structured clone algorithm](https://mdn.io/Structured_clone_algorithm)
 * and supports cloning arrays, array buffers, booleans, date objects, maps,
 * numbers, `Object` objects, regexes, sets, strings, symbols, and typed
 * arrays. The own enumerable properties of `arguments` objects are cloned
 * as plain objects. An empty object is returned for uncloneable values such
 * as error objects, functions, DOM nodes, and WeakMaps.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to clone.
 * @returns {*} Returns the cloned value.
 * @see _.cloneDeep
 * @example
 *
 * var objects = [{ 'a': 1 }, { 'b': 2 }];
 *
 * var shallow = _.clone(objects);
 * console.log(shallow[0] === objects[0]);
 * // => true
 */
function clone(value) {
  return (0,_baseClone_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(value, CLONE_SYMBOLS_FLAG);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (clone);


/***/ }),

/***/ 3688:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _baseRest_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(69581);
/* harmony import */ var _eq_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(79651);
/* harmony import */ var _isIterateeCall_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(50439);
/* harmony import */ var _keysIn_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(32957);





/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Assigns own and inherited enumerable string keyed properties of source
 * objects to the destination object for all destination properties that
 * resolve to `undefined`. Source objects are applied from left to right.
 * Once a property is set, additional values of the same property are ignored.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.defaultsDeep
 * @example
 *
 * _.defaults({ 'a': 1 }, { 'b': 2 }, { 'a': 3 });
 * // => { 'a': 1, 'b': 2 }
 */
var defaults = (0,_baseRest_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(function(object, sources) {
  object = Object(object);

  var index = -1;
  var length = sources.length;
  var guard = length > 2 ? sources[2] : undefined;

  if (guard && (0,_isIterateeCall_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(sources[0], sources[1], guard)) {
    length = 1;
  }

  while (++index < length) {
    var source = sources[index];
    var props = (0,_keysIn_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)(source);
    var propsIndex = -1;
    var propsLength = props.length;

    while (++propsIndex < propsLength) {
      var key = props[propsIndex];
      var value = object[key];

      if (value === undefined ||
          ((0,_eq_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z)(value, objectProto[key]) && !hasOwnProperty.call(object, key))) {
        object[key] = source[key];
      }
    }
  }

  return object;
});

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (defaults);


/***/ }),

/***/ 13445:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_filter)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_arrayFilter.js
var _arrayFilter = __webpack_require__(68774);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseEach.js + 1 modules
var _baseEach = __webpack_require__(49811);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseFilter.js


/**
 * The base implementation of `_.filter` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function baseFilter(collection, predicate) {
  var result = [];
  (0,_baseEach/* default */.Z)(collection, function(value, index, collection) {
    if (predicate(value, index, collection)) {
      result.push(value);
    }
  });
  return result;
}

/* harmony default export */ const _baseFilter = (baseFilter);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseIteratee.js + 16 modules
var _baseIteratee = __webpack_require__(74765);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
;// CONCATENATED MODULE: ./node_modules/lodash-es/filter.js





/**
 * Iterates over elements of `collection`, returning an array of all elements
 * `predicate` returns truthy for. The predicate is invoked with three
 * arguments: (value, index|key, collection).
 *
 * **Note:** Unlike `_.remove`, this method returns a new array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [predicate=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 * @see _.reject
 * @example
 *
 * var users = [
 *   { 'user': 'barney', 'age': 36, 'active': true },
 *   { 'user': 'fred',   'age': 40, 'active': false }
 * ];
 *
 * _.filter(users, function(o) { return !o.active; });
 * // => objects for ['fred']
 *
 * // The `_.matches` iteratee shorthand.
 * _.filter(users, { 'age': 36, 'active': true });
 * // => objects for ['barney']
 *
 * // The `_.matchesProperty` iteratee shorthand.
 * _.filter(users, ['active', false]);
 * // => objects for ['fred']
 *
 * // The `_.property` iteratee shorthand.
 * _.filter(users, 'active');
 * // => objects for ['barney']
 *
 * // Combining several predicates using `_.overEvery` or `_.overSome`.
 * _.filter(users, _.overSome([{ 'age': 36 }, ['age', 40]]));
 * // => objects for ['fred', 'barney']
 */
function filter(collection, predicate) {
  var func = (0,isArray/* default */.Z)(collection) ? _arrayFilter/* default */.Z : _baseFilter;
  return func(collection, (0,_baseIteratee/* default */.Z)(predicate, 3));
}

/* harmony default export */ const lodash_es_filter = (filter);


/***/ }),

/***/ 27961:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _baseFlatten_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(10626);


/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? (0,_baseFlatten_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(array, 1) : [];
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (flatten);


/***/ }),

/***/ 70870:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _arrayEach_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(76579);
/* harmony import */ var _baseEach_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(49811);
/* harmony import */ var _castFunction_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(68882);
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27771);





/**
 * Iterates over elements of `collection` and invokes `iteratee` for each element.
 * The iteratee is invoked with three arguments: (value, index|key, collection).
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * **Note:** As with other "Collections" methods, objects with a "length"
 * property are iterated like arrays. To avoid this behavior use `_.forIn`
 * or `_.forOwn` for object iteration.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @alias each
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 * @see _.forEachRight
 * @example
 *
 * _.forEach([1, 2], function(value) {
 *   console.log(value);
 * });
 * // => Logs `1` then `2`.
 *
 * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
 *   console.log(key);
 * });
 * // => Logs 'a' then 'b' (iteration order is not guaranteed).
 */
function forEach(collection, iteratee) {
  var func = (0,_isArray_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(collection) ? _arrayEach_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z : _baseEach_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z;
  return func(collection, (0,_castFunction_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z)(iteratee));
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (forEach);


/***/ }),

/***/ 75487:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_hasIn)
});

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseHasIn.js
/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/* harmony default export */ const _baseHasIn = (baseHasIn);

// EXTERNAL MODULE: ./node_modules/lodash-es/_hasPath.js
var _hasPath = __webpack_require__(16174);
;// CONCATENATED MODULE: ./node_modules/lodash-es/hasIn.js



/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && (0,_hasPath/* default */.Z)(object, path, _baseHasIn);
}

/* harmony default export */ const lodash_es_hasIn = (hasIn);


/***/ }),

/***/ 72714:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _baseGetTag_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(93589);
/* harmony import */ var _isObjectLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(18533);



/** `Object#toString` result references. */
var symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    ((0,_isObjectLike_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(value) && (0,_baseGetTag_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(value) == symbolTag);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isSymbol);


/***/ }),

/***/ 49360:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * Checks if `value` is `undefined`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `undefined`, else `false`.
 * @example
 *
 * _.isUndefined(void 0);
 * // => true
 *
 * _.isUndefined(null);
 * // => false
 */
function isUndefined(value) {
  return value === undefined;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (isUndefined);


/***/ }),

/***/ 17179:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _arrayLikeKeys_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(87668);
/* harmony import */ var _baseKeys_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(39473);
/* harmony import */ var _isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(50585);




/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return (0,_isArrayLike_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(object) ? (0,_arrayLikeKeys_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z)(object) : (0,_baseKeys_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z)(object);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (keys);


/***/ }),

/***/ 43836:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _arrayMap_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(74073);
/* harmony import */ var _baseIteratee_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(74765);
/* harmony import */ var _baseMap_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(21018);
/* harmony import */ var _isArray_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(27771);





/**
 * Creates an array of values by running each element in `collection` thru
 * `iteratee`. The iteratee is invoked with three arguments:
 * (value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
 *
 * The guarded methods are:
 * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
 * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
 * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
 * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 * @example
 *
 * function square(n) {
 *   return n * n;
 * }
 *
 * _.map([4, 8], square);
 * // => [16, 64]
 *
 * _.map({ 'a': 4, 'b': 8 }, square);
 * // => [16, 64] (iteration order is not guaranteed)
 *
 * var users = [
 *   { 'user': 'barney' },
 *   { 'user': 'fred' }
 * ];
 *
 * // The `_.property` iteratee shorthand.
 * _.map(users, 'user');
 * // => ['barney', 'fred']
 */
function map(collection, iteratee) {
  var func = (0,_isArray_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(collection) ? _arrayMap_js__WEBPACK_IMPORTED_MODULE_1__/* ["default"] */ .Z : _baseMap_js__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z;
  return func(collection, (0,_baseIteratee_js__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z)(iteratee, 3));
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (map);


/***/ }),

/***/ 61666:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_pick)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseGet.js
var _baseGet = __webpack_require__(13317);
// EXTERNAL MODULE: ./node_modules/lodash-es/_assignValue.js
var _assignValue = __webpack_require__(72954);
// EXTERNAL MODULE: ./node_modules/lodash-es/_castPath.js + 2 modules
var _castPath = __webpack_require__(22823);
// EXTERNAL MODULE: ./node_modules/lodash-es/_isIndex.js
var _isIndex = __webpack_require__(56009);
// EXTERNAL MODULE: ./node_modules/lodash-es/isObject.js
var isObject = __webpack_require__(77226);
// EXTERNAL MODULE: ./node_modules/lodash-es/_toKey.js
var _toKey = __webpack_require__(62281);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseSet.js






/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!(0,isObject/* default */.Z)(object)) {
    return object;
  }
  path = (0,_castPath/* default */.Z)(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = (0,_toKey/* default */.Z)(path[index]),
        newValue = value;

    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return object;
    }

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = (0,isObject/* default */.Z)(objValue)
          ? objValue
          : ((0,_isIndex/* default */.Z)(path[index + 1]) ? [] : {});
      }
    }
    (0,_assignValue/* default */.Z)(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

/* harmony default export */ const _baseSet = (baseSet);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_basePickBy.js




/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = (0,_baseGet/* default */.Z)(object, path);

    if (predicate(value, path)) {
      _baseSet(result, (0,_castPath/* default */.Z)(path, object), value);
    }
  }
  return result;
}

/* harmony default export */ const _basePickBy = (basePickBy);

// EXTERNAL MODULE: ./node_modules/lodash-es/hasIn.js + 1 modules
var hasIn = __webpack_require__(75487);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_basePick.js



/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, paths) {
  return _basePickBy(object, paths, function(value, path) {
    return (0,hasIn/* default */.Z)(object, path);
  });
}

/* harmony default export */ const _basePick = (basePick);

// EXTERNAL MODULE: ./node_modules/lodash-es/flatten.js
var flatten = __webpack_require__(27961);
// EXTERNAL MODULE: ./node_modules/lodash-es/_overRest.js + 1 modules
var _overRest = __webpack_require__(81211);
// EXTERNAL MODULE: ./node_modules/lodash-es/_setToString.js + 2 modules
var _setToString = __webpack_require__(27227);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_flatRest.js




/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
function flatRest(func) {
  return (0,_setToString/* default */.Z)((0,_overRest/* default */.Z)(func, undefined, flatten/* default */.Z), func + '');
}

/* harmony default export */ const _flatRest = (flatRest);

;// CONCATENATED MODULE: ./node_modules/lodash-es/pick.js



/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = _flatRest(function(object, paths) {
  return object == null ? {} : _basePick(object, paths);
});

/* harmony default export */ const lodash_es_pick = (pick);


/***/ }),

/***/ 74379:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_range)
});

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseRange.js
/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeCeil = Math.ceil,
    nativeMax = Math.max;

/**
 * The base implementation of `_.range` and `_.rangeRight` which doesn't
 * coerce arguments.
 *
 * @private
 * @param {number} start The start of the range.
 * @param {number} end The end of the range.
 * @param {number} step The value to increment or decrement by.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Array} Returns the range of numbers.
 */
function baseRange(start, end, step, fromRight) {
  var index = -1,
      length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
      result = Array(length);

  while (length--) {
    result[fromRight ? length : ++index] = start;
    start += step;
  }
  return result;
}

/* harmony default export */ const _baseRange = (baseRange);

// EXTERNAL MODULE: ./node_modules/lodash-es/_isIterateeCall.js
var _isIterateeCall = __webpack_require__(50439);
// EXTERNAL MODULE: ./node_modules/lodash-es/toFinite.js + 3 modules
var toFinite = __webpack_require__(94099);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_createRange.js




/**
 * Creates a `_.range` or `_.rangeRight` function.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new range function.
 */
function createRange(fromRight) {
  return function(start, end, step) {
    if (step && typeof step != 'number' && (0,_isIterateeCall/* default */.Z)(start, end, step)) {
      end = step = undefined;
    }
    // Ensure the sign of `-0` is preserved.
    start = (0,toFinite/* default */.Z)(start);
    if (end === undefined) {
      end = start;
      start = 0;
    } else {
      end = (0,toFinite/* default */.Z)(end);
    }
    step = step === undefined ? (start < end ? 1 : -1) : (0,toFinite/* default */.Z)(step);
    return _baseRange(start, end, step, fromRight);
  };
}

/* harmony default export */ const _createRange = (createRange);

;// CONCATENATED MODULE: ./node_modules/lodash-es/range.js


/**
 * Creates an array of numbers (positive and/or negative) progressing from
 * `start` up to, but not including, `end`. A step of `-1` is used if a negative
 * `start` is specified without an `end` or `step`. If `end` is not specified,
 * it's set to `start` with `start` then set to `0`.
 *
 * **Note:** JavaScript follows the IEEE-754 standard for resolving
 * floating-point values which can produce unexpected results.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {number} [start=0] The start of the range.
 * @param {number} end The end of the range.
 * @param {number} [step=1] The value to increment or decrement by.
 * @returns {Array} Returns the range of numbers.
 * @see _.inRange, _.rangeRight
 * @example
 *
 * _.range(4);
 * // => [0, 1, 2, 3]
 *
 * _.range(-4);
 * // => [0, -1, -2, -3]
 *
 * _.range(1, 5);
 * // => [1, 2, 3, 4]
 *
 * _.range(0, 20, 5);
 * // => [0, 5, 10, 15]
 *
 * _.range(0, -4, -1);
 * // => [0, -1, -2, -3]
 *
 * _.range(1, 4, 0);
 * // => [1, 1, 1]
 *
 * _.range(0);
 * // => []
 */
var range = _createRange();

/* harmony default export */ const lodash_es_range = (range);


/***/ }),

/***/ 92344:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_reduce)
});

;// CONCATENATED MODULE: ./node_modules/lodash-es/_arrayReduce.js
/**
 * A specialized version of `_.reduce` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @param {boolean} [initAccum] Specify using the first element of `array` as
 *  the initial value.
 * @returns {*} Returns the accumulated value.
 */
function arrayReduce(array, iteratee, accumulator, initAccum) {
  var index = -1,
      length = array == null ? 0 : array.length;

  if (initAccum && length) {
    accumulator = array[++index];
  }
  while (++index < length) {
    accumulator = iteratee(accumulator, array[index], index, array);
  }
  return accumulator;
}

/* harmony default export */ const _arrayReduce = (arrayReduce);

// EXTERNAL MODULE: ./node_modules/lodash-es/_baseEach.js + 1 modules
var _baseEach = __webpack_require__(49811);
// EXTERNAL MODULE: ./node_modules/lodash-es/_baseIteratee.js + 16 modules
var _baseIteratee = __webpack_require__(74765);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseReduce.js
/**
 * The base implementation of `_.reduce` and `_.reduceRight`, without support
 * for iteratee shorthands, which iterates over `collection` using `eachFunc`.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {*} accumulator The initial value.
 * @param {boolean} initAccum Specify using the first or last element of
 *  `collection` as the initial value.
 * @param {Function} eachFunc The function to iterate over `collection`.
 * @returns {*} Returns the accumulated value.
 */
function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
  eachFunc(collection, function(value, index, collection) {
    accumulator = initAccum
      ? (initAccum = false, value)
      : iteratee(accumulator, value, index, collection);
  });
  return accumulator;
}

/* harmony default export */ const _baseReduce = (baseReduce);

// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
;// CONCATENATED MODULE: ./node_modules/lodash-es/reduce.js






/**
 * Reduces `collection` to a value which is the accumulated result of running
 * each element in `collection` thru `iteratee`, where each successive
 * invocation is supplied the return value of the previous. If `accumulator`
 * is not given, the first element of `collection` is used as the initial
 * value. The iteratee is invoked with four arguments:
 * (accumulator, value, index|key, collection).
 *
 * Many lodash methods are guarded to work as iteratees for methods like
 * `_.reduce`, `_.reduceRight`, and `_.transform`.
 *
 * The guarded methods are:
 * `assign`, `defaults`, `defaultsDeep`, `includes`, `merge`, `orderBy`,
 * and `sortBy`
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Collection
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} [iteratee=_.identity] The function invoked per iteration.
 * @param {*} [accumulator] The initial value.
 * @returns {*} Returns the accumulated value.
 * @see _.reduceRight
 * @example
 *
 * _.reduce([1, 2], function(sum, n) {
 *   return sum + n;
 * }, 0);
 * // => 3
 *
 * _.reduce({ 'a': 1, 'b': 2, 'c': 1 }, function(result, value, key) {
 *   (result[value] || (result[value] = [])).push(key);
 *   return result;
 * }, {});
 * // => { '1': ['a', 'c'], '2': ['b'] } (iteration order is not guaranteed)
 */
function reduce(collection, iteratee, accumulator) {
  var func = (0,isArray/* default */.Z)(collection) ? _arrayReduce : _baseReduce,
      initAccum = arguments.length < 3;

  return func(collection, (0,_baseIteratee/* default */.Z)(iteratee, 4), accumulator, initAccum, _baseEach/* default */.Z);
}

/* harmony default export */ const lodash_es_reduce = (reduce);


/***/ }),

/***/ 60532:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stubArray);


/***/ }),

/***/ 94099:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_toFinite)
});

;// CONCATENATED MODULE: ./node_modules/lodash-es/_trimmedEndIndex.js
/** Used to match a single whitespace character. */
var reWhitespace = /\s/;

/**
 * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
 * character of `string`.
 *
 * @private
 * @param {string} string The string to inspect.
 * @returns {number} Returns the index of the last non-whitespace character.
 */
function trimmedEndIndex(string) {
  var index = string.length;

  while (index-- && reWhitespace.test(string.charAt(index))) {}
  return index;
}

/* harmony default export */ const _trimmedEndIndex = (trimmedEndIndex);

;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseTrim.js


/** Used to match leading whitespace. */
var reTrimStart = /^\s+/;

/**
 * The base implementation of `_.trim`.
 *
 * @private
 * @param {string} string The string to trim.
 * @returns {string} Returns the trimmed string.
 */
function baseTrim(string) {
  return string
    ? string.slice(0, _trimmedEndIndex(string) + 1).replace(reTrimStart, '')
    : string;
}

/* harmony default export */ const _baseTrim = (baseTrim);

// EXTERNAL MODULE: ./node_modules/lodash-es/isObject.js
var isObject = __webpack_require__(77226);
// EXTERNAL MODULE: ./node_modules/lodash-es/isSymbol.js
var isSymbol = __webpack_require__(72714);
;// CONCATENATED MODULE: ./node_modules/lodash-es/toNumber.js




/** Used as references for various `Number` constants. */
var NAN = 0 / 0;

/** Used to detect bad signed hexadecimal string values. */
var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

/** Used to detect binary string values. */
var reIsBinary = /^0b[01]+$/i;

/** Used to detect octal string values. */
var reIsOctal = /^0o[0-7]+$/i;

/** Built-in method references without a dependency on `root`. */
var freeParseInt = parseInt;

/**
 * Converts `value` to a number.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to process.
 * @returns {number} Returns the number.
 * @example
 *
 * _.toNumber(3.2);
 * // => 3.2
 *
 * _.toNumber(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toNumber(Infinity);
 * // => Infinity
 *
 * _.toNumber('3.2');
 * // => 3.2
 */
function toNumber(value) {
  if (typeof value == 'number') {
    return value;
  }
  if ((0,isSymbol/* default */.Z)(value)) {
    return NAN;
  }
  if ((0,isObject/* default */.Z)(value)) {
    var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
    value = (0,isObject/* default */.Z)(other) ? (other + '') : other;
  }
  if (typeof value != 'string') {
    return value === 0 ? value : +value;
  }
  value = _baseTrim(value);
  var isBinary = reIsBinary.test(value);
  return (isBinary || reIsOctal.test(value))
    ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
    : (reIsBadHex.test(value) ? NAN : +value);
}

/* harmony default export */ const lodash_es_toNumber = (toNumber);

;// CONCATENATED MODULE: ./node_modules/lodash-es/toFinite.js


/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0,
    MAX_INTEGER = 1.7976931348623157e+308;

/**
 * Converts `value` to a finite number.
 *
 * @static
 * @memberOf _
 * @since 4.12.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {number} Returns the converted number.
 * @example
 *
 * _.toFinite(3.2);
 * // => 3.2
 *
 * _.toFinite(Number.MIN_VALUE);
 * // => 5e-324
 *
 * _.toFinite(Infinity);
 * // => 1.7976931348623157e+308
 *
 * _.toFinite('3.2');
 * // => 3.2
 */
function toFinite(value) {
  if (!value) {
    return value === 0 ? value : 0;
  }
  value = lodash_es_toNumber(value);
  if (value === INFINITY || value === -INFINITY) {
    var sign = (value < 0 ? -1 : 1);
    return sign * MAX_INTEGER;
  }
  return value === value ? value : 0;
}

/* harmony default export */ const lodash_es_toFinite = (toFinite);


/***/ }),

/***/ 50751:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_toString)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_Symbol.js
var _Symbol = __webpack_require__(17685);
// EXTERNAL MODULE: ./node_modules/lodash-es/_arrayMap.js
var _arrayMap = __webpack_require__(74073);
// EXTERNAL MODULE: ./node_modules/lodash-es/isArray.js
var isArray = __webpack_require__(27771);
// EXTERNAL MODULE: ./node_modules/lodash-es/isSymbol.js
var isSymbol = __webpack_require__(72714);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseToString.js





/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol/* default */.Z ? _Symbol/* default.prototype */.Z.prototype : undefined,
    symbolToString = symbolProto ? symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if ((0,isArray/* default */.Z)(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return (0,_arrayMap/* default */.Z)(value, baseToString) + '';
  }
  if ((0,isSymbol/* default */.Z)(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/* harmony default export */ const _baseToString = (baseToString);

;// CONCATENATED MODULE: ./node_modules/lodash-es/toString.js


/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString_toString(value) {
  return value == null ? '' : _baseToString(value);
}

/* harmony default export */ const lodash_es_toString = (toString_toString);


/***/ }),

/***/ 66749:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _toString_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(50751);


/** Used to generate unique IDs. */
var idCounter = 0;

/**
 * Generates a unique ID. If `prefix` is given, the ID is appended to it.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {string} [prefix=''] The value to prefix the ID with.
 * @returns {string} Returns the unique ID.
 * @example
 *
 * _.uniqueId('contact_');
 * // => 'contact_104'
 *
 * _.uniqueId();
 * // => '105'
 */
function uniqueId(prefix) {
  var id = ++idCounter;
  return (0,_toString_js__WEBPACK_IMPORTED_MODULE_0__/* ["default"] */ .Z)(prefix) + id;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (uniqueId);


/***/ }),

/***/ 34148:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "Z": () => (/* binding */ lodash_es_values)
});

// EXTERNAL MODULE: ./node_modules/lodash-es/_arrayMap.js
var _arrayMap = __webpack_require__(74073);
;// CONCATENATED MODULE: ./node_modules/lodash-es/_baseValues.js


/**
 * The base implementation of `_.values` and `_.valuesIn` which creates an
 * array of `object` property values corresponding to the property names
 * of `props`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} props The property names to get values for.
 * @returns {Object} Returns the array of property values.
 */
function baseValues(object, props) {
  return (0,_arrayMap/* default */.Z)(props, function(key) {
    return object[key];
  });
}

/* harmony default export */ const _baseValues = (baseValues);

// EXTERNAL MODULE: ./node_modules/lodash-es/keys.js
var keys = __webpack_require__(17179);
;// CONCATENATED MODULE: ./node_modules/lodash-es/values.js



/**
 * Creates an array of the own enumerable string keyed property values of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property values.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.values(new Foo);
 * // => [1, 2] (iteration order is not guaranteed)
 *
 * _.values('hi');
 * // => ['h', 'i']
 */
function values(object) {
  return object == null ? [] : _baseValues(object, (0,keys/* default */.Z)(object));
}

/* harmony default export */ const lodash_es_values = (values);


/***/ }),

/***/ 28540:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "a": () => (/* binding */ createText),
  "c": () => (/* binding */ computeDimensionOfText)
});

// EXTERNAL MODULE: ./node_modules/mermaid/dist/mermaid-7ea9cbd6.js + 8 modules
var mermaid_7ea9cbd6 = __webpack_require__(93883);
// EXTERNAL MODULE: ./node_modules/mdast-util-to-string/index.js
var mdast_util_to_string = __webpack_require__(42195);
// EXTERNAL MODULE: ./node_modules/micromark/lib/parse.js + 32 modules
var parse = __webpack_require__(80787);
// EXTERNAL MODULE: ./node_modules/micromark/lib/preprocess.js
var preprocess = __webpack_require__(15483);
// EXTERNAL MODULE: ./node_modules/micromark/lib/postprocess.js
var postprocess = __webpack_require__(22373);
// EXTERNAL MODULE: ./node_modules/micromark-util-decode-numeric-character-reference/index.js
var micromark_util_decode_numeric_character_reference = __webpack_require__(80889);
// EXTERNAL MODULE: ./node_modules/micromark-util-decode-string/index.js
var micromark_util_decode_string = __webpack_require__(47881);
// EXTERNAL MODULE: ./node_modules/micromark-util-normalize-identifier/index.js
var micromark_util_normalize_identifier = __webpack_require__(11098);
// EXTERNAL MODULE: ./node_modules/decode-named-character-reference/index.js + 1 modules
var decode_named_character_reference = __webpack_require__(26560);
// EXTERNAL MODULE: ./node_modules/unist-util-stringify-position/index.js
var unist_util_stringify_position = __webpack_require__(16343);
;// CONCATENATED MODULE: ./node_modules/mermaid/node_modules/mdast-util-from-markdown/lib/index.js
/**
 * @typedef {import('micromark-util-types').Encoding} Encoding
 * @typedef {import('micromark-util-types').Event} Event
 * @typedef {import('micromark-util-types').ParseOptions} ParseOptions
 * @typedef {import('micromark-util-types').Token} Token
 * @typedef {import('micromark-util-types').TokenizeContext} TokenizeContext
 * @typedef {import('micromark-util-types').Value} Value
 *
 * @typedef {import('unist').Parent} UnistParent
 * @typedef {import('unist').Point} Point
 *
 * @typedef {import('mdast').PhrasingContent} PhrasingContent
 * @typedef {import('mdast').StaticPhrasingContent} StaticPhrasingContent
 * @typedef {import('mdast').Content} Content
 * @typedef {import('mdast').Break} Break
 * @typedef {import('mdast').Blockquote} Blockquote
 * @typedef {import('mdast').Code} Code
 * @typedef {import('mdast').Definition} Definition
 * @typedef {import('mdast').Emphasis} Emphasis
 * @typedef {import('mdast').Heading} Heading
 * @typedef {import('mdast').HTML} HTML
 * @typedef {import('mdast').Image} Image
 * @typedef {import('mdast').ImageReference} ImageReference
 * @typedef {import('mdast').InlineCode} InlineCode
 * @typedef {import('mdast').Link} Link
 * @typedef {import('mdast').LinkReference} LinkReference
 * @typedef {import('mdast').List} List
 * @typedef {import('mdast').ListItem} ListItem
 * @typedef {import('mdast').Paragraph} Paragraph
 * @typedef {import('mdast').Root} Root
 * @typedef {import('mdast').Strong} Strong
 * @typedef {import('mdast').Text} Text
 * @typedef {import('mdast').ThematicBreak} ThematicBreak
 * @typedef {import('mdast').ReferenceType} ReferenceType
 * @typedef {import('../index.js').CompileData} CompileData
 */

/**
 * @typedef {Root | Content} Node
 * @typedef {Extract<Node, UnistParent>} Parent
 *
 * @typedef {Omit<UnistParent, 'type' | 'children'> & {type: 'fragment', children: Array<PhrasingContent>}} Fragment
 */

/**
 * @callback Transform
 *   Extra transform, to change the AST afterwards.
 * @param {Root} tree
 *   Tree to transform.
 * @returns {Root | undefined | null | void}
 *   New tree or nothing (in which case the current tree is used).
 *
 * @callback Handle
 *   Handle a token.
 * @param {CompileContext} this
 *   Context.
 * @param {Token} token
 *   Current token.
 * @returns {void}
 *   Nothing.
 *
 * @typedef {Record<string, Handle>} Handles
 *   Token types mapping to handles
 *
 * @callback OnEnterError
 *   Handle the case where the `right` token is open, but it is closed (by the
 *   `left` token) or because we reached the end of the document.
 * @param {Omit<CompileContext, 'sliceSerialize'>} this
 *   Context.
 * @param {Token | undefined} left
 *   Left token.
 * @param {Token} right
 *   Right token.
 * @returns {void}
 *   Nothing.
 *
 * @callback OnExitError
 *   Handle the case where the `right` token is open but it is closed by
 *   exiting the `left` token.
 * @param {Omit<CompileContext, 'sliceSerialize'>} this
 *   Context.
 * @param {Token} left
 *   Left token.
 * @param {Token} right
 *   Right token.
 * @returns {void}
 *   Nothing.
 *
 * @typedef {[Token, OnEnterError | undefined]} TokenTuple
 *   Open token on the stack, with an optional error handler for when
 *   that token isn’t closed properly.
 */

/**
 * @typedef Config
 *   Configuration.
 *
 *   We have our defaults, but extensions will add more.
 * @property {Array<string>} canContainEols
 *   Token types where line endings are used.
 * @property {Handles} enter
 *   Opening handles.
 * @property {Handles} exit
 *   Closing handles.
 * @property {Array<Transform>} transforms
 *   Tree transforms.
 *
 * @typedef {Partial<Config>} Extension
 *   Change how markdown tokens from micromark are turned into mdast.
 *
 * @typedef CompileContext
 *   mdast compiler context.
 * @property {Array<Node | Fragment>} stack
 *   Stack of nodes.
 * @property {Array<TokenTuple>} tokenStack
 *   Stack of tokens.
 * @property {<Key extends keyof CompileData>(key: Key) => CompileData[Key]} getData
 *   Get data from the key/value store.
 * @property {<Key extends keyof CompileData>(key: Key, value?: CompileData[Key]) => void} setData
 *   Set data into the key/value store.
 * @property {(this: CompileContext) => void} buffer
 *   Capture some of the output data.
 * @property {(this: CompileContext) => string} resume
 *   Stop capturing and access the output data.
 * @property {<Kind extends Node>(this: CompileContext, node: Kind, token: Token, onError?: OnEnterError) => Kind} enter
 *   Enter a token.
 * @property {(this: CompileContext, token: Token, onError?: OnExitError) => Node} exit
 *   Exit a token.
 * @property {TokenizeContext['sliceSerialize']} sliceSerialize
 *   Get the string value of a token.
 * @property {Config} config
 *   Configuration.
 *
 * @typedef FromMarkdownOptions
 *   Configuration for how to build mdast.
 * @property {Array<Extension | Array<Extension>> | null | undefined} [mdastExtensions]
 *   Extensions for this utility to change how tokens are turned into a tree.
 *
 * @typedef {ParseOptions & FromMarkdownOptions} Options
 *   Configuration.
 */

// To do: micromark: create a registry of tokens?
// To do: next major: don’t return given `Node` from `enter`.
// To do: next major: remove setter/getter.










const own = {}.hasOwnProperty

/**
 * @param value
 *   Markdown to parse.
 * @param encoding
 *   Character encoding for when `value` is `Buffer`.
 * @param options
 *   Configuration.
 * @returns
 *   mdast tree.
 */
const fromMarkdown =
  /**
   * @type {(
   *   ((value: Value, encoding: Encoding, options?: Options | null | undefined) => Root) &
   *   ((value: Value, options?: Options | null | undefined) => Root)
   * )}
   */

  /**
   * @param {Value} value
   * @param {Encoding | Options | null | undefined} [encoding]
   * @param {Options | null | undefined} [options]
   * @returns {Root}
   */
  function (value, encoding, options) {
    if (typeof encoding !== 'string') {
      options = encoding
      encoding = undefined
    }
    return compiler(options)(
      (0,postprocess/* postprocess */.e)(
        (0,parse/* parse */.Q)(options).document().write((0,preprocess/* preprocess */.d)()(value, encoding, true))
      )
    )
  }

/**
 * Note this compiler only understand complete buffering, not streaming.
 *
 * @param {Options | null | undefined} [options]
 */
function compiler(options) {
  /** @type {Config} */
  const config = {
    transforms: [],
    canContainEols: ['emphasis', 'fragment', 'heading', 'paragraph', 'strong'],
    enter: {
      autolink: opener(link),
      autolinkProtocol: onenterdata,
      autolinkEmail: onenterdata,
      atxHeading: opener(heading),
      blockQuote: opener(blockQuote),
      characterEscape: onenterdata,
      characterReference: onenterdata,
      codeFenced: opener(codeFlow),
      codeFencedFenceInfo: buffer,
      codeFencedFenceMeta: buffer,
      codeIndented: opener(codeFlow, buffer),
      codeText: opener(codeText, buffer),
      codeTextData: onenterdata,
      data: onenterdata,
      codeFlowValue: onenterdata,
      definition: opener(definition),
      definitionDestinationString: buffer,
      definitionLabelString: buffer,
      definitionTitleString: buffer,
      emphasis: opener(emphasis),
      hardBreakEscape: opener(hardBreak),
      hardBreakTrailing: opener(hardBreak),
      htmlFlow: opener(html, buffer),
      htmlFlowData: onenterdata,
      htmlText: opener(html, buffer),
      htmlTextData: onenterdata,
      image: opener(image),
      label: buffer,
      link: opener(link),
      listItem: opener(listItem),
      listItemValue: onenterlistitemvalue,
      listOrdered: opener(list, onenterlistordered),
      listUnordered: opener(list),
      paragraph: opener(paragraph),
      reference: onenterreference,
      referenceString: buffer,
      resourceDestinationString: buffer,
      resourceTitleString: buffer,
      setextHeading: opener(heading),
      strong: opener(strong),
      thematicBreak: opener(thematicBreak)
    },
    exit: {
      atxHeading: closer(),
      atxHeadingSequence: onexitatxheadingsequence,
      autolink: closer(),
      autolinkEmail: onexitautolinkemail,
      autolinkProtocol: onexitautolinkprotocol,
      blockQuote: closer(),
      characterEscapeValue: onexitdata,
      characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
      characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
      characterReferenceValue: onexitcharacterreferencevalue,
      codeFenced: closer(onexitcodefenced),
      codeFencedFence: onexitcodefencedfence,
      codeFencedFenceInfo: onexitcodefencedfenceinfo,
      codeFencedFenceMeta: onexitcodefencedfencemeta,
      codeFlowValue: onexitdata,
      codeIndented: closer(onexitcodeindented),
      codeText: closer(onexitcodetext),
      codeTextData: onexitdata,
      data: onexitdata,
      definition: closer(),
      definitionDestinationString: onexitdefinitiondestinationstring,
      definitionLabelString: onexitdefinitionlabelstring,
      definitionTitleString: onexitdefinitiontitlestring,
      emphasis: closer(),
      hardBreakEscape: closer(onexithardbreak),
      hardBreakTrailing: closer(onexithardbreak),
      htmlFlow: closer(onexithtmlflow),
      htmlFlowData: onexitdata,
      htmlText: closer(onexithtmltext),
      htmlTextData: onexitdata,
      image: closer(onexitimage),
      label: onexitlabel,
      labelText: onexitlabeltext,
      lineEnding: onexitlineending,
      link: closer(onexitlink),
      listItem: closer(),
      listOrdered: closer(),
      listUnordered: closer(),
      paragraph: closer(),
      referenceString: onexitreferencestring,
      resourceDestinationString: onexitresourcedestinationstring,
      resourceTitleString: onexitresourcetitlestring,
      resource: onexitresource,
      setextHeading: closer(onexitsetextheading),
      setextHeadingLineSequence: onexitsetextheadinglinesequence,
      setextHeadingText: onexitsetextheadingtext,
      strong: closer(),
      thematicBreak: closer()
    }
  }
  configure(config, (options || {}).mdastExtensions || [])

  /** @type {CompileData} */
  const data = {}
  return compile

  /**
   * Turn micromark events into an mdast tree.
   *
   * @param {Array<Event>} events
   *   Events.
   * @returns {Root}
   *   mdast tree.
   */
  function compile(events) {
    /** @type {Root} */
    let tree = {
      type: 'root',
      children: []
    }
    /** @type {Omit<CompileContext, 'sliceSerialize'>} */
    const context = {
      stack: [tree],
      tokenStack: [],
      config,
      enter,
      exit,
      buffer,
      resume,
      setData,
      getData
    }
    /** @type {Array<number>} */
    const listStack = []
    let index = -1
    while (++index < events.length) {
      // We preprocess lists to add `listItem` tokens, and to infer whether
      // items the list itself are spread out.
      if (
        events[index][1].type === 'listOrdered' ||
        events[index][1].type === 'listUnordered'
      ) {
        if (events[index][0] === 'enter') {
          listStack.push(index)
        } else {
          const tail = listStack.pop()
          index = prepareList(events, tail, index)
        }
      }
    }
    index = -1
    while (++index < events.length) {
      const handler = config[events[index][0]]
      if (own.call(handler, events[index][1].type)) {
        handler[events[index][1].type].call(
          Object.assign(
            {
              sliceSerialize: events[index][2].sliceSerialize
            },
            context
          ),
          events[index][1]
        )
      }
    }

    // Handle tokens still being open.
    if (context.tokenStack.length > 0) {
      const tail = context.tokenStack[context.tokenStack.length - 1]
      const handler = tail[1] || defaultOnError
      handler.call(context, undefined, tail[0])
    }

    // Figure out `root` position.
    tree.position = {
      start: point(
        events.length > 0
          ? events[0][1].start
          : {
              line: 1,
              column: 1,
              offset: 0
            }
      ),
      end: point(
        events.length > 0
          ? events[events.length - 2][1].end
          : {
              line: 1,
              column: 1,
              offset: 0
            }
      )
    }

    // Call transforms.
    index = -1
    while (++index < config.transforms.length) {
      tree = config.transforms[index](tree) || tree
    }
    return tree
  }

  /**
   * @param {Array<Event>} events
   * @param {number} start
   * @param {number} length
   * @returns {number}
   */
  function prepareList(events, start, length) {
    let index = start - 1
    let containerBalance = -1
    let listSpread = false
    /** @type {Token | undefined} */
    let listItem
    /** @type {number | undefined} */
    let lineIndex
    /** @type {number | undefined} */
    let firstBlankLineIndex
    /** @type {boolean | undefined} */
    let atMarker
    while (++index <= length) {
      const event = events[index]
      if (
        event[1].type === 'listUnordered' ||
        event[1].type === 'listOrdered' ||
        event[1].type === 'blockQuote'
      ) {
        if (event[0] === 'enter') {
          containerBalance++
        } else {
          containerBalance--
        }
        atMarker = undefined
      } else if (event[1].type === 'lineEndingBlank') {
        if (event[0] === 'enter') {
          if (
            listItem &&
            !atMarker &&
            !containerBalance &&
            !firstBlankLineIndex
          ) {
            firstBlankLineIndex = index
          }
          atMarker = undefined
        }
      } else if (
        event[1].type === 'linePrefix' ||
        event[1].type === 'listItemValue' ||
        event[1].type === 'listItemMarker' ||
        event[1].type === 'listItemPrefix' ||
        event[1].type === 'listItemPrefixWhitespace'
      ) {
        // Empty.
      } else {
        atMarker = undefined
      }
      if (
        (!containerBalance &&
          event[0] === 'enter' &&
          event[1].type === 'listItemPrefix') ||
        (containerBalance === -1 &&
          event[0] === 'exit' &&
          (event[1].type === 'listUnordered' ||
            event[1].type === 'listOrdered'))
      ) {
        if (listItem) {
          let tailIndex = index
          lineIndex = undefined
          while (tailIndex--) {
            const tailEvent = events[tailIndex]
            if (
              tailEvent[1].type === 'lineEnding' ||
              tailEvent[1].type === 'lineEndingBlank'
            ) {
              if (tailEvent[0] === 'exit') continue
              if (lineIndex) {
                events[lineIndex][1].type = 'lineEndingBlank'
                listSpread = true
              }
              tailEvent[1].type = 'lineEnding'
              lineIndex = tailIndex
            } else if (
              tailEvent[1].type === 'linePrefix' ||
              tailEvent[1].type === 'blockQuotePrefix' ||
              tailEvent[1].type === 'blockQuotePrefixWhitespace' ||
              tailEvent[1].type === 'blockQuoteMarker' ||
              tailEvent[1].type === 'listItemIndent'
            ) {
              // Empty
            } else {
              break
            }
          }
          if (
            firstBlankLineIndex &&
            (!lineIndex || firstBlankLineIndex < lineIndex)
          ) {
            listItem._spread = true
          }

          // Fix position.
          listItem.end = Object.assign(
            {},
            lineIndex ? events[lineIndex][1].start : event[1].end
          )
          events.splice(lineIndex || index, 0, ['exit', listItem, event[2]])
          index++
          length++
        }

        // Create a new list item.
        if (event[1].type === 'listItemPrefix') {
          listItem = {
            type: 'listItem',
            _spread: false,
            start: Object.assign({}, event[1].start),
            // @ts-expect-error: we’ll add `end` in a second.
            end: undefined
          }
          // @ts-expect-error: `listItem` is most definitely defined, TS...
          events.splice(index, 0, ['enter', listItem, event[2]])
          index++
          length++
          firstBlankLineIndex = undefined
          atMarker = true
        }
      }
    }
    events[start][1]._spread = listSpread
    return length
  }

  /**
   * Set data.
   *
   * @template {keyof CompileData} Key
   *   Field type.
   * @param {Key} key
   *   Key of field.
   * @param {CompileData[Key]} [value]
   *   New value.
   * @returns {void}
   *   Nothing.
   */
  function setData(key, value) {
    data[key] = value
  }

  /**
   * Get data.
   *
   * @template {keyof CompileData} Key
   *   Field type.
   * @param {Key} key
   *   Key of field.
   * @returns {CompileData[Key]}
   *   Value.
   */
  function getData(key) {
    return data[key]
  }

  /**
   * Create an opener handle.
   *
   * @param {(token: Token) => Node} create
   *   Create a node.
   * @param {Handle} [and]
   *   Optional function to also run.
   * @returns {Handle}
   *   Handle.
   */
  function opener(create, and) {
    return open

    /**
     * @this {CompileContext}
     * @param {Token} token
     * @returns {void}
     */
    function open(token) {
      enter.call(this, create(token), token)
      if (and) and.call(this, token)
    }
  }

  /**
   * @this {CompileContext}
   * @returns {void}
   */
  function buffer() {
    this.stack.push({
      type: 'fragment',
      children: []
    })
  }

  /**
   * @template {Node} Kind
   *   Node type.
   * @this {CompileContext}
   *   Context.
   * @param {Kind} node
   *   Node to enter.
   * @param {Token} token
   *   Corresponding token.
   * @param {OnEnterError | undefined} [errorHandler]
   *   Handle the case where this token is open, but it is closed by something else.
   * @returns {Kind}
   *   The given node.
   */
  function enter(node, token, errorHandler) {
    const parent = this.stack[this.stack.length - 1]
    // @ts-expect-error: Assume `Node` can exist as a child of `parent`.
    parent.children.push(node)
    this.stack.push(node)
    this.tokenStack.push([token, errorHandler])
    // @ts-expect-error: `end` will be patched later.
    node.position = {
      start: point(token.start)
    }
    return node
  }

  /**
   * Create a closer handle.
   *
   * @param {Handle} [and]
   *   Optional function to also run.
   * @returns {Handle}
   *   Handle.
   */
  function closer(and) {
    return close

    /**
     * @this {CompileContext}
     * @param {Token} token
     * @returns {void}
     */
    function close(token) {
      if (and) and.call(this, token)
      exit.call(this, token)
    }
  }

  /**
   * @this {CompileContext}
   *   Context.
   * @param {Token} token
   *   Corresponding token.
   * @param {OnExitError | undefined} [onExitError]
   *   Handle the case where another token is open.
   * @returns {Node}
   *   The closed node.
   */
  function exit(token, onExitError) {
    const node = this.stack.pop()
    const open = this.tokenStack.pop()
    if (!open) {
      throw new Error(
        'Cannot close `' +
          token.type +
          '` (' +
          (0,unist_util_stringify_position/* stringifyPosition */.y)({
            start: token.start,
            end: token.end
          }) +
          '): it’s not open'
      )
    } else if (open[0].type !== token.type) {
      if (onExitError) {
        onExitError.call(this, token, open[0])
      } else {
        const handler = open[1] || defaultOnError
        handler.call(this, token, open[0])
      }
    }
    node.position.end = point(token.end)
    return node
  }

  /**
   * @this {CompileContext}
   * @returns {string}
   */
  function resume() {
    return (0,mdast_util_to_string/* toString */.B)(this.stack.pop())
  }

  //
  // Handlers.
  //

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onenterlistordered() {
    setData('expectingFirstListItemValue', true)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onenterlistitemvalue(token) {
    if (getData('expectingFirstListItemValue')) {
      const ancestor = this.stack[this.stack.length - 2]
      ancestor.start = Number.parseInt(this.sliceSerialize(token), 10)
      setData('expectingFirstListItemValue')
    }
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitcodefencedfenceinfo() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.lang = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitcodefencedfencemeta() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.meta = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitcodefencedfence() {
    // Exit if this is the closing fence.
    if (getData('flowCodeInside')) return
    this.buffer()
    setData('flowCodeInside', true)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitcodefenced() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, '')
    setData('flowCodeInside')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitcodeindented() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data.replace(/(\r?\n|\r)$/g, '')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitdefinitionlabelstring(token) {
    const label = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.label = label
    node.identifier = (0,micromark_util_normalize_identifier/* normalizeIdentifier */.d)(
      this.sliceSerialize(token)
    ).toLowerCase()
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitdefinitiontitlestring() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.title = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitdefinitiondestinationstring() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.url = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitatxheadingsequence(token) {
    const node = this.stack[this.stack.length - 1]
    if (!node.depth) {
      const depth = this.sliceSerialize(token).length
      node.depth = depth
    }
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitsetextheadingtext() {
    setData('setextHeadingSlurpLineEnding', true)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitsetextheadinglinesequence(token) {
    const node = this.stack[this.stack.length - 1]
    node.depth = this.sliceSerialize(token).charCodeAt(0) === 61 ? 1 : 2
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitsetextheading() {
    setData('setextHeadingSlurpLineEnding')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onenterdata(token) {
    const node = this.stack[this.stack.length - 1]
    let tail = node.children[node.children.length - 1]
    if (!tail || tail.type !== 'text') {
      // Add a new text node.
      tail = text()
      // @ts-expect-error: we’ll add `end` later.
      tail.position = {
        start: point(token.start)
      }
      // @ts-expect-error: Assume `parent` accepts `text`.
      node.children.push(tail)
    }
    this.stack.push(tail)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitdata(token) {
    const tail = this.stack.pop()
    tail.value += this.sliceSerialize(token)
    tail.position.end = point(token.end)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitlineending(token) {
    const context = this.stack[this.stack.length - 1]
    // If we’re at a hard break, include the line ending in there.
    if (getData('atHardBreak')) {
      const tail = context.children[context.children.length - 1]
      tail.position.end = point(token.end)
      setData('atHardBreak')
      return
    }
    if (
      !getData('setextHeadingSlurpLineEnding') &&
      config.canContainEols.includes(context.type)
    ) {
      onenterdata.call(this, token)
      onexitdata.call(this, token)
    }
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexithardbreak() {
    setData('atHardBreak', true)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexithtmlflow() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexithtmltext() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitcodetext() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.value = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitlink() {
    const node = this.stack[this.stack.length - 1]
    // Note: there are also `identifier` and `label` fields on this link node!
    // These are used / cleaned here.
    // To do: clean.
    if (getData('inReference')) {
      /** @type {ReferenceType} */
      const referenceType = getData('referenceType') || 'shortcut'
      node.type += 'Reference'
      // @ts-expect-error: mutate.
      node.referenceType = referenceType
      // @ts-expect-error: mutate.
      delete node.url
      delete node.title
    } else {
      // @ts-expect-error: mutate.
      delete node.identifier
      // @ts-expect-error: mutate.
      delete node.label
    }
    setData('referenceType')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitimage() {
    const node = this.stack[this.stack.length - 1]
    // Note: there are also `identifier` and `label` fields on this link node!
    // These are used / cleaned here.
    // To do: clean.
    if (getData('inReference')) {
      /** @type {ReferenceType} */
      const referenceType = getData('referenceType') || 'shortcut'
      node.type += 'Reference'
      // @ts-expect-error: mutate.
      node.referenceType = referenceType
      // @ts-expect-error: mutate.
      delete node.url
      delete node.title
    } else {
      // @ts-expect-error: mutate.
      delete node.identifier
      // @ts-expect-error: mutate.
      delete node.label
    }
    setData('referenceType')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitlabeltext(token) {
    const string = this.sliceSerialize(token)
    const ancestor = this.stack[this.stack.length - 2]
    // @ts-expect-error: stash this on the node, as it might become a reference
    // later.
    ancestor.label = (0,micromark_util_decode_string/* decodeString */.v)(string)
    // @ts-expect-error: same as above.
    ancestor.identifier = (0,micromark_util_normalize_identifier/* normalizeIdentifier */.d)(string).toLowerCase()
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitlabel() {
    const fragment = this.stack[this.stack.length - 1]
    const value = this.resume()
    const node = this.stack[this.stack.length - 1]
    // Assume a reference.
    setData('inReference', true)
    if (node.type === 'link') {
      /** @type {Array<StaticPhrasingContent>} */
      // @ts-expect-error: Assume static phrasing content.
      const children = fragment.children
      node.children = children
    } else {
      node.alt = value
    }
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitresourcedestinationstring() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.url = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitresourcetitlestring() {
    const data = this.resume()
    const node = this.stack[this.stack.length - 1]
    node.title = data
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitresource() {
    setData('inReference')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onenterreference() {
    setData('referenceType', 'collapsed')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitreferencestring(token) {
    const label = this.resume()
    const node = this.stack[this.stack.length - 1]
    // @ts-expect-error: stash this on the node, as it might become a reference
    // later.
    node.label = label
    // @ts-expect-error: same as above.
    node.identifier = (0,micromark_util_normalize_identifier/* normalizeIdentifier */.d)(
      this.sliceSerialize(token)
    ).toLowerCase()
    setData('referenceType', 'full')
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */

  function onexitcharacterreferencemarker(token) {
    setData('characterReferenceType', token.type)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitcharacterreferencevalue(token) {
    const data = this.sliceSerialize(token)
    const type = getData('characterReferenceType')
    /** @type {string} */
    let value
    if (type) {
      value = (0,micromark_util_decode_numeric_character_reference/* decodeNumericCharacterReference */.o)(
        data,
        type === 'characterReferenceMarkerNumeric' ? 10 : 16
      )
      setData('characterReferenceType')
    } else {
      const result = (0,decode_named_character_reference/* decodeNamedCharacterReference */.T)(data)
      value = result
    }
    const tail = this.stack.pop()
    tail.value += value
    tail.position.end = point(token.end)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitautolinkprotocol(token) {
    onexitdata.call(this, token)
    const node = this.stack[this.stack.length - 1]
    node.url = this.sliceSerialize(token)
  }

  /**
   * @this {CompileContext}
   * @type {Handle}
   */
  function onexitautolinkemail(token) {
    onexitdata.call(this, token)
    const node = this.stack[this.stack.length - 1]
    node.url = 'mailto:' + this.sliceSerialize(token)
  }

  //
  // Creaters.
  //

  /** @returns {Blockquote} */
  function blockQuote() {
    return {
      type: 'blockquote',
      children: []
    }
  }

  /** @returns {Code} */
  function codeFlow() {
    return {
      type: 'code',
      lang: null,
      meta: null,
      value: ''
    }
  }

  /** @returns {InlineCode} */
  function codeText() {
    return {
      type: 'inlineCode',
      value: ''
    }
  }

  /** @returns {Definition} */
  function definition() {
    return {
      type: 'definition',
      identifier: '',
      label: null,
      title: null,
      url: ''
    }
  }

  /** @returns {Emphasis} */
  function emphasis() {
    return {
      type: 'emphasis',
      children: []
    }
  }

  /** @returns {Heading} */
  function heading() {
    // @ts-expect-error `depth` will be set later.
    return {
      type: 'heading',
      depth: undefined,
      children: []
    }
  }

  /** @returns {Break} */
  function hardBreak() {
    return {
      type: 'break'
    }
  }

  /** @returns {HTML} */
  function html() {
    return {
      type: 'html',
      value: ''
    }
  }

  /** @returns {Image} */
  function image() {
    return {
      type: 'image',
      title: null,
      url: '',
      alt: null
    }
  }

  /** @returns {Link} */
  function link() {
    return {
      type: 'link',
      title: null,
      url: '',
      children: []
    }
  }

  /**
   * @param {Token} token
   * @returns {List}
   */
  function list(token) {
    return {
      type: 'list',
      ordered: token.type === 'listOrdered',
      start: null,
      spread: token._spread,
      children: []
    }
  }

  /**
   * @param {Token} token
   * @returns {ListItem}
   */
  function listItem(token) {
    return {
      type: 'listItem',
      spread: token._spread,
      checked: null,
      children: []
    }
  }

  /** @returns {Paragraph} */
  function paragraph() {
    return {
      type: 'paragraph',
      children: []
    }
  }

  /** @returns {Strong} */
  function strong() {
    return {
      type: 'strong',
      children: []
    }
  }

  /** @returns {Text} */
  function text() {
    return {
      type: 'text',
      value: ''
    }
  }

  /** @returns {ThematicBreak} */
  function thematicBreak() {
    return {
      type: 'thematicBreak'
    }
  }
}

/**
 * Copy a point-like value.
 *
 * @param {Point} d
 *   Point-like value.
 * @returns {Point}
 *   unist point.
 */
function point(d) {
  return {
    line: d.line,
    column: d.column,
    offset: d.offset
  }
}

/**
 * @param {Config} combined
 * @param {Array<Extension | Array<Extension>>} extensions
 * @returns {void}
 */
function configure(combined, extensions) {
  let index = -1
  while (++index < extensions.length) {
    const value = extensions[index]
    if (Array.isArray(value)) {
      configure(combined, value)
    } else {
      extension(combined, value)
    }
  }
}

/**
 * @param {Config} combined
 * @param {Extension} extension
 * @returns {void}
 */
function extension(combined, extension) {
  /** @type {keyof Extension} */
  let key
  for (key in extension) {
    if (own.call(extension, key)) {
      if (key === 'canContainEols') {
        const right = extension[key]
        if (right) {
          combined[key].push(...right)
        }
      } else if (key === 'transforms') {
        const right = extension[key]
        if (right) {
          combined[key].push(...right)
        }
      } else if (key === 'enter' || key === 'exit') {
        const right = extension[key]
        if (right) {
          Object.assign(combined[key], right)
        }
      }
    }
  }
}

/** @type {OnEnterError} */
function defaultOnError(left, right) {
  if (left) {
    throw new Error(
      'Cannot close `' +
        left.type +
        '` (' +
        (0,unist_util_stringify_position/* stringifyPosition */.y)({
          start: left.start,
          end: left.end
        }) +
        '): a different token (`' +
        right.type +
        '`, ' +
        (0,unist_util_stringify_position/* stringifyPosition */.y)({
          start: right.start,
          end: right.end
        }) +
        ') is open'
    )
  } else {
    throw new Error(
      'Cannot close document, a token (`' +
        right.type +
        '`, ' +
        (0,unist_util_stringify_position/* stringifyPosition */.y)({
          start: right.start,
          end: right.end
        }) +
        ') is still open'
    )
  }
}

// EXTERNAL MODULE: ./node_modules/ts-dedent/esm/index.js
var esm = __webpack_require__(18464);
;// CONCATENATED MODULE: ./node_modules/mermaid/dist/createText-1719965b.js



function preprocessMarkdown(markdown) {
  const withoutMultipleNewlines = markdown.replace(/\n{2,}/g, "\n");
  const withoutExtraSpaces = (0,esm/* dedent */.Z)(withoutMultipleNewlines);
  return withoutExtraSpaces;
}
function markdownToLines(markdown) {
  const preprocessedMarkdown = preprocessMarkdown(markdown);
  const { children } = fromMarkdown(preprocessedMarkdown);
  const lines = [[]];
  let currentLine = 0;
  function processNode(node, parentType = "normal") {
    if (node.type === "text") {
      const textLines = node.value.split("\n");
      textLines.forEach((textLine, index) => {
        if (index !== 0) {
          currentLine++;
          lines.push([]);
        }
        textLine.split(" ").forEach((word) => {
          if (word) {
            lines[currentLine].push({ content: word, type: parentType });
          }
        });
      });
    } else if (node.type === "strong" || node.type === "emphasis") {
      node.children.forEach((contentNode) => {
        processNode(contentNode, node.type);
      });
    }
  }
  children.forEach((treeNode) => {
    if (treeNode.type === "paragraph") {
      treeNode.children.forEach((contentNode) => {
        processNode(contentNode);
      });
    }
  });
  return lines;
}
function markdownToHTML(markdown) {
  const { children } = fromMarkdown(markdown);
  function output(node) {
    if (node.type === "text") {
      return node.value.replace(/\n/g, "<br/>");
    } else if (node.type === "strong") {
      return `<strong>${node.children.map(output).join("")}</strong>`;
    } else if (node.type === "emphasis") {
      return `<em>${node.children.map(output).join("")}</em>`;
    } else if (node.type === "paragraph") {
      return `<p>${node.children.map(output).join("")}</p>`;
    }
    return `Unsupported markdown: ${node.type}`;
  }
  return children.map(output).join("");
}
function splitTextToChars(text) {
  if (Intl.Segmenter) {
    return [...new Intl.Segmenter().segment(text)].map((s) => s.segment);
  }
  return [...text];
}
function splitWordToFitWidth(checkFit, word) {
  const characters = splitTextToChars(word.content);
  return splitWordToFitWidthRecursion(checkFit, [], characters, word.type);
}
function splitWordToFitWidthRecursion(checkFit, usedChars, remainingChars, type) {
  if (remainingChars.length === 0) {
    return [
      { content: usedChars.join(""), type },
      { content: "", type }
    ];
  }
  const [nextChar, ...rest] = remainingChars;
  const newWord = [...usedChars, nextChar];
  if (checkFit([{ content: newWord.join(""), type }])) {
    return splitWordToFitWidthRecursion(checkFit, newWord, rest, type);
  }
  if (usedChars.length === 0 && nextChar) {
    usedChars.push(nextChar);
    remainingChars.shift();
  }
  return [
    { content: usedChars.join(""), type },
    { content: remainingChars.join(""), type }
  ];
}
function splitLineToFitWidth(line, checkFit) {
  if (line.some(({ content }) => content.includes("\n"))) {
    throw new Error("splitLineToFitWidth does not support newlines in the line");
  }
  return splitLineToFitWidthRecursion(line, checkFit);
}
function splitLineToFitWidthRecursion(words, checkFit, lines = [], newLine = []) {
  if (words.length === 0) {
    if (newLine.length > 0) {
      lines.push(newLine);
    }
    return lines.length > 0 ? lines : [];
  }
  let joiner = "";
  if (words[0].content === " ") {
    joiner = " ";
    words.shift();
  }
  const nextWord = words.shift() ?? { content: " ", type: "normal" };
  const lineWithNextWord = [...newLine];
  if (joiner !== "") {
    lineWithNextWord.push({ content: joiner, type: "normal" });
  }
  lineWithNextWord.push(nextWord);
  if (checkFit(lineWithNextWord)) {
    return splitLineToFitWidthRecursion(words, checkFit, lines, lineWithNextWord);
  }
  if (newLine.length > 0) {
    lines.push(newLine);
    words.unshift(nextWord);
  } else if (nextWord.content) {
    const [line, rest] = splitWordToFitWidth(checkFit, nextWord);
    lines.push([line]);
    if (rest.content) {
      words.unshift(rest);
    }
  }
  return splitLineToFitWidthRecursion(words, checkFit, lines);
}
function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr("style", styleFn);
  }
}
function addHtmlSpan(element, node, width, classes, addBackground = false) {
  const fo = element.append("foreignObject");
  const div = fo.append("xhtml:div");
  const label = node.label;
  const labelClass = node.isNode ? "nodeLabel" : "edgeLabel";
  div.html(
    (0,mermaid_7ea9cbd6.d)(
      `
    <span class="${labelClass} ${classes}" ` + (node.labelStyle ? 'style="' + node.labelStyle + '"' : "") + ">" + label + "</span>",
      (0,mermaid_7ea9cbd6.F)()
    )
  );
  applyStyle(div, node.labelStyle);
  div.style("display", "table-cell");
  div.style("white-space", "nowrap");
  div.style("max-width", width + "px");
  div.attr("xmlns", "http://www.w3.org/1999/xhtml");
  if (addBackground) {
    div.attr("class", "labelBkg");
  }
  let bbox = div.node().getBoundingClientRect();
  if (bbox.width === width) {
    div.style("display", "table");
    div.style("white-space", "break-spaces");
    div.style("width", width + "px");
    bbox = div.node().getBoundingClientRect();
  }
  fo.style("width", bbox.width);
  fo.style("height", bbox.height);
  return fo.node();
}
function createTspan(textElement, lineIndex, lineHeight) {
  return textElement.append("tspan").attr("class", "text-outer-tspan").attr("x", 0).attr("y", lineIndex * lineHeight - 0.1 + "em").attr("dy", lineHeight + "em");
}
function computeWidthOfText(parentNode, lineHeight, line) {
  const testElement = parentNode.append("text");
  const testSpan = createTspan(testElement, 1, lineHeight);
  updateTextContentAndStyles(testSpan, line);
  const textLength = testSpan.node().getComputedTextLength();
  testElement.remove();
  return textLength;
}
function computeDimensionOfText(parentNode, lineHeight, text) {
  var _a;
  const testElement = parentNode.append("text");
  const testSpan = createTspan(testElement, 1, lineHeight);
  updateTextContentAndStyles(testSpan, [{ content: text, type: "normal" }]);
  const textDimension = (_a = testSpan.node()) == null ? void 0 : _a.getBoundingClientRect();
  if (textDimension) {
    testElement.remove();
  }
  return textDimension;
}
function createFormattedText(width, g, structuredText, addBackground = false) {
  const lineHeight = 1.1;
  const labelGroup = g.append("g");
  const bkg = labelGroup.insert("rect").attr("class", "background");
  const textElement = labelGroup.append("text").attr("y", "-10.1");
  let lineIndex = 0;
  for (const line of structuredText) {
    const checkWidth = (line2) => computeWidthOfText(labelGroup, lineHeight, line2) <= width;
    const linesUnderWidth = checkWidth(line) ? [line] : splitLineToFitWidth(line, checkWidth);
    for (const preparedLine of linesUnderWidth) {
      const tspan = createTspan(textElement, lineIndex, lineHeight);
      updateTextContentAndStyles(tspan, preparedLine);
      lineIndex++;
    }
  }
  if (addBackground) {
    const bbox = textElement.node().getBBox();
    const padding = 2;
    bkg.attr("x", -padding).attr("y", -padding).attr("width", bbox.width + 2 * padding).attr("height", bbox.height + 2 * padding);
    return labelGroup.node();
  } else {
    return textElement.node();
  }
}
function updateTextContentAndStyles(tspan, wrappedLine) {
  tspan.text("");
  wrappedLine.forEach((word, index) => {
    const innerTspan = tspan.append("tspan").attr("font-style", word.type === "emphasis" ? "italic" : "normal").attr("class", "text-inner-tspan").attr("font-weight", word.type === "strong" ? "bold" : "normal");
    if (index === 0) {
      innerTspan.text(word.content);
    } else {
      innerTspan.text(" " + word.content);
    }
  });
}
const createText = (el, text = "", {
  style = "",
  isTitle = false,
  classes = "",
  useHtmlLabels = true,
  isNode = true,
  width = 200,
  addSvgBackground = false
} = {}) => {
  mermaid_7ea9cbd6.l.info("createText", text, style, isTitle, classes, useHtmlLabels, isNode, addSvgBackground);
  if (useHtmlLabels) {
    const htmlText = markdownToHTML(text);
    const node = {
      isNode,
      label: (0,mermaid_7ea9cbd6.M)(htmlText).replace(
        /fa[blrs]?:fa-[\w-]+/g,
        // cspell: disable-line
        (s) => `<i class='${s.replace(":", " ")}'></i>`
      ),
      labelStyle: style.replace("fill:", "color:")
    };
    const vertexNode = addHtmlSpan(el, node, width, classes, addSvgBackground);
    return vertexNode;
  } else {
    const structuredText = markdownToLines(text);
    const svgLabel = createFormattedText(width, el, structuredText, addSvgBackground);
    return svgLabel;
  }
};



/***/ }),

/***/ 47195:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a": () => (/* binding */ insertMarkers$1),
/* harmony export */   "b": () => (/* binding */ clear$1),
/* harmony export */   "c": () => (/* binding */ createLabel$1),
/* harmony export */   "d": () => (/* binding */ clear),
/* harmony export */   "e": () => (/* binding */ insertNode),
/* harmony export */   "f": () => (/* binding */ insertEdgeLabel),
/* harmony export */   "g": () => (/* binding */ getSubGraphTitleMargins),
/* harmony export */   "h": () => (/* binding */ insertEdge),
/* harmony export */   "i": () => (/* binding */ intersectRect$1),
/* harmony export */   "j": () => (/* binding */ positionEdgeLabel),
/* harmony export */   "k": () => (/* binding */ getLineFunctionsWithOffset),
/* harmony export */   "l": () => (/* binding */ labelHelper),
/* harmony export */   "m": () => (/* binding */ addEdgeMarkers),
/* harmony export */   "p": () => (/* binding */ positionNode),
/* harmony export */   "s": () => (/* binding */ setNodeElem),
/* harmony export */   "u": () => (/* binding */ updateNodeBounds)
/* harmony export */ });
/* harmony import */ var _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(93883);
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(35417);
/* harmony import */ var _createText_1719965b_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(28540);



const insertMarkers = (elem, markerArray, type, id) => {
  markerArray.forEach((markerName) => {
    markers[markerName](elem, type, id);
  });
};
const extension = (elem, type, id) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.trace("Making markers for ", id);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-extensionStart").attr("class", "marker extension " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 1,7 L18,13 V 1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-extensionEnd").attr("class", "marker extension " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 1,1 V 13 L18,7 Z");
};
const composition = (elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionStart").attr("class", "marker composition " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-compositionEnd").attr("class", "marker composition " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
};
const aggregation = (elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationStart").attr("class", "marker aggregation " + type).attr("refX", 18).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-aggregationEnd").attr("class", "marker aggregation " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L1,7 L9,1 Z");
};
const dependency = (elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyStart").attr("class", "marker dependency " + type).attr("refX", 6).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("path").attr("d", "M 5,7 L9,13 L1,7 L9,1 Z");
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-dependencyEnd").attr("class", "marker dependency " + type).attr("refX", 13).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 28).attr("orient", "auto").append("path").attr("d", "M 18,7 L9,13 L14,7 L9,1 Z");
};
const lollipop = (elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopStart").attr("class", "marker lollipop " + type).attr("refX", 13).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-lollipopEnd").attr("class", "marker lollipop " + type).attr("refX", 1).attr("refY", 7).attr("markerWidth", 190).attr("markerHeight", 240).attr("orient", "auto").append("circle").attr("stroke", "black").attr("fill", "transparent").attr("cx", 7).attr("cy", 7).attr("r", 6);
};
const point = (elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-pointEnd").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 6).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-pointStart").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 4.5).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 12).attr("markerHeight", 12).attr("orient", "auto").append("path").attr("d", "M 0 5 L 10 10 L 10 0 z").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
};
const circle$1 = (elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-circleEnd").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", 11).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-circleStart").attr("class", "marker " + type).attr("viewBox", "0 0 10 10").attr("refX", -1).attr("refY", 5).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("circle").attr("cx", "5").attr("cy", "5").attr("r", "5").attr("class", "arrowMarkerPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
};
const cross = (elem, type, id) => {
  elem.append("marker").attr("id", id + "_" + type + "-crossEnd").attr("class", "marker cross " + type).attr("viewBox", "0 0 11 11").attr("refX", 12).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
  elem.append("marker").attr("id", id + "_" + type + "-crossStart").attr("class", "marker cross " + type).attr("viewBox", "0 0 11 11").attr("refX", -1).attr("refY", 5.2).attr("markerUnits", "userSpaceOnUse").attr("markerWidth", 11).attr("markerHeight", 11).attr("orient", "auto").append("path").attr("d", "M 1,1 l 9,9 M 10,1 l -9,9").attr("class", "arrowMarkerPath").style("stroke-width", 2).style("stroke-dasharray", "1,0");
};
const barb = (elem, type, id) => {
  elem.append("defs").append("marker").attr("id", id + "_" + type + "-barbEnd").attr("refX", 19).attr("refY", 7).attr("markerWidth", 20).attr("markerHeight", 14).attr("markerUnits", "strokeWidth").attr("orient", "auto").append("path").attr("d", "M 19,7 L9,13 L14,7 L9,1 Z");
};
const markers = {
  extension,
  composition,
  aggregation,
  dependency,
  lollipop,
  point,
  circle: circle$1,
  cross,
  barb
};
const insertMarkers$1 = insertMarkers;
function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr("style", styleFn);
  }
}
function addHtmlLabel(node, config) {
  const fo = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(document.createElementNS("http://www.w3.org/2000/svg", "foreignObject"));
  const div = fo.append("xhtml:div");
  const label = node.label;
  const labelClass = node.isNode ? "nodeLabel" : "edgeLabel";
  div.html(
    (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.d)(
      '<span class="' + labelClass + '" ' + (node.labelStyle ? 'style="' + node.labelStyle + '"' : "") + ">" + label + "</span>",
      config
    )
  );
  applyStyle(div, node.labelStyle);
  div.style("display", "inline-block");
  div.style("white-space", "nowrap");
  div.attr("xmlns", "http://www.w3.org/1999/xhtml");
  return fo.node();
}
const createLabel = (_vertexText, style, isTitle, isNode) => {
  let vertexText = _vertexText || "";
  if (typeof vertexText === "object") {
    vertexText = vertexText[0];
  }
  const config = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)();
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)(config.flowchart.htmlLabels)) {
    vertexText = vertexText.replace(/\\n|\n/g, "<br />");
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("vertexText" + vertexText);
    const node = {
      isNode,
      label: (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.M)(vertexText).replace(
        /fa[blrs]?:fa-[\w-]+/g,
        // cspell: disable-line
        (s) => `<i class='${s.replace(":", " ")}'></i>`
      ),
      labelStyle: style.replace("fill:", "color:")
    };
    let vertexNode = addHtmlLabel(node, config);
    return vertexNode;
  } else {
    const svgLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    svgLabel.setAttribute("style", style.replace("color:", "fill:"));
    let rows = [];
    if (typeof vertexText === "string") {
      rows = vertexText.split(/\\n|\n|<br\s*\/?>/gi);
    } else if (Array.isArray(vertexText)) {
      rows = vertexText;
    } else {
      rows = [];
    }
    for (const row of rows) {
      const tspan = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      tspan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
      tspan.setAttribute("dy", "1em");
      tspan.setAttribute("x", "0");
      if (isTitle) {
        tspan.setAttribute("class", "title-row");
      } else {
        tspan.setAttribute("class", "row");
      }
      tspan.textContent = row.trim();
      svgLabel.appendChild(tspan);
    }
    return svgLabel;
  }
};
const createLabel$1 = createLabel;
const labelHelper = async (parent, node, _classes, isNode) => {
  let classes;
  const useHtmlLabels = node.useHtmlLabels || (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels);
  if (!_classes) {
    classes = "node default";
  } else {
    classes = _classes;
  }
  const shapeSvg = parent.insert("g").attr("class", classes).attr("id", node.domId || node.id);
  const label = shapeSvg.insert("g").attr("class", "label").attr("style", node.labelStyle);
  let labelText;
  if (node.labelText === void 0) {
    labelText = "";
  } else {
    labelText = typeof node.labelText === "string" ? node.labelText : node.labelText[0];
  }
  const textNode = label.node();
  let text;
  if (node.labelType === "markdown") {
    text = (0,_createText_1719965b_js__WEBPACK_IMPORTED_MODULE_2__.a)(label, (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.d)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.M)(labelText), (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)()), {
      useHtmlLabels,
      width: node.width || (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.wrappingWidth,
      classes: "markdown-node-label"
    });
  } else {
    text = textNode.appendChild(
      createLabel$1(
        (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.d)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.M)(labelText), (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)()),
        node.labelStyle,
        false,
        isNode
      )
    );
  }
  let bbox = text.getBBox();
  const halfPadding = node.padding / 2;
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels)) {
    const div = text.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(text);
    const images = div.getElementsByTagName("img");
    if (images) {
      const noImgText = labelText.replace(/<img[^>]*>/g, "").trim() === "";
      await Promise.all(
        [...images].map(
          (img) => new Promise((res) => {
            function setupImage() {
              img.style.display = "flex";
              img.style.flexDirection = "column";
              if (noImgText) {
                const bodyFontSize = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().fontSize ? (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().fontSize : window.getComputedStyle(document.body).fontSize;
                const enlargingFactor = 5;
                const width = parseInt(bodyFontSize, 10) * enlargingFactor + "px";
                img.style.minWidth = width;
                img.style.maxWidth = width;
              } else {
                img.style.width = "100%";
              }
              res(img);
            }
            setTimeout(() => {
              if (img.complete) {
                setupImage();
              }
            });
            img.addEventListener("error", setupImage);
            img.addEventListener("load", setupImage);
          })
        )
      );
    }
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  if (useHtmlLabels) {
    label.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  } else {
    label.attr("transform", "translate(0, " + -bbox.height / 2 + ")");
  }
  if (node.centerLabel) {
    label.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  }
  label.insert("rect", ":first-child");
  return { shapeSvg, bbox, halfPadding, label };
};
const updateNodeBounds = (node, element) => {
  const bbox = element.node().getBBox();
  node.width = bbox.width;
  node.height = bbox.height;
};
function insertPolygonShape(parent, w, h, points) {
  return parent.insert("polygon", ":first-child").attr(
    "points",
    points.map(function(d) {
      return d.x + "," + d.y;
    }).join(" ")
  ).attr("class", "label-container").attr("transform", "translate(" + -w / 2 + "," + h / 2 + ")");
}
function intersectNode(node, point2) {
  return node.intersect(point2);
}
function intersectEllipse(node, rx, ry, point2) {
  var cx = node.x;
  var cy = node.y;
  var px = cx - point2.x;
  var py = cy - point2.y;
  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);
  var dx = Math.abs(rx * ry * px / det);
  if (point2.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point2.y < cy) {
    dy = -dy;
  }
  return { x: cx + dx, y: cy + dy };
}
function intersectCircle(node, rx, point2) {
  return intersectEllipse(node, rx, rx, point2);
}
function intersectLine(p1, p2, q1, q2) {
  var a1, a2, b1, b2, c1, c2;
  var r1, r2, r3, r4;
  var denom, offset, num;
  var x, y;
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = p2.x * p1.y - p1.x * p2.y;
  r3 = a1 * q1.x + b1 * q1.y + c1;
  r4 = a1 * q2.x + b1 * q2.y + c1;
  if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
    return;
  }
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = q2.x * q1.y - q1.x * q2.y;
  r1 = a2 * p1.x + b2 * p1.y + c2;
  r2 = a2 * p2.x + b2 * p2.y + c2;
  if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
    return;
  }
  denom = a1 * b2 - a2 * b1;
  if (denom === 0) {
    return;
  }
  offset = Math.abs(denom / 2);
  num = b1 * c2 - b2 * c1;
  x = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  num = a2 * c1 - a1 * c2;
  y = num < 0 ? (num - offset) / denom : (num + offset) / denom;
  return { x, y };
}
function sameSign(r1, r2) {
  return r1 * r2 > 0;
}
function intersectPolygon(node, polyPoints, point2) {
  var x1 = node.x;
  var y1 = node.y;
  var intersections = [];
  var minX = Number.POSITIVE_INFINITY;
  var minY = Number.POSITIVE_INFINITY;
  if (typeof polyPoints.forEach === "function") {
    polyPoints.forEach(function(entry) {
      minX = Math.min(minX, entry.x);
      minY = Math.min(minY, entry.y);
    });
  } else {
    minX = Math.min(minX, polyPoints.x);
    minY = Math.min(minY, polyPoints.y);
  }
  var left = x1 - node.width / 2 - minX;
  var top = y1 - node.height / 2 - minY;
  for (var i = 0; i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect2 = intersectLine(
      node,
      point2,
      { x: left + p1.x, y: top + p1.y },
      { x: left + p2.x, y: top + p2.y }
    );
    if (intersect2) {
      intersections.push(intersect2);
    }
  }
  if (!intersections.length) {
    return node;
  }
  if (intersections.length > 1) {
    intersections.sort(function(p, q) {
      var pdx = p.x - point2.x;
      var pdy = p.y - point2.y;
      var distp = Math.sqrt(pdx * pdx + pdy * pdy);
      var qdx = q.x - point2.x;
      var qdy = q.y - point2.y;
      var distq = Math.sqrt(qdx * qdx + qdy * qdy);
      return distp < distq ? -1 : distp === distq ? 0 : 1;
    });
  }
  return intersections[0];
}
const intersectRect = (node, point2) => {
  var x = node.x;
  var y = node.y;
  var dx = point2.x - x;
  var dy = point2.y - y;
  var w = node.width / 2;
  var h = node.height / 2;
  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }
  return { x: x + sx, y: y + sy };
};
const intersectRect$1 = intersectRect;
const intersect = {
  node: intersectNode,
  circle: intersectCircle,
  ellipse: intersectEllipse,
  polygon: intersectPolygon,
  rect: intersectRect$1
};
const note = async (parent, node) => {
  const useHtmlLabels = node.useHtmlLabels || (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels;
  if (!useHtmlLabels) {
    node.centerLabel = true;
  }
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    "node " + node.classes,
    true
  );
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("Classes = ", node.classes);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  rect2.attr("rx", node.rx).attr("ry", node.ry).attr("x", -bbox.width / 2 - halfPadding).attr("y", -bbox.height / 2 - halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
const note$1 = note;
const expandAndDeduplicateDirections = (directions) => {
  const uniqueDirections = /* @__PURE__ */ new Set();
  for (const direction of directions) {
    switch (direction) {
      case "x":
        uniqueDirections.add("right");
        uniqueDirections.add("left");
        break;
      case "y":
        uniqueDirections.add("up");
        uniqueDirections.add("down");
        break;
      default:
        uniqueDirections.add(direction);
        break;
    }
  }
  return uniqueDirections;
};
const getArrowPoints = (duplicatedDirections, bbox, node) => {
  const directions = expandAndDeduplicateDirections(duplicatedDirections);
  const f = 2;
  const height = bbox.height + 2 * node.padding;
  const midpoint = height / f;
  const width = bbox.width + 2 * midpoint + node.padding;
  const padding = node.padding / 2;
  if (directions.has("right") && directions.has("left") && directions.has("up") && directions.has("down")) {
    return [
      // Bottom
      { x: 0, y: 0 },
      { x: midpoint, y: 0 },
      { x: width / 2, y: 2 * padding },
      { x: width - midpoint, y: 0 },
      { x: width, y: 0 },
      // Right
      { x: width, y: -height / 3 },
      { x: width + 2 * padding, y: -height / 2 },
      { x: width, y: -2 * height / 3 },
      { x: width, y: -height },
      // Top
      { x: width - midpoint, y: -height },
      { x: width / 2, y: -height - 2 * padding },
      { x: midpoint, y: -height },
      // Left
      { x: 0, y: -height },
      { x: 0, y: -2 * height / 3 },
      { x: -2 * padding, y: -height / 2 },
      { x: 0, y: -height / 3 }
    ];
  }
  if (directions.has("right") && directions.has("left") && directions.has("up")) {
    return [
      { x: midpoint, y: 0 },
      { x: width - midpoint, y: 0 },
      { x: width, y: -height / 2 },
      { x: width - midpoint, y: -height },
      { x: midpoint, y: -height },
      { x: 0, y: -height / 2 }
    ];
  }
  if (directions.has("right") && directions.has("left") && directions.has("down")) {
    return [
      { x: 0, y: 0 },
      { x: midpoint, y: -height },
      { x: width - midpoint, y: -height },
      { x: width, y: 0 }
    ];
  }
  if (directions.has("right") && directions.has("up") && directions.has("down")) {
    return [
      { x: 0, y: 0 },
      { x: width, y: -midpoint },
      { x: width, y: -height + midpoint },
      { x: 0, y: -height }
    ];
  }
  if (directions.has("left") && directions.has("up") && directions.has("down")) {
    return [
      { x: width, y: 0 },
      { x: 0, y: -midpoint },
      { x: 0, y: -height + midpoint },
      { x: width, y: -height }
    ];
  }
  if (directions.has("right") && directions.has("left")) {
    return [
      { x: midpoint, y: 0 },
      { x: midpoint, y: -padding },
      { x: width - midpoint, y: -padding },
      { x: width - midpoint, y: 0 },
      { x: width, y: -height / 2 },
      { x: width - midpoint, y: -height },
      { x: width - midpoint, y: -height + padding },
      { x: midpoint, y: -height + padding },
      { x: midpoint, y: -height },
      { x: 0, y: -height / 2 }
    ];
  }
  if (directions.has("up") && directions.has("down")) {
    return [
      // Bottom center
      { x: width / 2, y: 0 },
      // Left pont of bottom arrow
      { x: 0, y: -padding },
      { x: midpoint, y: -padding },
      // Left top over vertical section
      { x: midpoint, y: -height + padding },
      { x: 0, y: -height + padding },
      // Top of arrow
      { x: width / 2, y: -height },
      { x: width, y: -height + padding },
      // Top of right vertical bar
      { x: width - midpoint, y: -height + padding },
      { x: width - midpoint, y: -padding },
      { x: width, y: -padding }
    ];
  }
  if (directions.has("right") && directions.has("up")) {
    return [
      { x: 0, y: 0 },
      { x: width, y: -midpoint },
      { x: 0, y: -height }
    ];
  }
  if (directions.has("right") && directions.has("down")) {
    return [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: -height }
    ];
  }
  if (directions.has("left") && directions.has("up")) {
    return [
      { x: width, y: 0 },
      { x: 0, y: -midpoint },
      { x: width, y: -height }
    ];
  }
  if (directions.has("left") && directions.has("down")) {
    return [
      { x: width, y: 0 },
      { x: 0, y: 0 },
      { x: width, y: -height }
    ];
  }
  if (directions.has("right")) {
    return [
      { x: midpoint, y: -padding },
      { x: midpoint, y: -padding },
      { x: width - midpoint, y: -padding },
      { x: width - midpoint, y: 0 },
      { x: width, y: -height / 2 },
      { x: width - midpoint, y: -height },
      { x: width - midpoint, y: -height + padding },
      // top left corner of arrow
      { x: midpoint, y: -height + padding },
      { x: midpoint, y: -height + padding }
    ];
  }
  if (directions.has("left")) {
    return [
      { x: midpoint, y: 0 },
      { x: midpoint, y: -padding },
      // Two points, the right corners
      { x: width - midpoint, y: -padding },
      { x: width - midpoint, y: -height + padding },
      { x: midpoint, y: -height + padding },
      { x: midpoint, y: -height },
      { x: 0, y: -height / 2 }
    ];
  }
  if (directions.has("up")) {
    return [
      // Bottom center
      { x: midpoint, y: -padding },
      // Left top over vertical section
      { x: midpoint, y: -height + padding },
      { x: 0, y: -height + padding },
      // Top of arrow
      { x: width / 2, y: -height },
      { x: width, y: -height + padding },
      // Top of right vertical bar
      { x: width - midpoint, y: -height + padding },
      { x: width - midpoint, y: -padding }
    ];
  }
  if (directions.has("down")) {
    return [
      // Bottom center
      { x: width / 2, y: 0 },
      // Left pont of bottom arrow
      { x: 0, y: -padding },
      { x: midpoint, y: -padding },
      // Left top over vertical section
      { x: midpoint, y: -height + padding },
      { x: width - midpoint, y: -height + padding },
      { x: width - midpoint, y: -padding },
      { x: width, y: -padding }
    ];
  }
  return [{ x: 0, y: 0 }];
};
const formatClass = (str) => {
  if (str) {
    return " " + str;
  }
  return "";
};
const getClassesFromNode = (node, otherClasses) => {
  return `${otherClasses ? otherClasses : "node default"}${formatClass(node.classes)} ${formatClass(
    node.class
  )}`;
};
const question = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const s = w + h;
  const points = [
    { x: s / 2, y: 0 },
    { x: s, y: -s / 2 },
    { x: s / 2, y: -s },
    { x: 0, y: -s / 2 }
  ];
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("Question main (Circle)");
  const questionElem = insertPolygonShape(shapeSvg, s, s, points);
  questionElem.attr("style", node.style);
  updateNodeBounds(node, questionElem);
  node.intersect = function(point2) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.warn("Intersect called");
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const choice = (parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  const s = 28;
  const points = [
    { x: 0, y: s / 2 },
    { x: s / 2, y: 0 },
    { x: 0, y: -s / 2 },
    { x: -s / 2, y: 0 }
  ];
  const choice2 = shapeSvg.insert("polygon", ":first-child").attr(
    "points",
    points.map(function(d) {
      return d.x + "," + d.y;
    }).join(" ")
  );
  choice2.attr("class", "state-start").attr("r", 7).attr("width", 28).attr("height", 28);
  node.width = 28;
  node.height = 28;
  node.intersect = function(point2) {
    return intersect.circle(node, 14, point2);
  };
  return shapeSvg;
};
const hexagon = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const f = 4;
  const h = bbox.height + node.padding;
  const m = h / f;
  const w = bbox.width + 2 * m + node.padding;
  const points = [
    { x: m, y: 0 },
    { x: w - m, y: 0 },
    { x: w, y: -h / 2 },
    { x: w - m, y: -h },
    { x: m, y: -h },
    { x: 0, y: -h / 2 }
  ];
  const hex = insertPolygonShape(shapeSvg, w, h, points);
  hex.attr("style", node.style);
  updateNodeBounds(node, hex);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const block_arrow = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, void 0, true);
  const f = 2;
  const h = bbox.height + 2 * node.padding;
  const m = h / f;
  const w = bbox.width + 2 * m + node.padding;
  const points = getArrowPoints(node.directions, bbox, node);
  const blockArrow = insertPolygonShape(shapeSvg, w, h, points);
  blockArrow.attr("style", node.style);
  updateNodeBounds(node, blockArrow);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const rect_left_inv_arrow = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: -h / 2, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: -h / 2, y: -h },
    { x: 0, y: -h / 2 }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  node.width = w + h;
  node.height = h;
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const lean_right = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(parent, node, getClassesFromNode(node), true);
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: -2 * h / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + 2 * h / 6, y: -h },
    { x: h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const lean_left = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 2 * h / 6, y: 0 },
    { x: w + h / 6, y: 0 },
    { x: w - 2 * h / 6, y: -h },
    { x: -h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const trapezoid = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: -2 * h / 6, y: 0 },
    { x: w + 2 * h / 6, y: 0 },
    { x: w - h / 6, y: -h },
    { x: h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const inv_trapezoid = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: h / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + 2 * h / 6, y: -h },
    { x: -2 * h / 6, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const rect_right_inv_arrow = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 0, y: 0 },
    { x: w + h / 2, y: 0 },
    { x: w, y: -h / 2 },
    { x: w + h / 2, y: -h },
    { x: 0, y: -h }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const cylinder = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const h = bbox.height + ry + node.padding;
  const shape = "M 0," + ry + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 a " + rx + "," + ry + " 0,0,0 " + -w + " 0 l 0," + h + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 l 0," + -h;
  const el = shapeSvg.attr("label-offset-y", ry).insert("path", ":first-child").attr("style", node.style).attr("d", shape).attr("transform", "translate(" + -w / 2 + "," + -(h / 2 + ry) + ")");
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    const pos = intersect.rect(node, point2);
    const x = pos.x - node.x;
    if (rx != 0 && (Math.abs(x) < node.width / 2 || Math.abs(x) == node.width / 2 && Math.abs(pos.y - node.y) > node.height / 2 - ry)) {
      let y = ry * ry * (1 - x * x / (rx * rx));
      if (y != 0) {
        y = Math.sqrt(y);
      }
      y = ry - y;
      if (point2.y - node.y > 0) {
        y = -y;
      }
      pos.y += y;
    }
    return pos;
  };
  return shapeSvg;
};
const rect = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    "node " + node.classes + " " + node.class,
    true
  );
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const totalWidth = node.positioned ? node.width : bbox.width + node.padding;
  const totalHeight = node.positioned ? node.height : bbox.height + node.padding;
  const x = node.positioned ? -totalWidth / 2 : -bbox.width / 2 - halfPadding;
  const y = node.positioned ? -totalHeight / 2 : -bbox.height / 2 - halfPadding;
  rect2.attr("class", "basic label-container").attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("x", x).attr("y", y).attr("width", totalWidth).attr("height", totalHeight);
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect2, node.props.borders, totalWidth, totalHeight);
      propKeys.delete("borders");
    }
    propKeys.forEach((propKey) => {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.warn(`Unknown node property ${propKey}`);
    });
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
const composite = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    "node " + node.classes,
    true
  );
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const totalWidth = node.positioned ? node.width : bbox.width + node.padding;
  const totalHeight = node.positioned ? node.height : bbox.height + node.padding;
  const x = node.positioned ? -totalWidth / 2 : -bbox.width / 2 - halfPadding;
  const y = node.positioned ? -totalHeight / 2 : -bbox.height / 2 - halfPadding;
  rect2.attr("class", "basic cluster composite label-container").attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("x", x).attr("y", y).attr("width", totalWidth).attr("height", totalHeight);
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect2, node.props.borders, totalWidth, totalHeight);
      propKeys.delete("borders");
    }
    propKeys.forEach((propKey) => {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.warn(`Unknown node property ${propKey}`);
    });
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
const labelRect = async (parent, node) => {
  const { shapeSvg } = await labelHelper(parent, node, "label", true);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.trace("Classes = ", node.class);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const totalWidth = 0;
  const totalHeight = 0;
  rect2.attr("width", totalWidth).attr("height", totalHeight);
  shapeSvg.attr("class", "label edgeLabel");
  if (node.props) {
    const propKeys = new Set(Object.keys(node.props));
    if (node.props.borders) {
      applyNodePropertyBorders(rect2, node.props.borders, totalWidth, totalHeight);
      propKeys.delete("borders");
    }
    propKeys.forEach((propKey) => {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.warn(`Unknown node property ${propKey}`);
    });
  }
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
function applyNodePropertyBorders(rect2, borders, totalWidth, totalHeight) {
  const strokeDashArray = [];
  const addBorder = (length) => {
    strokeDashArray.push(length, 0);
  };
  const skipBorder = (length) => {
    strokeDashArray.push(0, length);
  };
  if (borders.includes("t")) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("add top border");
    addBorder(totalWidth);
  } else {
    skipBorder(totalWidth);
  }
  if (borders.includes("r")) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("add right border");
    addBorder(totalHeight);
  } else {
    skipBorder(totalHeight);
  }
  if (borders.includes("b")) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("add bottom border");
    addBorder(totalWidth);
  } else {
    skipBorder(totalWidth);
  }
  if (borders.includes("l")) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("add left border");
    addBorder(totalHeight);
  } else {
    skipBorder(totalHeight);
  }
  rect2.attr("stroke-dasharray", strokeDashArray.join(" "));
}
const rectWithTitle = (parent, node) => {
  let classes;
  if (!node.classes) {
    classes = "node default";
  } else {
    classes = "node " + node.classes;
  }
  const shapeSvg = parent.insert("g").attr("class", classes).attr("id", node.domId || node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const innerLine = shapeSvg.insert("line");
  const label = shapeSvg.insert("g").attr("class", "label");
  const text2 = node.labelText.flat ? node.labelText.flat() : node.labelText;
  let title = "";
  if (typeof text2 === "object") {
    title = text2[0];
  } else {
    title = text2;
  }
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("Label text abc79", title, text2, typeof text2 === "object");
  const text = label.node().appendChild(createLabel$1(title, node.labelStyle, true, true));
  let bbox = { width: 0, height: 0 };
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels)) {
    const div = text.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(text);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("Text 2", text2);
  const textRows = text2.slice(1, text2.length);
  let titleBox = text.getBBox();
  const descr = label.node().appendChild(
    createLabel$1(textRows.join ? textRows.join("<br/>") : textRows, node.labelStyle, true, true)
  );
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels)) {
    const div = descr.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(descr);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  const halfPadding = node.padding / 2;
  (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(descr).attr(
    "transform",
    "translate( " + // (titleBox.width - bbox.width) / 2 +
    (bbox.width > titleBox.width ? 0 : (titleBox.width - bbox.width) / 2) + ", " + (titleBox.height + halfPadding + 5) + ")"
  );
  (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(text).attr(
    "transform",
    "translate( " + // (titleBox.width - bbox.width) / 2 +
    (bbox.width < titleBox.width ? 0 : -(titleBox.width - bbox.width) / 2) + ", 0)"
  );
  bbox = label.node().getBBox();
  label.attr(
    "transform",
    "translate(" + -bbox.width / 2 + ", " + (-bbox.height / 2 - halfPadding + 3) + ")"
  );
  rect2.attr("class", "outer title-state").attr("x", -bbox.width / 2 - halfPadding).attr("y", -bbox.height / 2 - halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  innerLine.attr("class", "divider").attr("x1", -bbox.width / 2 - halfPadding).attr("x2", bbox.width / 2 + halfPadding).attr("y1", -bbox.height / 2 - halfPadding + titleBox.height + halfPadding).attr("y2", -bbox.height / 2 - halfPadding + titleBox.height + halfPadding);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
const stadium = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const h = bbox.height + node.padding;
  const w = bbox.width + h / 4 + node.padding;
  const rect2 = shapeSvg.insert("rect", ":first-child").attr("style", node.style).attr("rx", h / 2).attr("ry", h / 2).attr("x", -w / 2).attr("y", -h / 2).attr("width", w).attr("height", h);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
const circle = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const circle2 = shapeSvg.insert("circle", ":first-child");
  circle2.attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("r", bbox.width / 2 + halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("Circle main");
  updateNodeBounds(node, circle2);
  node.intersect = function(point2) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("Circle intersect", node, bbox.width / 2 + halfPadding, point2);
    return intersect.circle(node, bbox.width / 2 + halfPadding, point2);
  };
  return shapeSvg;
};
const doublecircle = async (parent, node) => {
  const { shapeSvg, bbox, halfPadding } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const gap = 5;
  const circleGroup = shapeSvg.insert("g", ":first-child");
  const outerCircle = circleGroup.insert("circle");
  const innerCircle = circleGroup.insert("circle");
  circleGroup.attr("class", node.class);
  outerCircle.attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("r", bbox.width / 2 + halfPadding + gap).attr("width", bbox.width + node.padding + gap * 2).attr("height", bbox.height + node.padding + gap * 2);
  innerCircle.attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("r", bbox.width / 2 + halfPadding).attr("width", bbox.width + node.padding).attr("height", bbox.height + node.padding);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("DoubleCircle main");
  updateNodeBounds(node, outerCircle);
  node.intersect = function(point2) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("DoubleCircle intersect", node, bbox.width / 2 + halfPadding + gap, point2);
    return intersect.circle(node, bbox.width / 2 + halfPadding + gap, point2);
  };
  return shapeSvg;
};
const subroutine = async (parent, node) => {
  const { shapeSvg, bbox } = await labelHelper(
    parent,
    node,
    getClassesFromNode(node, void 0),
    true
  );
  const w = bbox.width + node.padding;
  const h = bbox.height + node.padding;
  const points = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: 0, y: -h },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: w + 8, y: 0 },
    { x: w + 8, y: -h },
    { x: -8, y: -h },
    { x: -8, y: 0 }
  ];
  const el = insertPolygonShape(shapeSvg, w, h, points);
  el.attr("style", node.style);
  updateNodeBounds(node, el);
  node.intersect = function(point2) {
    return intersect.polygon(node, points, point2);
  };
  return shapeSvg;
};
const start = (parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  const circle2 = shapeSvg.insert("circle", ":first-child");
  circle2.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  updateNodeBounds(node, circle2);
  node.intersect = function(point2) {
    return intersect.circle(node, 7, point2);
  };
  return shapeSvg;
};
const forkJoin = (parent, node, dir) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  let width = 70;
  let height = 10;
  if (dir === "LR") {
    width = 10;
    height = 70;
  }
  const shape = shapeSvg.append("rect").attr("x", -1 * width / 2).attr("y", -1 * height / 2).attr("width", width).attr("height", height).attr("class", "fork-join");
  updateNodeBounds(node, shape);
  node.height = node.height + node.padding / 2;
  node.width = node.width + node.padding / 2;
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
const end = (parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "node default").attr("id", node.domId || node.id);
  const innerCircle = shapeSvg.insert("circle", ":first-child");
  const circle2 = shapeSvg.insert("circle", ":first-child");
  circle2.attr("class", "state-start").attr("r", 7).attr("width", 14).attr("height", 14);
  innerCircle.attr("class", "state-end").attr("r", 5).attr("width", 10).attr("height", 10);
  updateNodeBounds(node, circle2);
  node.intersect = function(point2) {
    return intersect.circle(node, 7, point2);
  };
  return shapeSvg;
};
const class_box = (parent, node) => {
  const halfPadding = node.padding / 2;
  const rowPadding = 4;
  const lineHeight = 8;
  let classes;
  if (!node.classes) {
    classes = "node default";
  } else {
    classes = "node " + node.classes;
  }
  const shapeSvg = parent.insert("g").attr("class", classes).attr("id", node.domId || node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const topLine = shapeSvg.insert("line");
  const bottomLine = shapeSvg.insert("line");
  let maxWidth = 0;
  let maxHeight = rowPadding;
  const labelContainer = shapeSvg.insert("g").attr("class", "label");
  let verticalPos = 0;
  const hasInterface = node.classData.annotations && node.classData.annotations[0];
  const interfaceLabelText = node.classData.annotations[0] ? "«" + node.classData.annotations[0] + "»" : "";
  const interfaceLabel = labelContainer.node().appendChild(createLabel$1(interfaceLabelText, node.labelStyle, true, true));
  let interfaceBBox = interfaceLabel.getBBox();
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels)) {
    const div = interfaceLabel.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(interfaceLabel);
    interfaceBBox = div.getBoundingClientRect();
    dv.attr("width", interfaceBBox.width);
    dv.attr("height", interfaceBBox.height);
  }
  if (node.classData.annotations[0]) {
    maxHeight += interfaceBBox.height + rowPadding;
    maxWidth += interfaceBBox.width;
  }
  let classTitleString = node.classData.label;
  if (node.classData.type !== void 0 && node.classData.type !== "") {
    if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels) {
      classTitleString += "&lt;" + node.classData.type + "&gt;";
    } else {
      classTitleString += "<" + node.classData.type + ">";
    }
  }
  const classTitleLabel = labelContainer.node().appendChild(createLabel$1(classTitleString, node.labelStyle, true, true));
  (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(classTitleLabel).attr("class", "classTitle");
  let classTitleBBox = classTitleLabel.getBBox();
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels)) {
    const div = classTitleLabel.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(classTitleLabel);
    classTitleBBox = div.getBoundingClientRect();
    dv.attr("width", classTitleBBox.width);
    dv.attr("height", classTitleBBox.height);
  }
  maxHeight += classTitleBBox.height + rowPadding;
  if (classTitleBBox.width > maxWidth) {
    maxWidth = classTitleBBox.width;
  }
  const classAttributes = [];
  node.classData.members.forEach((member) => {
    const parsedInfo = member.getDisplayDetails();
    let parsedText = parsedInfo.displayText;
    if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels) {
      parsedText = parsedText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const lbl = labelContainer.node().appendChild(
      createLabel$1(
        parsedText,
        parsedInfo.cssStyle ? parsedInfo.cssStyle : node.labelStyle,
        true,
        true
      )
    );
    let bbox = lbl.getBBox();
    if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels)) {
      const div = lbl.children[0];
      const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(lbl);
      bbox = div.getBoundingClientRect();
      dv.attr("width", bbox.width);
      dv.attr("height", bbox.height);
    }
    if (bbox.width > maxWidth) {
      maxWidth = bbox.width;
    }
    maxHeight += bbox.height + rowPadding;
    classAttributes.push(lbl);
  });
  maxHeight += lineHeight;
  const classMethods = [];
  node.classData.methods.forEach((member) => {
    const parsedInfo = member.getDisplayDetails();
    let displayText = parsedInfo.displayText;
    if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels) {
      displayText = displayText.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    const lbl = labelContainer.node().appendChild(
      createLabel$1(
        displayText,
        parsedInfo.cssStyle ? parsedInfo.cssStyle : node.labelStyle,
        true,
        true
      )
    );
    let bbox = lbl.getBBox();
    if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels)) {
      const div = lbl.children[0];
      const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(lbl);
      bbox = div.getBoundingClientRect();
      dv.attr("width", bbox.width);
      dv.attr("height", bbox.height);
    }
    if (bbox.width > maxWidth) {
      maxWidth = bbox.width;
    }
    maxHeight += bbox.height + rowPadding;
    classMethods.push(lbl);
  });
  maxHeight += lineHeight;
  if (hasInterface) {
    let diffX2 = (maxWidth - interfaceBBox.width) / 2;
    (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(interfaceLabel).attr(
      "transform",
      "translate( " + (-1 * maxWidth / 2 + diffX2) + ", " + -1 * maxHeight / 2 + ")"
    );
    verticalPos = interfaceBBox.height + rowPadding;
  }
  let diffX = (maxWidth - classTitleBBox.width) / 2;
  (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(classTitleLabel).attr(
    "transform",
    "translate( " + (-1 * maxWidth / 2 + diffX) + ", " + (-1 * maxHeight / 2 + verticalPos) + ")"
  );
  verticalPos += classTitleBBox.height + rowPadding;
  topLine.attr("class", "divider").attr("x1", -maxWidth / 2 - halfPadding).attr("x2", maxWidth / 2 + halfPadding).attr("y1", -maxHeight / 2 - halfPadding + lineHeight + verticalPos).attr("y2", -maxHeight / 2 - halfPadding + lineHeight + verticalPos);
  verticalPos += lineHeight;
  classAttributes.forEach((lbl) => {
    (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(lbl).attr(
      "transform",
      "translate( " + -maxWidth / 2 + ", " + (-1 * maxHeight / 2 + verticalPos + lineHeight / 2) + ")"
    );
    const memberBBox = lbl == null ? void 0 : lbl.getBBox();
    verticalPos += ((memberBBox == null ? void 0 : memberBBox.height) ?? 0) + rowPadding;
  });
  verticalPos += lineHeight;
  bottomLine.attr("class", "divider").attr("x1", -maxWidth / 2 - halfPadding).attr("x2", maxWidth / 2 + halfPadding).attr("y1", -maxHeight / 2 - halfPadding + lineHeight + verticalPos).attr("y2", -maxHeight / 2 - halfPadding + lineHeight + verticalPos);
  verticalPos += lineHeight;
  classMethods.forEach((lbl) => {
    (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(lbl).attr(
      "transform",
      "translate( " + -maxWidth / 2 + ", " + (-1 * maxHeight / 2 + verticalPos) + ")"
    );
    const memberBBox = lbl == null ? void 0 : lbl.getBBox();
    verticalPos += ((memberBBox == null ? void 0 : memberBBox.height) ?? 0) + rowPadding;
  });
  rect2.attr("style", node.style).attr("class", "outer title-state").attr("x", -maxWidth / 2 - halfPadding).attr("y", -(maxHeight / 2) - halfPadding).attr("width", maxWidth + node.padding).attr("height", maxHeight + node.padding);
  updateNodeBounds(node, rect2);
  node.intersect = function(point2) {
    return intersect.rect(node, point2);
  };
  return shapeSvg;
};
const shapes = {
  rhombus: question,
  composite,
  question,
  rect,
  labelRect,
  rectWithTitle,
  choice,
  circle,
  doublecircle,
  stadium,
  hexagon,
  block_arrow,
  rect_left_inv_arrow,
  lean_right,
  lean_left,
  trapezoid,
  inv_trapezoid,
  rect_right_inv_arrow,
  cylinder,
  start,
  end,
  note: note$1,
  subroutine,
  fork: forkJoin,
  join: forkJoin,
  class_box
};
let nodeElems = {};
const insertNode = async (elem, node, dir) => {
  let newEl;
  let el;
  if (node.link) {
    let target;
    if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().securityLevel === "sandbox") {
      target = "_top";
    } else if (node.linkTarget) {
      target = node.linkTarget || "_blank";
    }
    newEl = elem.insert("svg:a").attr("xlink:href", node.link).attr("target", target);
    el = await shapes[node.shape](newEl, node, dir);
  } else {
    el = await shapes[node.shape](elem, node, dir);
    newEl = el;
  }
  if (node.tooltip) {
    el.attr("title", node.tooltip);
  }
  if (node.class) {
    el.attr("class", "node default " + node.class);
  }
  newEl.attr("data-node", "true");
  newEl.attr("data-id", node.id);
  nodeElems[node.id] = newEl;
  if (node.haveCallback) {
    nodeElems[node.id].attr("class", nodeElems[node.id].attr("class") + " clickable");
  }
  return newEl;
};
const setNodeElem = (elem, node) => {
  nodeElems[node.id] = elem;
};
const clear$1 = () => {
  nodeElems = {};
};
const positionNode = (node) => {
  const el = nodeElems[node.id];
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.trace(
    "Transforming node",
    node.diff,
    node,
    "translate(" + (node.x - node.width / 2 - 5) + ", " + node.width / 2 + ")"
  );
  const padding = 8;
  const diff = node.diff || 0;
  if (node.clusterNode) {
    el.attr(
      "transform",
      "translate(" + (node.x + diff - node.width / 2) + ", " + (node.y - node.height / 2 - padding) + ")"
    );
  } else {
    el.attr("transform", "translate(" + node.x + ", " + node.y + ")");
  }
  return diff;
};
const getSubGraphTitleMargins = ({
  flowchart
}) => {
  var _a, _b;
  const subGraphTitleTopMargin = ((_a = flowchart == null ? void 0 : flowchart.subGraphTitleMargin) == null ? void 0 : _a.top) ?? 0;
  const subGraphTitleBottomMargin = ((_b = flowchart == null ? void 0 : flowchart.subGraphTitleMargin) == null ? void 0 : _b.bottom) ?? 0;
  const subGraphTitleTotalMargin = subGraphTitleTopMargin + subGraphTitleBottomMargin;
  return {
    subGraphTitleTopMargin,
    subGraphTitleBottomMargin,
    subGraphTitleTotalMargin
  };
};
const markerOffsets = {
  aggregation: 18,
  extension: 18,
  composition: 18,
  dependency: 6,
  lollipop: 13.5,
  arrow_point: 5.3
};
function calculateDeltaAndAngle(point1, point2) {
  if (point1 === void 0 || point2 === void 0) {
    return { angle: 0, deltaX: 0, deltaY: 0 };
  }
  point1 = pointTransformer(point1);
  point2 = pointTransformer(point2);
  const [x1, y1] = [point1.x, point1.y];
  const [x2, y2] = [point2.x, point2.y];
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  return { angle: Math.atan(deltaY / deltaX), deltaX, deltaY };
}
const pointTransformer = (data) => {
  if (Array.isArray(data)) {
    return { x: data[0], y: data[1] };
  }
  return data;
};
const getLineFunctionsWithOffset = (edge) => {
  return {
    x: function(d, i, data) {
      let offset = 0;
      if (i === 0 && Object.hasOwn(markerOffsets, edge.arrowTypeStart)) {
        const { angle, deltaX } = calculateDeltaAndAngle(data[0], data[1]);
        offset = markerOffsets[edge.arrowTypeStart] * Math.cos(angle) * (deltaX >= 0 ? 1 : -1);
      } else if (i === data.length - 1 && Object.hasOwn(markerOffsets, edge.arrowTypeEnd)) {
        const { angle, deltaX } = calculateDeltaAndAngle(
          data[data.length - 1],
          data[data.length - 2]
        );
        offset = markerOffsets[edge.arrowTypeEnd] * Math.cos(angle) * (deltaX >= 0 ? 1 : -1);
      }
      return pointTransformer(d).x + offset;
    },
    y: function(d, i, data) {
      let offset = 0;
      if (i === 0 && Object.hasOwn(markerOffsets, edge.arrowTypeStart)) {
        const { angle, deltaY } = calculateDeltaAndAngle(data[0], data[1]);
        offset = markerOffsets[edge.arrowTypeStart] * Math.abs(Math.sin(angle)) * (deltaY >= 0 ? 1 : -1);
      } else if (i === data.length - 1 && Object.hasOwn(markerOffsets, edge.arrowTypeEnd)) {
        const { angle, deltaY } = calculateDeltaAndAngle(
          data[data.length - 1],
          data[data.length - 2]
        );
        offset = markerOffsets[edge.arrowTypeEnd] * Math.abs(Math.sin(angle)) * (deltaY >= 0 ? 1 : -1);
      }
      return pointTransformer(d).y + offset;
    }
  };
};
const addEdgeMarkers = (svgPath, edge, url, id, diagramType) => {
  if (edge.arrowTypeStart) {
    addEdgeMarker(svgPath, "start", edge.arrowTypeStart, url, id, diagramType);
  }
  if (edge.arrowTypeEnd) {
    addEdgeMarker(svgPath, "end", edge.arrowTypeEnd, url, id, diagramType);
  }
};
const arrowTypesMap = {
  arrow_cross: "cross",
  arrow_point: "point",
  arrow_barb: "barb",
  arrow_circle: "circle",
  aggregation: "aggregation",
  extension: "extension",
  composition: "composition",
  dependency: "dependency",
  lollipop: "lollipop"
};
const addEdgeMarker = (svgPath, position, arrowType, url, id, diagramType) => {
  const endMarkerType = arrowTypesMap[arrowType];
  if (!endMarkerType) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.warn(`Unknown arrow type: ${arrowType}`);
    return;
  }
  const suffix = position === "start" ? "Start" : "End";
  svgPath.attr(`marker-${position}`, `url(${url}#${id}_${diagramType}-${endMarkerType}${suffix})`);
};
let edgeLabels = {};
let terminalLabels = {};
const clear = () => {
  edgeLabels = {};
  terminalLabels = {};
};
const insertEdgeLabel = (elem, edge) => {
  const useHtmlLabels = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels);
  const labelElement = edge.labelType === "markdown" ? (0,_createText_1719965b_js__WEBPACK_IMPORTED_MODULE_2__.a)(elem, edge.label, {
    style: edge.labelStyle,
    useHtmlLabels,
    addSvgBackground: true
  }) : createLabel$1(edge.label, edge.labelStyle);
  const edgeLabel = elem.insert("g").attr("class", "edgeLabel");
  const label = edgeLabel.insert("g").attr("class", "label");
  label.node().appendChild(labelElement);
  let bbox = labelElement.getBBox();
  if (useHtmlLabels) {
    const div = labelElement.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(labelElement);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  label.attr("transform", "translate(" + -bbox.width / 2 + ", " + -bbox.height / 2 + ")");
  edgeLabels[edge.id] = edgeLabel;
  edge.width = bbox.width;
  edge.height = bbox.height;
  let fo;
  if (edge.startLabelLeft) {
    const startLabelElement = createLabel$1(edge.startLabelLeft, edge.labelStyle);
    const startEdgeLabelLeft = elem.insert("g").attr("class", "edgeTerminals");
    const inner = startEdgeLabelLeft.insert("g").attr("class", "inner");
    fo = inner.node().appendChild(startLabelElement);
    const slBox = startLabelElement.getBBox();
    inner.attr("transform", "translate(" + -slBox.width / 2 + ", " + -slBox.height / 2 + ")");
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].startLeft = startEdgeLabelLeft;
    setTerminalWidth(fo, edge.startLabelLeft);
  }
  if (edge.startLabelRight) {
    const startLabelElement = createLabel$1(edge.startLabelRight, edge.labelStyle);
    const startEdgeLabelRight = elem.insert("g").attr("class", "edgeTerminals");
    const inner = startEdgeLabelRight.insert("g").attr("class", "inner");
    fo = startEdgeLabelRight.node().appendChild(startLabelElement);
    inner.node().appendChild(startLabelElement);
    const slBox = startLabelElement.getBBox();
    inner.attr("transform", "translate(" + -slBox.width / 2 + ", " + -slBox.height / 2 + ")");
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].startRight = startEdgeLabelRight;
    setTerminalWidth(fo, edge.startLabelRight);
  }
  if (edge.endLabelLeft) {
    const endLabelElement = createLabel$1(edge.endLabelLeft, edge.labelStyle);
    const endEdgeLabelLeft = elem.insert("g").attr("class", "edgeTerminals");
    const inner = endEdgeLabelLeft.insert("g").attr("class", "inner");
    fo = inner.node().appendChild(endLabelElement);
    const slBox = endLabelElement.getBBox();
    inner.attr("transform", "translate(" + -slBox.width / 2 + ", " + -slBox.height / 2 + ")");
    endEdgeLabelLeft.node().appendChild(endLabelElement);
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].endLeft = endEdgeLabelLeft;
    setTerminalWidth(fo, edge.endLabelLeft);
  }
  if (edge.endLabelRight) {
    const endLabelElement = createLabel$1(edge.endLabelRight, edge.labelStyle);
    const endEdgeLabelRight = elem.insert("g").attr("class", "edgeTerminals");
    const inner = endEdgeLabelRight.insert("g").attr("class", "inner");
    fo = inner.node().appendChild(endLabelElement);
    const slBox = endLabelElement.getBBox();
    inner.attr("transform", "translate(" + -slBox.width / 2 + ", " + -slBox.height / 2 + ")");
    endEdgeLabelRight.node().appendChild(endLabelElement);
    if (!terminalLabels[edge.id]) {
      terminalLabels[edge.id] = {};
    }
    terminalLabels[edge.id].endRight = endEdgeLabelRight;
    setTerminalWidth(fo, edge.endLabelRight);
  }
  return labelElement;
};
function setTerminalWidth(fo, value) {
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.htmlLabels && fo) {
    fo.style.width = value.length * 9 + "px";
    fo.style.height = "12px";
  }
}
const positionEdgeLabel = (edge, paths) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("Moving label abc88 ", edge.id, edge.label, edgeLabels[edge.id], paths);
  let path = paths.updatedPath ? paths.updatedPath : paths.originalPath;
  const siteConfig = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)();
  const { subGraphTitleTotalMargin } = getSubGraphTitleMargins(siteConfig);
  if (edge.label) {
    const el = edgeLabels[edge.id];
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.calcLabelPosition(path);
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug(
        "Moving label " + edge.label + " from (",
        x,
        ",",
        y,
        ") to (",
        pos.x,
        ",",
        pos.y,
        ") abc88"
      );
      if (paths.updatedPath) {
        x = pos.x;
        y = pos.y;
      }
    }
    el.attr("transform", `translate(${x}, ${y + subGraphTitleTotalMargin / 2})`);
  }
  if (edge.startLabelLeft) {
    const el = terminalLabels[edge.id].startLeft;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.calcTerminalLabelPosition(edge.arrowTypeStart ? 10 : 0, "start_left", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.startLabelRight) {
    const el = terminalLabels[edge.id].startRight;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.calcTerminalLabelPosition(
        edge.arrowTypeStart ? 10 : 0,
        "start_right",
        path
      );
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.endLabelLeft) {
    const el = terminalLabels[edge.id].endLeft;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.calcTerminalLabelPosition(edge.arrowTypeEnd ? 10 : 0, "end_left", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
  if (edge.endLabelRight) {
    const el = terminalLabels[edge.id].endRight;
    let x = edge.x;
    let y = edge.y;
    if (path) {
      const pos = _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.calcTerminalLabelPosition(edge.arrowTypeEnd ? 10 : 0, "end_right", path);
      x = pos.x;
      y = pos.y;
    }
    el.attr("transform", `translate(${x}, ${y})`);
  }
};
const outsideNode = (node, point2) => {
  const x = node.x;
  const y = node.y;
  const dx = Math.abs(point2.x - x);
  const dy = Math.abs(point2.y - y);
  const w = node.width / 2;
  const h = node.height / 2;
  if (dx >= w || dy >= h) {
    return true;
  }
  return false;
};
const intersection = (node, outsidePoint, insidePoint) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug(`intersection calc abc89:
  outsidePoint: ${JSON.stringify(outsidePoint)}
  insidePoint : ${JSON.stringify(insidePoint)}
  node        : x:${node.x} y:${node.y} w:${node.width} h:${node.height}`);
  const x = node.x;
  const y = node.y;
  const dx = Math.abs(x - insidePoint.x);
  const w = node.width / 2;
  let r = insidePoint.x < outsidePoint.x ? w - dx : w + dx;
  const h = node.height / 2;
  const Q = Math.abs(outsidePoint.y - insidePoint.y);
  const R = Math.abs(outsidePoint.x - insidePoint.x);
  if (Math.abs(y - outsidePoint.y) * w > Math.abs(x - outsidePoint.x) * h) {
    let q = insidePoint.y < outsidePoint.y ? outsidePoint.y - h - y : y - h - outsidePoint.y;
    r = R * q / Q;
    const res = {
      x: insidePoint.x < outsidePoint.x ? insidePoint.x + r : insidePoint.x - R + r,
      y: insidePoint.y < outsidePoint.y ? insidePoint.y + Q - q : insidePoint.y - Q + q
    };
    if (r === 0) {
      res.x = outsidePoint.x;
      res.y = outsidePoint.y;
    }
    if (R === 0) {
      res.x = outsidePoint.x;
    }
    if (Q === 0) {
      res.y = outsidePoint.y;
    }
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug(`abc89 topp/bott calc, Q ${Q}, q ${q}, R ${R}, r ${r}`, res);
    return res;
  } else {
    if (insidePoint.x < outsidePoint.x) {
      r = outsidePoint.x - w - x;
    } else {
      r = x - w - outsidePoint.x;
    }
    let q = Q * r / R;
    let _x = insidePoint.x < outsidePoint.x ? insidePoint.x + R - r : insidePoint.x - R + r;
    let _y = insidePoint.y < outsidePoint.y ? insidePoint.y + q : insidePoint.y - q;
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug(`sides calc abc89, Q ${Q}, q ${q}, R ${R}, r ${r}`, { _x, _y });
    if (r === 0) {
      _x = outsidePoint.x;
      _y = outsidePoint.y;
    }
    if (R === 0) {
      _x = outsidePoint.x;
    }
    if (Q === 0) {
      _y = outsidePoint.y;
    }
    return { x: _x, y: _y };
  }
};
const cutPathAtIntersect = (_points, boundaryNode) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("abc88 cutPathAtIntersect", _points, boundaryNode);
  let points = [];
  let lastPointOutside = _points[0];
  let isInside = false;
  _points.forEach((point2) => {
    if (!outsideNode(boundaryNode, point2) && !isInside) {
      const inter = intersection(boundaryNode, lastPointOutside, point2);
      let pointPresent = false;
      points.forEach((p) => {
        pointPresent = pointPresent || p.x === inter.x && p.y === inter.y;
      });
      if (!points.some((e) => e.x === inter.x && e.y === inter.y)) {
        points.push(inter);
      }
      isInside = true;
    } else {
      lastPointOutside = point2;
      if (!isInside) {
        points.push(point2);
      }
    }
  });
  return points;
};
const insertEdge = function(elem, e, edge, clusterDb, diagramType, graph, id) {
  let points = edge.points;
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("abc88 InsertEdge: edge=", edge, "e=", e);
  let pointsHasChanged = false;
  const tail = graph.node(e.v);
  var head = graph.node(e.w);
  if ((head == null ? void 0 : head.intersect) && (tail == null ? void 0 : tail.intersect)) {
    points = points.slice(1, edge.points.length - 1);
    points.unshift(tail.intersect(points[0]));
    points.push(head.intersect(points[points.length - 1]));
  }
  if (edge.toCluster) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("to cluster abc88", clusterDb[edge.toCluster]);
    points = cutPathAtIntersect(edge.points, clusterDb[edge.toCluster].node);
    pointsHasChanged = true;
  }
  if (edge.fromCluster) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.debug("from cluster abc88", clusterDb[edge.fromCluster]);
    points = cutPathAtIntersect(points.reverse(), clusterDb[edge.fromCluster].node).reverse();
    pointsHasChanged = true;
  }
  const lineData = points.filter((p) => !Number.isNaN(p.y));
  let curve = d3__WEBPACK_IMPORTED_MODULE_0__/* .curveBasis */ .$0Z;
  if (edge.curve && (diagramType === "graph" || diagramType === "flowchart")) {
    curve = edge.curve;
  }
  const { x, y } = getLineFunctionsWithOffset(edge);
  const lineFunction = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .line */ .jvg)().x(x).y(y).curve(curve);
  let strokeClasses;
  switch (edge.thickness) {
    case "normal":
      strokeClasses = "edge-thickness-normal";
      break;
    case "thick":
      strokeClasses = "edge-thickness-thick";
      break;
    case "invisible":
      strokeClasses = "edge-thickness-thick";
      break;
    default:
      strokeClasses = "";
  }
  switch (edge.pattern) {
    case "solid":
      strokeClasses += " edge-pattern-solid";
      break;
    case "dotted":
      strokeClasses += " edge-pattern-dotted";
      break;
    case "dashed":
      strokeClasses += " edge-pattern-dashed";
      break;
  }
  const svgPath = elem.append("path").attr("d", lineFunction(lineData)).attr("id", edge.id).attr("class", " " + strokeClasses + (edge.classes ? " " + edge.classes : "")).attr("style", edge.style);
  let url = "";
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().flowchart.arrowMarkerAbsolute || (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().state.arrowMarkerAbsolute) {
    url = window.location.protocol + "//" + window.location.host + window.location.pathname + window.location.search;
    url = url.replace(/\(/g, "\\(");
    url = url.replace(/\)/g, "\\)");
  }
  addEdgeMarkers(svgPath, edge, url, id, diagramType);
  let paths = {};
  if (pointsHasChanged) {
    paths.updatedPath = points;
  }
  paths.originalPath = edge.points;
  return paths;
};



/***/ }),

/***/ 99172:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "d": () => (/* binding */ db),
/* harmony export */   "f": () => (/* binding */ flowDb),
/* harmony export */   "p": () => (/* binding */ parser$1)
/* harmony export */ });
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(35417);
/* harmony import */ var _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(93883);


var parser = function() {
  var o = function(k, v, o2, l) {
    for (o2 = o2 || {}, l = k.length; l--; o2[k[l]] = v)
      ;
    return o2;
  }, $V0 = [1, 4], $V1 = [1, 3], $V2 = [1, 5], $V3 = [1, 8, 9, 10, 11, 27, 34, 36, 38, 42, 58, 81, 82, 83, 84, 85, 86, 99, 102, 103, 106, 108, 111, 112, 113, 118, 119, 120, 121], $V4 = [2, 2], $V5 = [1, 13], $V6 = [1, 14], $V7 = [1, 15], $V8 = [1, 16], $V9 = [1, 23], $Va = [1, 25], $Vb = [1, 26], $Vc = [1, 27], $Vd = [1, 49], $Ve = [1, 48], $Vf = [1, 29], $Vg = [1, 30], $Vh = [1, 31], $Vi = [1, 32], $Vj = [1, 33], $Vk = [1, 44], $Vl = [1, 46], $Vm = [1, 42], $Vn = [1, 47], $Vo = [1, 43], $Vp = [1, 50], $Vq = [1, 45], $Vr = [1, 51], $Vs = [1, 52], $Vt = [1, 34], $Vu = [1, 35], $Vv = [1, 36], $Vw = [1, 37], $Vx = [1, 57], $Vy = [1, 8, 9, 10, 11, 27, 32, 34, 36, 38, 42, 58, 81, 82, 83, 84, 85, 86, 99, 102, 103, 106, 108, 111, 112, 113, 118, 119, 120, 121], $Vz = [1, 61], $VA = [1, 60], $VB = [1, 62], $VC = [8, 9, 11, 73, 75], $VD = [1, 88], $VE = [1, 93], $VF = [1, 92], $VG = [1, 89], $VH = [1, 85], $VI = [1, 91], $VJ = [1, 87], $VK = [1, 94], $VL = [1, 90], $VM = [1, 95], $VN = [1, 86], $VO = [8, 9, 10, 11, 73, 75], $VP = [8, 9, 10, 11, 44, 73, 75], $VQ = [8, 9, 10, 11, 29, 42, 44, 46, 48, 50, 52, 54, 56, 58, 61, 63, 65, 66, 68, 73, 75, 86, 99, 102, 103, 106, 108, 111, 112, 113], $VR = [8, 9, 11, 42, 58, 73, 75, 86, 99, 102, 103, 106, 108, 111, 112, 113], $VS = [42, 58, 86, 99, 102, 103, 106, 108, 111, 112, 113], $VT = [1, 121], $VU = [1, 120], $VV = [1, 128], $VW = [1, 142], $VX = [1, 143], $VY = [1, 144], $VZ = [1, 145], $V_ = [1, 130], $V$ = [1, 132], $V01 = [1, 136], $V11 = [1, 137], $V21 = [1, 138], $V31 = [1, 139], $V41 = [1, 140], $V51 = [1, 141], $V61 = [1, 146], $V71 = [1, 147], $V81 = [1, 126], $V91 = [1, 127], $Va1 = [1, 134], $Vb1 = [1, 129], $Vc1 = [1, 133], $Vd1 = [1, 131], $Ve1 = [8, 9, 10, 11, 27, 32, 34, 36, 38, 42, 58, 81, 82, 83, 84, 85, 86, 99, 102, 103, 106, 108, 111, 112, 113, 118, 119, 120, 121], $Vf1 = [1, 149], $Vg1 = [8, 9, 11], $Vh1 = [8, 9, 10, 11, 14, 42, 58, 86, 102, 103, 106, 108, 111, 112, 113], $Vi1 = [1, 169], $Vj1 = [1, 165], $Vk1 = [1, 166], $Vl1 = [1, 170], $Vm1 = [1, 167], $Vn1 = [1, 168], $Vo1 = [75, 113, 116], $Vp1 = [8, 9, 10, 11, 12, 14, 27, 29, 32, 42, 58, 73, 81, 82, 83, 84, 85, 86, 87, 102, 106, 108, 111, 112, 113], $Vq1 = [10, 103], $Vr1 = [31, 47, 49, 51, 53, 55, 60, 62, 64, 65, 67, 69, 113, 114, 115], $Vs1 = [1, 235], $Vt1 = [1, 233], $Vu1 = [1, 237], $Vv1 = [1, 231], $Vw1 = [1, 232], $Vx1 = [1, 234], $Vy1 = [1, 236], $Vz1 = [1, 238], $VA1 = [1, 255], $VB1 = [8, 9, 11, 103], $VC1 = [8, 9, 10, 11, 58, 81, 102, 103, 106, 107, 108, 109];
  var parser2 = {
    trace: function trace() {
    },
    yy: {},
    symbols_: { "error": 2, "start": 3, "graphConfig": 4, "document": 5, "line": 6, "statement": 7, "SEMI": 8, "NEWLINE": 9, "SPACE": 10, "EOF": 11, "GRAPH": 12, "NODIR": 13, "DIR": 14, "FirstStmtSeparator": 15, "ending": 16, "endToken": 17, "spaceList": 18, "spaceListNewline": 19, "vertexStatement": 20, "separator": 21, "styleStatement": 22, "linkStyleStatement": 23, "classDefStatement": 24, "classStatement": 25, "clickStatement": 26, "subgraph": 27, "textNoTags": 28, "SQS": 29, "text": 30, "SQE": 31, "end": 32, "direction": 33, "acc_title": 34, "acc_title_value": 35, "acc_descr": 36, "acc_descr_value": 37, "acc_descr_multiline_value": 38, "link": 39, "node": 40, "styledVertex": 41, "AMP": 42, "vertex": 43, "STYLE_SEPARATOR": 44, "idString": 45, "DOUBLECIRCLESTART": 46, "DOUBLECIRCLEEND": 47, "PS": 48, "PE": 49, "(-": 50, "-)": 51, "STADIUMSTART": 52, "STADIUMEND": 53, "SUBROUTINESTART": 54, "SUBROUTINEEND": 55, "VERTEX_WITH_PROPS_START": 56, "NODE_STRING[field]": 57, "COLON": 58, "NODE_STRING[value]": 59, "PIPE": 60, "CYLINDERSTART": 61, "CYLINDEREND": 62, "DIAMOND_START": 63, "DIAMOND_STOP": 64, "TAGEND": 65, "TRAPSTART": 66, "TRAPEND": 67, "INVTRAPSTART": 68, "INVTRAPEND": 69, "linkStatement": 70, "arrowText": 71, "TESTSTR": 72, "START_LINK": 73, "edgeText": 74, "LINK": 75, "edgeTextToken": 76, "STR": 77, "MD_STR": 78, "textToken": 79, "keywords": 80, "STYLE": 81, "LINKSTYLE": 82, "CLASSDEF": 83, "CLASS": 84, "CLICK": 85, "DOWN": 86, "UP": 87, "textNoTagsToken": 88, "stylesOpt": 89, "idString[vertex]": 90, "idString[class]": 91, "CALLBACKNAME": 92, "CALLBACKARGS": 93, "HREF": 94, "LINK_TARGET": 95, "STR[link]": 96, "STR[tooltip]": 97, "alphaNum": 98, "DEFAULT": 99, "numList": 100, "INTERPOLATE": 101, "NUM": 102, "COMMA": 103, "style": 104, "styleComponent": 105, "NODE_STRING": 106, "UNIT": 107, "BRKT": 108, "PCT": 109, "idStringToken": 110, "MINUS": 111, "MULT": 112, "UNICODE_TEXT": 113, "TEXT": 114, "TAGSTART": 115, "EDGE_TEXT": 116, "alphaNumToken": 117, "direction_tb": 118, "direction_bt": 119, "direction_rl": 120, "direction_lr": 121, "$accept": 0, "$end": 1 },
    terminals_: { 2: "error", 8: "SEMI", 9: "NEWLINE", 10: "SPACE", 11: "EOF", 12: "GRAPH", 13: "NODIR", 14: "DIR", 27: "subgraph", 29: "SQS", 31: "SQE", 32: "end", 34: "acc_title", 35: "acc_title_value", 36: "acc_descr", 37: "acc_descr_value", 38: "acc_descr_multiline_value", 42: "AMP", 44: "STYLE_SEPARATOR", 46: "DOUBLECIRCLESTART", 47: "DOUBLECIRCLEEND", 48: "PS", 49: "PE", 50: "(-", 51: "-)", 52: "STADIUMSTART", 53: "STADIUMEND", 54: "SUBROUTINESTART", 55: "SUBROUTINEEND", 56: "VERTEX_WITH_PROPS_START", 57: "NODE_STRING[field]", 58: "COLON", 59: "NODE_STRING[value]", 60: "PIPE", 61: "CYLINDERSTART", 62: "CYLINDEREND", 63: "DIAMOND_START", 64: "DIAMOND_STOP", 65: "TAGEND", 66: "TRAPSTART", 67: "TRAPEND", 68: "INVTRAPSTART", 69: "INVTRAPEND", 72: "TESTSTR", 73: "START_LINK", 75: "LINK", 77: "STR", 78: "MD_STR", 81: "STYLE", 82: "LINKSTYLE", 83: "CLASSDEF", 84: "CLASS", 85: "CLICK", 86: "DOWN", 87: "UP", 90: "idString[vertex]", 91: "idString[class]", 92: "CALLBACKNAME", 93: "CALLBACKARGS", 94: "HREF", 95: "LINK_TARGET", 96: "STR[link]", 97: "STR[tooltip]", 99: "DEFAULT", 101: "INTERPOLATE", 102: "NUM", 103: "COMMA", 106: "NODE_STRING", 107: "UNIT", 108: "BRKT", 109: "PCT", 111: "MINUS", 112: "MULT", 113: "UNICODE_TEXT", 114: "TEXT", 115: "TAGSTART", 116: "EDGE_TEXT", 118: "direction_tb", 119: "direction_bt", 120: "direction_rl", 121: "direction_lr" },
    productions_: [0, [3, 2], [5, 0], [5, 2], [6, 1], [6, 1], [6, 1], [6, 1], [6, 1], [4, 2], [4, 2], [4, 2], [4, 3], [16, 2], [16, 1], [17, 1], [17, 1], [17, 1], [15, 1], [15, 1], [15, 2], [19, 2], [19, 2], [19, 1], [19, 1], [18, 2], [18, 1], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 2], [7, 9], [7, 6], [7, 4], [7, 1], [7, 2], [7, 2], [7, 1], [21, 1], [21, 1], [21, 1], [20, 3], [20, 4], [20, 2], [20, 1], [40, 1], [40, 5], [41, 1], [41, 3], [43, 4], [43, 4], [43, 6], [43, 4], [43, 4], [43, 4], [43, 8], [43, 4], [43, 4], [43, 4], [43, 6], [43, 4], [43, 4], [43, 4], [43, 4], [43, 4], [43, 1], [39, 2], [39, 3], [39, 3], [39, 1], [39, 3], [74, 1], [74, 2], [74, 1], [74, 1], [70, 1], [71, 3], [30, 1], [30, 2], [30, 1], [30, 1], [80, 1], [80, 1], [80, 1], [80, 1], [80, 1], [80, 1], [80, 1], [80, 1], [80, 1], [80, 1], [80, 1], [28, 1], [28, 2], [28, 1], [28, 1], [24, 5], [25, 5], [26, 2], [26, 4], [26, 3], [26, 5], [26, 3], [26, 5], [26, 5], [26, 7], [26, 2], [26, 4], [26, 2], [26, 4], [26, 4], [26, 6], [22, 5], [23, 5], [23, 5], [23, 9], [23, 9], [23, 7], [23, 7], [100, 1], [100, 3], [89, 1], [89, 3], [104, 1], [104, 2], [105, 1], [105, 1], [105, 1], [105, 1], [105, 1], [105, 1], [105, 1], [105, 1], [110, 1], [110, 1], [110, 1], [110, 1], [110, 1], [110, 1], [110, 1], [110, 1], [110, 1], [110, 1], [110, 1], [79, 1], [79, 1], [79, 1], [79, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [88, 1], [76, 1], [76, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [117, 1], [45, 1], [45, 2], [98, 1], [98, 2], [33, 1], [33, 1], [33, 1], [33, 1]],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$) {
      var $0 = $$.length - 1;
      switch (yystate) {
        case 2:
          this.$ = [];
          break;
        case 3:
          if (!Array.isArray($$[$0]) || $$[$0].length > 0) {
            $$[$0 - 1].push($$[$0]);
          }
          this.$ = $$[$0 - 1];
          break;
        case 4:
        case 176:
          this.$ = $$[$0];
          break;
        case 11:
          yy.setDirection("TB");
          this.$ = "TB";
          break;
        case 12:
          yy.setDirection($$[$0 - 1]);
          this.$ = $$[$0 - 1];
          break;
        case 27:
          this.$ = $$[$0 - 1].nodes;
          break;
        case 28:
        case 29:
        case 30:
        case 31:
        case 32:
          this.$ = [];
          break;
        case 33:
          this.$ = yy.addSubGraph($$[$0 - 6], $$[$0 - 1], $$[$0 - 4]);
          break;
        case 34:
          this.$ = yy.addSubGraph($$[$0 - 3], $$[$0 - 1], $$[$0 - 3]);
          break;
        case 35:
          this.$ = yy.addSubGraph(void 0, $$[$0 - 1], void 0);
          break;
        case 37:
          this.$ = $$[$0].trim();
          yy.setAccTitle(this.$);
          break;
        case 38:
        case 39:
          this.$ = $$[$0].trim();
          yy.setAccDescription(this.$);
          break;
        case 43:
          yy.addLink($$[$0 - 2].stmt, $$[$0], $$[$0 - 1]);
          this.$ = { stmt: $$[$0], nodes: $$[$0].concat($$[$0 - 2].nodes) };
          break;
        case 44:
          yy.addLink($$[$0 - 3].stmt, $$[$0 - 1], $$[$0 - 2]);
          this.$ = { stmt: $$[$0 - 1], nodes: $$[$0 - 1].concat($$[$0 - 3].nodes) };
          break;
        case 45:
          this.$ = { stmt: $$[$0 - 1], nodes: $$[$0 - 1] };
          break;
        case 46:
          this.$ = { stmt: $$[$0], nodes: $$[$0] };
          break;
        case 47:
          this.$ = [$$[$0]];
          break;
        case 48:
          this.$ = $$[$0 - 4].concat($$[$0]);
          break;
        case 49:
          this.$ = $$[$0];
          break;
        case 50:
          this.$ = $$[$0 - 2];
          yy.setClass($$[$0 - 2], $$[$0]);
          break;
        case 51:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "square");
          break;
        case 52:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "doublecircle");
          break;
        case 53:
          this.$ = $$[$0 - 5];
          yy.addVertex($$[$0 - 5], $$[$0 - 2], "circle");
          break;
        case 54:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "ellipse");
          break;
        case 55:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "stadium");
          break;
        case 56:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "subroutine");
          break;
        case 57:
          this.$ = $$[$0 - 7];
          yy.addVertex($$[$0 - 7], $$[$0 - 1], "rect", void 0, void 0, void 0, Object.fromEntries([[$$[$0 - 5], $$[$0 - 3]]]));
          break;
        case 58:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "cylinder");
          break;
        case 59:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "round");
          break;
        case 60:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "diamond");
          break;
        case 61:
          this.$ = $$[$0 - 5];
          yy.addVertex($$[$0 - 5], $$[$0 - 2], "hexagon");
          break;
        case 62:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "odd");
          break;
        case 63:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "trapezoid");
          break;
        case 64:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "inv_trapezoid");
          break;
        case 65:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "lean_right");
          break;
        case 66:
          this.$ = $$[$0 - 3];
          yy.addVertex($$[$0 - 3], $$[$0 - 1], "lean_left");
          break;
        case 67:
          this.$ = $$[$0];
          yy.addVertex($$[$0]);
          break;
        case 68:
          $$[$0 - 1].text = $$[$0];
          this.$ = $$[$0 - 1];
          break;
        case 69:
        case 70:
          $$[$0 - 2].text = $$[$0 - 1];
          this.$ = $$[$0 - 2];
          break;
        case 71:
          this.$ = $$[$0];
          break;
        case 72:
          var inf = yy.destructLink($$[$0], $$[$0 - 2]);
          this.$ = { "type": inf.type, "stroke": inf.stroke, "length": inf.length, "text": $$[$0 - 1] };
          break;
        case 73:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 74:
          this.$ = { text: $$[$0 - 1].text + "" + $$[$0], type: $$[$0 - 1].type };
          break;
        case 75:
          this.$ = { text: $$[$0], type: "string" };
          break;
        case 76:
          this.$ = { text: $$[$0], type: "markdown" };
          break;
        case 77:
          var inf = yy.destructLink($$[$0]);
          this.$ = { "type": inf.type, "stroke": inf.stroke, "length": inf.length };
          break;
        case 78:
          this.$ = $$[$0 - 1];
          break;
        case 79:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 80:
          this.$ = { text: $$[$0 - 1].text + "" + $$[$0], type: $$[$0 - 1].type };
          break;
        case 81:
          this.$ = { text: $$[$0], type: "string" };
          break;
        case 82:
        case 97:
          this.$ = { text: $$[$0], type: "markdown" };
          break;
        case 94:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 95:
          this.$ = { text: $$[$0 - 1].text + "" + $$[$0], type: $$[$0 - 1].type };
          break;
        case 96:
          this.$ = { text: $$[$0], type: "text" };
          break;
        case 98:
          this.$ = $$[$0 - 4];
          yy.addClass($$[$0 - 2], $$[$0]);
          break;
        case 99:
          this.$ = $$[$0 - 4];
          yy.setClass($$[$0 - 2], $$[$0]);
          break;
        case 100:
        case 108:
          this.$ = $$[$0 - 1];
          yy.setClickEvent($$[$0 - 1], $$[$0]);
          break;
        case 101:
        case 109:
          this.$ = $$[$0 - 3];
          yy.setClickEvent($$[$0 - 3], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 3], $$[$0]);
          break;
        case 102:
          this.$ = $$[$0 - 2];
          yy.setClickEvent($$[$0 - 2], $$[$0 - 1], $$[$0]);
          break;
        case 103:
          this.$ = $$[$0 - 4];
          yy.setClickEvent($$[$0 - 4], $$[$0 - 3], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 4], $$[$0]);
          break;
        case 104:
          this.$ = $$[$0 - 2];
          yy.setLink($$[$0 - 2], $$[$0]);
          break;
        case 105:
          this.$ = $$[$0 - 4];
          yy.setLink($$[$0 - 4], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 4], $$[$0]);
          break;
        case 106:
          this.$ = $$[$0 - 4];
          yy.setLink($$[$0 - 4], $$[$0 - 2], $$[$0]);
          break;
        case 107:
          this.$ = $$[$0 - 6];
          yy.setLink($$[$0 - 6], $$[$0 - 4], $$[$0]);
          yy.setTooltip($$[$0 - 6], $$[$0 - 2]);
          break;
        case 110:
          this.$ = $$[$0 - 1];
          yy.setLink($$[$0 - 1], $$[$0]);
          break;
        case 111:
          this.$ = $$[$0 - 3];
          yy.setLink($$[$0 - 3], $$[$0 - 2]);
          yy.setTooltip($$[$0 - 3], $$[$0]);
          break;
        case 112:
          this.$ = $$[$0 - 3];
          yy.setLink($$[$0 - 3], $$[$0 - 2], $$[$0]);
          break;
        case 113:
          this.$ = $$[$0 - 5];
          yy.setLink($$[$0 - 5], $$[$0 - 4], $$[$0]);
          yy.setTooltip($$[$0 - 5], $$[$0 - 2]);
          break;
        case 114:
          this.$ = $$[$0 - 4];
          yy.addVertex($$[$0 - 2], void 0, void 0, $$[$0]);
          break;
        case 115:
          this.$ = $$[$0 - 4];
          yy.updateLink([$$[$0 - 2]], $$[$0]);
          break;
        case 116:
          this.$ = $$[$0 - 4];
          yy.updateLink($$[$0 - 2], $$[$0]);
          break;
        case 117:
          this.$ = $$[$0 - 8];
          yy.updateLinkInterpolate([$$[$0 - 6]], $$[$0 - 2]);
          yy.updateLink([$$[$0 - 6]], $$[$0]);
          break;
        case 118:
          this.$ = $$[$0 - 8];
          yy.updateLinkInterpolate($$[$0 - 6], $$[$0 - 2]);
          yy.updateLink($$[$0 - 6], $$[$0]);
          break;
        case 119:
          this.$ = $$[$0 - 6];
          yy.updateLinkInterpolate([$$[$0 - 4]], $$[$0]);
          break;
        case 120:
          this.$ = $$[$0 - 6];
          yy.updateLinkInterpolate($$[$0 - 4], $$[$0]);
          break;
        case 121:
        case 123:
          this.$ = [$$[$0]];
          break;
        case 122:
        case 124:
          $$[$0 - 2].push($$[$0]);
          this.$ = $$[$0 - 2];
          break;
        case 126:
          this.$ = $$[$0 - 1] + $$[$0];
          break;
        case 174:
          this.$ = $$[$0];
          break;
        case 175:
          this.$ = $$[$0 - 1] + "" + $$[$0];
          break;
        case 177:
          this.$ = $$[$0 - 1] + "" + $$[$0];
          break;
        case 178:
          this.$ = { stmt: "dir", value: "TB" };
          break;
        case 179:
          this.$ = { stmt: "dir", value: "BT" };
          break;
        case 180:
          this.$ = { stmt: "dir", value: "RL" };
          break;
        case 181:
          this.$ = { stmt: "dir", value: "LR" };
          break;
      }
    },
    table: [{ 3: 1, 4: 2, 9: $V0, 10: $V1, 12: $V2 }, { 1: [3] }, o($V3, $V4, { 5: 6 }), { 4: 7, 9: $V0, 10: $V1, 12: $V2 }, { 4: 8, 9: $V0, 10: $V1, 12: $V2 }, { 13: [1, 9], 14: [1, 10] }, { 1: [2, 1], 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 40: 28, 41: 38, 42: $Vd, 43: 39, 45: 40, 58: $Ve, 81: $Vf, 82: $Vg, 83: $Vh, 84: $Vi, 85: $Vj, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs, 118: $Vt, 119: $Vu, 120: $Vv, 121: $Vw }, o($V3, [2, 9]), o($V3, [2, 10]), o($V3, [2, 11]), { 8: [1, 54], 9: [1, 55], 10: $Vx, 15: 53, 18: 56 }, o($Vy, [2, 3]), o($Vy, [2, 4]), o($Vy, [2, 5]), o($Vy, [2, 6]), o($Vy, [2, 7]), o($Vy, [2, 8]), { 8: $Vz, 9: $VA, 11: $VB, 21: 58, 39: 59, 70: 63, 73: [1, 64], 75: [1, 65] }, { 8: $Vz, 9: $VA, 11: $VB, 21: 66 }, { 8: $Vz, 9: $VA, 11: $VB, 21: 67 }, { 8: $Vz, 9: $VA, 11: $VB, 21: 68 }, { 8: $Vz, 9: $VA, 11: $VB, 21: 69 }, { 8: $Vz, 9: $VA, 11: $VB, 21: 70 }, { 8: $Vz, 9: $VA, 10: [1, 71], 11: $VB, 21: 72 }, o($Vy, [2, 36]), { 35: [1, 73] }, { 37: [1, 74] }, o($Vy, [2, 39]), o($VC, [2, 46], { 18: 75, 10: $Vx }), { 10: [1, 76] }, { 10: [1, 77] }, { 10: [1, 78] }, { 10: [1, 79] }, { 14: $VD, 42: $VE, 58: $VF, 77: [1, 83], 86: $VG, 92: [1, 80], 94: [1, 81], 98: 82, 102: $VH, 103: $VI, 106: $VJ, 108: $VK, 111: $VL, 112: $VM, 113: $VN, 117: 84 }, o($Vy, [2, 178]), o($Vy, [2, 179]), o($Vy, [2, 180]), o($Vy, [2, 181]), o($VO, [2, 47]), o($VO, [2, 49], { 44: [1, 96] }), o($VP, [2, 67], { 110: 109, 29: [1, 97], 42: $Vd, 46: [1, 98], 48: [1, 99], 50: [1, 100], 52: [1, 101], 54: [1, 102], 56: [1, 103], 58: $Ve, 61: [1, 104], 63: [1, 105], 65: [1, 106], 66: [1, 107], 68: [1, 108], 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 111: $Vq, 112: $Vr, 113: $Vs }), o($VQ, [2, 174]), o($VQ, [2, 135]), o($VQ, [2, 136]), o($VQ, [2, 137]), o($VQ, [2, 138]), o($VQ, [2, 139]), o($VQ, [2, 140]), o($VQ, [2, 141]), o($VQ, [2, 142]), o($VQ, [2, 143]), o($VQ, [2, 144]), o($VQ, [2, 145]), o($V3, [2, 12]), o($V3, [2, 18]), o($V3, [2, 19]), { 9: [1, 110] }, o($VR, [2, 26], { 18: 111, 10: $Vx }), o($Vy, [2, 27]), { 40: 112, 41: 38, 42: $Vd, 43: 39, 45: 40, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs }, o($Vy, [2, 40]), o($Vy, [2, 41]), o($Vy, [2, 42]), o($VS, [2, 71], { 71: 113, 60: [1, 115], 72: [1, 114] }), { 74: 116, 76: 117, 77: [1, 118], 78: [1, 119], 113: $VT, 116: $VU }, o([42, 58, 60, 72, 86, 99, 102, 103, 106, 108, 111, 112, 113], [2, 77]), o($Vy, [2, 28]), o($Vy, [2, 29]), o($Vy, [2, 30]), o($Vy, [2, 31]), o($Vy, [2, 32]), { 10: $VV, 12: $VW, 14: $VX, 27: $VY, 28: 122, 32: $VZ, 42: $V_, 58: $V$, 73: $V01, 77: [1, 124], 78: [1, 125], 80: 135, 81: $V11, 82: $V21, 83: $V31, 84: $V41, 85: $V51, 86: $V61, 87: $V71, 88: 123, 102: $V81, 106: $V91, 108: $Va1, 111: $Vb1, 112: $Vc1, 113: $Vd1 }, o($Ve1, $V4, { 5: 148 }), o($Vy, [2, 37]), o($Vy, [2, 38]), o($VC, [2, 45], { 42: $Vf1 }), { 42: $Vd, 45: 150, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs }, { 99: [1, 151], 100: 152, 102: [1, 153] }, { 42: $Vd, 45: 154, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs }, { 42: $Vd, 45: 155, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs }, o($Vg1, [2, 100], { 10: [1, 156], 93: [1, 157] }), { 77: [1, 158] }, o($Vg1, [2, 108], { 117: 160, 10: [1, 159], 14: $VD, 42: $VE, 58: $VF, 86: $VG, 102: $VH, 103: $VI, 106: $VJ, 108: $VK, 111: $VL, 112: $VM, 113: $VN }), o($Vg1, [2, 110], { 10: [1, 161] }), o($Vh1, [2, 176]), o($Vh1, [2, 163]), o($Vh1, [2, 164]), o($Vh1, [2, 165]), o($Vh1, [2, 166]), o($Vh1, [2, 167]), o($Vh1, [2, 168]), o($Vh1, [2, 169]), o($Vh1, [2, 170]), o($Vh1, [2, 171]), o($Vh1, [2, 172]), o($Vh1, [2, 173]), { 42: $Vd, 45: 162, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs }, { 30: 163, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 171, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 173, 48: [1, 172], 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 174, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 175, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 176, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 106: [1, 177] }, { 30: 178, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 179, 63: [1, 180], 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 181, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 182, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 183, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($VQ, [2, 175]), o($V3, [2, 20]), o($VR, [2, 25]), o($VC, [2, 43], { 18: 184, 10: $Vx }), o($VS, [2, 68], { 10: [1, 185] }), { 10: [1, 186] }, { 30: 187, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 75: [1, 188], 76: 189, 113: $VT, 116: $VU }, o($Vo1, [2, 73]), o($Vo1, [2, 75]), o($Vo1, [2, 76]), o($Vo1, [2, 161]), o($Vo1, [2, 162]), { 8: $Vz, 9: $VA, 10: $VV, 11: $VB, 12: $VW, 14: $VX, 21: 191, 27: $VY, 29: [1, 190], 32: $VZ, 42: $V_, 58: $V$, 73: $V01, 80: 135, 81: $V11, 82: $V21, 83: $V31, 84: $V41, 85: $V51, 86: $V61, 87: $V71, 88: 192, 102: $V81, 106: $V91, 108: $Va1, 111: $Vb1, 112: $Vc1, 113: $Vd1 }, o($Vp1, [2, 94]), o($Vp1, [2, 96]), o($Vp1, [2, 97]), o($Vp1, [2, 150]), o($Vp1, [2, 151]), o($Vp1, [2, 152]), o($Vp1, [2, 153]), o($Vp1, [2, 154]), o($Vp1, [2, 155]), o($Vp1, [2, 156]), o($Vp1, [2, 157]), o($Vp1, [2, 158]), o($Vp1, [2, 159]), o($Vp1, [2, 160]), o($Vp1, [2, 83]), o($Vp1, [2, 84]), o($Vp1, [2, 85]), o($Vp1, [2, 86]), o($Vp1, [2, 87]), o($Vp1, [2, 88]), o($Vp1, [2, 89]), o($Vp1, [2, 90]), o($Vp1, [2, 91]), o($Vp1, [2, 92]), o($Vp1, [2, 93]), { 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 32: [1, 193], 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 40: 28, 41: 38, 42: $Vd, 43: 39, 45: 40, 58: $Ve, 81: $Vf, 82: $Vg, 83: $Vh, 84: $Vi, 85: $Vj, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs, 118: $Vt, 119: $Vu, 120: $Vv, 121: $Vw }, { 10: $Vx, 18: 194 }, { 10: [1, 195], 42: $Vd, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 109, 111: $Vq, 112: $Vr, 113: $Vs }, { 10: [1, 196] }, { 10: [1, 197], 103: [1, 198] }, o($Vq1, [2, 121]), { 10: [1, 199], 42: $Vd, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 109, 111: $Vq, 112: $Vr, 113: $Vs }, { 10: [1, 200], 42: $Vd, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 109, 111: $Vq, 112: $Vr, 113: $Vs }, { 77: [1, 201] }, o($Vg1, [2, 102], { 10: [1, 202] }), o($Vg1, [2, 104], { 10: [1, 203] }), { 77: [1, 204] }, o($Vh1, [2, 177]), { 77: [1, 205], 95: [1, 206] }, o($VO, [2, 50], { 110: 109, 42: $Vd, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 111: $Vq, 112: $Vr, 113: $Vs }), { 31: [1, 207], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($Vr1, [2, 79]), o($Vr1, [2, 81]), o($Vr1, [2, 82]), o($Vr1, [2, 146]), o($Vr1, [2, 147]), o($Vr1, [2, 148]), o($Vr1, [2, 149]), { 47: [1, 209], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 210, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 49: [1, 211], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 51: [1, 212], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 53: [1, 213], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 55: [1, 214], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 58: [1, 215] }, { 62: [1, 216], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 64: [1, 217], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 30: 218, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 31: [1, 219], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 65: $Vi1, 67: [1, 220], 69: [1, 221], 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 65: $Vi1, 67: [1, 223], 69: [1, 222], 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($VC, [2, 44], { 42: $Vf1 }), o($VS, [2, 70]), o($VS, [2, 69]), { 60: [1, 224], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($VS, [2, 72]), o($Vo1, [2, 74]), { 30: 225, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($Ve1, $V4, { 5: 226 }), o($Vp1, [2, 95]), o($Vy, [2, 35]), { 41: 227, 42: $Vd, 43: 39, 45: 40, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs }, { 10: $Vs1, 58: $Vt1, 81: $Vu1, 89: 228, 102: $Vv1, 104: 229, 105: 230, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }, { 10: $Vs1, 58: $Vt1, 81: $Vu1, 89: 239, 101: [1, 240], 102: $Vv1, 104: 229, 105: 230, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }, { 10: $Vs1, 58: $Vt1, 81: $Vu1, 89: 241, 101: [1, 242], 102: $Vv1, 104: 229, 105: 230, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }, { 102: [1, 243] }, { 10: $Vs1, 58: $Vt1, 81: $Vu1, 89: 244, 102: $Vv1, 104: 229, 105: 230, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }, { 42: $Vd, 45: 245, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs }, o($Vg1, [2, 101]), { 77: [1, 246] }, { 77: [1, 247], 95: [1, 248] }, o($Vg1, [2, 109]), o($Vg1, [2, 111], { 10: [1, 249] }), o($Vg1, [2, 112]), o($VP, [2, 51]), o($Vr1, [2, 80]), o($VP, [2, 52]), { 49: [1, 250], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($VP, [2, 59]), o($VP, [2, 54]), o($VP, [2, 55]), o($VP, [2, 56]), { 106: [1, 251] }, o($VP, [2, 58]), o($VP, [2, 60]), { 64: [1, 252], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($VP, [2, 62]), o($VP, [2, 63]), o($VP, [2, 65]), o($VP, [2, 64]), o($VP, [2, 66]), o([10, 42, 58, 86, 99, 102, 103, 106, 108, 111, 112, 113], [2, 78]), { 31: [1, 253], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 32: [1, 254], 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 40: 28, 41: 38, 42: $Vd, 43: 39, 45: 40, 58: $Ve, 81: $Vf, 82: $Vg, 83: $Vh, 84: $Vi, 85: $Vj, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs, 118: $Vt, 119: $Vu, 120: $Vv, 121: $Vw }, o($VO, [2, 48]), o($Vg1, [2, 114], { 103: $VA1 }), o($VB1, [2, 123], { 105: 256, 10: $Vs1, 58: $Vt1, 81: $Vu1, 102: $Vv1, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }), o($VC1, [2, 125]), o($VC1, [2, 127]), o($VC1, [2, 128]), o($VC1, [2, 129]), o($VC1, [2, 130]), o($VC1, [2, 131]), o($VC1, [2, 132]), o($VC1, [2, 133]), o($VC1, [2, 134]), o($Vg1, [2, 115], { 103: $VA1 }), { 10: [1, 257] }, o($Vg1, [2, 116], { 103: $VA1 }), { 10: [1, 258] }, o($Vq1, [2, 122]), o($Vg1, [2, 98], { 103: $VA1 }), o($Vg1, [2, 99], { 110: 109, 42: $Vd, 58: $Ve, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 111: $Vq, 112: $Vr, 113: $Vs }), o($Vg1, [2, 103]), o($Vg1, [2, 105], { 10: [1, 259] }), o($Vg1, [2, 106]), { 95: [1, 260] }, { 49: [1, 261] }, { 60: [1, 262] }, { 64: [1, 263] }, { 8: $Vz, 9: $VA, 11: $VB, 21: 264 }, o($Vy, [2, 34]), { 10: $Vs1, 58: $Vt1, 81: $Vu1, 102: $Vv1, 104: 265, 105: 230, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }, o($VC1, [2, 126]), { 14: $VD, 42: $VE, 58: $VF, 86: $VG, 98: 266, 102: $VH, 103: $VI, 106: $VJ, 108: $VK, 111: $VL, 112: $VM, 113: $VN, 117: 84 }, { 14: $VD, 42: $VE, 58: $VF, 86: $VG, 98: 267, 102: $VH, 103: $VI, 106: $VJ, 108: $VK, 111: $VL, 112: $VM, 113: $VN, 117: 84 }, { 95: [1, 268] }, o($Vg1, [2, 113]), o($VP, [2, 53]), { 30: 269, 65: $Vi1, 77: $Vj1, 78: $Vk1, 79: 164, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, o($VP, [2, 61]), o($Ve1, $V4, { 5: 270 }), o($VB1, [2, 124], { 105: 256, 10: $Vs1, 58: $Vt1, 81: $Vu1, 102: $Vv1, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }), o($Vg1, [2, 119], { 117: 160, 10: [1, 271], 14: $VD, 42: $VE, 58: $VF, 86: $VG, 102: $VH, 103: $VI, 106: $VJ, 108: $VK, 111: $VL, 112: $VM, 113: $VN }), o($Vg1, [2, 120], { 117: 160, 10: [1, 272], 14: $VD, 42: $VE, 58: $VF, 86: $VG, 102: $VH, 103: $VI, 106: $VJ, 108: $VK, 111: $VL, 112: $VM, 113: $VN }), o($Vg1, [2, 107]), { 31: [1, 273], 65: $Vi1, 79: 208, 113: $Vl1, 114: $Vm1, 115: $Vn1 }, { 6: 11, 7: 12, 8: $V5, 9: $V6, 10: $V7, 11: $V8, 20: 17, 22: 18, 23: 19, 24: 20, 25: 21, 26: 22, 27: $V9, 32: [1, 274], 33: 24, 34: $Va, 36: $Vb, 38: $Vc, 40: 28, 41: 38, 42: $Vd, 43: 39, 45: 40, 58: $Ve, 81: $Vf, 82: $Vg, 83: $Vh, 84: $Vi, 85: $Vj, 86: $Vk, 99: $Vl, 102: $Vm, 103: $Vn, 106: $Vo, 108: $Vp, 110: 41, 111: $Vq, 112: $Vr, 113: $Vs, 118: $Vt, 119: $Vu, 120: $Vv, 121: $Vw }, { 10: $Vs1, 58: $Vt1, 81: $Vu1, 89: 275, 102: $Vv1, 104: 229, 105: 230, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }, { 10: $Vs1, 58: $Vt1, 81: $Vu1, 89: 276, 102: $Vv1, 104: 229, 105: 230, 106: $Vw1, 107: $Vx1, 108: $Vy1, 109: $Vz1 }, o($VP, [2, 57]), o($Vy, [2, 33]), o($Vg1, [2, 117], { 103: $VA1 }), o($Vg1, [2, 118], { 103: $VA1 })],
    defaultActions: {},
    parseError: function parseError(str, hash) {
      if (hash.recoverable) {
        this.trace(str);
      } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
      }
    },
    parse: function parse(input) {
      var self = this, stack = [0], tstack = [], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0, TERROR = 2, EOF = 1;
      var args = lstack.slice.call(arguments, 1);
      var lexer2 = Object.create(this.lexer);
      var sharedState = { yy: {} };
      for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
          sharedState.yy[k] = this.yy[k];
        }
      }
      lexer2.setInput(input, sharedState.yy);
      sharedState.yy.lexer = lexer2;
      sharedState.yy.parser = this;
      if (typeof lexer2.yylloc == "undefined") {
        lexer2.yylloc = {};
      }
      var yyloc = lexer2.yylloc;
      lstack.push(yyloc);
      var ranges = lexer2.options && lexer2.options.ranges;
      if (typeof sharedState.yy.parseError === "function") {
        this.parseError = sharedState.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      function lex2() {
        var token;
        token = tstack.pop() || lexer2.lex() || EOF;
        if (typeof token !== "number") {
          if (token instanceof Array) {
            tstack = token;
            token = tstack.pop();
          }
          token = self.symbols_[token] || token;
        }
        return token;
      }
      var symbol, state, action, r, yyval = {}, p, len, newState, expected;
      while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
          action = this.defaultActions[state];
        } else {
          if (symbol === null || typeof symbol == "undefined") {
            symbol = lex2();
          }
          action = table[state] && table[state][symbol];
        }
        if (typeof action === "undefined" || !action.length || !action[0]) {
          var errStr = "";
          expected = [];
          for (p in table[state]) {
            if (this.terminals_[p] && p > TERROR) {
              expected.push("'" + this.terminals_[p] + "'");
            }
          }
          if (lexer2.showPosition) {
            errStr = "Parse error on line " + (yylineno + 1) + ":\n" + lexer2.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
          } else {
            errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == EOF ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
          }
          this.parseError(errStr, {
            text: lexer2.match,
            token: this.terminals_[symbol] || symbol,
            line: lexer2.yylineno,
            loc: yyloc,
            expected
          });
        }
        if (action[0] instanceof Array && action.length > 1) {
          throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
        }
        switch (action[0]) {
          case 1:
            stack.push(symbol);
            vstack.push(lexer2.yytext);
            lstack.push(lexer2.yylloc);
            stack.push(action[1]);
            symbol = null;
            {
              yyleng = lexer2.yyleng;
              yytext = lexer2.yytext;
              yylineno = lexer2.yylineno;
              yyloc = lexer2.yylloc;
            }
            break;
          case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
              first_line: lstack[lstack.length - (len || 1)].first_line,
              last_line: lstack[lstack.length - 1].last_line,
              first_column: lstack[lstack.length - (len || 1)].first_column,
              last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
              yyval._$.range = [
                lstack[lstack.length - (len || 1)].range[0],
                lstack[lstack.length - 1].range[1]
              ];
            }
            r = this.performAction.apply(yyval, [
              yytext,
              yyleng,
              yylineno,
              sharedState.yy,
              action[1],
              vstack,
              lstack
            ].concat(args));
            if (typeof r !== "undefined") {
              return r;
            }
            if (len) {
              stack = stack.slice(0, -1 * len * 2);
              vstack = vstack.slice(0, -1 * len);
              lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }
  };
  var lexer = function() {
    var lexer2 = {
      EOF: 1,
      parseError: function parseError(str, hash) {
        if (this.yy.parser) {
          this.yy.parser.parseError(str, hash);
        } else {
          throw new Error(str);
        }
      },
      // resets the lexer, sets new input
      setInput: function(input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = "";
        this.conditionStack = ["INITIAL"];
        this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0
        };
        if (this.options.ranges) {
          this.yylloc.range = [0, 0];
        }
        this.offset = 0;
        return this;
      },
      // consumes and returns one char from the input
      input: function() {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return ch;
      },
      // unshifts one char (or a string) into the input
      unput: function(ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);
        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (lines.length - 1) {
          this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
        };
        if (this.options.ranges) {
          this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
      },
      // When called from action, caches matched text and appends it on next action
      more: function() {
        this._more = true;
        return this;
      },
      // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
      reject: function() {
        if (this.options.backtrack_lexer) {
          this._backtrack = true;
        } else {
          return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n" + this.showPosition(), {
            text: "",
            token: null,
            line: this.yylineno
          });
        }
        return this;
      },
      // retain first n characters of the match
      less: function(n) {
        this.unput(this.match.slice(n));
      },
      // displays already matched input, i.e. for error messages
      pastInput: function() {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
      },
      // displays upcoming input, i.e. for error messages
      upcomingInput: function() {
        var next = this.match;
        if (next.length < 20) {
          next += this._input.substr(0, 20 - next.length);
        }
        return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
      },
      // displays the character position where the lexing error occurred, i.e. for error messages
      showPosition: function() {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
      },
      // test the lexed token: return FALSE when not a match, otherwise return token
      test_match: function(match, indexed_rule) {
        var token, lines, backup;
        if (this.options.backtrack_lexer) {
          backup = {
            yylineno: this.yylineno,
            yylloc: {
              first_line: this.yylloc.first_line,
              last_line: this.last_line,
              first_column: this.yylloc.first_column,
              last_column: this.yylloc.last_column
            },
            yytext: this.yytext,
            match: this.match,
            matches: this.matches,
            matched: this.matched,
            yyleng: this.yyleng,
            offset: this.offset,
            _more: this._more,
            _input: this._input,
            yy: this.yy,
            conditionStack: this.conditionStack.slice(0),
            done: this.done
          };
          if (this.options.ranges) {
            backup.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
          this.yylineno += lines.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (token) {
          return token;
        } else if (this._backtrack) {
          for (var k in backup) {
            this[k] = backup[k];
          }
          return false;
        }
        return false;
      },
      // return next match in input
      next: function() {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var token, match, tempMatch, index;
        if (!this._more) {
          this.yytext = "";
          this.match = "";
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
          tempMatch = this._input.match(this.rules[rules[i]]);
          if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
            match = tempMatch;
            index = i;
            if (this.options.backtrack_lexer) {
              token = this.test_match(tempMatch, rules[i]);
              if (token !== false) {
                return token;
              } else if (this._backtrack) {
                match = false;
                continue;
              } else {
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (match) {
          token = this.test_match(match, rules[index]);
          if (token !== false) {
            return token;
          }
          return false;
        }
        if (this._input === "") {
          return this.EOF;
        } else {
          return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), {
            text: "",
            token: null,
            line: this.yylineno
          });
        }
      },
      // return next match that has a token
      lex: function lex2() {
        var r = this.next();
        if (r) {
          return r;
        } else {
          return this.lex();
        }
      },
      // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
      begin: function begin(condition) {
        this.conditionStack.push(condition);
      },
      // pop the previously active lexer condition state off the condition stack
      popState: function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      },
      // produce the lexer rule set which is active for the currently active lexer condition state
      _currentRules: function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions["INITIAL"].rules;
        }
      },
      // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
      topState: function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
          return this.conditionStack[n];
        } else {
          return "INITIAL";
        }
      },
      // alias for begin(condition)
      pushState: function pushState(condition) {
        this.begin(condition);
      },
      // return the number of states currently on the stack
      stateStackSize: function stateStackSize() {
        return this.conditionStack.length;
      },
      options: {},
      performAction: function anonymous(yy, yy_, $avoiding_name_collisions, YY_START) {
        switch ($avoiding_name_collisions) {
          case 0:
            this.begin("acc_title");
            return 34;
          case 1:
            this.popState();
            return "acc_title_value";
          case 2:
            this.begin("acc_descr");
            return 36;
          case 3:
            this.popState();
            return "acc_descr_value";
          case 4:
            this.begin("acc_descr_multiline");
            break;
          case 5:
            this.popState();
            break;
          case 6:
            return "acc_descr_multiline_value";
          case 7:
            this.begin("callbackname");
            break;
          case 8:
            this.popState();
            break;
          case 9:
            this.popState();
            this.begin("callbackargs");
            break;
          case 10:
            return 92;
          case 11:
            this.popState();
            break;
          case 12:
            return 93;
          case 13:
            return "MD_STR";
          case 14:
            this.popState();
            break;
          case 15:
            this.begin("md_string");
            break;
          case 16:
            return "STR";
          case 17:
            this.popState();
            break;
          case 18:
            this.pushState("string");
            break;
          case 19:
            return 81;
          case 20:
            return 99;
          case 21:
            return 82;
          case 22:
            return 101;
          case 23:
            return 83;
          case 24:
            return 84;
          case 25:
            return 94;
          case 26:
            this.begin("click");
            break;
          case 27:
            this.popState();
            break;
          case 28:
            return 85;
          case 29:
            if (yy.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
          case 30:
            if (yy.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
          case 31:
            if (yy.lex.firstGraph()) {
              this.begin("dir");
            }
            return 12;
          case 32:
            return 27;
          case 33:
            return 32;
          case 34:
            return 95;
          case 35:
            return 95;
          case 36:
            return 95;
          case 37:
            return 95;
          case 38:
            this.popState();
            return 13;
          case 39:
            this.popState();
            return 14;
          case 40:
            this.popState();
            return 14;
          case 41:
            this.popState();
            return 14;
          case 42:
            this.popState();
            return 14;
          case 43:
            this.popState();
            return 14;
          case 44:
            this.popState();
            return 14;
          case 45:
            this.popState();
            return 14;
          case 46:
            this.popState();
            return 14;
          case 47:
            this.popState();
            return 14;
          case 48:
            this.popState();
            return 14;
          case 49:
            return 118;
          case 50:
            return 119;
          case 51:
            return 120;
          case 52:
            return 121;
          case 53:
            return 102;
          case 54:
            return 108;
          case 55:
            return 44;
          case 56:
            return 58;
          case 57:
            return 42;
          case 58:
            return 8;
          case 59:
            return 103;
          case 60:
            return 112;
          case 61:
            this.popState();
            return 75;
          case 62:
            this.pushState("edgeText");
            return 73;
          case 63:
            return 116;
          case 64:
            this.popState();
            return 75;
          case 65:
            this.pushState("thickEdgeText");
            return 73;
          case 66:
            return 116;
          case 67:
            this.popState();
            return 75;
          case 68:
            this.pushState("dottedEdgeText");
            return 73;
          case 69:
            return 116;
          case 70:
            return 75;
          case 71:
            this.popState();
            return 51;
          case 72:
            return "TEXT";
          case 73:
            this.pushState("ellipseText");
            return 50;
          case 74:
            this.popState();
            return 53;
          case 75:
            this.pushState("text");
            return 52;
          case 76:
            this.popState();
            return 55;
          case 77:
            this.pushState("text");
            return 54;
          case 78:
            return 56;
          case 79:
            this.pushState("text");
            return 65;
          case 80:
            this.popState();
            return 62;
          case 81:
            this.pushState("text");
            return 61;
          case 82:
            this.popState();
            return 47;
          case 83:
            this.pushState("text");
            return 46;
          case 84:
            this.popState();
            return 67;
          case 85:
            this.popState();
            return 69;
          case 86:
            return 114;
          case 87:
            this.pushState("trapText");
            return 66;
          case 88:
            this.pushState("trapText");
            return 68;
          case 89:
            return 115;
          case 90:
            return 65;
          case 91:
            return 87;
          case 92:
            return "SEP";
          case 93:
            return 86;
          case 94:
            return 112;
          case 95:
            return 108;
          case 96:
            return 42;
          case 97:
            return 106;
          case 98:
            return 111;
          case 99:
            return 113;
          case 100:
            this.popState();
            return 60;
          case 101:
            this.pushState("text");
            return 60;
          case 102:
            this.popState();
            return 49;
          case 103:
            this.pushState("text");
            return 48;
          case 104:
            this.popState();
            return 31;
          case 105:
            this.pushState("text");
            return 29;
          case 106:
            this.popState();
            return 64;
          case 107:
            this.pushState("text");
            return 63;
          case 108:
            return "TEXT";
          case 109:
            return "QUOTE";
          case 110:
            return 9;
          case 111:
            return 10;
          case 112:
            return 11;
        }
      },
      rules: [/^(?:accTitle\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*:\s*)/, /^(?:(?!\n||)*[^\n]*)/, /^(?:accDescr\s*\{\s*)/, /^(?:[\}])/, /^(?:[^\}]*)/, /^(?:call[\s]+)/, /^(?:\([\s]*\))/, /^(?:\()/, /^(?:[^(]*)/, /^(?:\))/, /^(?:[^)]*)/, /^(?:[^`"]+)/, /^(?:[`]["])/, /^(?:["][`])/, /^(?:[^"]+)/, /^(?:["])/, /^(?:["])/, /^(?:style\b)/, /^(?:default\b)/, /^(?:linkStyle\b)/, /^(?:interpolate\b)/, /^(?:classDef\b)/, /^(?:class\b)/, /^(?:href[\s])/, /^(?:click[\s]+)/, /^(?:[\s\n])/, /^(?:[^\s\n]*)/, /^(?:flowchart-elk\b)/, /^(?:graph\b)/, /^(?:flowchart\b)/, /^(?:subgraph\b)/, /^(?:end\b\s*)/, /^(?:_self\b)/, /^(?:_blank\b)/, /^(?:_parent\b)/, /^(?:_top\b)/, /^(?:(\r?\n)*\s*\n)/, /^(?:\s*LR\b)/, /^(?:\s*RL\b)/, /^(?:\s*TB\b)/, /^(?:\s*BT\b)/, /^(?:\s*TD\b)/, /^(?:\s*BR\b)/, /^(?:\s*<)/, /^(?:\s*>)/, /^(?:\s*\^)/, /^(?:\s*v\b)/, /^(?:.*direction\s+TB[^\n]*)/, /^(?:.*direction\s+BT[^\n]*)/, /^(?:.*direction\s+RL[^\n]*)/, /^(?:.*direction\s+LR[^\n]*)/, /^(?:[0-9]+)/, /^(?:#)/, /^(?::::)/, /^(?::)/, /^(?:&)/, /^(?:;)/, /^(?:,)/, /^(?:\*)/, /^(?:\s*[xo<]?--+[-xo>]\s*)/, /^(?:\s*[xo<]?--\s*)/, /^(?:[^-]|-(?!-)+)/, /^(?:\s*[xo<]?==+[=xo>]\s*)/, /^(?:\s*[xo<]?==\s*)/, /^(?:[^=]|=(?!))/, /^(?:\s*[xo<]?-?\.+-[xo>]?\s*)/, /^(?:\s*[xo<]?-\.\s*)/, /^(?:[^\.]|\.(?!))/, /^(?:\s*~~[\~]+\s*)/, /^(?:[-/\)][\)])/, /^(?:[^\(\)\[\]\{\}]|!\)+)/, /^(?:\(-)/, /^(?:\]\))/, /^(?:\(\[)/, /^(?:\]\])/, /^(?:\[\[)/, /^(?:\[\|)/, /^(?:>)/, /^(?:\)\])/, /^(?:\[\()/, /^(?:\)\)\))/, /^(?:\(\(\()/, /^(?:[\\(?=\])][\]])/, /^(?:\/(?=\])\])/, /^(?:\/(?!\])|\\(?!\])|[^\\\[\]\(\)\{\}\/]+)/, /^(?:\[\/)/, /^(?:\[\\)/, /^(?:<)/, /^(?:>)/, /^(?:\^)/, /^(?:\\\|)/, /^(?:v\b)/, /^(?:\*)/, /^(?:#)/, /^(?:&)/, /^(?:([A-Za-z0-9!"\#$%&'*+\.`?\\_\/]|-(?=[^\>\-\.])|(?!))+)/, /^(?:-)/, /^(?:[\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6]|[\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377]|[\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5]|[\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA]|[\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE]|[\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA]|[\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0]|[\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977]|[\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2]|[\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A]|[\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39]|[\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8]|[\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C]|[\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C]|[\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99]|[\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0]|[\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D]|[\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3]|[\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10]|[\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1]|[\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81]|[\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3]|[\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6]|[\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A]|[\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081]|[\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D]|[\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0]|[\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310]|[\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C]|[\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711]|[\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7]|[\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C]|[\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16]|[\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF]|[\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC]|[\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D]|[\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D]|[\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3]|[\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F]|[\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128]|[\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184]|[\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3]|[\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6]|[\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE]|[\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C]|[\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D]|[\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC]|[\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B]|[\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788]|[\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805]|[\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB]|[\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28]|[\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5]|[\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4]|[\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E]|[\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D]|[\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36]|[\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D]|[\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC]|[\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF]|[\uFFD2-\uFFD7\uFFDA-\uFFDC])/, /^(?:\|)/, /^(?:\|)/, /^(?:\))/, /^(?:\()/, /^(?:\])/, /^(?:\[)/, /^(?:(\}))/, /^(?:\{)/, /^(?:[^\[\]\(\)\{\}\|\"]+)/, /^(?:")/, /^(?:(\r?\n)+)/, /^(?:\s)/, /^(?:$)/],
      conditions: { "callbackargs": { "rules": [11, 12, 15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "callbackname": { "rules": [8, 9, 10, 15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "href": { "rules": [15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "click": { "rules": [15, 18, 27, 28, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "dottedEdgeText": { "rules": [15, 18, 67, 69, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "thickEdgeText": { "rules": [15, 18, 64, 66, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "edgeText": { "rules": [15, 18, 61, 63, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "trapText": { "rules": [15, 18, 70, 73, 75, 77, 81, 83, 84, 85, 86, 87, 88, 101, 103, 105, 107], "inclusive": false }, "ellipseText": { "rules": [15, 18, 70, 71, 72, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "text": { "rules": [15, 18, 70, 73, 74, 75, 76, 77, 80, 81, 82, 83, 87, 88, 100, 101, 102, 103, 104, 105, 106, 107, 108], "inclusive": false }, "vertex": { "rules": [15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "dir": { "rules": [15, 18, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "acc_descr_multiline": { "rules": [5, 6, 15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "acc_descr": { "rules": [3, 15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "acc_title": { "rules": [1, 15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "md_string": { "rules": [13, 14, 15, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "string": { "rules": [15, 16, 17, 18, 70, 73, 75, 77, 81, 83, 87, 88, 101, 103, 105, 107], "inclusive": false }, "INITIAL": { "rules": [0, 2, 4, 7, 15, 18, 19, 20, 21, 22, 23, 24, 25, 26, 29, 30, 31, 32, 33, 34, 35, 36, 37, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 64, 65, 67, 68, 70, 73, 75, 77, 78, 79, 81, 83, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 101, 103, 105, 107, 109, 110, 111, 112], "inclusive": true } }
    };
    return lexer2;
  }();
  parser2.lexer = lexer;
  function Parser() {
    this.yy = {};
  }
  Parser.prototype = parser2;
  parser2.Parser = Parser;
  return new Parser();
}();
parser.parser = parser;
const parser$1 = parser;
const MERMAID_DOM_ID_PREFIX = "flowchart-";
let vertexCounter = 0;
let config = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)();
let vertices = {};
let edges = [];
let classes = {};
let subGraphs = [];
let subGraphLookup = {};
let tooltips = {};
let subCount = 0;
let firstGraphFlag = true;
let direction;
let version;
let funs = [];
const sanitizeText = (txt) => _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.e.sanitizeText(txt, config);
const lookUpDomId = function(id) {
  const vertexKeys = Object.keys(vertices);
  for (const vertexKey of vertexKeys) {
    if (vertices[vertexKey].id === id) {
      return vertices[vertexKey].domId;
    }
  }
  return id;
};
const addVertex = function(_id, textObj, type, style, classes2, dir, props = {}) {
  let txt;
  let id = _id;
  if (id === void 0) {
    return;
  }
  if (id.trim().length === 0) {
    return;
  }
  if (vertices[id] === void 0) {
    vertices[id] = {
      id,
      labelType: "text",
      domId: MERMAID_DOM_ID_PREFIX + id + "-" + vertexCounter,
      styles: [],
      classes: []
    };
  }
  vertexCounter++;
  if (textObj !== void 0) {
    config = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)();
    txt = sanitizeText(textObj.text.trim());
    vertices[id].labelType = textObj.type;
    if (txt[0] === '"' && txt[txt.length - 1] === '"') {
      txt = txt.substring(1, txt.length - 1);
    }
    vertices[id].text = txt;
  } else {
    if (vertices[id].text === void 0) {
      vertices[id].text = _id;
    }
  }
  if (type !== void 0) {
    vertices[id].type = type;
  }
  if (style !== void 0 && style !== null) {
    style.forEach(function(s) {
      vertices[id].styles.push(s);
    });
  }
  if (classes2 !== void 0 && classes2 !== null) {
    classes2.forEach(function(s) {
      vertices[id].classes.push(s);
    });
  }
  if (dir !== void 0) {
    vertices[id].dir = dir;
  }
  if (vertices[id].props === void 0) {
    vertices[id].props = props;
  } else if (props !== void 0) {
    Object.assign(vertices[id].props, props);
  }
};
const addSingleLink = function(_start, _end, type) {
  let start = _start;
  let end = _end;
  const edge = { start, end, type: void 0, text: "", labelType: "text" };
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("abc78 Got edge...", edge);
  const linkTextObj = type.text;
  if (linkTextObj !== void 0) {
    edge.text = sanitizeText(linkTextObj.text.trim());
    if (edge.text[0] === '"' && edge.text[edge.text.length - 1] === '"') {
      edge.text = edge.text.substring(1, edge.text.length - 1);
    }
    edge.labelType = linkTextObj.type;
  }
  if (type !== void 0) {
    edge.type = type.type;
    edge.stroke = type.stroke;
    edge.length = type.length;
  }
  if ((edge == null ? void 0 : edge.length) > 10) {
    edge.length = 10;
  }
  if (edges.length < (config.maxEdges ?? 500)) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("abc78 pushing edge...");
    edges.push(edge);
  } else {
    throw new Error(
      `Edge limit exceeded. ${edges.length} edges found, but the limit is ${config.maxEdges}.

Initialize mermaid with maxEdges set to a higher number to allow more edges.
You cannot set this config via configuration inside the diagram as it is a secure config.
You have to call mermaid.initialize.`
    );
  }
};
const addLink = function(_start, _end, type) {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("addLink (abc78)", _start, _end, type);
  let i, j;
  for (i = 0; i < _start.length; i++) {
    for (j = 0; j < _end.length; j++) {
      addSingleLink(_start[i], _end[j], type);
    }
  }
};
const updateLinkInterpolate = function(positions, interp) {
  positions.forEach(function(pos) {
    if (pos === "default") {
      edges.defaultInterpolate = interp;
    } else {
      edges[pos].interpolate = interp;
    }
  });
};
const updateLink = function(positions, style) {
  positions.forEach(function(pos) {
    if (pos >= edges.length) {
      throw new Error(
        `The index ${pos} for linkStyle is out of bounds. Valid indices for linkStyle are between 0 and ${edges.length - 1}. (Help: Ensure that the index is within the range of existing edges.)`
      );
    }
    if (pos === "default") {
      edges.defaultStyle = style;
    } else {
      if (_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.isSubstringInArray("fill", style) === -1) {
        style.push("fill:none");
      }
      edges[pos].style = style;
    }
  });
};
const addClass = function(ids, style) {
  ids.split(",").forEach(function(id) {
    if (classes[id] === void 0) {
      classes[id] = { id, styles: [], textStyles: [] };
    }
    if (style !== void 0 && style !== null) {
      style.forEach(function(s) {
        if (s.match("color")) {
          const newStyle = s.replace("fill", "bgFill").replace("color", "fill");
          classes[id].textStyles.push(newStyle);
        }
        classes[id].styles.push(s);
      });
    }
  });
};
const setDirection = function(dir) {
  direction = dir;
  if (direction.match(/.*</)) {
    direction = "RL";
  }
  if (direction.match(/.*\^/)) {
    direction = "BT";
  }
  if (direction.match(/.*>/)) {
    direction = "LR";
  }
  if (direction.match(/.*v/)) {
    direction = "TB";
  }
  if (direction === "TD") {
    direction = "TB";
  }
};
const setClass = function(ids, className) {
  ids.split(",").forEach(function(_id) {
    let id = _id;
    if (vertices[id] !== void 0) {
      vertices[id].classes.push(className);
    }
    if (subGraphLookup[id] !== void 0) {
      subGraphLookup[id].classes.push(className);
    }
  });
};
const setTooltip = function(ids, tooltip) {
  ids.split(",").forEach(function(id) {
    if (tooltip !== void 0) {
      tooltips[version === "gen-1" ? lookUpDomId(id) : id] = sanitizeText(tooltip);
    }
  });
};
const setClickFun = function(id, functionName, functionArgs) {
  let domId = lookUpDomId(id);
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)().securityLevel !== "loose") {
    return;
  }
  if (functionName === void 0) {
    return;
  }
  let argList = [];
  if (typeof functionArgs === "string") {
    argList = functionArgs.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    for (let i = 0; i < argList.length; i++) {
      let item = argList[i].trim();
      if (item.charAt(0) === '"' && item.charAt(item.length - 1) === '"') {
        item = item.substr(1, item.length - 2);
      }
      argList[i] = item;
    }
  }
  if (argList.length === 0) {
    argList.push(id);
  }
  if (vertices[id] !== void 0) {
    vertices[id].haveCallback = true;
    funs.push(function() {
      const elem = document.querySelector(`[id="${domId}"]`);
      if (elem !== null) {
        elem.addEventListener(
          "click",
          function() {
            _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.runFunc(functionName, ...argList);
          },
          false
        );
      }
    });
  }
};
const setLink = function(ids, linkStr, target) {
  ids.split(",").forEach(function(id) {
    if (vertices[id] !== void 0) {
      vertices[id].link = _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.u.formatUrl(linkStr, config);
      vertices[id].linkTarget = target;
    }
  });
  setClass(ids, "clickable");
};
const getTooltip = function(id) {
  if (tooltips.hasOwnProperty(id)) {
    return tooltips[id];
  }
  return void 0;
};
const setClickEvent = function(ids, functionName, functionArgs) {
  ids.split(",").forEach(function(id) {
    setClickFun(id, functionName, functionArgs);
  });
  setClass(ids, "clickable");
};
const bindFunctions = function(element) {
  funs.forEach(function(fun) {
    fun(element);
  });
};
const getDirection = function() {
  return direction.trim();
};
const getVertices = function() {
  return vertices;
};
const getEdges = function() {
  return edges;
};
const getClasses = function() {
  return classes;
};
const setupToolTips = function(element) {
  let tooltipElem = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(".mermaidTooltip");
  if ((tooltipElem._groups || tooltipElem)[0][0] === null) {
    tooltipElem = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)("body").append("div").attr("class", "mermaidTooltip").style("opacity", 0);
  }
  const svg = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(element).select("svg");
  const nodes = svg.selectAll("g.node");
  nodes.on("mouseover", function() {
    const el = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(this);
    const title = el.attr("title");
    if (title === null) {
      return;
    }
    const rect = this.getBoundingClientRect();
    tooltipElem.transition().duration(200).style("opacity", ".9");
    tooltipElem.text(el.attr("title")).style("left", window.scrollX + rect.left + (rect.right - rect.left) / 2 + "px").style("top", window.scrollY + rect.bottom + "px");
    tooltipElem.html(tooltipElem.html().replace(/&lt;br\/&gt;/g, "<br/>"));
    el.classed("hover", true);
  }).on("mouseout", function() {
    tooltipElem.transition().duration(500).style("opacity", 0);
    const el = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(this);
    el.classed("hover", false);
  });
};
funs.push(setupToolTips);
const clear = function(ver = "gen-1") {
  vertices = {};
  classes = {};
  edges = [];
  funs = [setupToolTips];
  subGraphs = [];
  subGraphLookup = {};
  subCount = 0;
  tooltips = {};
  firstGraphFlag = true;
  version = ver;
  config = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.c)();
  (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.v)();
};
const setGen = (ver) => {
  version = ver || "gen-2";
};
const defaultStyle = function() {
  return "fill:#ffa;stroke: #f66; stroke-width: 3px; stroke-dasharray: 5, 5;fill:#ffa;stroke: #666;";
};
const addSubGraph = function(_id, list, _title) {
  let id = _id.text.trim();
  let title = _title.text;
  if (_id === _title && _title.text.match(/\s/)) {
    id = void 0;
  }
  function uniq(a) {
    const prims = { boolean: {}, number: {}, string: {} };
    const objs = [];
    let dir2;
    const nodeList2 = a.filter(function(item) {
      const type = typeof item;
      if (item.stmt && item.stmt === "dir") {
        dir2 = item.value;
        return false;
      }
      if (item.trim() === "") {
        return false;
      }
      if (type in prims) {
        return prims[type].hasOwnProperty(item) ? false : prims[type][item] = true;
      } else {
        return objs.includes(item) ? false : objs.push(item);
      }
    });
    return { nodeList: nodeList2, dir: dir2 };
  }
  let nodeList = [];
  const { nodeList: nl, dir } = uniq(nodeList.concat.apply(nodeList, list));
  nodeList = nl;
  if (version === "gen-1") {
    for (let i = 0; i < nodeList.length; i++) {
      nodeList[i] = lookUpDomId(nodeList[i]);
    }
  }
  id = id || "subGraph" + subCount;
  title = title || "";
  title = sanitizeText(title);
  subCount = subCount + 1;
  const subGraph = {
    id,
    nodes: nodeList,
    title: title.trim(),
    classes: [],
    dir,
    labelType: _title.type
  };
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.l.info("Adding", subGraph.id, subGraph.nodes, subGraph.dir);
  subGraph.nodes = makeUniq(subGraph, subGraphs).nodes;
  subGraphs.push(subGraph);
  subGraphLookup[id] = subGraph;
  return id;
};
const getPosForId = function(id) {
  for (const [i, subGraph] of subGraphs.entries()) {
    if (subGraph.id === id) {
      return i;
    }
  }
  return -1;
};
let secCount = -1;
const posCrossRef = [];
const indexNodes2 = function(id, pos) {
  const nodes = subGraphs[pos].nodes;
  secCount = secCount + 1;
  if (secCount > 2e3) {
    return;
  }
  posCrossRef[secCount] = pos;
  if (subGraphs[pos].id === id) {
    return {
      result: true,
      count: 0
    };
  }
  let count = 0;
  let posCount = 1;
  while (count < nodes.length) {
    const childPos = getPosForId(nodes[count]);
    if (childPos >= 0) {
      const res = indexNodes2(id, childPos);
      if (res.result) {
        return {
          result: true,
          count: posCount + res.count
        };
      } else {
        posCount = posCount + res.count;
      }
    }
    count = count + 1;
  }
  return {
    result: false,
    count: posCount
  };
};
const getDepthFirstPos = function(pos) {
  return posCrossRef[pos];
};
const indexNodes = function() {
  secCount = -1;
  if (subGraphs.length > 0) {
    indexNodes2("none", subGraphs.length - 1);
  }
};
const getSubGraphs = function() {
  return subGraphs;
};
const firstGraph = () => {
  if (firstGraphFlag) {
    firstGraphFlag = false;
    return true;
  }
  return false;
};
const destructStartLink = (_str) => {
  let str = _str.trim();
  let type = "arrow_open";
  switch (str[0]) {
    case "<":
      type = "arrow_point";
      str = str.slice(1);
      break;
    case "x":
      type = "arrow_cross";
      str = str.slice(1);
      break;
    case "o":
      type = "arrow_circle";
      str = str.slice(1);
      break;
  }
  let stroke = "normal";
  if (str.includes("=")) {
    stroke = "thick";
  }
  if (str.includes(".")) {
    stroke = "dotted";
  }
  return { type, stroke };
};
const countChar = (char, str) => {
  const length = str.length;
  let count = 0;
  for (let i = 0; i < length; ++i) {
    if (str[i] === char) {
      ++count;
    }
  }
  return count;
};
const destructEndLink = (_str) => {
  const str = _str.trim();
  let line = str.slice(0, -1);
  let type = "arrow_open";
  switch (str.slice(-1)) {
    case "x":
      type = "arrow_cross";
      if (str[0] === "x") {
        type = "double_" + type;
        line = line.slice(1);
      }
      break;
    case ">":
      type = "arrow_point";
      if (str[0] === "<") {
        type = "double_" + type;
        line = line.slice(1);
      }
      break;
    case "o":
      type = "arrow_circle";
      if (str[0] === "o") {
        type = "double_" + type;
        line = line.slice(1);
      }
      break;
  }
  let stroke = "normal";
  let length = line.length - 1;
  if (line[0] === "=") {
    stroke = "thick";
  }
  if (line[0] === "~") {
    stroke = "invisible";
  }
  let dots = countChar(".", line);
  if (dots) {
    stroke = "dotted";
    length = dots;
  }
  return { type, stroke, length };
};
const destructLink = (_str, _startStr) => {
  const info = destructEndLink(_str);
  let startInfo;
  if (_startStr) {
    startInfo = destructStartLink(_startStr);
    if (startInfo.stroke !== info.stroke) {
      return { type: "INVALID", stroke: "INVALID" };
    }
    if (startInfo.type === "arrow_open") {
      startInfo.type = info.type;
    } else {
      if (startInfo.type !== info.type) {
        return { type: "INVALID", stroke: "INVALID" };
      }
      startInfo.type = "double_" + startInfo.type;
    }
    if (startInfo.type === "double_arrow") {
      startInfo.type = "double_arrow_point";
    }
    startInfo.length = info.length;
    return startInfo;
  }
  return info;
};
const exists = (allSgs, _id) => {
  let res = false;
  allSgs.forEach((sg) => {
    const pos = sg.nodes.indexOf(_id);
    if (pos >= 0) {
      res = true;
    }
  });
  return res;
};
const makeUniq = (sg, allSubgraphs) => {
  const res = [];
  sg.nodes.forEach((_id, pos) => {
    if (!exists(allSubgraphs, _id)) {
      res.push(sg.nodes[pos]);
    }
  });
  return { nodes: res };
};
const lex = {
  firstGraph
};
const flowDb = {
  defaultConfig: () => _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.K.flowchart,
  setAccTitle: _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.s,
  getAccTitle: _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.g,
  getAccDescription: _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.a,
  setAccDescription: _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.b,
  addVertex,
  lookUpDomId,
  addLink,
  updateLinkInterpolate,
  updateLink,
  addClass,
  setDirection,
  setClass,
  setTooltip,
  getTooltip,
  setClickEvent,
  setLink,
  bindFunctions,
  getDirection,
  getVertices,
  getEdges,
  getClasses,
  clear,
  setGen,
  defaultStyle,
  addSubGraph,
  getDepthFirstPos,
  indexNodes,
  getSubGraphs,
  destructLink,
  lex,
  exists,
  makeUniq,
  setDiagramTitle: _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.q,
  getDiagramTitle: _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_1__.t
};
const db = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addClass,
  addLink,
  addSingleLink,
  addSubGraph,
  addVertex,
  bindFunctions,
  clear,
  default: flowDb,
  defaultStyle,
  destructLink,
  firstGraph,
  getClasses,
  getDepthFirstPos,
  getDirection,
  getEdges,
  getSubGraphs,
  getTooltip,
  getVertices,
  indexNodes,
  lex,
  lookUpDomId,
  setClass,
  setClickEvent,
  setDirection,
  setGen,
  setLink,
  updateLink,
  updateLinkInterpolate
}, Symbol.toStringTag, { value: "Module" }));



/***/ }),

/***/ 20676:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  "diagram": () => (/* binding */ diagram)
});

// EXTERNAL MODULE: ./node_modules/mermaid/dist/flowDb-c6c81e3f.js
var flowDb_c6c81e3f = __webpack_require__(99172);
// EXTERNAL MODULE: ./node_modules/d3/src/index.js + 202 modules
var src = __webpack_require__(35417);
// EXTERNAL MODULE: ./node_modules/lodash-es/defaults.js
var defaults = __webpack_require__(3688);
// EXTERNAL MODULE: ./node_modules/dagre-d3-es/src/dagre/index.js + 66 modules
var dagre = __webpack_require__(62865);
// EXTERNAL MODULE: ./node_modules/dagre-d3-es/src/dagre-js/util.js
var util = __webpack_require__(96225);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/arrows.js




var arrows = {
  normal,
  vee,
  undirected,
};

function setArrows(value) {
  arrows = value;
}

function normal(parent, id, edge, type) {
  var marker = parent
    .append('marker')
    .attr('id', id)
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', 8)
    .attr('markerHeight', 6)
    .attr('orient', 'auto');

  var path = marker
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 z')
    .style('stroke-width', 1)
    .style('stroke-dasharray', '1,0');
  util/* applyStyle */.bg(path, edge[type + 'Style']);
  if (edge[type + 'Class']) {
    path.attr('class', edge[type + 'Class']);
  }
}

function vee(parent, id, edge, type) {
  var marker = parent
    .append('marker')
    .attr('id', id)
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', 8)
    .attr('markerHeight', 6)
    .attr('orient', 'auto');

  var path = marker
    .append('path')
    .attr('d', 'M 0 0 L 10 5 L 0 10 L 4 5 z')
    .style('stroke-width', 1)
    .style('stroke-dasharray', '1,0');
  util/* applyStyle */.bg(path, edge[type + 'Style']);
  if (edge[type + 'Class']) {
    path.attr('class', edge[type + 'Class']);
  }
}

function undirected(parent, id, edge, type) {
  var marker = parent
    .append('marker')
    .attr('id', id)
    .attr('viewBox', '0 0 10 10')
    .attr('refX', 9)
    .attr('refY', 5)
    .attr('markerUnits', 'strokeWidth')
    .attr('markerWidth', 8)
    .attr('markerHeight', 6)
    .attr('orient', 'auto');

  var path = marker
    .append('path')
    .attr('d', 'M 0 5 L 10 5')
    .style('stroke-width', 1)
    .style('stroke-dasharray', '1,0');
  util/* applyStyle */.bg(path, edge[type + 'Style']);
  if (edge[type + 'Class']) {
    path.attr('class', edge[type + 'Class']);
  }
}

// EXTERNAL MODULE: ./node_modules/dagre-d3-es/src/dagre-js/label/add-html-label.js
var add_html_label = __webpack_require__(43349);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/label/add-svg-label.js




function addSVGLabel(root, node) {
  var domNode = root;

  domNode.node().appendChild(node.label);

  util/* applyStyle */.bg(domNode, node.labelStyle);

  return domNode;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/label/add-text-label.js




/*
 * Attaches a text label to the specified root. Handles escape sequences.
 */
function addTextLabel(root, node) {
  var domNode = root.append('text');

  var lines = processEscapeSequences(node.label).split('\n');
  for (var i = 0; i < lines.length; i++) {
    domNode
      .append('tspan')
      .attr('xml:space', 'preserve')
      .attr('dy', '1em')
      .attr('x', '1')
      .text(lines[i]);
  }

  util/* applyStyle */.bg(domNode, node.labelStyle);

  return domNode;
}

function processEscapeSequences(text) {
  var newText = '';
  var escaped = false;
  var ch;
  for (var i = 0; i < text.length; ++i) {
    ch = text[i];
    if (escaped) {
      switch (ch) {
        case 'n':
          newText += '\n';
          break;
        default:
          newText += ch;
      }
      escaped = false;
    } else if (ch === '\\') {
      escaped = true;
    } else {
      newText += ch;
    }
  }
  return newText;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/label/add-label.js






function addLabel(root, node, location) {
  var label = node.label;
  var labelSvg = root.append('g');

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (node.labelType === 'svg') {
    addSVGLabel(labelSvg, node);
  } else if (typeof label !== 'string' || node.labelType === 'html') {
    (0,add_html_label/* addHtmlLabel */.a)(labelSvg, node);
  } else {
    addTextLabel(labelSvg, node);
  }

  var labelBBox = labelSvg.node().getBBox();
  var y;
  switch (location) {
    case 'top':
      y = -node.height / 2;
      break;
    case 'bottom':
      y = node.height / 2 - labelBBox.height;
      break;
    default:
      y = -labelBBox.height / 2;
  }
  labelSvg.attr('transform', 'translate(' + -labelBBox.width / 2 + ',' + y + ')');

  return labelSvg;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/create-clusters.js






var createClusters = function (selection, g) {
  var clusters = g.nodes().filter(function (v) {
    return util/* isSubgraph */.bF(g, v);
  });
  var svgClusters = selection.selectAll('g.cluster').data(clusters, function (v) {
    return v;
  });

  util/* applyTransition */.WR(svgClusters.exit(), g).style('opacity', 0).remove();

  var enterSelection = svgClusters
    .enter()
    .append('g')
    .attr('class', 'cluster')
    .attr('id', function (v) {
      var node = g.node(v);
      return node.id;
    })
    .style('opacity', 0)
    .each(function (v) {
      var node = g.node(v);
      var thisGroup = src/* select */.Ys(this);
      src/* select */.Ys(this).append('rect');
      var labelGroup = thisGroup.append('g').attr('class', 'label');
      addLabel(labelGroup, node, node.clusterLabelPos);
    });

  svgClusters = svgClusters.merge(enterSelection);

  svgClusters = util/* applyTransition */.WR(svgClusters, g).style('opacity', 1);

  svgClusters.selectAll('rect').each(function (c) {
    var node = g.node(c);
    var domCluster = src/* select */.Ys(this);
    util/* applyStyle */.bg(domCluster, node.style);
  });

  return svgClusters;
};

function setCreateClusters(value) {
  createClusters = value;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/create-edge-labels.js






let createEdgeLabels = function (selection, g) {
  var svgEdgeLabels = selection
    .selectAll('g.edgeLabel')
    .data(g.edges(), function (e) {
      return util/* edgeToId */.O1(e);
    })
    .classed('update', true);

  svgEdgeLabels.exit().remove();
  svgEdgeLabels.enter().append('g').classed('edgeLabel', true).style('opacity', 0);

  svgEdgeLabels = selection.selectAll('g.edgeLabel');

  svgEdgeLabels.each(function (e) {
    var root = src/* select */.Ys(this);
    root.select('.label').remove();
    var edge = g.edge(e);
    var label = addLabel(root, g.edge(e), 0).classed('label', true);
    var bbox = label.node().getBBox();

    if (edge.labelId) {
      label.attr('id', edge.labelId);
    }
    if (!Object.prototype.hasOwnProperty.call(edge, 'width')) {
      edge.width = bbox.width;
    }
    if (!Object.prototype.hasOwnProperty.call(edge, 'height')) {
      edge.height = bbox.height;
    }
  });

  var exitSelection;

  if (svgEdgeLabels.exit) {
    exitSelection = svgEdgeLabels.exit();
  } else {
    exitSelection = svgEdgeLabels.selectAll(null); // empty selection
  }

  util/* applyTransition */.WR(exitSelection, g).style('opacity', 0).remove();

  return svgEdgeLabels;
};

function setCreateEdgeLabels(value) {
  createEdgeLabels = value;
}

// EXTERNAL MODULE: ./node_modules/lodash-es/uniqueId.js
var uniqueId = __webpack_require__(66749);
// EXTERNAL MODULE: ./node_modules/lodash-es/range.js + 2 modules
var range = __webpack_require__(74379);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-node.js


function intersectNode(node, point) {
  return node.intersect(point);
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/create-edge-paths.js







var createEdgePaths = function (selection, g, arrows) {
  var previousPaths = selection
    .selectAll('g.edgePath')
    .data(g.edges(), function (e) {
      return util/* edgeToId */.O1(e);
    })
    .classed('update', true);

  var newPaths = enter(previousPaths, g);
  exit(previousPaths, g);

  var svgPaths = previousPaths.merge !== undefined ? previousPaths.merge(newPaths) : previousPaths;
  util/* applyTransition */.WR(svgPaths, g).style('opacity', 1);

  // Save DOM element in the path group, and set ID and class
  svgPaths.each(function (e) {
    var domEdge = src/* select */.Ys(this);
    var edge = g.edge(e);
    edge.elem = this;

    if (edge.id) {
      domEdge.attr('id', edge.id);
    }

    util/* applyClass */.$p(
      domEdge,
      edge['class'],
      (domEdge.classed('update') ? 'update ' : '') + 'edgePath',
    );
  });

  svgPaths.selectAll('path.path').each(function (e) {
    var edge = g.edge(e);
    edge.arrowheadId = uniqueId/* default */.Z('arrowhead');

    var domEdge = src/* select */.Ys(this)
      .attr('marker-end', function () {
        return 'url(' + makeFragmentRef(location.href, edge.arrowheadId) + ')';
      })
      .style('fill', 'none');

    util/* applyTransition */.WR(domEdge, g).attr('d', function (e) {
      return calcPoints(g, e);
    });

    util/* applyStyle */.bg(domEdge, edge.style);
  });

  svgPaths.selectAll('defs *').remove();
  svgPaths.selectAll('defs').each(function (e) {
    var edge = g.edge(e);
    var arrowhead = arrows[edge.arrowhead];
    arrowhead(src/* select */.Ys(this), edge.arrowheadId, edge, 'arrowhead');
  });

  return svgPaths;
};

function setCreateEdgePaths(value) {
  createEdgePaths = value;
}

function makeFragmentRef(url, fragmentId) {
  var baseUrl = url.split('#')[0];
  return baseUrl + '#' + fragmentId;
}

function calcPoints(g, e) {
  var edge = g.edge(e);
  var tail = g.node(e.v);
  var head = g.node(e.w);
  var points = edge.points.slice(1, edge.points.length - 1);
  points.unshift(intersectNode(tail, points[0]));
  points.push(intersectNode(head, points[points.length - 1]));

  return createLine(edge, points);
}

function createLine(edge, points) {
  // @ts-expect-error
  var line = (src/* line */.jvg || src/* svg.line */.YPS.line)()
    .x(function (d) {
      return d.x;
    })
    .y(function (d) {
      return d.y;
    });

  (line.curve || line.interpolate)(edge.curve);

  return line(points);
}

function getCoords(elem) {
  var bbox = elem.getBBox();
  var matrix = elem.ownerSVGElement
    .getScreenCTM()
    .inverse()
    .multiply(elem.getScreenCTM())
    .translate(bbox.width / 2, bbox.height / 2);
  return { x: matrix.e, y: matrix.f };
}

function enter(svgPaths, g) {
  var svgPathsEnter = svgPaths.enter().append('g').attr('class', 'edgePath').style('opacity', 0);
  svgPathsEnter
    .append('path')
    .attr('class', 'path')
    .attr('d', function (e) {
      var edge = g.edge(e);
      var sourceElem = g.node(e.v).elem;
      var points = range/* default */.Z(edge.points.length).map(function () {
        return getCoords(sourceElem);
      });
      return createLine(edge, points);
    });
  svgPathsEnter.append('defs');
  return svgPathsEnter;
}

function exit(svgPaths, g) {
  var svgPathExit = svgPaths.exit();
  util/* applyTransition */.WR(svgPathExit, g).style('opacity', 0).remove();
}

// EXTERNAL MODULE: ./node_modules/lodash-es/pick.js + 4 modules
var pick = __webpack_require__(61666);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/create-nodes.js







var createNodes = function (selection, g, shapes) {
  var simpleNodes = g.nodes().filter(function (v) {
    return !util/* isSubgraph */.bF(g, v);
  });
  var svgNodes = selection
    .selectAll('g.node')
    .data(simpleNodes, function (v) {
      return v;
    })
    .classed('update', true);

  svgNodes.exit().remove();

  svgNodes.enter().append('g').attr('class', 'node').style('opacity', 0);

  svgNodes = selection.selectAll('g.node');

  svgNodes.each(function (v) {
    var node = g.node(v);
    var thisGroup = src/* select */.Ys(this);
    util/* applyClass */.$p(
      thisGroup,
      node['class'],
      (thisGroup.classed('update') ? 'update ' : '') + 'node',
    );

    thisGroup.select('g.label').remove();
    var labelGroup = thisGroup.append('g').attr('class', 'label');
    var labelDom = addLabel(labelGroup, node);
    var shape = shapes[node.shape];
    var bbox = (0,pick/* default */.Z)(labelDom.node().getBBox(), 'width', 'height');

    node.elem = this;

    if (node.id) {
      thisGroup.attr('id', node.id);
    }
    if (node.labelId) {
      labelGroup.attr('id', node.labelId);
    }

    if (Object.prototype.hasOwnProperty.call(node, 'width')) {
      bbox.width = node.width;
    }
    if (Object.prototype.hasOwnProperty.call(node, 'height')) {
      bbox.height = node.height;
    }

    bbox.width += node.paddingLeft + node.paddingRight;
    bbox.height += node.paddingTop + node.paddingBottom;
    labelGroup.attr(
      'transform',
      'translate(' +
        (node.paddingLeft - node.paddingRight) / 2 +
        ',' +
        (node.paddingTop - node.paddingBottom) / 2 +
        ')',
    );

    var root = src/* select */.Ys(this);
    root.select('.label-container').remove();
    var shapeSvg = shape(root, bbox, node).classed('label-container', true);
    util/* applyStyle */.bg(shapeSvg, node.style);

    var shapeBBox = shapeSvg.node().getBBox();
    node.width = shapeBBox.width;
    node.height = shapeBBox.height;
  });

  var exitSelection;

  if (svgNodes.exit) {
    exitSelection = svgNodes.exit();
  } else {
    exitSelection = svgNodes.selectAll(null); // empty selection
  }

  util/* applyTransition */.WR(exitSelection, g).style('opacity', 0).remove();

  return svgNodes;
};

function setCreateNodes(value) {
  createNodes = value;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/position-clusters.js





function positionClusters(selection, g) {
  var created = selection.filter(function () {
    return !src/* select */.Ys(this).classed('update');
  });

  function translate(v) {
    var node = g.node(v);
    return 'translate(' + node.x + ',' + node.y + ')';
  }

  created.attr('transform', translate);

  util/* applyTransition */.WR(selection, g).style('opacity', 1).attr('transform', translate);

  util/* applyTransition */.WR(created.selectAll('rect'), g)
    .attr('width', function (v) {
      return g.node(v).width;
    })
    .attr('height', function (v) {
      return g.node(v).height;
    })
    .attr('x', function (v) {
      var node = g.node(v);
      return -node.width / 2;
    })
    .attr('y', function (v) {
      var node = g.node(v);
      return -node.height / 2;
    });
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/position-edge-labels.js





function positionEdgeLabels(selection, g) {
  var created = selection.filter(function () {
    return !src/* select */.Ys(this).classed('update');
  });

  function translate(e) {
    var edge = g.edge(e);
    return Object.prototype.hasOwnProperty.call(edge, 'x')
      ? 'translate(' + edge.x + ',' + edge.y + ')'
      : '';
  }

  created.attr('transform', translate);

  util/* applyTransition */.WR(selection, g).style('opacity', 1).attr('transform', translate);
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/position-nodes.js





function positionNodes(selection, g) {
  var created = selection.filter(function () {
    return !src/* select */.Ys(this).classed('update');
  });

  function translate(v) {
    var node = g.node(v);
    return 'translate(' + node.x + ',' + node.y + ')';
  }

  created.attr('transform', translate);

  util/* applyTransition */.WR(selection, g).style('opacity', 1).attr('transform', translate);
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-ellipse.js


function intersectEllipse(node, rx, ry, point) {
  // Formulae from: http://mathworld.wolfram.com/Ellipse-LineIntersection.html

  var cx = node.x;
  var cy = node.y;

  var px = cx - point.x;
  var py = cy - point.y;

  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);

  var dx = Math.abs((rx * ry * px) / det);
  if (point.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs((rx * ry * py) / det);
  if (point.y < cy) {
    dy = -dy;
  }

  return { x: cx + dx, y: cy + dy };
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-circle.js




function intersectCircle(node, rx, point) {
  return intersectEllipse(node, rx, rx, point);
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-line.js


/*
 * Returns the point at which two lines, p and q, intersect or returns
 * undefined if they do not intersect.
 */
function intersectLine(p1, p2, q1, q2) {
  // Algorithm from J. Avro, (ed.) Graphics Gems, No 2, Morgan Kaufmann, 1994,
  // p7 and p473.

  var a1, a2, b1, b2, c1, c2;
  var r1, r2, r3, r4;
  var denom, offset, num;
  var x, y;

  // Compute a1, b1, c1, where line joining points 1 and 2 is F(x,y) = a1 x +
  // b1 y + c1 = 0.
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = p2.x * p1.y - p1.x * p2.y;

  // Compute r3 and r4.
  r3 = a1 * q1.x + b1 * q1.y + c1;
  r4 = a1 * q2.x + b1 * q2.y + c1;

  // Check signs of r3 and r4. If both point 3 and point 4 lie on
  // same side of line 1, the line segments do not intersect.
  if (r3 !== 0 && r4 !== 0 && sameSign(r3, r4)) {
    return /*DONT_INTERSECT*/;
  }

  // Compute a2, b2, c2 where line joining points 3 and 4 is G(x,y) = a2 x + b2 y + c2 = 0
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = q2.x * q1.y - q1.x * q2.y;

  // Compute r1 and r2
  r1 = a2 * p1.x + b2 * p1.y + c2;
  r2 = a2 * p2.x + b2 * p2.y + c2;

  // Check signs of r1 and r2. If both point 1 and point 2 lie
  // on same side of second line segment, the line segments do
  // not intersect.
  if (r1 !== 0 && r2 !== 0 && sameSign(r1, r2)) {
    return /*DONT_INTERSECT*/;
  }

  // Line segments intersect: compute intersection point.
  denom = a1 * b2 - a2 * b1;
  if (denom === 0) {
    return /*COLLINEAR*/;
  }

  offset = Math.abs(denom / 2);

  // The denom/2 is to get rounding instead of truncating. It
  // is added or subtracted to the numerator, depending upon the
  // sign of the numerator.
  num = b1 * c2 - b2 * c1;
  x = num < 0 ? (num - offset) / denom : (num + offset) / denom;

  num = a2 * c1 - a1 * c2;
  y = num < 0 ? (num - offset) / denom : (num + offset) / denom;

  return { x: x, y: y };
}

function sameSign(r1, r2) {
  return r1 * r2 > 0;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-polygon.js




/*
 * Returns the point ({x, y}) at which the point argument intersects with the
 * node argument assuming that it has the shape specified by polygon.
 */
function intersectPolygon(node, polyPoints, point) {
  var x1 = node.x;
  var y1 = node.y;

  var intersections = [];

  var minX = Number.POSITIVE_INFINITY;
  var minY = Number.POSITIVE_INFINITY;
  polyPoints.forEach(function (entry) {
    minX = Math.min(minX, entry.x);
    minY = Math.min(minY, entry.y);
  });

  var left = x1 - node.width / 2 - minX;
  var top = y1 - node.height / 2 - minY;

  for (var i = 0; i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect = intersectLine(
      node,
      point,
      { x: left + p1.x, y: top + p1.y },
      { x: left + p2.x, y: top + p2.y },
    );
    if (intersect) {
      intersections.push(intersect);
    }
  }

  if (!intersections.length) {
    console.log('NO INTERSECTION FOUND, RETURN NODE CENTER', node);
    return node;
  }

  if (intersections.length > 1) {
    // More intersections, find the one nearest to edge end point
    intersections.sort(function (p, q) {
      var pdx = p.x - point.x;
      var pdy = p.y - point.y;
      var distp = Math.sqrt(pdx * pdx + pdy * pdy);

      var qdx = q.x - point.x;
      var qdy = q.y - point.y;
      var distq = Math.sqrt(qdx * qdx + qdy * qdy);

      return distp < distq ? -1 : distp === distq ? 0 : 1;
    });
  }
  return intersections[0];
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/intersect/intersect-rect.js


function intersectRect(node, point) {
  var x = node.x;
  var y = node.y;

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.width / 2;
  var h = node.height / 2;

  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : (h * dx) / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : (w * dy) / dx;
  }

  return { x: x + sx, y: y + sy };
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/shapes.js







var shapes = {
  rect,
  ellipse,
  circle,
  diamond,
};

function setShapes(value) {
  shapes = value;
}

function rect(parent, bbox, node) {
  var shapeSvg = parent
    .insert('rect', ':first-child')
    .attr('rx', node.rx)
    .attr('ry', node.ry)
    .attr('x', -bbox.width / 2)
    .attr('y', -bbox.height / 2)
    .attr('width', bbox.width)
    .attr('height', bbox.height);

  node.intersect = function (point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
}

function ellipse(parent, bbox, node) {
  var rx = bbox.width / 2;
  var ry = bbox.height / 2;
  var shapeSvg = parent
    .insert('ellipse', ':first-child')
    .attr('x', -bbox.width / 2)
    .attr('y', -bbox.height / 2)
    .attr('rx', rx)
    .attr('ry', ry);

  node.intersect = function (point) {
    return intersectEllipse(node, rx, ry, point);
  };

  return shapeSvg;
}

function circle(parent, bbox, node) {
  var r = Math.max(bbox.width, bbox.height) / 2;
  var shapeSvg = parent
    .insert('circle', ':first-child')
    .attr('x', -bbox.width / 2)
    .attr('y', -bbox.height / 2)
    .attr('r', r);

  node.intersect = function (point) {
    return intersectCircle(node, r, point);
  };

  return shapeSvg;
}

// Circumscribe an ellipse for the bounding box with a diamond shape. I derived
// the function to calculate the diamond shape from:
// http://mathforum.org/kb/message.jspa?messageID=3750236
function diamond(parent, bbox, node) {
  var w = (bbox.width * Math.SQRT2) / 2;
  var h = (bbox.height * Math.SQRT2) / 2;
  var points = [
    { x: 0, y: -h },
    { x: -w, y: 0 },
    { x: 0, y: h },
    { x: w, y: 0 },
  ];
  var shapeSvg = parent.insert('polygon', ':first-child').attr(
    'points',
    points
      .map(function (p) {
        return p.x + ',' + p.y;
      })
      .join(' '),
  );

  node.intersect = function (p) {
    return intersectPolygon(node, points, p);
  };

  return shapeSvg;
}

;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/dagre-js/render.js















// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var fn = function (svg, g) {
    preProcessGraph(g);

    var outputGroup = createOrSelectGroup(svg, 'output');
    var clustersGroup = createOrSelectGroup(outputGroup, 'clusters');
    var edgePathsGroup = createOrSelectGroup(outputGroup, 'edgePaths');
    var edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, 'edgeLabels'), g);
    var nodes = createNodes(createOrSelectGroup(outputGroup, 'nodes'), g, shapes);

    (0,dagre/* layout */.bK)(g);

    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    createEdgePaths(edgePathsGroup, g, arrows);

    var clusters = createClusters(clustersGroup, g);
    positionClusters(clusters, g);

    postProcessGraph(g);
  };

  fn.createNodes = function (value) {
    if (!arguments.length) return createNodes;
    setCreateNodes(value);
    return fn;
  };

  fn.createClusters = function (value) {
    if (!arguments.length) return createClusters;
    setCreateClusters(value);
    return fn;
  };

  fn.createEdgeLabels = function (value) {
    if (!arguments.length) return createEdgeLabels;
    setCreateEdgeLabels(value);
    return fn;
  };

  fn.createEdgePaths = function (value) {
    if (!arguments.length) return createEdgePaths;
    setCreateEdgePaths(value);
    return fn;
  };

  fn.shapes = function (value) {
    if (!arguments.length) return shapes;
    setShapes(value);
    return fn;
  };

  fn.arrows = function (value) {
    if (!arguments.length) return arrows;
    setArrows(value);
    return fn;
  };

  return fn;
}

var NODE_DEFAULT_ATTRS = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  rx: 0,
  ry: 0,
  shape: 'rect',
};

var EDGE_DEFAULT_ATTRS = {
  arrowhead: 'normal',
  curve: src/* curveLinear */.c_6,
};

/**
 * @typedef {Object} Node
 * @property {string} label - The label of the node.
 * @property {number} [paddingX] - The horizontal padding of the node.
 * @property {number} [paddingY] - The vertical padding of the node.
 * @property {number} [padding] - The padding of the node for all directions. Overrides `paddingX` and `paddingY`.
 * @property {number} [paddingLeft] - The left padding of the node.
 * @property {number} [paddingRight] - The right padding of the node.
 * @property {number} [_prevWidth]
 * @property {number} [width]
 * @property {number} [_prevHeight]
 * @property {number} [height]
 */

/**
 * Pre-processes the graph by setting default labels and padding for nodes.
 * @param {Object} g - The graph object.
 */
function preProcessGraph(g) {
  g.nodes().forEach((v) => {
    /** @type {Node} */
    const node = g.node(v);
    if (!Object.prototype.hasOwnProperty.call(node, 'label') && !g.children(v).length) {
      node.label = v;
    }

    if (Object.prototype.hasOwnProperty.call(node, 'paddingX')) {
      (0,defaults/* default */.Z)(node, {
        paddingLeft: node.paddingX,
        paddingRight: node.paddingX,
      });
    }

    if (Object.prototype.hasOwnProperty.call(node, 'paddingY')) {
      (0,defaults/* default */.Z)(node, {
        paddingTop: node.paddingY,
        paddingBottom: node.paddingY,
      });
    }

    if (Object.prototype.hasOwnProperty.call(node, 'padding')) {
      (0,defaults/* default */.Z)(node, {
        paddingLeft: node.padding,
        paddingRight: node.padding,
        paddingTop: node.padding,
        paddingBottom: node.padding,
      });
    }

    (0,defaults/* default */.Z)(node, NODE_DEFAULT_ATTRS);

    ['paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'].forEach((k) => {
      node[k] = Number(node[k]);
    });

    // Save dimensions for restore during post-processing
    if (Object.prototype.hasOwnProperty.call(node, 'width')) {
      node._prevWidth = node.width;
    }
    if (Object.prototype.hasOwnProperty.call(node, 'height')) {
      node._prevHeight = node.height;
    }
  });

  g.edges().forEach(function (e) {
    var edge = g.edge(e);
    if (!Object.prototype.hasOwnProperty.call(edge, 'label')) {
      edge.label = '';
    }
    (0,defaults/* default */.Z)(edge, EDGE_DEFAULT_ATTRS);
  });
}

function postProcessGraph(g) {
  g.nodes().forEach((v) => {
    /** @type {Node} */
    var node = g.node(v);

    // Restore original dimensions
    if (Object.prototype.hasOwnProperty.call(node, '_prevWidth')) {
      node.width = node._prevWidth;
    } else {
      delete node.width;
    }

    if (Object.prototype.hasOwnProperty.call(node, '_prevHeight')) {
      node.height = node._prevHeight;
    } else {
      delete node.height;
    }

    delete node._prevWidth;
    delete node._prevHeight;
  });
}

function createOrSelectGroup(root, name) {
  var selection = root.select('g.' + name);
  if (selection.empty()) {
    selection = root.append('g').attr('class', name);
  }
  return selection;
}

// EXTERNAL MODULE: ./node_modules/dagre-d3-es/src/graphlib/index.js
var graphlib = __webpack_require__(45625);
;// CONCATENATED MODULE: ./node_modules/dagre-d3-es/src/index.js







// EXTERNAL MODULE: ./node_modules/mermaid/dist/mermaid-7ea9cbd6.js + 8 modules
var mermaid_7ea9cbd6 = __webpack_require__(93883);
// EXTERNAL MODULE: ./node_modules/mermaid/dist/styles-d45a18b0.js
var styles_d45a18b0 = __webpack_require__(7336);
// EXTERNAL MODULE: ./node_modules/dayjs/dayjs.min.js
var dayjs_min = __webpack_require__(27484);
// EXTERNAL MODULE: ./node_modules/@braintree/sanitize-url/dist/index.js
var dist = __webpack_require__(17967);
// EXTERNAL MODULE: ./node_modules/dompurify/dist/purify.es.mjs
var purify_es = __webpack_require__(22424);
// EXTERNAL MODULE: ./node_modules/dagre-d3-es/src/graphlib/json.js
var json = __webpack_require__(46060);
;// CONCATENATED MODULE: ./node_modules/mermaid/dist/flowDiagram-50d868cf.js

























function question(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const s = (w + h) * 0.9;
  const points = [
    { x: s / 2, y: 0 },
    { x: s, y: -s / 2 },
    { x: s / 2, y: -s },
    { x: 0, y: -s / 2 }
  ];
  const shapeSvg = insertPolygonShape(parent, s, s, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function hexagon(parent, bbox, node) {
  const f = 4;
  const h = bbox.height;
  const m = h / f;
  const w = bbox.width + 2 * m;
  const points = [
    { x: m, y: 0 },
    { x: w - m, y: 0 },
    { x: w, y: -h / 2 },
    { x: w - m, y: -h },
    { x: m, y: -h },
    { x: 0, y: -h / 2 }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function rect_left_inv_arrow(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: -h / 2, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: -h / 2, y: -h },
    { x: 0, y: -h / 2 }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function lean_right(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: -2 * h / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + 2 * h / 6, y: -h },
    { x: h / 6, y: -h }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function lean_left(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: 2 * h / 6, y: 0 },
    { x: w + h / 6, y: 0 },
    { x: w - 2 * h / 6, y: -h },
    { x: -h / 6, y: -h }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function trapezoid(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: -2 * h / 6, y: 0 },
    { x: w + 2 * h / 6, y: 0 },
    { x: w - h / 6, y: -h },
    { x: h / 6, y: -h }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function inv_trapezoid(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: h / 6, y: 0 },
    { x: w - h / 6, y: 0 },
    { x: w + 2 * h / 6, y: -h },
    { x: -2 * h / 6, y: -h }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function rect_right_inv_arrow(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: 0, y: 0 },
    { x: w + h / 2, y: 0 },
    { x: w, y: -h / 2 },
    { x: w + h / 2, y: -h },
    { x: 0, y: -h }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function stadium(parent, bbox, node) {
  const h = bbox.height;
  const w = bbox.width + h / 4;
  const shapeSvg = parent.insert("rect", ":first-child").attr("rx", h / 2).attr("ry", h / 2).attr("x", -w / 2).attr("y", -h / 2).attr("width", w).attr("height", h);
  node.intersect = function(point) {
    return intersectRect(node, point);
  };
  return shapeSvg;
}
function subroutine(parent, bbox, node) {
  const w = bbox.width;
  const h = bbox.height;
  const points = [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: -h },
    { x: 0, y: -h },
    { x: 0, y: 0 },
    { x: -8, y: 0 },
    { x: w + 8, y: 0 },
    { x: w + 8, y: -h },
    { x: -8, y: -h },
    { x: -8, y: 0 }
  ];
  const shapeSvg = insertPolygonShape(parent, w, h, points);
  node.intersect = function(point) {
    return intersectPolygon(node, points, point);
  };
  return shapeSvg;
}
function cylinder(parent, bbox, node) {
  const w = bbox.width;
  const rx = w / 2;
  const ry = rx / (2.5 + w / 50);
  const h = bbox.height + ry;
  const shape = "M 0," + ry + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 a " + rx + "," + ry + " 0,0,0 " + -w + " 0 l 0," + h + " a " + rx + "," + ry + " 0,0,0 " + w + " 0 l 0," + -h;
  const shapeSvg = parent.attr("label-offset-y", ry).insert("path", ":first-child").attr("d", shape).attr("transform", "translate(" + -w / 2 + "," + -(h / 2 + ry) + ")");
  node.intersect = function(point) {
    const pos = intersectRect(node, point);
    const x = pos.x - node.x;
    if (rx != 0 && (Math.abs(x) < node.width / 2 || Math.abs(x) == node.width / 2 && Math.abs(pos.y - node.y) > node.height / 2 - ry)) {
      let y = ry * ry * (1 - x * x / (rx * rx));
      if (y != 0) {
        y = Math.sqrt(y);
      }
      y = ry - y;
      if (point.y - node.y > 0) {
        y = -y;
      }
      pos.y += y;
    }
    return pos;
  };
  return shapeSvg;
}
function addToRender(render2) {
  render2.shapes().question = question;
  render2.shapes().hexagon = hexagon;
  render2.shapes().stadium = stadium;
  render2.shapes().subroutine = subroutine;
  render2.shapes().cylinder = cylinder;
  render2.shapes().rect_left_inv_arrow = rect_left_inv_arrow;
  render2.shapes().lean_right = lean_right;
  render2.shapes().lean_left = lean_left;
  render2.shapes().trapezoid = trapezoid;
  render2.shapes().inv_trapezoid = inv_trapezoid;
  render2.shapes().rect_right_inv_arrow = rect_right_inv_arrow;
}
function addToRenderV2(addShape) {
  addShape({ question });
  addShape({ hexagon });
  addShape({ stadium });
  addShape({ subroutine });
  addShape({ cylinder });
  addShape({ rect_left_inv_arrow });
  addShape({ lean_right });
  addShape({ lean_left });
  addShape({ trapezoid });
  addShape({ inv_trapezoid });
  addShape({ rect_right_inv_arrow });
}
function insertPolygonShape(parent, w, h, points) {
  return parent.insert("polygon", ":first-child").attr(
    "points",
    points.map(function(d) {
      return d.x + "," + d.y;
    }).join(" ")
  ).attr("transform", "translate(" + -w / 2 + "," + h / 2 + ")");
}
const flowChartShapes = {
  addToRender,
  addToRenderV2
};
const conf = {};
const setConf = function(cnf) {
  const keys = Object.keys(cnf);
  for (const key of keys) {
    conf[key] = cnf[key];
  }
};
const addVertices = async function(vert, g, svgId, root, _doc, diagObj) {
  const svg = !root ? (0,src/* select */.Ys)(`[id="${svgId}"]`) : root.select(`[id="${svgId}"]`);
  const doc = !_doc ? document : _doc;
  const keys = Object.keys(vert);
  for (const id of keys) {
    const vertex = vert[id];
    let classStr = "default";
    if (vertex.classes.length > 0) {
      classStr = vertex.classes.join(" ");
    }
    const styles = (0,mermaid_7ea9cbd6.k)(vertex.styles);
    let vertexText = vertex.text !== void 0 ? vertex.text : vertex.id;
    let vertexNode;
    if ((0,mermaid_7ea9cbd6.m)((0,mermaid_7ea9cbd6.c)().flowchart.htmlLabels)) {
      const node = {
        label: await (0,mermaid_7ea9cbd6.r)(
          vertexText.replace(
            /fa[blrs]?:fa-[\w-]+/g,
            // cspell:disable-line
            (s) => `<i class='${s.replace(":", " ")}'></i>`
          ),
          (0,mermaid_7ea9cbd6.c)()
        )
      };
      vertexNode = (0,add_html_label/* addHtmlLabel */.a)(svg, node).node();
      vertexNode.parentNode.removeChild(vertexNode);
    } else {
      const svgLabel = doc.createElementNS("http://www.w3.org/2000/svg", "text");
      svgLabel.setAttribute("style", styles.labelStyle.replace("color:", "fill:"));
      const rows = vertexText.split(mermaid_7ea9cbd6.e.lineBreakRegex);
      for (const row of rows) {
        const tspan = doc.createElementNS("http://www.w3.org/2000/svg", "tspan");
        tspan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
        tspan.setAttribute("dy", "1em");
        tspan.setAttribute("x", "1");
        tspan.textContent = row;
        svgLabel.appendChild(tspan);
      }
      vertexNode = svgLabel;
    }
    let radius = 0;
    let _shape = "";
    switch (vertex.type) {
      case "round":
        radius = 5;
        _shape = "rect";
        break;
      case "square":
        _shape = "rect";
        break;
      case "diamond":
        _shape = "question";
        break;
      case "hexagon":
        _shape = "hexagon";
        break;
      case "odd":
        _shape = "rect_left_inv_arrow";
        break;
      case "lean_right":
        _shape = "lean_right";
        break;
      case "lean_left":
        _shape = "lean_left";
        break;
      case "trapezoid":
        _shape = "trapezoid";
        break;
      case "inv_trapezoid":
        _shape = "inv_trapezoid";
        break;
      case "odd_right":
        _shape = "rect_left_inv_arrow";
        break;
      case "circle":
        _shape = "circle";
        break;
      case "ellipse":
        _shape = "ellipse";
        break;
      case "stadium":
        _shape = "stadium";
        break;
      case "subroutine":
        _shape = "subroutine";
        break;
      case "cylinder":
        _shape = "cylinder";
        break;
      case "group":
        _shape = "rect";
        break;
      default:
        _shape = "rect";
    }
    mermaid_7ea9cbd6.l.warn("Adding node", vertex.id, vertex.domId);
    g.setNode(diagObj.db.lookUpDomId(vertex.id), {
      labelType: "svg",
      labelStyle: styles.labelStyle,
      shape: _shape,
      label: vertexNode,
      rx: radius,
      ry: radius,
      class: classStr,
      style: styles.style,
      id: diagObj.db.lookUpDomId(vertex.id)
    });
  }
};
const addEdges = async function(edges, g, diagObj) {
  let cnt = 0;
  let defaultStyle;
  let defaultLabelStyle;
  if (edges.defaultStyle !== void 0) {
    const defaultStyles = (0,mermaid_7ea9cbd6.k)(edges.defaultStyle);
    defaultStyle = defaultStyles.style;
    defaultLabelStyle = defaultStyles.labelStyle;
  }
  for (const edge of edges) {
    cnt++;
    const linkId = "L-" + edge.start + "-" + edge.end;
    const linkNameStart = "LS-" + edge.start;
    const linkNameEnd = "LE-" + edge.end;
    const edgeData = {};
    if (edge.type === "arrow_open") {
      edgeData.arrowhead = "none";
    } else {
      edgeData.arrowhead = "normal";
    }
    let style = "";
    let labelStyle = "";
    if (edge.style !== void 0) {
      const styles = (0,mermaid_7ea9cbd6.k)(edge.style);
      style = styles.style;
      labelStyle = styles.labelStyle;
    } else {
      switch (edge.stroke) {
        case "normal":
          style = "fill:none";
          if (defaultStyle !== void 0) {
            style = defaultStyle;
          }
          if (defaultLabelStyle !== void 0) {
            labelStyle = defaultLabelStyle;
          }
          break;
        case "dotted":
          style = "fill:none;stroke-width:2px;stroke-dasharray:3;";
          break;
        case "thick":
          style = " stroke-width: 3.5px;fill:none";
          break;
      }
    }
    edgeData.style = style;
    edgeData.labelStyle = labelStyle;
    if (edge.interpolate !== void 0) {
      edgeData.curve = (0,mermaid_7ea9cbd6.n)(edge.interpolate, src/* curveLinear */.c_6);
    } else if (edges.defaultInterpolate !== void 0) {
      edgeData.curve = (0,mermaid_7ea9cbd6.n)(edges.defaultInterpolate, src/* curveLinear */.c_6);
    } else {
      edgeData.curve = (0,mermaid_7ea9cbd6.n)(conf.curve, src/* curveLinear */.c_6);
    }
    if (edge.text === void 0) {
      if (edge.style !== void 0) {
        edgeData.arrowheadStyle = "fill: #333";
      }
    } else {
      edgeData.arrowheadStyle = "fill: #333";
      edgeData.labelpos = "c";
      if ((0,mermaid_7ea9cbd6.m)((0,mermaid_7ea9cbd6.c)().flowchart.htmlLabels)) {
        edgeData.labelType = "html";
        edgeData.label = `<span id="L-${linkId}" class="edgeLabel L-${linkNameStart}' L-${linkNameEnd}" style="${edgeData.labelStyle}">${await (0,mermaid_7ea9cbd6.r)(
          edge.text.replace(
            /fa[blrs]?:fa-[\w-]+/g,
            // cspell:disable-line
            (s) => `<i class='${s.replace(":", " ")}'></i>`
          ),
          (0,mermaid_7ea9cbd6.c)()
        )}</span>`;
      } else {
        edgeData.labelType = "text";
        edgeData.label = edge.text.replace(mermaid_7ea9cbd6.e.lineBreakRegex, "\n");
        if (edge.style === void 0) {
          edgeData.style = edgeData.style || "stroke: #333; stroke-width: 1.5px;fill:none";
        }
        edgeData.labelStyle = edgeData.labelStyle.replace("color:", "fill:");
      }
    }
    edgeData.id = linkId;
    edgeData.class = linkNameStart + " " + linkNameEnd;
    edgeData.minlen = edge.length || 1;
    g.setEdge(diagObj.db.lookUpDomId(edge.start), diagObj.db.lookUpDomId(edge.end), edgeData, cnt);
  }
};
const getClasses = function(text, diagObj) {
  mermaid_7ea9cbd6.l.info("Extracting classes");
  return diagObj.db.getClasses();
};
const draw = async function(text, id, _version, diagObj) {
  mermaid_7ea9cbd6.l.info("Drawing flowchart");
  const { securityLevel, flowchart: conf2 } = (0,mermaid_7ea9cbd6.c)();
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = (0,src/* select */.Ys)("#i" + id);
  }
  const root = securityLevel === "sandbox" ? (0,src/* select */.Ys)(sandboxElement.nodes()[0].contentDocument.body) : (0,src/* select */.Ys)("body");
  const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
  let dir = diagObj.db.getDirection();
  if (dir === void 0) {
    dir = "TD";
  }
  const nodeSpacing = conf2.nodeSpacing || 50;
  const rankSpacing = conf2.rankSpacing || 50;
  const g = new graphlib/* Graph */.k({
    multigraph: true,
    compound: true
  }).setGraph({
    rankdir: dir,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 8,
    marginy: 8
  }).setDefaultEdgeLabel(function() {
    return {};
  });
  let subG;
  const subGraphs = diagObj.db.getSubGraphs();
  for (let i2 = subGraphs.length - 1; i2 >= 0; i2--) {
    subG = subGraphs[i2];
    diagObj.db.addVertex(subG.id, subG.title, "group", void 0, subG.classes);
  }
  const vert = diagObj.db.getVertices();
  mermaid_7ea9cbd6.l.warn("Get vertices", vert);
  const edges = diagObj.db.getEdges();
  let i = 0;
  for (i = subGraphs.length - 1; i >= 0; i--) {
    subG = subGraphs[i];
    (0,src/* selectAll */.td_)("cluster").append("text");
    for (let j = 0; j < subG.nodes.length; j++) {
      mermaid_7ea9cbd6.l.warn(
        "Setting subgraph",
        subG.nodes[j],
        diagObj.db.lookUpDomId(subG.nodes[j]),
        diagObj.db.lookUpDomId(subG.id)
      );
      g.setParent(diagObj.db.lookUpDomId(subG.nodes[j]), diagObj.db.lookUpDomId(subG.id));
    }
  }
  await addVertices(vert, g, id, root, doc, diagObj);
  await addEdges(edges, g, diagObj);
  const render$1 = new render();
  flowChartShapes.addToRender(render$1);
  render$1.arrows().none = function normal(parent, id2, edge, type) {
    const marker = parent.append("marker").attr("id", id2).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
    const path = marker.append("path").attr("d", "M 0 0 L 0 0 L 0 0 z");
    (0,util/* applyStyle */.bg)(path, edge[type + "Style"]);
  };
  render$1.arrows().normal = function normal(parent, id2) {
    const marker = parent.append("marker").attr("id", id2).attr("viewBox", "0 0 10 10").attr("refX", 9).attr("refY", 5).attr("markerUnits", "strokeWidth").attr("markerWidth", 8).attr("markerHeight", 6).attr("orient", "auto");
    marker.append("path").attr("d", "M 0 0 L 10 5 L 0 10 z").attr("class", "arrowheadPath").style("stroke-width", 1).style("stroke-dasharray", "1,0");
  };
  const svg = root.select(`[id="${id}"]`);
  const element = root.select("#" + id + " g");
  render$1(element, g);
  element.selectAll("g.node").attr("title", function() {
    return diagObj.db.getTooltip(this.id);
  });
  diagObj.db.indexNodes("subGraph" + i);
  for (i = 0; i < subGraphs.length; i++) {
    subG = subGraphs[i];
    if (subG.title !== "undefined") {
      const clusterRects = doc.querySelectorAll(
        "#" + id + ' [id="' + diagObj.db.lookUpDomId(subG.id) + '"] rect'
      );
      const clusterEl = doc.querySelectorAll(
        "#" + id + ' [id="' + diagObj.db.lookUpDomId(subG.id) + '"]'
      );
      const xPos = clusterRects[0].x.baseVal.value;
      const yPos = clusterRects[0].y.baseVal.value;
      const _width = clusterRects[0].width.baseVal.value;
      const cluster = (0,src/* select */.Ys)(clusterEl[0]);
      const te = cluster.select(".label");
      te.attr("transform", `translate(${xPos + _width / 2}, ${yPos + 14})`);
      te.attr("id", id + "Text");
      for (let j = 0; j < subG.classes.length; j++) {
        clusterEl[0].classList.add(subG.classes[j]);
      }
    }
  }
  if (!conf2.htmlLabels) {
    const labels = doc.querySelectorAll('[id="' + id + '"] .edgeLabel .label');
    for (const label of labels) {
      const dim = label.getBBox();
      const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("rx", 0);
      rect.setAttribute("ry", 0);
      rect.setAttribute("width", dim.width);
      rect.setAttribute("height", dim.height);
      label.insertBefore(rect, label.firstChild);
    }
  }
  (0,mermaid_7ea9cbd6.o)(g, svg, conf2.diagramPadding, conf2.useMaxWidth);
  const keys = Object.keys(vert);
  keys.forEach(function(key) {
    const vertex = vert[key];
    if (vertex.link) {
      const node = root.select("#" + id + ' [id="' + diagObj.db.lookUpDomId(key) + '"]');
      if (node) {
        const link = doc.createElementNS("http://www.w3.org/2000/svg", "a");
        link.setAttributeNS("http://www.w3.org/2000/svg", "class", vertex.classes.join(" "));
        link.setAttributeNS("http://www.w3.org/2000/svg", "href", vertex.link);
        link.setAttributeNS("http://www.w3.org/2000/svg", "rel", "noopener");
        if (securityLevel === "sandbox") {
          link.setAttributeNS("http://www.w3.org/2000/svg", "target", "_top");
        } else if (vertex.linkTarget) {
          link.setAttributeNS("http://www.w3.org/2000/svg", "target", vertex.linkTarget);
        }
        const linkNode = node.insert(function() {
          return link;
        }, ":first-child");
        const shape = node.select(".label-container");
        if (shape) {
          linkNode.append(function() {
            return shape.node();
          });
        }
        const label = node.select(".label");
        if (label) {
          linkNode.append(function() {
            return label.node();
          });
        }
      }
    }
  });
};
const flowRenderer = {
  setConf,
  addVertices,
  addEdges,
  getClasses,
  draw
};
const diagram = {
  parser: flowDb_c6c81e3f.p,
  db: flowDb_c6c81e3f.f,
  renderer: styles_d45a18b0.f,
  styles: styles_d45a18b0.a,
  init: (cnf) => {
    if (!cnf.flowchart) {
      cnf.flowchart = {};
    }
    cnf.flowchart.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
    flowRenderer.setConf(cnf.flowchart);
    flowDb_c6c81e3f.f.clear();
    flowDb_c6c81e3f.f.setGen("gen-1");
  }
};



/***/ }),

/***/ 94617:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "r": () => (/* binding */ render)
/* harmony export */ });
/* harmony import */ var dagre_d3_es_src_dagre_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(62865);
/* harmony import */ var dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(46060);
/* harmony import */ var _edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(47195);
/* harmony import */ var _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(93883);
/* harmony import */ var dagre_d3_es_src_graphlib_index_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(45625);
/* harmony import */ var _createText_1719965b_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(28540);
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(35417);







let clusterDb = {};
let descendants = {};
let parents = {};
const clear$1 = () => {
  descendants = {};
  parents = {};
  clusterDb = {};
};
const isDescendant = (id, ancestorId) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("In isDescendant", ancestorId, " ", id, " = ", descendants[ancestorId].includes(id));
  if (descendants[ancestorId].includes(id)) {
    return true;
  }
  return false;
};
const edgeInCluster = (edge, clusterId) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Descendants of ", clusterId, " is ", descendants[clusterId]);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Edge is ", edge);
  if (edge.v === clusterId) {
    return false;
  }
  if (edge.w === clusterId) {
    return false;
  }
  if (!descendants[clusterId]) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Tilt, ", clusterId, ",not in descendants");
    return false;
  }
  return descendants[clusterId].includes(edge.v) || isDescendant(edge.v, clusterId) || isDescendant(edge.w, clusterId) || descendants[clusterId].includes(edge.w);
};
const copy = (clusterId, graph, newGraph, rootId) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn(
    "Copying children of ",
    clusterId,
    "root",
    rootId,
    "data",
    graph.node(clusterId),
    rootId
  );
  const nodes = graph.children(clusterId) || [];
  if (clusterId !== rootId) {
    nodes.push(clusterId);
  }
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Copying (nodes) clusterId", clusterId, "nodes", nodes);
  nodes.forEach((node) => {
    if (graph.children(node).length > 0) {
      copy(node, graph, newGraph, rootId);
    } else {
      const data = graph.node(node);
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("cp ", node, " to ", rootId, " with parent ", clusterId);
      newGraph.setNode(node, data);
      if (rootId !== graph.parent(node)) {
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Setting parent", node, graph.parent(node));
        newGraph.setParent(node, graph.parent(node));
      }
      if (clusterId !== rootId && node !== clusterId) {
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Setting parent", node, clusterId);
        newGraph.setParent(node, clusterId);
      } else {
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("In copy ", clusterId, "root", rootId, "data", graph.node(clusterId), rootId);
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug(
          "Not Setting parent for node=",
          node,
          "cluster!==rootId",
          clusterId !== rootId,
          "node!==clusterId",
          node !== clusterId
        );
      }
      const edges = graph.edges(node);
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Copying Edges", edges);
      edges.forEach((edge) => {
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Edge", edge);
        const data2 = graph.edge(edge.v, edge.w, edge.name);
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Edge data", data2, rootId);
        try {
          if (edgeInCluster(edge, rootId)) {
            _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Copying as ", edge.v, edge.w, data2, edge.name);
            newGraph.setEdge(edge.v, edge.w, data2, edge.name);
            _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("newGraph edges ", newGraph.edges(), newGraph.edge(newGraph.edges()[0]));
          } else {
            _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info(
              "Skipping copy of edge ",
              edge.v,
              "-->",
              edge.w,
              " rootId: ",
              rootId,
              " clusterId:",
              clusterId
            );
          }
        } catch (e) {
          _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.error(e);
        }
      });
    }
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Removing node", node);
    graph.removeNode(node);
  });
};
const extractDescendants = (id, graph) => {
  const children = graph.children(id);
  let res = [...children];
  for (const child of children) {
    parents[child] = id;
    res = [...res, ...extractDescendants(child, graph)];
  }
  return res;
};
const findNonClusterChild = (id, graph) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Searching", id);
  const children = graph.children(id);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Searching children of id ", id, children);
  if (children.length < 1) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("This is a valid node", id);
    return id;
  }
  for (const child of children) {
    const _id = findNonClusterChild(child, graph);
    if (_id) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Found replacement for", id, " => ", _id);
      return _id;
    }
  }
};
const getAnchorId = (id) => {
  if (!clusterDb[id]) {
    return id;
  }
  if (!clusterDb[id].externalConnections) {
    return id;
  }
  if (clusterDb[id]) {
    return clusterDb[id].id;
  }
  return id;
};
const adjustClustersAndEdges = (graph, depth) => {
  if (!graph || depth > 10) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Opting out, no graph ");
    return;
  } else {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Opting in, graph ");
  }
  graph.nodes().forEach(function(id) {
    const children = graph.children(id);
    if (children.length > 0) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn(
        "Cluster identified",
        id,
        " Replacement id in edges: ",
        findNonClusterChild(id, graph)
      );
      descendants[id] = extractDescendants(id, graph);
      clusterDb[id] = { id: findNonClusterChild(id, graph), clusterData: graph.node(id) };
    }
  });
  graph.nodes().forEach(function(id) {
    const children = graph.children(id);
    const edges = graph.edges();
    if (children.length > 0) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Cluster identified", id, descendants);
      edges.forEach((edge) => {
        if (edge.v !== id && edge.w !== id) {
          const d1 = isDescendant(edge.v, id);
          const d2 = isDescendant(edge.w, id);
          if (d1 ^ d2) {
            _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Edge: ", edge, " leaves cluster ", id);
            _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Descendants of XXX ", id, ": ", descendants[id]);
            clusterDb[id].externalConnections = true;
          }
        }
      });
    } else {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Not a cluster ", id, descendants);
    }
  });
  for (let id of Object.keys(clusterDb)) {
    const nonClusterChild = clusterDb[id].id;
    const parent = graph.parent(nonClusterChild);
    if (parent !== id && clusterDb[parent] && !clusterDb[parent].externalConnections) {
      clusterDb[id].id = parent;
    }
  }
  graph.edges().forEach(function(e) {
    const edge = graph.edge(e);
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(e));
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(graph.edge(e)));
    let v = e.v;
    let w = e.w;
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn(
      "Fix XXX",
      clusterDb,
      "ids:",
      e.v,
      e.w,
      "Translating: ",
      clusterDb[e.v],
      " --- ",
      clusterDb[e.w]
    );
    if (clusterDb[e.v] && clusterDb[e.w] && clusterDb[e.v] === clusterDb[e.w]) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Fixing and trixing link to self - removing XXX", e.v, e.w, e.name);
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Fixing and trixing - removing XXX", e.v, e.w, e.name);
      v = getAnchorId(e.v);
      w = getAnchorId(e.w);
      graph.removeEdge(e.v, e.w, e.name);
      const specialId = e.w + "---" + e.v;
      graph.setNode(specialId, {
        domId: specialId,
        id: specialId,
        labelStyle: "",
        labelText: edge.label,
        padding: 0,
        shape: "labelRect",
        style: ""
      });
      const edge1 = structuredClone(edge);
      const edge2 = structuredClone(edge);
      edge1.label = "";
      edge1.arrowTypeEnd = "none";
      edge2.label = "";
      edge1.fromCluster = e.v;
      edge2.toCluster = e.v;
      graph.setEdge(v, specialId, edge1, e.name + "-cyclic-special");
      graph.setEdge(specialId, w, edge2, e.name + "-cyclic-special");
    } else if (clusterDb[e.v] || clusterDb[e.w]) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Fixing and trixing - removing XXX", e.v, e.w, e.name);
      v = getAnchorId(e.v);
      w = getAnchorId(e.w);
      graph.removeEdge(e.v, e.w, e.name);
      if (v !== e.v) {
        const parent = graph.parent(v);
        clusterDb[parent].externalConnections = true;
        edge.fromCluster = e.v;
      }
      if (w !== e.w) {
        const parent = graph.parent(w);
        clusterDb[parent].externalConnections = true;
        edge.toCluster = e.w;
      }
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Fix Replacing with XXX", v, w, e.name);
      graph.setEdge(v, w, edge, e.name);
    }
  });
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Adjusted Graph", dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph));
  extractor(graph, 0);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace(clusterDb);
};
const extractor = (graph, depth) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("extractor - ", depth, dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph), graph.children("D"));
  if (depth > 10) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.error("Bailing out");
    return;
  }
  let nodes = graph.nodes();
  let hasChildren = false;
  for (const node of nodes) {
    const children = graph.children(node);
    hasChildren = hasChildren || children.length > 0;
  }
  if (!hasChildren) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Done, no node has children", graph.nodes());
    return;
  }
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Nodes = ", nodes, depth);
  for (const node of nodes) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug(
      "Extracting node",
      node,
      clusterDb,
      clusterDb[node] && !clusterDb[node].externalConnections,
      !graph.parent(node),
      graph.node(node),
      graph.children("D"),
      " Depth ",
      depth
    );
    if (!clusterDb[node]) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Not a cluster", node, depth);
    } else if (!clusterDb[node].externalConnections && // !graph.parent(node) &&
    graph.children(node) && graph.children(node).length > 0) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn(
        "Cluster without external connections, without a parent and with children",
        node,
        depth
      );
      const graphSettings = graph.graph();
      let dir = graphSettings.rankdir === "TB" ? "LR" : "TB";
      if (clusterDb[node] && clusterDb[node].clusterData && clusterDb[node].clusterData.dir) {
        dir = clusterDb[node].clusterData.dir;
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Fixing dir", clusterDb[node].clusterData.dir, dir);
      }
      const clusterGraph = new dagre_d3_es_src_graphlib_index_js__WEBPACK_IMPORTED_MODULE_2__/* .Graph */ .k({
        multigraph: true,
        compound: true
      }).setGraph({
        rankdir: dir,
        // Todo: set proper spacing
        nodesep: 50,
        ranksep: 50,
        marginx: 8,
        marginy: 8
      }).setDefaultEdgeLabel(function() {
        return {};
      });
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Old graph before copy", dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph));
      copy(node, graph, clusterGraph, node);
      graph.setNode(node, {
        clusterNode: true,
        id: node,
        clusterData: clusterDb[node].clusterData,
        labelText: clusterDb[node].labelText,
        graph: clusterGraph
      });
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("New graph after copy node: (", node, ")", dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(clusterGraph));
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug("Old graph after copy", dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph));
    } else {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn(
        "Cluster ** ",
        node,
        " **not meeting the criteria !externalConnections:",
        !clusterDb[node].externalConnections,
        " no parent: ",
        !graph.parent(node),
        " children ",
        graph.children(node) && graph.children(node).length > 0,
        graph.children("D"),
        depth
      );
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.debug(clusterDb);
    }
  }
  nodes = graph.nodes();
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("New list of nodes", nodes);
  for (const node of nodes) {
    const data = graph.node(node);
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn(" Now next level", node, data);
    if (data.clusterNode) {
      extractor(data.graph, depth + 1);
    }
  }
};
const sorter = (graph, nodes) => {
  if (nodes.length === 0) {
    return [];
  }
  let result = Object.assign(nodes);
  nodes.forEach((node) => {
    const children = graph.children(node);
    const sorted = sorter(graph, children);
    result = [...result, ...sorted];
  });
  return result;
};
const sortNodesByHierarchy = (graph) => sorter(graph, graph.children());
const rect = (parent, node) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Creating subgraph rect for ", node.id, node);
  const siteConfig = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.c)();
  const shapeSvg = parent.insert("g").attr("class", "cluster" + (node.class ? " " + node.class : "")).attr("id", node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const useHtmlLabels = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.m)(siteConfig.flowchart.htmlLabels);
  const label = shapeSvg.insert("g").attr("class", "cluster-label");
  const text = node.labelType === "markdown" ? (0,_createText_1719965b_js__WEBPACK_IMPORTED_MODULE_5__.a)(label, node.labelText, { style: node.labelStyle, useHtmlLabels }) : label.node().appendChild((0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.c)(node.labelText, node.labelStyle, void 0, true));
  let bbox = text.getBBox();
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.m)(siteConfig.flowchart.htmlLabels)) {
    const div = text.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_3__/* .select */ .Ys)(text);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  const padding = 0 * node.padding;
  const halfPadding = padding / 2;
  const width = node.width <= bbox.width + padding ? bbox.width + padding : node.width;
  if (node.width <= bbox.width + padding) {
    node.diff = (bbox.width - node.width) / 2 - node.padding / 2;
  } else {
    node.diff = -node.padding / 2;
  }
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Data ", node, JSON.stringify(node));
  rect2.attr("style", node.style).attr("rx", node.rx).attr("ry", node.ry).attr("x", node.x - width / 2).attr("y", node.y - node.height / 2 - halfPadding).attr("width", width).attr("height", node.height + padding);
  const { subGraphTitleTopMargin } = (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.g)(siteConfig);
  if (useHtmlLabels) {
    label.attr(
      "transform",
      // This puts the label on top of the box instead of inside it
      `translate(${node.x - bbox.width / 2}, ${node.y - node.height / 2 + subGraphTitleTopMargin})`
    );
  } else {
    label.attr(
      "transform",
      // This puts the label on top of the box instead of inside it
      `translate(${node.x}, ${node.y - node.height / 2 + subGraphTitleTopMargin})`
    );
  }
  const rectBox = rect2.node().getBBox();
  node.width = rectBox.width;
  node.height = rectBox.height;
  node.intersect = function(point) {
    return (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.i)(node, point);
  };
  return shapeSvg;
};
const noteGroup = (parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", "note-cluster").attr("id", node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const padding = 0 * node.padding;
  const halfPadding = padding / 2;
  rect2.attr("rx", node.rx).attr("ry", node.ry).attr("x", node.x - node.width / 2 - halfPadding).attr("y", node.y - node.height / 2 - halfPadding).attr("width", node.width + padding).attr("height", node.height + padding).attr("fill", "none");
  const rectBox = rect2.node().getBBox();
  node.width = rectBox.width;
  node.height = rectBox.height;
  node.intersect = function(point) {
    return (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.i)(node, point);
  };
  return shapeSvg;
};
const roundedWithTitle = (parent, node) => {
  const siteConfig = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.c)();
  const shapeSvg = parent.insert("g").attr("class", node.classes).attr("id", node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const label = shapeSvg.insert("g").attr("class", "cluster-label");
  const innerRect = shapeSvg.append("rect");
  const text = label.node().appendChild((0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.c)(node.labelText, node.labelStyle, void 0, true));
  let bbox = text.getBBox();
  if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.m)(siteConfig.flowchart.htmlLabels)) {
    const div = text.children[0];
    const dv = (0,d3__WEBPACK_IMPORTED_MODULE_3__/* .select */ .Ys)(text);
    bbox = div.getBoundingClientRect();
    dv.attr("width", bbox.width);
    dv.attr("height", bbox.height);
  }
  bbox = text.getBBox();
  const padding = 0 * node.padding;
  const halfPadding = padding / 2;
  const width = node.width <= bbox.width + node.padding ? bbox.width + node.padding : node.width;
  if (node.width <= bbox.width + node.padding) {
    node.diff = (bbox.width + node.padding * 0 - node.width) / 2;
  } else {
    node.diff = -node.padding / 2;
  }
  rect2.attr("class", "outer").attr("x", node.x - width / 2 - halfPadding).attr("y", node.y - node.height / 2 - halfPadding).attr("width", width + padding).attr("height", node.height + padding);
  innerRect.attr("class", "inner").attr("x", node.x - width / 2 - halfPadding).attr("y", node.y - node.height / 2 - halfPadding + bbox.height - 1).attr("width", width + padding).attr("height", node.height + padding - bbox.height - 3);
  const { subGraphTitleTopMargin } = (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.g)(siteConfig);
  label.attr(
    "transform",
    `translate(${node.x - bbox.width / 2}, ${node.y - node.height / 2 - node.padding / 3 + ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.m)(siteConfig.flowchart.htmlLabels) ? 5 : 3) + subGraphTitleTopMargin})`
  );
  const rectBox = rect2.node().getBBox();
  node.height = rectBox.height;
  node.intersect = function(point) {
    return (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.i)(node, point);
  };
  return shapeSvg;
};
const divider = (parent, node) => {
  const shapeSvg = parent.insert("g").attr("class", node.classes).attr("id", node.id);
  const rect2 = shapeSvg.insert("rect", ":first-child");
  const padding = 0 * node.padding;
  const halfPadding = padding / 2;
  rect2.attr("class", "divider").attr("x", node.x - node.width / 2 - halfPadding).attr("y", node.y - node.height / 2).attr("width", node.width + padding).attr("height", node.height + padding);
  const rectBox = rect2.node().getBBox();
  node.width = rectBox.width;
  node.height = rectBox.height;
  node.diff = -node.padding / 2;
  node.intersect = function(point) {
    return (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.i)(node, point);
  };
  return shapeSvg;
};
const shapes = { rect, roundedWithTitle, noteGroup, divider };
let clusterElems = {};
const insertCluster = (elem, node) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Inserting cluster");
  const shape = node.shape || "rect";
  clusterElems[node.id] = shapes[shape](elem, node);
};
const clear = () => {
  clusterElems = {};
};
const recursiveRender = async (_elem, graph, diagramType, id, parentCluster, siteConfig) => {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Graph in recursive render: XXX", dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph), parentCluster);
  const dir = graph.graph().rankdir;
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Dir in recursive render - dir:", dir);
  const elem = _elem.insert("g").attr("class", "root");
  if (!graph.nodes()) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("No nodes found for", graph);
  } else {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Recursive render XXX", graph.nodes());
  }
  if (graph.edges().length > 0) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Recursive edges", graph.edge(graph.edges()[0]));
  }
  const clusters = elem.insert("g").attr("class", "clusters");
  const edgePaths = elem.insert("g").attr("class", "edgePaths");
  const edgeLabels = elem.insert("g").attr("class", "edgeLabels");
  const nodes = elem.insert("g").attr("class", "nodes");
  await Promise.all(
    graph.nodes().map(async function(v) {
      const node = graph.node(v);
      if (parentCluster !== void 0) {
        const data = JSON.parse(JSON.stringify(parentCluster.clusterData));
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Setting data for cluster XXX (", v, ") ", data, parentCluster);
        graph.setNode(parentCluster.id, data);
        if (!graph.parent(v)) {
          _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.trace("Setting parent", v, parentCluster.id);
          graph.setParent(v, parentCluster.id, data);
        }
      }
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("(Insert) Node XXX" + v + ": " + JSON.stringify(graph.node(v)));
      if (node && node.clusterNode) {
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Cluster identified", v, node.width, graph.node(v));
        const o = await recursiveRender(
          nodes,
          node.graph,
          diagramType,
          id,
          graph.node(v),
          siteConfig
        );
        const newEl = o.elem;
        (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.u)(node, newEl);
        node.diff = o.diff || 0;
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Node bounds (abc123)", v, node, node.width, node.x, node.y);
        (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.s)(newEl, node);
        _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Recursive render complete ", newEl, node);
      } else {
        if (graph.children(v).length > 0) {
          _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Cluster - the non recursive path XXX", v, node.id, node, graph);
          _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info(findNonClusterChild(node.id, graph));
          clusterDb[node.id] = { id: findNonClusterChild(node.id, graph), node };
        } else {
          _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Node - the non recursive path", v, node.id, node);
          await (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.e)(nodes, graph.node(v), dir);
        }
      }
    })
  );
  graph.edges().forEach(function(e) {
    const edge = graph.edge(e.v, e.w, e.name);
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(e));
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Edge " + e.v + " -> " + e.w + ": ", e, " ", JSON.stringify(graph.edge(e)));
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Fix", clusterDb, "ids:", e.v, e.w, "Translating: ", clusterDb[e.v], clusterDb[e.w]);
    (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.f)(edgeLabels, edge);
  });
  graph.edges().forEach(function(e) {
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(e));
  });
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("#############################################");
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("###                Layout                 ###");
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("#############################################");
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info(graph);
  (0,dagre_d3_es_src_dagre_index_js__WEBPACK_IMPORTED_MODULE_0__/* .layout */ .bK)(graph);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Graph after layout:", dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph));
  let diff = 0;
  const { subGraphTitleTotalMargin } = (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.g)(siteConfig);
  sortNodesByHierarchy(graph).forEach(function(v) {
    const node = graph.node(v);
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Position " + v + ": " + JSON.stringify(graph.node(v)));
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info(
      "Position " + v + ": (" + node.x,
      "," + node.y,
      ") width: ",
      node.width,
      " height: ",
      node.height
    );
    if (node && node.clusterNode) {
      node.y += subGraphTitleTotalMargin;
      (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.p)(node);
    } else {
      if (graph.children(v).length > 0) {
        node.height += subGraphTitleTotalMargin;
        insertCluster(clusters, node);
        clusterDb[node.id].node = node;
      } else {
        node.y += subGraphTitleTotalMargin / 2;
        (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.p)(node);
      }
    }
  });
  graph.edges().forEach(function(e) {
    const edge = graph.edge(e);
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info("Edge " + e.v + " -> " + e.w + ": " + JSON.stringify(edge), edge);
    edge.points.forEach((point) => point.y += subGraphTitleTotalMargin / 2);
    const paths = (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.h)(edgePaths, e, edge, clusterDb, diagramType, graph, id);
    (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.j)(edge, paths);
  });
  graph.nodes().forEach(function(v) {
    const n = graph.node(v);
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.info(v, n.type, n.diff);
    if (n.type === "group") {
      diff = n.diff;
    }
  });
  return { elem, diff };
};
const render = async (elem, graph, markers, diagramType, id) => {
  (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.a)(elem, markers, diagramType, id);
  (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.b)();
  (0,_edges_96097737_js__WEBPACK_IMPORTED_MODULE_6__.d)();
  clear();
  clear$1();
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Graph at first:", JSON.stringify(dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph)));
  adjustClustersAndEdges(graph);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.l.warn("Graph after:", JSON.stringify(dagre_d3_es_src_graphlib_json_js__WEBPACK_IMPORTED_MODULE_1__/* .write */ .c(graph)));
  const siteConfig = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_4__.c)();
  await recursiveRender(elem, graph, diagramType, id, void 0, siteConfig);
};



/***/ }),

/***/ 7336:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "a": () => (/* binding */ flowStyles),
/* harmony export */   "f": () => (/* binding */ flowRendererV2)
/* harmony export */ });
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(35417);
/* harmony import */ var dagre_d3_es_src_dagre_js_label_add_html_label_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(43349);
/* harmony import */ var dagre_d3_es_src_graphlib_index_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(45625);
/* harmony import */ var _index_5325376f_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(94617);
/* harmony import */ var _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(93883);
/* harmony import */ var khroma__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(59792);
/* harmony import */ var khroma__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(51117);






const conf = {};
const setConf = function(cnf) {
  const keys = Object.keys(cnf);
  for (const key of keys) {
    conf[key] = cnf[key];
  }
};
const addVertices = async function(vert, g, svgId, root, doc, diagObj) {
  const svg = root.select(`[id="${svgId}"]`);
  const keys = Object.keys(vert);
  for (const id of keys) {
    const vertex = vert[id];
    let classStr = "default";
    if (vertex.classes.length > 0) {
      classStr = vertex.classes.join(" ");
    }
    classStr = classStr + " flowchart-label";
    const styles = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.k)(vertex.styles);
    let vertexText = vertex.text !== void 0 ? vertex.text : vertex.id;
    let vertexNode;
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("vertex", vertex, vertex.labelType);
    if (vertex.labelType === "markdown") {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("vertex", vertex, vertex.labelType);
    } else {
      if ((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.m)((0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.c)().flowchart.htmlLabels)) {
        const node = {
          label: vertexText
        };
        vertexNode = (0,dagre_d3_es_src_dagre_js_label_add_html_label_js__WEBPACK_IMPORTED_MODULE_3__/* .addHtmlLabel */ .a)(svg, node).node();
        vertexNode.parentNode.removeChild(vertexNode);
      } else {
        const svgLabel = doc.createElementNS("http://www.w3.org/2000/svg", "text");
        svgLabel.setAttribute("style", styles.labelStyle.replace("color:", "fill:"));
        const rows = vertexText.split(_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.e.lineBreakRegex);
        for (const row of rows) {
          const tspan = doc.createElementNS("http://www.w3.org/2000/svg", "tspan");
          tspan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
          tspan.setAttribute("dy", "1em");
          tspan.setAttribute("x", "1");
          tspan.textContent = row;
          svgLabel.appendChild(tspan);
        }
        vertexNode = svgLabel;
      }
    }
    let radius = 0;
    let _shape = "";
    switch (vertex.type) {
      case "round":
        radius = 5;
        _shape = "rect";
        break;
      case "square":
        _shape = "rect";
        break;
      case "diamond":
        _shape = "question";
        break;
      case "hexagon":
        _shape = "hexagon";
        break;
      case "odd":
        _shape = "rect_left_inv_arrow";
        break;
      case "lean_right":
        _shape = "lean_right";
        break;
      case "lean_left":
        _shape = "lean_left";
        break;
      case "trapezoid":
        _shape = "trapezoid";
        break;
      case "inv_trapezoid":
        _shape = "inv_trapezoid";
        break;
      case "odd_right":
        _shape = "rect_left_inv_arrow";
        break;
      case "circle":
        _shape = "circle";
        break;
      case "ellipse":
        _shape = "ellipse";
        break;
      case "stadium":
        _shape = "stadium";
        break;
      case "subroutine":
        _shape = "subroutine";
        break;
      case "cylinder":
        _shape = "cylinder";
        break;
      case "group":
        _shape = "rect";
        break;
      case "doublecircle":
        _shape = "doublecircle";
        break;
      default:
        _shape = "rect";
    }
    const labelText = await (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.r)(vertexText, (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.c)());
    g.setNode(vertex.id, {
      labelStyle: styles.labelStyle,
      shape: _shape,
      labelText,
      labelType: vertex.labelType,
      rx: radius,
      ry: radius,
      class: classStr,
      style: styles.style,
      id: vertex.id,
      link: vertex.link,
      linkTarget: vertex.linkTarget,
      tooltip: diagObj.db.getTooltip(vertex.id) || "",
      domId: diagObj.db.lookUpDomId(vertex.id),
      haveCallback: vertex.haveCallback,
      width: vertex.type === "group" ? 500 : void 0,
      dir: vertex.dir,
      type: vertex.type,
      props: vertex.props,
      padding: (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.c)().flowchart.padding
    });
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("setNode", {
      labelStyle: styles.labelStyle,
      labelType: vertex.labelType,
      shape: _shape,
      labelText,
      rx: radius,
      ry: radius,
      class: classStr,
      style: styles.style,
      id: vertex.id,
      domId: diagObj.db.lookUpDomId(vertex.id),
      width: vertex.type === "group" ? 500 : void 0,
      type: vertex.type,
      dir: vertex.dir,
      props: vertex.props,
      padding: (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.c)().flowchart.padding
    });
  }
};
const addEdges = async function(edges, g, diagObj) {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("abc78 edges = ", edges);
  let cnt = 0;
  let linkIdCnt = {};
  let defaultStyle;
  let defaultLabelStyle;
  if (edges.defaultStyle !== void 0) {
    const defaultStyles = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.k)(edges.defaultStyle);
    defaultStyle = defaultStyles.style;
    defaultLabelStyle = defaultStyles.labelStyle;
  }
  for (const edge of edges) {
    cnt++;
    const linkIdBase = "L-" + edge.start + "-" + edge.end;
    if (linkIdCnt[linkIdBase] === void 0) {
      linkIdCnt[linkIdBase] = 0;
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("abc78 new entry", linkIdBase, linkIdCnt[linkIdBase]);
    } else {
      linkIdCnt[linkIdBase]++;
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("abc78 new entry", linkIdBase, linkIdCnt[linkIdBase]);
    }
    let linkId = linkIdBase + "-" + linkIdCnt[linkIdBase];
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("abc78 new link id to be used is", linkIdBase, linkId, linkIdCnt[linkIdBase]);
    const linkNameStart = "LS-" + edge.start;
    const linkNameEnd = "LE-" + edge.end;
    const edgeData = { style: "", labelStyle: "" };
    edgeData.minlen = edge.length || 1;
    if (edge.type === "arrow_open") {
      edgeData.arrowhead = "none";
    } else {
      edgeData.arrowhead = "normal";
    }
    edgeData.arrowTypeStart = "arrow_open";
    edgeData.arrowTypeEnd = "arrow_open";
    switch (edge.type) {
      case "double_arrow_cross":
        edgeData.arrowTypeStart = "arrow_cross";
      case "arrow_cross":
        edgeData.arrowTypeEnd = "arrow_cross";
        break;
      case "double_arrow_point":
        edgeData.arrowTypeStart = "arrow_point";
      case "arrow_point":
        edgeData.arrowTypeEnd = "arrow_point";
        break;
      case "double_arrow_circle":
        edgeData.arrowTypeStart = "arrow_circle";
      case "arrow_circle":
        edgeData.arrowTypeEnd = "arrow_circle";
        break;
    }
    let style = "";
    let labelStyle = "";
    switch (edge.stroke) {
      case "normal":
        style = "fill:none;";
        if (defaultStyle !== void 0) {
          style = defaultStyle;
        }
        if (defaultLabelStyle !== void 0) {
          labelStyle = defaultLabelStyle;
        }
        edgeData.thickness = "normal";
        edgeData.pattern = "solid";
        break;
      case "dotted":
        edgeData.thickness = "normal";
        edgeData.pattern = "dotted";
        edgeData.style = "fill:none;stroke-width:2px;stroke-dasharray:3;";
        break;
      case "thick":
        edgeData.thickness = "thick";
        edgeData.pattern = "solid";
        edgeData.style = "stroke-width: 3.5px;fill:none;";
        break;
      case "invisible":
        edgeData.thickness = "invisible";
        edgeData.pattern = "solid";
        edgeData.style = "stroke-width: 0;fill:none;";
        break;
    }
    if (edge.style !== void 0) {
      const styles = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.k)(edge.style);
      style = styles.style;
      labelStyle = styles.labelStyle;
    }
    edgeData.style = edgeData.style += style;
    edgeData.labelStyle = edgeData.labelStyle += labelStyle;
    if (edge.interpolate !== void 0) {
      edgeData.curve = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.n)(edge.interpolate, d3__WEBPACK_IMPORTED_MODULE_0__/* .curveLinear */ .c_6);
    } else if (edges.defaultInterpolate !== void 0) {
      edgeData.curve = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.n)(edges.defaultInterpolate, d3__WEBPACK_IMPORTED_MODULE_0__/* .curveLinear */ .c_6);
    } else {
      edgeData.curve = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.n)(conf.curve, d3__WEBPACK_IMPORTED_MODULE_0__/* .curveLinear */ .c_6);
    }
    if (edge.text === void 0) {
      if (edge.style !== void 0) {
        edgeData.arrowheadStyle = "fill: #333";
      }
    } else {
      edgeData.arrowheadStyle = "fill: #333";
      edgeData.labelpos = "c";
    }
    edgeData.labelType = edge.labelType;
    edgeData.label = await (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.r)(
      edge.text.replace(_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.e.lineBreakRegex, "\n"),
      (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.c)()
    );
    if (edge.style === void 0) {
      edgeData.style = edgeData.style || "stroke: #333; stroke-width: 1.5px;fill:none;";
    }
    edgeData.labelStyle = edgeData.labelStyle.replace("color:", "fill:");
    edgeData.id = linkId;
    edgeData.classes = "flowchart-link " + linkNameStart + " " + linkNameEnd;
    g.setEdge(edge.start, edge.end, edgeData, cnt);
  }
};
const getClasses = function(text, diagObj) {
  return diagObj.db.getClasses();
};
const draw = async function(text, id, _version, diagObj) {
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("Drawing flowchart");
  let dir = diagObj.db.getDirection();
  if (dir === void 0) {
    dir = "TD";
  }
  const { securityLevel, flowchart: conf2 } = (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.c)();
  const nodeSpacing = conf2.nodeSpacing || 50;
  const rankSpacing = conf2.rankSpacing || 50;
  let sandboxElement;
  if (securityLevel === "sandbox") {
    sandboxElement = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)("#i" + id);
  }
  const root = securityLevel === "sandbox" ? (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)(sandboxElement.nodes()[0].contentDocument.body) : (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)("body");
  const doc = securityLevel === "sandbox" ? sandboxElement.nodes()[0].contentDocument : document;
  const g = new dagre_d3_es_src_graphlib_index_js__WEBPACK_IMPORTED_MODULE_1__/* .Graph */ .k({
    multigraph: true,
    compound: true
  }).setGraph({
    rankdir: dir,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 0,
    marginy: 0
  }).setDefaultEdgeLabel(function() {
    return {};
  });
  let subG;
  const subGraphs = diagObj.db.getSubGraphs();
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("Subgraphs - ", subGraphs);
  for (let i2 = subGraphs.length - 1; i2 >= 0; i2--) {
    subG = subGraphs[i2];
    _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("Subgraph - ", subG);
    diagObj.db.addVertex(
      subG.id,
      { text: subG.title, type: subG.labelType },
      "group",
      void 0,
      subG.classes,
      subG.dir
    );
  }
  const vert = diagObj.db.getVertices();
  const edges = diagObj.db.getEdges();
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("Edges", edges);
  let i = 0;
  for (i = subGraphs.length - 1; i >= 0; i--) {
    subG = subGraphs[i];
    (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .selectAll */ .td_)("cluster").append("text");
    for (let j = 0; j < subG.nodes.length; j++) {
      _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.l.info("Setting up subgraphs", subG.nodes[j], subG.id);
      g.setParent(subG.nodes[j], subG.id);
    }
  }
  await addVertices(vert, g, id, root, doc, diagObj);
  await addEdges(edges, g);
  const svg = root.select(`[id="${id}"]`);
  const element = root.select("#" + id + " g");
  await (0,_index_5325376f_js__WEBPACK_IMPORTED_MODULE_4__.r)(element, g, ["point", "circle", "cross"], "flowchart", id);
  _mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.u.insertTitle(svg, "flowchartTitleText", conf2.titleTopMargin, diagObj.db.getDiagramTitle());
  (0,_mermaid_7ea9cbd6_js__WEBPACK_IMPORTED_MODULE_2__.o)(g, svg, conf2.diagramPadding, conf2.useMaxWidth);
  diagObj.db.indexNodes("subGraph" + i);
  if (!conf2.htmlLabels) {
    const labels = doc.querySelectorAll('[id="' + id + '"] .edgeLabel .label');
    for (const label of labels) {
      const dim = label.getBBox();
      const rect = doc.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("rx", 0);
      rect.setAttribute("ry", 0);
      rect.setAttribute("width", dim.width);
      rect.setAttribute("height", dim.height);
      label.insertBefore(rect, label.firstChild);
    }
  }
  const keys = Object.keys(vert);
  keys.forEach(function(key) {
    const vertex = vert[key];
    if (vertex.link) {
      const node = (0,d3__WEBPACK_IMPORTED_MODULE_0__/* .select */ .Ys)("#" + id + ' [id="' + key + '"]');
      if (node) {
        const link = doc.createElementNS("http://www.w3.org/2000/svg", "a");
        link.setAttributeNS("http://www.w3.org/2000/svg", "class", vertex.classes.join(" "));
        link.setAttributeNS("http://www.w3.org/2000/svg", "href", vertex.link);
        link.setAttributeNS("http://www.w3.org/2000/svg", "rel", "noopener");
        if (securityLevel === "sandbox") {
          link.setAttributeNS("http://www.w3.org/2000/svg", "target", "_top");
        } else if (vertex.linkTarget) {
          link.setAttributeNS("http://www.w3.org/2000/svg", "target", vertex.linkTarget);
        }
        const linkNode = node.insert(function() {
          return link;
        }, ":first-child");
        const shape = node.select(".label-container");
        if (shape) {
          linkNode.append(function() {
            return shape.node();
          });
        }
        const label = node.select(".label");
        if (label) {
          linkNode.append(function() {
            return label.node();
          });
        }
      }
    }
  });
};
const flowRendererV2 = {
  setConf,
  addVertices,
  addEdges,
  getClasses,
  draw
};
const fade = (color, opacity) => {
  const channel = khroma__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .Z;
  const r = channel(color, "r");
  const g = channel(color, "g");
  const b = channel(color, "b");
  return khroma__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .Z(r, g, b, opacity);
};
const getStyles = (options) => `.label {
    font-family: ${options.fontFamily};
    color: ${options.nodeTextColor || options.textColor};
  }
  .cluster-label text {
    fill: ${options.titleColor};
  }
  .cluster-label span,p {
    color: ${options.titleColor};
  }

  .label text,span,p {
    fill: ${options.nodeTextColor || options.textColor};
    color: ${options.nodeTextColor || options.textColor};
  }

  .node rect,
  .node circle,
  .node ellipse,
  .node polygon,
  .node path {
    fill: ${options.mainBkg};
    stroke: ${options.nodeBorder};
    stroke-width: 1px;
  }
  .flowchart-label text {
    text-anchor: middle;
  }
  // .flowchart-label .text-outer-tspan {
  //   text-anchor: middle;
  // }
  // .flowchart-label .text-inner-tspan {
  //   text-anchor: start;
  // }

  .node .katex path {
    fill: #000;
    stroke: #000;
    stroke-width: 1px;
  }

  .node .label {
    text-align: center;
  }
  .node.clickable {
    cursor: pointer;
  }

  .arrowheadPath {
    fill: ${options.arrowheadColor};
  }

  .edgePath .path {
    stroke: ${options.lineColor};
    stroke-width: 2.0px;
  }

  .flowchart-link {
    stroke: ${options.lineColor};
    fill: none;
  }

  .edgeLabel {
    background-color: ${options.edgeLabelBackground};
    rect {
      opacity: 0.5;
      background-color: ${options.edgeLabelBackground};
      fill: ${options.edgeLabelBackground};
    }
    text-align: center;
  }

  /* For html labels only */
  .labelBkg {
    background-color: ${fade(options.edgeLabelBackground, 0.5)};
    // background-color: 
  }

  .cluster rect {
    fill: ${options.clusterBkg};
    stroke: ${options.clusterBorder};
    stroke-width: 1px;
  }

  .cluster text {
    fill: ${options.titleColor};
  }

  .cluster span,p {
    color: ${options.titleColor};
  }
  /* .cluster div {
    color: ${options.titleColor};
  } */

  div.mermaidTooltip {
    position: absolute;
    text-align: center;
    max-width: 200px;
    padding: 2px;
    font-family: ${options.fontFamily};
    font-size: 12px;
    background: ${options.tertiaryColor};
    border: 1px solid ${options.border2};
    border-radius: 2px;
    pointer-events: none;
    z-index: 100;
  }

  .flowchartTitleText {
    text-anchor: middle;
    font-size: 18px;
    fill: ${options.textColor};
  }
`;
const flowStyles = getStyles;



/***/ })

};
;