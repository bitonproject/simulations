'use strict'

const debug = require('debug')('biton:simulations')
const { EventEmitter}  = require('events')
const seedrandom = require('seedrandom')

const bitonTopology = require('./topology')
const drawGraph = require('./drawGraph')

class bitonSim extends EventEmitter {
  constructor () {
    super()

    this.topology = new bitonTopology(null, new seedrandom('topology seed'))

    // Generate honest nodes topology
    this.topology.resetPrng(new seedrandom('honest small world'))
    const honestSW = this.topology.genSmallWorld(500, 8, 0.25, 'honest')

    // Generate malicious nodes topology
    this.topology.resetPrng(new seedrandom('malicious small world'))
    const maliciousSW = this.topology.genSmallWorld(100, 6, 0.25, 'malicious')

    this.topology.mergeGraph(honestSW)
    this.topology.mergeGraph(maliciousSW)
  }

  draw(root) {
    return new drawGraph(root, this.topology.graph)
  }
}

module.exports = bitonSim
