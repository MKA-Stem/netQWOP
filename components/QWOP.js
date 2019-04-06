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
    this.world = planck.World(Vec2(0, 0));

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

    const torso = this.world.createDynamicBody(
      Vec2(width / 2 / this.scale, height / 2 / this.scale - 1.5)
    );
    torso.createFixture({
      shape: planck.Box(1, 2.5),
      filterGroupIndex: -1
    });
    torso.setMassData({
      mass: 4,
      center: Vec2(),
      I: 3
    });

    const leftThigh = this.world.createDynamicBody(
      Vec2(width / 2 / this.scale + 0.25, height / 2 / this.scale + 2.5)
    );
    leftThigh.createFixture({
      shape: planck.Box(0.5, 2),
      filterGroupIndex: -1
    });
    leftThigh.setMassData({
      mass: 3,
      center: Vec2(),
      I: 2
    });

    const rightThigh = this.world.createDynamicBody(
      Vec2(width / 2 / this.scale - 0.25, height / 2 / this.scale + 2.5)
    );
    rightThigh.createFixture({
      shape: planck.Box(0.5, 2),
      filterGroupIndex: -1
    });
    rightThigh.setMassData({
      mass: 3,
      center: Vec2(),
      I: 2
    });

    this.leftHip = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        leftThigh,
        torso,
        Vec2(width / 2 / this.scale + 0.25, height / 2 / this.scale + 0.5)
      )
    );
    console.log(this.leftHip);
    // leftHipJoint.setAngle(Math.PI / 4);

    this.rightHip = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        rightThigh,
        torso,
        Vec2(width / 2 / this.scale - 0.25, height / 2 / this.scale + 0.5)
      )
    );

    const leftCalf = this.world.createDynamicBody(
      Vec2(width / 2 / this.scale + 0.25, height / 2 / this.scale + 5.6)
    );
    leftCalf.createFixture({
      shape: planck.Box(0.3, 1.4),
      filterGroupIndex: -1
    });
    leftCalf.setMassData({
      mass: 2,
      center: Vec2(),
      I: 1
    });

    const rightCalf = this.world.createDynamicBody(
      Vec2(width / 2 / this.scale - 0.25, height / 2 / this.scale + 5.6)
    );
    rightCalf.createFixture({
      shape: planck.Box(0.3, 1.4),
      filterGroupIndex: -1
    });
    rightCalf.setMassData({
      mass: 2,
      center: Vec2(),
      I: 1
    });

    this.leftKnee = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        leftCalf,
        leftThigh,
        Vec2(width / 2 / this.scale + 0.25, height / 2 / this.scale + 4.2)
      )
    );

    this.rightKnee = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        rightCalf,
        rightThigh,
        Vec2(width / 2 / this.scale - 0.25, height / 2 / this.scale + 4.2)
      )
    );

    /* const revoluteJoint = this.world.createJoint(
      planck.RevoluteJoint({}, dynamicBar, staticBar, Vec2(15, 5))
    );
    revoluteJoint.setMaxMotorTorque(50);
    revoluteJoint.setMotorSpeed(10);
    revoluteJoint.enableMotor(true); */

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
    for (const v of vertices.reverse()) {
      this.ctx.lineTo(v.x, v.y);
    }
    this.ctx.lineWidth = 0.05;
    this.ctx.stroke();

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

  _updateMotors({ q, w, o, p }) {
    this.leftHip.setMotorSpeed(q ? 10 : 0);
    this.rightHip.setMotorSpeed(w ? 10 : 0);
    this.leftKnee.setMotorSpeed(o ? 10 : 0);
    this.rightKnee.setMotorSpeed(p ? 10 : 0);
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
