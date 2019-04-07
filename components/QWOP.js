/* eslint-disable react/no-unused-prop-types */

import React from "react";
import PropTypes from "prop-types";
import planck, { Vec2 } from "planck-js";

class QWOP extends React.Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    className: PropTypes.string,
    q: PropTypes.bool.isRequired,
    w: PropTypes.bool.isRequired,
    o: PropTypes.bool.isRequired,
    p: PropTypes.bool.isRequired,
    onFinish: PropTypes.func
  };

  static defaultProps = {
    className: null,
    onFinish: () => {}
  };

  static controls = ["q", "w", "o", "p"];

  scale = 40;

  componentDidMount() {
    const { width, height, onFinish } = this.props;

    this.world = planck.World(Vec2(0, 7));
    this.ctx = this.canvas.getContext("2d");

    // Static object for the ground
    const ground = this.world.createBody({
      type: "static",
      position: Vec2(width / 2 / this.scale, height / this.scale),
      angle: 0
    });
    ground.createFixture({
      shape: planck.Box(width, 1),
      userData: "floor"
    });

    // from polar
    const PolarVec = (r, theta) =>
      Vec2(r * Math.cos(theta), r * Math.sin(theta));
    const Perp = ({ x, y }) => {
      const v = Vec2(-y, x);
      v.normalize();
      return v;
    };

    // Configuration for QWOP's body
    this.params = {};
    const { params } = this;
    params.stance = 2; // hip width
    params.torso = PolarVec(5, 0.2 + Math.PI / 2);
    params.thighLength = 3.2;
    params.rightThigh = PolarVec(params.thighLength, 1.1);
    params.leftThigh = PolarVec(params.thighLength, 1.5);
    params.calfLength = 3.4;
    params.rightCalf = PolarVec(params.calfLength, 1.8);
    params.leftCalf = PolarVec(params.calfLength, 1.9);
    params.footLength = 1;
    params.footFriction = 0.3;
    params.ankleFlex = 0.2;

    this.points = {};
    const { points } = this;
    points.torso = Vec2(width / 2 / this.scale, height / 2 / this.scale);
    points.leftHip = points.torso
      .clone()
      .add(params.torso.clone().mul(1 / 2))
      .add(Perp(params.torso).mul(params.stance / 2));
    points.rightHip = points.torso
      .clone()
      .add(params.torso.clone().mul(1 / 2))
      .sub(Perp(params.torso).mul(params.stance / 2));
    points.leftShoulder = points.torso
      .clone()
      .add(Vec2(-params.stance / 2, -params.torsoHeight / 2));
    points.rightShoulder = points.torso
      .clone()
      .add(Vec2(params.stance / 2, -params.torsoHeight / 2));
    points.rightKnee = points.rightHip.clone().add(params.rightThigh);
    points.leftKnee = points.leftHip.clone().add(params.leftThigh);
    points.rightAnkle = points.rightKnee.clone().add(params.rightCalf);
    points.leftAnkle = points.leftKnee.clone().add(params.leftCalf);

    const createLimb = ({
      between: [a, b],
      thickness = 0.4,
      density = 2,
      friction = 0.2
    }) => {
      const { x: w, y: h } = b.clone().sub(a);
      const theta = Math.atan(h / w);
      const midpoint = a
        .clone()
        .add(b)
        .mul(1 / 2);
      const limb = this.world.createDynamicBody(midpoint, theta + Math.PI / 2);
      limb.createFixture({
        shape: planck.Box(thickness / 2, Vec2.distance(a, b) / 2),
        density,
        friction,
        filterGroupIndex: -1
      });
      limb.resetMassData();
      return limb;
    };

    this.bodies = {};
    const { bodies } = this;
    bodies.torso = createLimb({
      between: [
        points.torso.clone().sub(params.torso.clone().mul(1 / 2)),
        points.torso.clone().add(params.torso.clone().mul(1 / 2))
      ],
      thickness: params.stance,
      density: 0.1
    });
    bodies.leftThigh = createLimb({
      between: [points.leftHip, points.leftKnee]
    });
    bodies.rightThigh = createLimb({
      between: [points.rightHip, points.rightKnee]
    });
    bodies.rightCalf = createLimb({
      between: [points.rightKnee, points.rightAnkle]
    });
    bodies.leftCalf = createLimb({
      between: [points.leftKnee, points.leftAnkle]
    });
    bodies.rightFoot = createLimb({
      between: [
        points.rightAnkle,
        points.rightAnkle
          .clone()
          .add(
            Perp(points.rightAnkle.clone().sub(points.rightKnee)).mul(
              -params.footLength
            )
          )
      ],
      friction: params.footFriction
    });
    bodies.leftFoot = createLimb({
      between: [
        points.leftAnkle,
        points.leftAnkle
          .clone()
          .add(
            Perp(points.leftAnkle.clone().sub(points.leftKnee)).mul(
              -params.footLength
            )
          )
      ],
      friction: params.footFriction
    });

    const createJoint = ({
      between: [a, b],
      at,
      motorSpeed = 0,
      maxMotorTorque = 100,
      enableMotor = true,
      enableLimit = true,
      lowerAngle = undefined,
      upperAngle = undefined
    }) => {
      const joint = this.world.createJoint(
        planck.RevoluteJoint(
          {
            motorSpeed,
            maxMotorTorque,
            enableMotor,
            enableLimit,
            lowerAngle,
            upperAngle
          },
          a,
          b,
          at
        )
      );
      return joint;
    };

    this.joints = {};
    const { joints } = this;
    joints.leftHip = createJoint({
      between: [bodies.torso, bodies.leftThigh],
      at: points.leftHip
    });
    joints.rightHip = createJoint({
      between: [bodies.torso, bodies.rightThigh],
      at: points.rightHip
    });
    joints.rightKnee = createJoint({
      between: [bodies.rightThigh, bodies.rightCalf],
      at: points.rightKnee
    });
    joints.leftKnee = createJoint({
      between: [bodies.leftThigh, bodies.leftCalf],
      at: points.leftKnee
    });
    joints.leftAnkle = createJoint({
      between: [bodies.leftFoot, bodies.leftCalf],
      at: points.leftAnkle,
      lowerAngle: params.ankleFlex,
      upperAngle: params.ankleFlex,
      enableLimit: true
    });
    joints.rightAnkle = createJoint({
      between: [bodies.rightFoot, bodies.rightCalf],
      at: points.rightAnkle,
      lowerAngle: params.ankleFlex,
      upperAngle: params.ankleFlex,
      enableLimit: true
    });

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

    if (process.env.NODE_ENV === "development") {
      window.world = this.world; // Debug
    }
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
    // from https://techspirited.com/tips-for-beginners-to-play-qwop-on-computer-like-pro
    // Q moves the anterior thigh forward (the one facing the player), and the posterior thigh back.
    // W moves the posterior thigh forward, and the anterior thigh back (opposite of Q).
    // O moves the anterior calf forward, and the posterior one back.
    // P moves the posterior calf forward and the anterior one back (opposite of O).

    const thighs = q ? 1 : w ? -1 : 0;
    const calves = o ? 1 : p ? -1 : 0;
    const speed = 10;

    if (thighs === 0) {
      this.joints.leftHip.enableLimit(true);
      this.joints.rightHip.enableLimit(true);
      this.joints.leftHip.setMotorSpeed(0);
      this.joints.rightHip.setMotorSpeed(0);
    } else {
      this.joints.leftHip.enableLimit(false);
      this.joints.rightHip.enableLimit(false);
      this.joints.leftHip.setMotorSpeed(-speed * thighs);
      this.joints.rightHip.setMotorSpeed(speed * thighs);
    }

    if (calves === 0) {
      this.joints.leftKnee.enableLimit(true);
      this.joints.rightKnee.enableLimit(true);
      this.joints.leftKnee.setMotorSpeed(0);
      this.joints.rightKnee.setMotorSpeed(0);
    } else {
      this.joints.leftKnee.enableLimit(false);
      this.joints.rightKnee.enableLimit(false);
      this.joints.leftKnee.setMotorSpeed(speed * thighs);
      this.joints.rightKnee.setMotorSpeed(speed * thighs);
    }
  }

  render() {
    const { width, height, className } = this.props;
    return (
      <canvas
        ref={el => (this.canvas = el)}
        width={width}
        height={height}
        className={className}
      />
    );
  }
}

export default QWOP;
