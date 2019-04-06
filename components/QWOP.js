import React from "react";
import PropTypes from "prop-types";
import planck, { Vec2 } from "planck-js";

class QWOP extends React.Component {
  static propTypes = {
    height: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.scale = 40;
  }

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

    const revoluteJoint = this.world.createJoint(
      planck.RevoluteJoint({}, dynamicBar, staticBar, Vec2(15, 5))
    );
    revoluteJoint.setMaxMotorTorque(50);
    revoluteJoint.setMotorSpeed(10);
    revoluteJoint.enableMotor(true);

    window.world = this.world; // Debug
    this._frame();
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
