'use strict'

const debug = require('debug')('biton:simulations')
const { EventEmitter}  = require('events')
const seedrandom = require('seedrandom')

const bitonTopology = require('./topology')

class bitonSim extends EventEmitter {
  constructor () {
    super()

    const topology = new bitonTopology(null, new seedrandom('topology seed'))

    // Generate honest nodes topology
    topology.resetPrng(new seedrandom('honest small world'))
    const honestSW = topology.genSmallWorld(4000, 12, 0.25, 'honest')

    // Generate malicious nodes topology
    topology.resetPrng(new seedrandom('malicious small world'))
    const maliciousSW = topology.genSmallWorld(1000, 12, 0.25, 'malicious')

    topology.mergeGraph(honestSW)
    topology.mergeGraph(maliciousSW)
  }
}

module.exports = bitonSim
