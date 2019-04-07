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
    p: PropTypes.bool.isRequired,
    onFinish: PropTypes.func.isRequired
  };

  static controls = ["q", "w", "o", "p"];

  scale = 40;

  componentDidMount() {
    const { width, height, onFinish } = this.props;
    const QWOPStartX = width / 2 / this.scale;
    const QWOPStartY = height / 2 / this.scale;
    const density = 0.5;

    this.world = planck.World(Vec2(0, 14));

    this.ctx = this.canvas.getContext("2d");

    const ground = this.world.createBody({
      type: "static",
      position: Vec2(width / 2 / this.scale, height / this.scale),
      angle: 0
    });

    ground.createFixture({
      shape: planck.Box(width, 1),
      userData: "floor"
    });

    const torso = this.world.createDynamicBody(
      Vec2(QWOPStartX, QWOPStartY - 1.5)
    );
    torso.createFixture({
      shape: planck.Box(1, 2.5),
      filterGroupIndex: -1
    });
    torso.createFixture({
      shape: planck.Box(0.2, 0.3, Vec2(0, -2.5 - 0.3)),
      density,
      filterGroupIndex: -1
    });
    torso.createFixture({
      shape: planck.Box(0.7, 0.7, Vec2(0, -2.5 - 0.6 - 0.7)),
      density,
      filterGroupIndex: -1
    });
    torso.resetMassData();

    const leftThigh = this.world.createDynamicBody(
      Vec2(QWOPStartX + 0.25, QWOPStartY + 2.5)
    );
    leftThigh.createFixture({
      shape: planck.Box(0.5, 2),
      density,
      filterGroupIndex: -1,
      userData: "touchable"
    });
    leftThigh.resetMassData();

    const rightThigh = this.world.createDynamicBody(
      Vec2(QWOPStartX - 0.25, QWOPStartY + 2.5)
    );
    rightThigh.createFixture({
      shape: planck.Box(0.5, 2),
      density,
      filterGroupIndex: -1,
      userData: "touchable"
    });
    rightThigh.resetMassData();

    this.leftHip = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        leftThigh,
        torso,
        Vec2(QWOPStartX + 0.25, QWOPStartY + 0.5)
      )
    );

    this.rightHip = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        rightThigh,
        torso,
        Vec2(QWOPStartX - 0.25, QWOPStartY + 0.5)
      )
    );

    const leftCalf = this.world.createDynamicBody(
      Vec2(QWOPStartX + 0.25, QWOPStartY + 5.6)
    );
    leftCalf.createFixture({
      shape: planck.Box(0.3, 1.4),
      density,
      filterGroupIndex: -1,
      userData: "touchable"
    });
    leftCalf.resetMassData();

    const rightCalf = this.world.createDynamicBody(
      Vec2(QWOPStartX - 0.25, QWOPStartY + 5.6)
    );
    rightCalf.createFixture({
      shape: planck.Box(0.3, 1.4),
      density,
      filterGroupIndex: -1,
      userData: "touchable"
    });
    rightCalf.resetMassData();

    this.leftKnee = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        leftCalf,
        leftThigh,
        Vec2(QWOPStartX + 0.25, QWOPStartY + 4.2)
      )
    );

    this.rightKnee = this.world.createJoint(
      planck.RevoluteJoint(
        { motorSpeed: 0, maxMotorTorque: 30, enableMotor: true },
        rightCalf,
        rightThigh,
        Vec2(QWOPStartX - 0.25, QWOPStartY + 4.2)
      )
    );

    const leftFoot = this.world.createDynamicBody(
      Vec2(QWOPStartX + 0.25, QWOPStartY + 7.0)
    );
    leftFoot.createFixture({
      shape: planck.Box(0.6, 0.3, Vec2(0.3, 0)),
      density,
      filterGroupIndex: -1,
      userData: "touchable"
    });
    leftFoot.resetMassData();

    const rightFoot = this.world.createDynamicBody(
      Vec2(QWOPStartX - 0.25, QWOPStartY + 7.0)
    );
    rightFoot.createFixture({
      shape: planck.Box(0.6, 0.3, Vec2(0.3, 0)),
      density,
      filterGroupIndex: -1,
      userData: "touchable"
    });
    rightFoot.resetMassData();

    // Left Ankle
    this.world.createJoint(
      planck.RevoluteJoint(
        {},
        leftCalf,
        leftFoot,
        Vec2(QWOPStartX + 0.25, QWOPStartY + 6.7)
      )
    );

    // Right Ankle
    this.world.createJoint(
      planck.RevoluteJoint(
        {},
        rightCalf,
        rightFoot,
        Vec2(QWOPStartX - 0.25, QWOPStartY + 6.7)
      )
    );

    const upperLeftArm = this.world.createDynamicBody(
      Vec2(QWOPStartX + 0.5, QWOPStartY - 3.8)
    );
    upperLeftArm.createFixture({
      shape: planck.Box(0.3, 1.45, Vec2(0, 1.45)),
      density,
      filterGroupIndex: -1
    });
    upperLeftArm.resetMassData();

    const upperRightArm = this.world.createDynamicBody(
      Vec2(QWOPStartX - 0.5, QWOPStartY - 3.8)
    );
    upperRightArm.createFixture({
      shape: planck.Box(0.3, 1.45, Vec2(0, 1.45)),
      density,
      filterGroupIndex: -1
    });
    upperRightArm.resetMassData();

    // Left Shoulder
    this.world.createJoint(
      planck.RevoluteJoint(
        {},
        upperLeftArm,
        torso,
        Vec2(QWOPStartX + 0.5, QWOPStartY - 3.8)
      )
    );

    // Right Shoulder
    this.world.createJoint(
      planck.RevoluteJoint(
        {},
        upperRightArm,
        torso,
        Vec2(QWOPStartX - 0.5, QWOPStartY - 3.8)
      )
    );

    const lowerLeftArm = this.world.createDynamicBody(
      Vec2(QWOPStartX + 0.5, QWOPStartY - 3.8 + 2.9)
    );
    lowerLeftArm.createFixture({
      shape: planck.Box(0.3, 1, Vec2(0, 1)),
      density,
      filterGroupIndex: -1
    });
    lowerLeftArm.createFixture({
      shape: planck.Box(0.3, 0.3, Vec2(0, 2.3)),
      density,
      filterGroupIndex: -1
    });
    lowerLeftArm.resetMassData();

    const lowerRightArm = this.world.createDynamicBody(
      Vec2(QWOPStartX - 0.5, QWOPStartY - 3.8 + 2.9)
    );
    lowerRightArm.createFixture({
      shape: planck.Box(0.3, 1, Vec2(0, 1)),
      density,
      filterGroupIndex: -1
    });
    lowerRightArm.createFixture({
      shape: planck.Box(0.3, 0.3, Vec2(0, 2.3)),
      density,
      filterGroupIndex: -1
    });
    lowerRightArm.resetMassData();

    // Left Elbow
    this.world.createJoint(
      planck.RevoluteJoint(
        {},
        upperLeftArm,
        lowerLeftArm,
        Vec2(QWOPStartX + 0.5, QWOPStartY - 3.8 + 2.9)
      )
    );

    // Right Elbow
    this.world.createJoint(
      planck.RevoluteJoint(
        {},
        upperRightArm,
        lowerRightArm,
        Vec2(QWOPStartX - 0.5, QWOPStartY - 3.8 + 2.9)
      )
    );

    // Check if lost

    this.world.on("begin-contact", contact => {
      const fixtureA = contact.getFixtureA();
      const fixtureB = contact.getFixtureB();

      if (
        !(
          (fixtureA.getUserData() === "touchable" ||
            fixtureA.getUserData() === "floor") &&
          (fixtureB.getUserData() === "touchable" ||
            fixtureB.getUserData() === "floor")
        )
      ) {
        onFinish(false);
      }
    });

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
