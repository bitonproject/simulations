'use strict'

const debug = require('debug')('biton:draw')
const { EventEmitter } = require('events')
const d3 = require('d3')

class drawGraph {
  constructor (graphSVG, graph) {
    this.svg = d3.select(graphSVG)
    this._width = this.svg.node().getBoundingClientRect().width
    this._height = this.svg.node().getBoundingClientRect().height

    this._nodes = []
    this._links = []

    this._parseGraph(graph)
    this._update()
  }

  _parseGraph (graph) {
    this._graph = graph

    const self = this
    this._graph.forEachNode(function (node, attributes) {
      self._nodes.push({id: node, attributes: attributes})
    })
    this._graph.forEachEdge(function (edge, attributes, source, target) {
      self._links.push({source: source, target: target})
    })

    debug('parsing graph complete')

    // Attach graph event listeners
    graph.on('nodeAdded', this.nodeAdded)
    graph.on('nodeDropped', this.nodeDropped)

    graph.on('edgeAdded', this.edgeAdded)
    graph.on('edgeDropped', this.edgeDropped)
  }


  _update() {
    this._simulation = d3.forceSimulation(this._nodes)
      .force('link', d3.forceLink(this._links).id(d => d.id))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(this._width / 2, this._height / 2))

    const link = this.svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this._links)
      .join("line")

    const node = this.svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(this._nodes)
      .join("circle")
      .attr("r", 5)

    node.append('title')
      .text(d => d.id);

    this._simulation
      .on('tick', function () {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y)

        node
          .attr("cx", d => d.x)
          .attr("cy", d => d.y)
      } )
  }

  nodeAdded (key, attributes) {
  }

  nodeDropped (key, attributes) {
  }

  edgeAdded (key, source, target) {
  }

  edgeDropped (key, source, target) {
  }
}



module.exports = drawGraph
