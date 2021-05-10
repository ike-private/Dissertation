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
let p = {};
let poseNormalised;
let num = 0;
let vptree ; 
let posesAndConfidence = [];

function delay(time){
    return new Promise((resolve, reject) => {
      if( isNaN(time)){
        reject(new Error('Delay requires a valid number'));
      } else {
        setTimeout(resolve, time);
      }
    });
  }

function estimatePose() {
	video.addEventListener( 'loadeddata' , net.estimateSinglePose(video) 
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
		// console.log(poseNormalised);
		poses.push(poseNormalised);
	if (elapsed < video.duration * 1000) {
		requestAnimationFrame(function() {
			estimatePose();
			
		})
	}
	else if(elapsed > video.duration*1000) {
		console.log('ended');
		for (let i = 0; i < poses.length; i++) {
			buildVPTree1();
			let currentUserPose = poses[i];
			let closestMatchIndex = findMostSimilarMatch(currentUserPose);
			let closestMatch = poseData[closestMatchIndex];
			// console.log(closestMatch);
			poseLabels.push(closestMatch);
			if (i == poses.length - 1){
				finalLabel = getLabel(poseLabels);
				console.log(finalLabel);
			}
		}
	
	}	
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
		}
	
		if (dict[item] > maxValue) {
			maxValue = dict[item];
			posesAndConfidence.forEach((element) => {
				// console.log(item.slice(0,34));
			
				// if (element.keypoints === item){
				if	(element.keypoints.sort().join('|') === item.slice(0,34).sort().join('|')){
					console.log(element.label);
					label = element.label
				}
			});
			
		} 
		
	});
	
	return label;
  }

function setup() {
	createCanvas(1200,600);
  
	// load posenet by downloading the weights for the model.
	video.addEventListener( 'loadeddata' ,  posenet.load().then(function(loadedNet) {
	  console.log("loaded");
	  net = loadedNet;
	  // when it's loaded, start estimating poses
	  requestAnimationFrame(function() {
		estimatePose();
	  });
	}))
  }
  
$.getJSON("S1.json", function(json) {
     data = json ;
});
$.getJSON("CP1.json", function(json) {
	data =  data.concat(json) 
	// console.log(poseData);
});
$.getJSON("N1.json", function(json) {
	data = data.concat(json) 
	// console.log(poseData);
});
$.getJSON("P1.json", function(json) {
	data= data.concat(json) 
});
$.getJSON("MS1.json", function(json) {
	data = data.concat(json)
	data.forEach((i) => {
		p = {};
		p.keypoints = i.keypoints.slice(0, 34);
		p.confidences = i.keypoints.slice(34, 51);
		p.confidencesSum = i.keypoints.slice(51, 52) ;
		p.label = i.label;
		posesAndConfidence.push(p);
		// poseData.push(p.keypoints);
		poseData.push(i.keypoints.slice(0, 52))
	})
});
// PoseData = poseData.concat(JSON.parse($.getJSON({'url': "normal.json", 'async': false}).responseText));


function cosineSim(vectorPose1XY, vectorPose2XY){
	let v1DotV2 = 0;
	let absV1 = 0;
	let absV2 = 0;
  
	vectorPose1XY.forEach((v1, index) => {
	  const v2 = vectorPose2XY[index];
	  v1DotV2 += v1 * v2;
	  absV1 += v1 * v1;
	  absV2 += v2 * v2;
	})
	absV1 = Math.sqrt(absV1);
	absV2 = Math.sqrt(absV2);
  
	return v1DotV2 / (absV1 * absV2);
  }

function weightedDistance(poseVector1, poseVector2) {
	let vector1PoseXY = poseVector1.slice(0, 34);
	let vector1Confidences = poseVector1.slice(34, 51);
	let vector1ConfidenceSum = poseVector1.slice(51, 52);
  
	let vector2PoseXY = poseVector2.slice(0, 34);
  
	// First summation
	let summation1 = 1 / vector1ConfidenceSum;
  
	// Second summation
	let summation2 = 0;
	for (let i = 0; i < vector1PoseXY.length; i++) {
	  let tempConf = Math.floor(i / 2);
	  let tempSum = vector1Confidences[tempConf] * Math.abs(vector1PoseXY[i] - vector2PoseXY[i]);
	  summation2 = summation2 + tempSum;
	}
  
	return summation1 * summation2;
  }

function cosineDistanceMatching(poseVector1, poseVector2) {
	let cosine;
	cosine = cosineSim(poseVector1, poseVector2);
    return Math.sqrt(2 * (1 - cosine));
}

function weightedDistanceMatching(poseVector1, poseVector2) {
	let weight;
	weight = weightedDistance(poseVector1, poseVector2);
    return weight;
}

function buildVPTree1() {
	// Initialize our vptree with our images’ pose data and a distance function
	// console.log(poseData);
	vptree = buildVPTree(poseData, weightedDistanceMatching);
	// vptree = buildVPTree(poseData, cosineDistanceMatching);
  }
  
  function findMostSimilarMatch(userPose) {
	let nearestImage = vptree.search(userPose);
  
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
	let vectorPoseArray = [];
	let c = 0;
	// console.log(pose);
	pose.keypoints.forEach((point) => {
	  const x = point.position.x;
	  const y = point.position.y;
	  poseVector = createVector(x,y);
	  normalised = poseVector.normalize();
	  vectorPoseArray.push(normalised.x)
	  vectorPoseArray.push(normalised.y)
	})
	pose.keypoints.forEach((point) => {
	  const confidence = point.score;
	  c = c + confidence;
	  vectorPoseArray.push(confidence);
	})
	  vectorPoseArray.push(c);
	  // console.log(vectorPoseArray);
	  return vectorPoseArray;
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
