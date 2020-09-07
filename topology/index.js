'use strict'

const debug = require('debug')('biton:topology')
const graphology = require('graphology')

/**
 * We construct the biton topology in the following steps:
 *
 * 1) We generate two disconnected random small-world graphs according to the Watts–Strogatz model,
 * one for honest nodes and the other for malicious nodes.
 * 2) Each node is assigned a random address in the biton overlay.
 * 3) We generate a scale-free overlay topology (the degree distribution follows a power law).
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
    if (initGraph && !(initGraph instanceof graphology)) {
      throw new Error('provided initGraph is not a graphology instance')
    }
    this.graph = initGraph || new graphology({allowSelfLoops: false, type: 'undirected'})
    this.prng = prng || Math.random
  }

  resetPrng (prng) {
    this.prng = prng
  }

  /**
   * Merge the provided graph into the current topology
   * If a node or edge exists with the same name, then merge their attributes
   *
   * @param {graphology} graph - The graph to be merged
   */
  mergeGraph(graph) {
    graph.forEachNode((node, attributes) => {
      this.graph.mergeNode(node, attributes)
    })

    graph.forEachEdge((edge, attributes, source, target) => {
      this.graph.mergeEdge(source, target, attributes)
    })
  }

  /**
   * Return a Watts–Strogatz small-world graph.
   *
   * @param {number} n - The number of nodes
   * @param {number} k - The mean degree of the graph
   * @param {number} p - The probability β of rewiring an edge
   * @param {string} nodePrefix - Prefix for the key referencing the node
   * @param {Object} nodeAttrs - Optional node attributes
   * @param {Object} edgeAttrs - Optional edge attributes
   */
  genSmallWorld(n, k, p, nodePrefix, nodeAttrs, edgeAttrs) {
    if (k % 2 === 1 || !(Number.isInteger(k))) {
      throw new Error('k must be an even integer')
    }

    if (k > n) {
      throw new Error('k cannot be greater than n')
    }

    if (k < Math.log(n)) {
      throw new Error('k must be much greater that ln(n)')
    }

    if (p < 0 || p > 1) {
      throw new Error('Provided probability β is invalid')
    }

    // Generate a graph and add n nodes
    let G = new graphology({allowSelfLoops: false, type: 'undirected'})

    let keyPrefix = nodePrefix || 'nodeWS'
    for (let i = 0; i < n; i++) {
      G.addNode(keyPrefix + i, nodeAttrs)
    }

    // Connect each node to k/2 rightmost neighbors (wrapping around the array)
    // in effect forming a k-regular ring lattice
    for (let i = 0; i < n; i++) {
      for (let j = 1; j < k/2 + 1; j++) {
        G.addEdge(keyPrefix + i, keyPrefix + ((i + j) % n), edgeAttrs)
      }
    }

    // Rewire edges with probability β
    const nodes = G.nodes()
    G.forEachEdge((edge, attributes, source, target) => {
      if (this.prng() < p) {
        // Pick a uniformly random node, avoiding self-loops and link duplication
        let newTarget
        do {
          newTarget = nodes[Math.floor(this.prng() * nodes.length)]
        } while (source === newTarget || G.hasEdge(source, newTarget))

        G.dropEdge(edge)
        G.addEdge(source, newTarget, edgeAttrs)
      }
    })

    return G
  }

}

module.exports = bitonTopology
