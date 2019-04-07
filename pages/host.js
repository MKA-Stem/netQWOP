import React from "react";
import io from "socket.io-client";
import QWOP from "../components/QWOP";

export default class Host extends React.Component {
  state = {
    buttons: {},
    room: null
  };

  componentDidMount() {
    this.socket = io({ transports: ["websocket"] });
    this.socket.on("connect", this._onConnect);
  }

  _onConnect = () => {
    this.socket.emit("host", null, room => {
      this.setState({ room });
    });
    this.socket.on("button", this._onButton);
  };

  _onButton = ({ control, state }) => {
    this.setState(s => ({ buttons: { ...s.buttons, [control]: state } }));
  };

  render() {
    const { buttons, room } = this.state;
    return (
      <div>
        host for room: {room}
        <pre>{JSON.stringify(buttons, null, 2)}</pre>
        <QWOP
          width={800}
          height={800}
          q={buttons.q || false}
          w={buttons.w || false}
          o={buttons.w || false}
          p={buttons.p || false}
        />
      </div>
    );
  }
}
