'use strict'

const debug = require('debug')('biton:simulations')
const bitonTopology = require('./topology')
const seedrandom = require('seedrandom')

const topology = new bitonTopology(null, new seedrandom('topology seed'))
