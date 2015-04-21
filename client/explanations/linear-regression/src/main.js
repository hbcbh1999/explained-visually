'use strict'

// Third party modules.
var THREE = require('three')
// Adds `OrbitControls` to the `THREE` object.
require('OrbitControls')(THREE)
// Adds `TrackballControls` to the `THREE` object.
require('TrackballControls')(THREE)
var d3 = require('d3')
// Adds a `masonic` property to the `d3` object.
require('d3-masonic')(d3)
var React = require('react')

// Shared modules across explanations.
var color = require('color')
var alphaify = require('alphaify')

// Local modules to this explanation.
var utils = require('./utils')
var style = require('./style')
var LeastSquares = require('./LeastSquares.react')
var LeastSquares3DModule = require('./LeastSquares3DModule.react')
var RegressionAsNobsModule = require('./RegressionAsNobsModule.react')
var SLRParameters = require('./SLRParameters.react')

var App = React.createClass({
  getInitialState() {
    var color = d3.scale.category10()
    var points = [
      [16,  5],
      [13, 23],
      [24, 33],
      [43, 32],
      [51, 53],
      [84, 65],
      [90, 85]
    ].map(function(point, i) { return { point: point, color: color(i) } })
    var state = {
      leastSquaresPoints: points,
      regressionPoints: [[20, 20], [80, 80]],
      betas: this._getBetas(points),
      leastSquaresErrors: this._updateLeastSquaresErrors(points),
    }
    return state
  },
  _locationAccessor(d) { return d.point },
  _onDragOLSNob(type, e) {
    if (type === 'point') {
      var points = this.state.leastSquaresPoints.slice(0)
      points[e.i].point = e.pos
      this._updatePoint(points[e.i], e.pos)
    }
  },
  _onDragRegressionNob(type, e) {
    if (type === 'regression') {
      var points = this.state.regressionPoints
      this._updateRegressionPoint(points[e.i], e.pos)
    }
  },
  _updatePoint(d, pos) {
    var points = this.state.leastSquaresPoints.slice(0) // copy
    d.point = pos
    this.setState({
      leastSquaresPoints: points,
      betas: this._getBetas(points),
      leastSquaresErrors: this._updateLeastSquaresErrors(points),
    })
  },
  _updateRegressionPoint(d, pos) {
    var points = this.state.regressionPoints.slice(0) // copy
    d[0] = pos[0], d[1] = pos[1]
    this.setState({regressionPoints: points})
  },
  _updateLeastSquaresErrors(points) {
    return utils.wrapLeastSquaresErrors(points, this._locationAccessor)
  },
  _getBetas(points) {
    var X = points.map(function(d) { return [d.point[0]] })
    var y = points.map(function(d) { return d.point[1] })
    return utils.hessian(y, X)
  },
  _leastSquaresValueAccessor: d => d.error,
  _leastSquaresColorAccessor: d => d.color,
  render() {
    return <div>
      <h1>This explanation is interactive!</h1>
      <p>
        <i>Dials</i> allow you to adjust scalar values.
      </p>
      <img style={style.tutorialVideo}
        src='/ev/linear-regression/resources/dial-tutorial.gif' />
      <p>
        <i>Points</i> that have a gray circle around them are draggable.
      </p>
      <img style={style.tutorialVideo}
        src='/ev/linear-regression/resources/point-tutorial.gif' />
      <p>
        Say we had the following data on hand size vs height for a bunch of 
        people and we want to predict the height of someone we know only the 
        hand size of. The result of linear regression would give us the equation 
        below to the right. The input is 'hand size', the output, 'height'.
      </p>
      <LeastSquares
        key='least-squares'
        points={this.state.leastSquaresPoints}
        betas={this.state.betas}
        onDragNob={this._onDragOLSNob}
        margins={{l: 20, t: 20, r: 30, b: 30}}
        mode='point'
        width={310}
        height={310}
        showErrorSquares={false}
        showErrorLines={false}
        colorAccessor={() => color.senary}
        style={{float: 'left'}}
        xAxisLabel='hand size'
        yAxisLabel='height'/>
      <SLRParameters width={310} height={310} betas={this.state.betas} />
      <p>
        The goal of linear regression is to find the parameters (slop and
        y-intercept in the two 2d example) for a line that minimizes the 
        squared errors.
      </p>
      <RegressionAsNobsModule
        points={this.state.leastSquaresPoints}
        onDragOLSNob={this._onDragOLSNob}
        leastSquaresValueAccessor={d => d.error}
        leastSquaresColorAccessor={d => d.d.color} />
      <LeastSquares3DModule />
      <br style={{clear: 'both'}} />
      <br />
      <br />
      <br />
      <p>
        Special thanks to Ian Johnson and Lewis Lehe for reviewing earlier 
        version of this document.
      </p>
    </div>
  }
})

React.render(<App />, d3.select('.myApp').node())