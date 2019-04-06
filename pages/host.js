import React from "react";
import io from "socket.io-client";
import id from "../lib/id";
import QWOP from "../components/QWOP";

export default class Host extends React.Component {
  room = process.browser ? id() : "";

  state = {
    buttons: {}
  };

  componentDidMount() {
    this.socket = io({ transports: ["websocket"] });
    this.socket.on("connect", this._onConnect);
  }

  _onConnect = () => {
    const { room } = this;
    this.socket.on("button", this._onButton);
    this.socket.emit("join", room);
  };

  _onButton = ({ control, state }) => {
    this.setState(s => ({ buttons: { ...s.buttons, [control]: state } }));
  };

  render() {
    const { buttons } = this.state;
    return (
      <div>
        host for room: {this.room}
        <pre>{JSON.stringify(buttons, null, 2)}</pre>
        <QWOP
          width={800}
          height={800}
          q={buttons.q}
          w={buttons.w}
          o={buttons.w}
          p={buttons.p}
        />
      </div>
    );
  }
}
