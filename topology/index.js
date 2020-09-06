'use strict'

const debug = require('debug')('biton:topology')
const graphology = require('graphology')

/**
 * We construct the biton topology in the following steps:
 *
 * 1) We generate two disconnected random small-world graphs according to the Watts–Strogatz model,
 * one for honest nodes and the other for malicious nodes.
 * 2) Each node is assigned a random address in the biton overlay.
 * 3) We tweak the topology so that its degree distribution follows a power law (scale-free network).
 * To do so we add links among the existing nodes according to a preferential attachment rule
 * biased towards super-nodes in overlapping overlay zones, inspired by the Barabási–Albert model.
 *
 * For more information about mixes over sparse topologies refer to https://arxiv.org/pdf/0706.0430.pdf
 * Nagaraja, Shishir. "Anonymity in the wild: Mixes on unstructured networks."
 * In International Workshop on Privacy Enhancing Technologies, pp. 254-271. Springer, Berlin, Heidelberg, 2007.
 *
 * Also, see implementations of graph generators here
 * https://github.com/networkx/networkx/blob/master/networkx/generators/random_graphs.py
 */

class bitonTopology {

  constructor (initGraph, prng) {
    if (initGraph && !(initGraph instanceof graphology) ) {
      throw new Error('provided initGraph is not a graphology instance')
    }
    this.graph = initGraph || new graphology({allowSelfLoops: false, type: 'undirected'})
    this.prng = prng || Math.random
  }

  resetPrng (prng) {
    this.prng = prng
  }

}

module.exports = bitonTopology
