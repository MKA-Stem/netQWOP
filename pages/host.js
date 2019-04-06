import React from "react";
import io from "socket.io-client";
import id from "../lib/id";

export default class Host extends React.Component {
  room = process.browser ? id() : "";

  state = {
    messages: [],
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
    const { messages, buttons } = this.state;
    return (
      <div>
        host for room: {this.room}
        <pre>{JSON.stringify(buttons, null, 2)}</pre>
        <ul>
          {messages.map(e => (
            <li>{JSON.stringify(e)}</li>
          ))}
        </ul>
      </div>
    );
  }
}
