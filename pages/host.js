import React from "react";
import css from "styled-jsx/css";
import io from "socket.io-client";
import { generateCombination as generateIdent } from "gfycat-style-urls";
import GameTopBar from "../components/GameTopBar";
import QWOP from "../components/QWOP";
import { getLeaderboard, addScore } from "../lib/leaderboard";

export default class Host extends React.Component {
  state = {
    buttons: {},
    status: "start", // one of 'start', 'playing', 'lost'
    score: 0,
    room: null,
    dimensions: null,
    ident: generateIdent(2, " ", true),
    leaderboard: null
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
    if (button) {
      this._onButton({ control: button, state: pressed });
    }
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

  _onLose = async () => {
    const { score, ident } = this.state;
    this.setState({ status: "lost", leaderboard: null });
    await addScore({ name: ident, score });
    const leaderboard = await getLeaderboard();
    this.setState({ leaderboard });
  };

  render() {
    const {
      buttons,
      room,
      dimensions,
      score,
      status,
      leaderboard,
      ident
    } = this.state;

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
            margin-top: 10rem;
            font-size: 3rem;
          }

          .status-text {
            color: rgba(0, 0, 0, 0.3);
            text-transform: uppercase;
            text-align: center;
            margin-bottom: 3rem;
          }

          .leaderboard {
            width: 50rem;
            margin: 0 auto;
            margin-top: 2rem;
          }

          .leaderboard-row {
            font-size: 2rem;
            padding: 0.5rem;
            margin: 0.5rem;
          }
          .highlight {
            padding: 1rem;
            background-color: orangered;
            color: white;
            border-radius: 0.5rem;
          }
          .score {
            width: 10rem;
            opacity: 0.8;
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
            onLose={this._onLose}
            q={buttons.q || false}
            w={buttons.w || false}
            o={buttons.o || false}
            p={buttons.p || false}
          />
        )}
        {status === "start" && (
          <div className="status status-text">hit a button to start</div>
        )}
        {status === "lost" && (
          <div className="status">
            <div className="status-text">
              you tried. hit any button to restart.
            </div>
            <div className="status-text">leaderboard:</div>
            <table className="leaderboard">
              {leaderboard &&
                leaderboard.map(({ i, id, name, score: leaderScore }) => (
                  <tr
                    className={`leaderboard-row ${
                      name === ident ? "highlight" : ""
                    }`}
                    key={id}
                  >
                    <td>#{i}</td>
                    <td className="score">{leaderScore.toFixed(2)}</td>
                    <td className="name">{name}</td>
                  </tr>
                ))}
            </table>
          </div>
        )}
      </div>
    );
  }
}
