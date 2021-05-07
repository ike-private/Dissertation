// const { poseSimilarity } = require("posenet-similarity");
var video = document.getElementById('video');
video.width = 1200;
video.height = 600;
// var pose1ImageElement = document.getElementById('pose1');
// var poseData;
var weightedDistance;
let p1;
let p0;
let labelData;
let poses = [];
let start;
let pose;
let poseLabels = [];
let finalLabel;
var poseData = [];
let data = [];
let poseNormalised;
let num = 0;
let vptree ; 

function delay(time){
    return new Promise((resolve, reject) => {
      if( isNaN(time)){
        reject(new Error('Delay requires a valid number'));
      } else {
        setTimeout(resolve, time);
      }
    });
  }

// video.addEventListener('loadeddata', setup());
function estimatePose() {
	video.addEventListener( 'loadeddata' , net.estimateSinglePose(video) 
		// net.estimateSinglePose(pose2ImageElement)
	.then(function(pose){
		video.play();
	    console.log('collecting poses');
	let timestamp = Date.now()
	if (start === undefined)
		start = timestamp;
		const elapsed = timestamp - start;
	
		// poses.push(pose);
		// console.log(elapsed);
		poseNormalised = normalisePoseToVector(pose);
		console.log(poseNormalised);
		poses.push(pose);
	if (elapsed < video.duration * 1000) {
		requestAnimationFrame(function() {
			estimatePose();
			
		})
	}
	else if(elapsed > video.duration*1000) {
		// video.pause();
		// console.log(poses);
		console.log('ended');
		// console.log(poseData);
		// Build the tree once
	// loop through array of collected poses and find match for each pose
	// store labels of all the matches 
	// Find most frequent label
		for (let i = 0; i < poses.length; i++) {
			buildVPTree1();
			let currentUserPose = poses[i];
			// console.log(currentUserPose);
			let closestMatchIndex = findMostSimilarMatch(currentUserPose);
			let closestMatch = poseData[closestMatchIndex];
			poseLabels.push(closestMatch);
			// console.log(poseLabels);
			console.log(closestMatch);
			if (i == poses.length - 1){
				finalLabel = getLabel(poseLabels);
				console.log("Classification label: " + finalLabel.label);
			}
		}
	
	}	

	// weightedDistance = pns.poseSimilarity(poses, poses ,{ strategy: 'weightedDistance' });

	// console.log(weightedDistance);



	}));
}

function getLabel(array) {
	var dict = {};
	let maxValue = 0;
	let label;
	
	array.forEach(function (item){
		if (dict[item] == null) {
			dict[item] = 1;
		} 
		else {
			dict[item]++;
			// console.log(item);
		}
	
		if (dict[item] > maxValue) {
			maxValue = dict[item];
			label = item;
		} 
		
	});
	
	return label;
  }

function setup() {
	createCanvas(1200,600);
  
	// load posenet by downloading the weights for the model.
	video.addEventListener( 'loadeddata' ,  posenet.load({
		architecture: 'ResNet50',
		outputStride: 32,
		inputResolution: { width: 257, height: 200 },
		quantBytes: 2
	  }).then(function(loadedNet) {
	  console.log("loaded");
	  net = loadedNet;
	  // when it's loaded, start estimating poses
	  requestAnimationFrame(function() {
		estimatePose();
	  });
	}))
  }
$.getJSON("CP.json", function(json) {
     poseData = json ;
});
$.getJSON("stroke.json", function(json) {
	poseData =  poseData.concat(json) 
	// console.log(poseData);
});
$.getJSON("MS.json", function(json) {
	poseData = poseData.concat(json) 
	// console.log(poseData);
});
$.getJSON("parkinsons.json", function(json) {
	poseData = poseData.concat(json) 
});
$.getJSON("normal.json", function(json) {
	poseData = poseData.concat(json)
});
// PoseData = poseData.concat(JSON.parse($.getJSON({'url': "normal.json", 'async': false}).responseText));

function cosineDistanceMatching(poseVector1, poseVector2) {
	// console.log(poseVector1);
	// console.log(poseVector2);
    let cosineSimilarity = pns.poseSimilarity(poseVector1, poseVector2, { strategy: 'cosineSimilarity' });
	// console.log(cosineSimilarity);
    let distance = 2 * (1 - cosineSimilarity);
	// console.log(distance);
    return Math.sqrt(distance);
}


function buildVPTree1() {
	// Initialize our vptree with our images’ pose data and a distance function
	// console.log(poseData);
	vptree = buildVPTree(poseData, cosineDistanceMatching);
	// console.log(vptree);
  }
  
  function findMostSimilarMatch(userPose) {
	// search the vp tree for the image pose that is nearest (in cosine distance) to userPose
	let nearestImage = vptree.search(userPose);
  
	// console.log(nearestImage[0].d) // cosine distance value of the nearest match
  
	// return index (in relation to poseData) of nearest match. 
	return nearestImage[0].i; 
  }

  function draw(){
	// if (video) { image(video,0,0)}
	if (pose) {
	  // key points in skeleton 
	  for (let i = 0; i < pose.keypoints.length; i++) {
		let x = pose.keypoints[i].position.x;
		let y = pose.keypoints[i].position.y;
		fill(0,255,0);
		ellipse(x,y,16,16);
	  }
  
	  // Lines in skeleton
	  for (let i = 0; i < skeleton.length; i++) {
		let a = skeleton[i][0];
		let b = skeleton[i][1];
		strokeWeight(2);
		stroke(255);
		line(a.position.x, a.position.y, b.position.x, b.position.y);
	  }
	}
  }
  
function normalisePoseToVector(pose){
pose.keypoints.forEach((point) => {
	array = {};
	const x = point.position.x;
	const y = point.position.y;
	poseVector = createVector(x,y);
	normalised = poseVector.normalize();
	point.position['x'] = normalised.x
	point.position['y'] = normalised.y
})
	return pose;
}


/*╔═════════════════════════════════════════════════════════════════════════════════════════════════════════╗
 *║                                                                                                         ║
 *║      vptree.js v0.2.3                                                                                   ║
 *║      https://github.com/fpirsch/vptree.js                                                               ║
 *║                                                                                                         ║
 *║      A javascript implementation of the Vantage-Point Tree algorithm                                    ║
 *║      ISC license (http://opensource.org/licenses/ISC). François Pirsch. 2013.                           ║
 *║                                                                                                         ║
 *║      Date: 2015-12-24T11:39Z                                                                            ║
 *║                                                                                                         ║
 *╚═════════════════════════════════════════════════════════════════════════════════════════════════════════╝
 */

/* jshint node: true */
/* global define */

//https://github.com/umdjs/umd/blob/master/commonjsStrictGlobal.js
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports'], function (exports) {
            factory(root.VPTreeFactory = exports);
        });
    } else if (typeof exports === 'object') {
        // CommonJS
        factory(exports);
    } else {
        // Browser globals
        factory(root.VPTreeFactory = {});
    }
})

// (this, function (exports) {
    // "use strict";
    /* global VPTree, exports */

	/*───────────────────────────────────────────────────────────────────────────┐
	 │   Selection/partition algorithm                                           │
	 └───────────────────────────────────────────────────────────────────────────*/

	function partition(list, left, right, pivotIndex, comp) {
		var pivotValue = list[pivotIndex];
		var swap = list[pivotIndex];	// Move pivot to end
		list[pivotIndex] = list[right];
		list[right] = swap;
		var storeIndex = left;
		for (var i = left; i < right; i++) {
			if (comp(list[i], pivotValue)) {
				swap = list[storeIndex];
				list[storeIndex] = list[i];
				list[i] = swap;
				storeIndex++;
			}
		}
		swap = list[right];				// Move pivot to its final place
		list[right] = list[storeIndex];
		list[storeIndex] = swap;
		return storeIndex;
	}

	// Pivot selection : computes the median of elements a, b and c of the list,
	// according to comparator comp.
	function medianOf3(list, a, b, c, comp) {
		var A = list[a], B = list[b], C = list[c];
		return comp (A, B) ?
            comp (B, C) ? b : comp (A, C) ? c : a :
			comp (A, C) ? a : comp (B, C) ? c : b;
	}

	/**
	 * Quickselect : Finds the nth smallest number in a list according to comparator comp.
	 * All elements smaller than the nth element are moved to its left (in no particular order),
	 * and all elements greater thant the nth are moved to its right.
	 *
	 * The funny mix of 0-based and 1-based indexes comes from the C++
	 * Standard Library function nth_element.
	 *
	 * @param {Array} list - the list to partition
	 * @param {int} left - index in the list of the first element of the sublist.
	 * @param {int} right - index in the list of the last element of the sublist (inclusive)
	 * @param {int} nth - index, in the range [1, sublist.length] of the element to find.
	 * @param {function} comp - a comparator, i.e. a boolean function accepting two parameters a and b,
	 *        and returning true if a < b and false if a >= b.
	 *
	 * See http://en.wikipedia.org/wiki/Quickselect
	 * And /include/bits/stl_algo.h in the GCC Standard Library ( http://gcc.gnu.org/libstdc++/ )
	 */
	function nth_element(list, left, nth, right, comp) {
		if (nth <= 0 || nth > (right-left+1)) throw new Error("VPTree.nth_element: nth must be in range [1, right-left+1] (nth="+nth+")");
		var pivotIndex, pivotNewIndex, pivotDist;
		for (;;) {
			// select pivotIndex between left and right
			pivotIndex = medianOf3(list, left, right, (left + right) >> 1, comp);
			pivotNewIndex = partition(list, left, right, pivotIndex, comp);
			pivotDist = pivotNewIndex - left + 1;
			if (pivotDist === nth) {
				return list[pivotNewIndex];
			}
			else if (nth < pivotDist) {
				right = pivotNewIndex - 1;
			}
			else {
				nth -= pivotDist;
				left = pivotNewIndex + 1;
			}
		}
	}


	/**
	 * Wrapper around nth_element with a 0-based index.
	 */
	function select1(list, k, comp) {
		if (k < 0 || k >= list.length) {
            throw new Error("VPTree.select: k must be in range [0, list.length-1] (k="+k+")");
        }
		return nth_element(list, 0, k+1, list.length-1, comp);
	}


	/*───────────────────────────────────────────────────────────────────────────┐
	 │   vp-tree creation                                                        │
	 └───────────────────────────────────────────────────────────────────────────*/
	/** Selects a vantage point in a set.
	 *  We trivially pick one at random.
	 *  TODO this could be improved by random sampling to maximize spread.
	 */
	function selectVPIndex(list) {
		return Math.floor(Math.random() * list.length);
	}

	var distanceComparator = function(a, b) { return a.dist < b.dist; };

	/**
	 * Builds and returns a vp-tree from the list S.
	 * @param {Array} S array of objects to structure into a vp-tree.
	 * @param {function} distance a function returning the distance between 2 ojects from the list S.
	 * @param {number} nb (maximum) bucket size. 0 or undefined = no buckets used.
	 * @return {object} vp-tree.
	 */
	 function buildVPTree(S, distance, nb) {
		var list = [];
		for (var i = 0, n = S.length; i < n; i++) {
			list[i] = {
				i: i
				//hist: []		// unused (yet)
			};
		}

		var tree = recurseVPTree(S, list, distance, nb);
		return new VPTree(S, distance, tree);
	}

function recurseVPTree(S, list, distance, nb) {
		if (list.length === 0) return null;
		var i;

		// Is this a leaf node ?
		var listLength = list.length;
		if (nb > 0 && listLength <= nb) {
			var bucket = [];
			for (i = 0; i < listLength; i++) {
				bucket[i] = list[i].i;
			}
			return bucket;
		}

		// Non-leaf node.
		// Constructs a node with the selected vantage point extracted from the set.
		var vpIndex = selectVPIndex(list),
			node = list[vpIndex];
		list.splice(vpIndex, 1);
		listLength--;
		// We can't use node.dist yet, so don't show it in the vp-tree output.
		node = { i: node.i };
		if (listLength === 0) return node;

		// Adds to each item its distance to the vantage point.
		// This ensures each distance is computed only once.
		var vp = S[node.i],
			dmin = Infinity,
			dmax = 0,
			item, dist, n;
		for (i = 0, n = listLength; i < n; i++) {
			item = list[i];
			dist = distance(vp, S[item.i]);
			item.dist = dist;
			//item.hist.push(dist);	// unused (yet)
			if (dmin > dist) dmin = dist;
			if (dmax < dist) dmax = dist;
		}
		node.m = dmin;
		node.M = dmax;

		// Partitions the set around the median distance.
		var medianIndex = listLength >> 1,
			median = select1(list, medianIndex, distanceComparator);

		// Recursively builds vp-trees with the 2 resulting subsets.
		var leftItems = list.splice(0, medianIndex),
			rightItems = list;
		node.u = median.dist;
		node.L = recurseVPTree(S, leftItems, distance, nb);
		node.R = recurseVPTree(S, rightItems, distance, nb);
		return node;
	}

	/** Stringifies a vp-tree data structure.
	 *  JSON without the null nodes and the quotes around object keys, to save space.
	 */
	function stringify(root) {
		var stack = [root || this.tree], s = '';
		while (stack.length) {
			var node = stack.pop();

			// Happens if the bucket size is greater thant the dataset.
			if (node.length) return '['+node.join(',')+']';

			s += '{i:' + node.i;
			if (node.hasOwnProperty('m')) {
				s += ',m:' + node.m + ',M:' + node.M + ',u:' + node.u;
			}
			if (node.hasOwnProperty('b')) {
				s += ',b:[' + node.b + ']';
			}
			if (node.hasOwnProperty('L')) {
				var L = node.L;
				if (L) {
					s += ',L:';
					if (L.length) s += '[' + L + ']';
					else s += stringify(L);
				}
			}
			if (node.hasOwnProperty('R')) {
				var R = node.R;
				if (R) {
					s += ',R:';
					if (R.length) s += '[' + R + ']';
					else s += stringify(R);
				}
			}
			s += '}';
		}
		return s;
	}

	/*───────────────────────────────────────────────────────────────────────────┐
	 │   Build Public API                                                        │
	 └───────────────────────────────────────────────────────────────────────────*/

	// exports.select = select;
	// exports.build = buildVPTree;


	/*───────────────────────────────────────────────────────────────────────────┐
	 │   Priority Queue, used to store search results.                           │
	 └───────────────────────────────────────────────────────────────────────────*/

	/**
	 * @constructor
	 * @class PriorityQueue manages a queue of elements with priorities.
	 *
	 * @param {number} size maximum size of the queue (default = 5). Only lowest priority items will be retained.
	 */
	function PriorityQueue(size) {
		size = size || 5;
		var contents = [];

		function binaryIndexOf(priority) {
			var minIndex = 0,
				maxIndex = contents.length - 1,
				currentIndex,
				currentElement;

			while (minIndex <= maxIndex) {
				currentIndex = (minIndex + maxIndex) >> 1;
				currentElement = contents[currentIndex].priority;
				 
				if (currentElement < priority) {
					minIndex = currentIndex + 1;
				}
				else if (currentElement > priority) {
					maxIndex = currentIndex - 1;
				}
				else {
					return currentIndex;
				}
			}

			return -1 - minIndex;
		}

		var api = {
			// This breaks IE8 compatibility. Who cares ?
			get length() {
				return contents.length;
			},

			insert: function(data, priority) {
				var index = binaryIndexOf(priority);
				if (index < 0) index = -1 - index;
				if (index < size) {
					contents.splice(index, 0, {data: data, priority: priority});
					if (contents.length > size) {
						contents.length--;
					}
				}
				return contents.length === size ? contents[contents.length-1].priority : undefined;
			},

			list: function() {
				return contents.map(function(item){ return {i: item.data, d: item.priority}; });
			}
		};

		return api;
	}


	/*───────────────────────────────────────────────────────────────────────────┐
	 │   vp-tree search                                                          │
	 └───────────────────────────────────────────────────────────────────────────*/

	/**
	 * @param {object} q - query : any object the distance function can be applied to.
	 * @param {number} [n=1] - number of nearest neighbors to find
	 * @param {number} [t=∞] - maximum distance from element q
	 *
	 * @return {object[]} list of search results, ordered by increasing distance to the query object.
	 *                    Each result has a property i which is the index of the element in S, and d which
	 *                    is its distance to the query object.
	 */
	function searchVPTree(q, n, t) {
		t = t || Infinity;
		var W = new PriorityQueue(n || 1),
			S = this.S,
			distance = this.distance,
			comparisons = 0;

		function doSearch(node) {
			if (node === null) return;

			// Leaf node : test each element in this node's bucket.
			if (node.length) {
                console.log(node);
				for (var i = 0, n = node.length; i < n; i++) {
					comparisons++;
					var elementID = node[i],
						element = S[elementID],
						elementDist = distance(q, element);
					if (elementDist < t) {
						t = W.insert(elementID, elementDist) || t;
					}
				}
				return;
			}

			// Non-leaf node
			var id = node.i,
				p = S[id],
				dist = distance(q, p);

			comparisons++;

			// This vantage-point is close enough to q.
			if (dist < t) {
				t = W.insert(id, dist) || t;
			}

			// The order of exploration is determined by comparison with u.
			// The sooner we find elements close to q, the smaller t and the more nodes we skip.
			// P. Yianilos uses the middle of left/right bounds instead of u.
			// We search L if dist is in (m - t, u + t), and R if dist is in (u - t, M + t)
			var u = node.u, L = node.L, R = node.R;
			if (u === undefined) return;
			if (dist < u) {
				if (L && node.m - t < dist) doSearch(L);
				if (R && u - t < dist) doSearch(R);
			}
			else {
				if (R && dist < node.M + t) doSearch(R);
				if (L && dist < u + t) doSearch(L);
			}
		}

		doSearch(this.tree);
		this.comparisons = comparisons;
		return W.list();
	}



	/*───────────────────────────────────────────────────────────────────────────┐
	 │   vp-tree constructor                                                     │
	 └───────────────────────────────────────────────────────────────────────────*/

	/**
	 * @constructor
	 * @class VPTree manages a vp-tree.
	 *
	 * @param {Array} S the initial set of elements
	 * @param {Function} distance the distance function
	 * @param {Object} the vp-tree structure
	 */
	function VPTree(S, distance, tree) {
		this.S = S;
		this.distance = distance;
		this.tree = tree;

		this.search = searchVPTree;
		this.comparisons = 0;
		this.stringify = stringify;
	}


	// exports.load = function(S, distance, tree) {
	// 	return new VPTree(S, distance, tree);
	// };
// }));
