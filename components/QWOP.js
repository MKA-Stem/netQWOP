/* eslint-disable react/no-unused-prop-types */

import React from "react";
import PropTypes from "prop-types";
import planck, { Vec2 } from "planck-js";
import throttle from "lodash/throttle";

class QWOP extends React.Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    className: PropTypes.string,
    q: PropTypes.bool.isRequired,
    w: PropTypes.bool.isRequired,
    o: PropTypes.bool.isRequired,
    p: PropTypes.bool.isRequired,
    onLose: PropTypes.func,
    onScore: PropTypes.func
  };

  static defaultProps = {
    className: null,
    onLose: () => {},
    onScore: () => {}
  };

  scale = 30;

  stopped = false;

  componentDidMount() {
    const { width, height } = this.props;

    this.world = planck.World(Vec2(0, 10));

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
    params.stance = 0.5; // hip width
    params.torso = PolarVec(5, 0.2 + Math.PI / 2);
    params.thighLength = 3.2;
    params.rightThigh = PolarVec(params.thighLength, 1.1);
    params.leftThigh = PolarVec(params.thighLength, 1.5);
    params.kneeFlex = (5 * Math.PI) / 8;
    params.calfLength = 3.4;
    params.rightCalf = PolarVec(params.calfLength, 1.8);
    params.leftCalf = PolarVec(params.calfLength, 1.9);
    params.hipFlex = (3 * Math.PI) / 8;
    params.footLength = 1;
    params.footFriction = 5;
    params.ankleFlex = 0.2;

    this.points = {};
    const { points } = this;
    points.torso = Vec2(width / 4 / this.scale, height / 2 / this.scale);
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
      density = 0.5,
      friction = 0,
      userData = null
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
        filterGroupIndex: -1,
        userData
      });
      return limb;
    };

    this.bodies = {};
    const { bodies } = this;
    bodies.torso = createLimb({
      between: [
        points.torso.clone().sub(params.torso.clone().mul(1 / 2)),
        points.torso.clone().add(params.torso.clone().mul(1 / 2))
      ],
      thickness: params.stance
    });
    bodies.leftThigh = createLimb({
      between: [points.leftHip, points.leftKnee],
      userData: "touchable"
    });
    bodies.rightThigh = createLimb({
      between: [points.rightHip, points.rightKnee],
      userData: "touchable"
    });
    bodies.rightCalf = createLimb({
      between: [points.rightKnee, points.rightAnkle],
      userData: "touchable"
    });
    bodies.leftCalf = createLimb({
      between: [points.leftKnee, points.leftAnkle],
      userData: "touchable"
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
      friction: params.footFriction,
      density: 10,
      userData: "touchable"
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
      friction: params.footFriction,
      density: 10,
      userData: "touchable"
    });

    const createJoint = ({
      between: [a, b],
      at,
      motorSpeed = 0,
      maxMotorTorque = 500,
      enableMotor = true,
      enableLimit = false,
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
            upperAngle,
            referenceAngle: b.getAngle() - a.getAngle()
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
      at: points.leftHip,
      enableLimit: true,
      lowerAngle: -params.hipFlex,
      upperAngle: params.hipFlex
    });
    joints.rightHip = createJoint({
      between: [bodies.torso, bodies.rightThigh],
      at: points.rightHip,
      enableLimit: true,
      lowerAngle: -params.hipFlex,
      upperAngle: params.hipFlex
    });
    joints.rightKnee = createJoint({
      between: [bodies.rightThigh, bodies.rightCalf],
      at: points.rightKnee,
      enableLimit: true,
      lowerAngle: 0,
      upperAngle: params.kneeFlex
    });
    joints.leftKnee = createJoint({
      between: [bodies.leftThigh, bodies.leftCalf],
      at: points.leftKnee,
      enableLimit: true,
      lowerAngle: 0,
      upperAngle: params.kneeFlex
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
    this.world.on("begin-contact", this._contact);

    if (process.env.NODE_ENV === "development") {
      window.world = this.world; // Debug
    }
    this._frame();
  }

  shouldComponentUpdate(nextProps) {
    this._updateMotors(nextProps);
    return false; // never update
  }

  componentWillUnmount() {
    this.world.off("begin-contact", this._contact);
    this.stopped = true;
  }

  _contact = contact => {
    const { onLose } = this.props;
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
      onLose();
    }
  };

  // eslint-disable-next-line
  _updateScore = throttle(this.props.onScore, 300);

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
    if (this.stopped) {
      return;
    }
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

    // update the parent component's score value
    const score = this.bodies.torso.getPosition().x - this.points.torso.x;
    this._updateScore(score);

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
    const speed = 3;

    if (thighs === 0) {
      this.joints.leftHip.setMotorSpeed(0);
      this.joints.rightHip.setMotorSpeed(0);
    } else {
      this.joints.leftHip.setMotorSpeed(-speed * thighs);
      this.joints.rightHip.setMotorSpeed(speed * thighs);
    }

    if (calves === 0) {
      this.joints.leftKnee.setMotorSpeed(0);
      this.joints.rightKnee.setMotorSpeed(0);
    } else {
      this.joints.leftKnee.setMotorSpeed(speed * calves);
      this.joints.rightKnee.setMotorSpeed(-speed * calves);
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
