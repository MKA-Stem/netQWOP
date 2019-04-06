/* eslint-disable react/no-unused-prop-types */

import React from "react";
import PropTypes from "prop-types";
import planck, { Vec2 } from "planck-js";

class QWOP extends React.Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    q: PropTypes.bool.isRequired,
    w: PropTypes.bool.isRequired,
    o: PropTypes.bool.isRequired,
    p: PropTypes.bool.isRequired
  };

  static controls = ["q", "w", "o", "p"];

  scale = 40;

  componentDidMount() {
    const { width, height } = this.props;
    this.world = planck.World(Vec2(0, 10));

    this.ctx = this.canvas.getContext("2d");

    const ground = this.world.createBody({
      type: "static",
      position: Vec2(width / 2 / this.scale, height / this.scale),
      angle: 0
    });

    ground.createFixture({
      shape: planck.Box(width, 1),
      friction: 0.8,
      restitution: 0
    });

    const staticBar = this.world.createBody().setDynamic();
    staticBar.createFixture(planck.Box(2, 0.2));
    staticBar.setPosition(Vec2(17, 5));
    staticBar.setMassData({
      mass: 1,
      center: Vec2(),
      I: 1
    });

    const dynamicBar = this.world.createBody().setDynamic();
    dynamicBar.createFixture(planck.Box(2, 0.2));
    dynamicBar.setPosition(Vec2(13, 5));
    dynamicBar.setMassData({
      mass: 1,
      center: Vec2(),
      I: 1
    });

    this.revoluteJoint = this.world.createJoint(
      planck.RevoluteJoint({}, dynamicBar, staticBar, Vec2(15, 5))
    );
    this.revoluteJoint.setMaxMotorTorque(50);
    this.revoluteJoint.setMotorSpeed(0);
    this.revoluteJoint.enableMotor(true);

    window.world = this.world; // Debug
    this._frame();
  }

  shouldComponentUpdate(nextProps) {
    this._updateMotors(nextProps);
    return false; // never update
  }

  _drawPolygon = (body, shape) => {
    const vertices = shape.m_vertices;
    const position = body.getPosition();

    this.ctx.save();

    this.ctx.scale(this.scale, this.scale);
    this.ctx.translate(position.x, position.y);
    this.ctx.rotate(body.getAngle());

    this.ctx.beginPath();
    this.ctx.moveTo(vertices[0].x, vertices[0].y);
    for (const v of vertices.slice(1, vertices.length)) {
      this.ctx.lineTo(v.x, v.y);
    }
    this.ctx.fill();

    this.ctx.restore();
  };

  _frame = () => {
    const { width, height } = this.props;
    this.world.step(1 / 60);
    this.ctx.clearRect(0, 0, width, height);

    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        // console.log(body);
        if (fixture.getType() === "polygon") {
          this._drawPolygon(body, fixture.getShape());
        }
      }
    }

    window.requestAnimationFrame(this._frame);
  };

  _updateMotors({ q, w, o: _o, p: _p }) {
    if (q && w) {
      this.revoluteJoint.setMotorSpeed(0);
    } else if (q) {
      this.revoluteJoint.setMotorSpeed(10);
    } else if (w) {
      this.revoluteJoint.setMotorSpeed(-10);
    } else {
      this.revoluteJoint.setMotorSpeed(0);
    }
  }

  render() {
    const { width, height } = this.props;
    return (
      <div>
        <style jsx>{`
          canvas {
            border: solid red 1px;
          }
        `}</style>
        <canvas ref={el => (this.canvas = el)} width={width} height={height} />
      </div>
    );
  }
}

export default QWOP;
