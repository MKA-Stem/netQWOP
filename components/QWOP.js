import React from "react";
import planck, { Vec2 } from "planck-js";

class QWOP extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.world = planck.World({
      gravity: Vec2(0, -9.81)
    });

    this.ctx = this.canvas.getContext("2d");

    const ground = this.world.createBody({
      type: "static",
      position: Vec2(0, 0)
    });

    ground.createFixture({
      shape: planck.Polygon([
        Vec2(0.0, 0.0),
        Vec2(20.0, 0.0),
        Vec2(0.0, 20.0),
        Vec2(20.0, 20.0)
      ])
    });

    ground.createFixture({
      shape: planck.Polygon([
        Vec2(50.0, 50.0),
        Vec2(70.0, 50.0),
        Vec2(50.0, 70.0),
        Vec2(70.0, 70.0)
      ])
    });

    window.requestAnimationFrame(this._frame);
  }

  _drawPolygon = shape => {
    const vertices = shape.m_vertices;

    this.ctx.beginPath();
    this.ctx.moveTo(vertices[0].x, vertices[0].y);

    for (const v of vertices.slice(1, vertices.length)) {
      this.ctx.lineTo(v.x, v.y);
    }

    this.ctx.fill();
  };

  _frame = () => {
    this.world.step(1 / 60);
    for (let body = this.world.getBodyList(); body; body = body.getNext()) {
      for (
        let fixture = body.getFixtureList();
        fixture;
        fixture = fixture.getNext()
      ) {
        if (fixture.getType() === "polygon") {
          this._drawPolygon(fixture.getShape());
        }
      }
    }
  };

  render() {
    return (
      <div>
        <style jsx>{`
          canvas {
            border: solid red 1px;
          }
        `}</style>
        <canvas ref={el => (this.canvas = el)} />
      </div>
    );
  }
}

export default QWOP;
