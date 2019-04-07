import React from "react";
import css from "styled-jsx/css";
import io from "socket.io-client";
import GameTopBar from "../components/GameTopBar";
import QWOP from "../components/QWOP";

export default class Host extends React.Component {
  state = {
    buttons: {},
    status: "start", // one of 'start', 'playing', 'lost'
    score: 0,
    room: null,
    dimensions: null
  };

  componentDidMount() {
    this.socket = io({ transports: ["websocket"] });
    this.socket.on("connect", this._onConnect);

    // Attach q/w/o/p event listeners to window
    window.addEventListener("keydown", this._onKey);
    window.addEventListener("keyup", this._onKey);
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this._onKey);
    window.removeEventListener("keyup", this._onKey);
  }

  _onKey = e => {
    const pressed = e.type === "keydown";
    const codes = {
      KeyQ: "q",
      KeyW: "w",
      KeyO: "o",
      KeyP: "p"
    };
    const button = codes[e.code];
    this._onButton({ control: button, state: pressed });
  };

  _onConnect = () => {
    this.socket.emit("host", null, room => {
      this.setState({ room });
    });
    this.socket.on("button", this._onButton);
  };

  _onButton = ({ control, state }) => {
    this.setState(s => {
      // reset on button press
      let { status } = s;
      if (state === true && (status === "start" || status === "lost")) {
        status = "playing";
      }

      return { status, buttons: { ...s.buttons, [control]: state } };
    });
  };

  _measure = el => {
    if (el == null) {
      this.setState({ dimensions: null });
      return;
    }

    const { height, width } = el.getBoundingClientRect();

    this.setState({ dimensions: { width, height } });
  };

  render() {
    const { buttons, room, dimensions, score, status } = this.state;

    const { className: qwopClass, styles: qwopStyles } = css.resolve`
      canvas {
        position:absolute;
        z-index:-1;
        top:0;
        bottom:0;
        left:0;
        right:0;
      }
    `;

    return (
      <div className="root" ref={this._measure}>
        <style jsx>{`
          .root {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
          }

          .status {
            height: 20rem;
            line-height: 20rem;
            text-align: center;
            font-size: 3rem;
            color: rgba(0, 0, 0, 0.3);
            text-transform: uppercase;
          }
        `}</style>
        <GameTopBar buttons={buttons} room={room} score={score} />
        {qwopStyles}

        {dimensions && status === "playing" && (
          <QWOP
            width={dimensions.width}
            height={dimensions.height}
            className={qwopClass}
            onScore={e => this.setState({ score: e })}
            onLose={() => this.setState({ status: "lost" })}
            q={buttons.q || false}
            w={buttons.w || false}
            o={buttons.o || false}
            p={buttons.p || false}
          />
        )}
        {status === "start" && (
          <div className="status">hit a button to start</div>
        )}
        {status === "lost" && (
          <div className="status">you tried. hit any button to restart.</div>
        )}
      </div>
    );
  }
}
