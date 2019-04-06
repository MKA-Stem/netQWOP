import React from "react";
import io from "socket.io-client";

class SocketTest extends React.Component {
  state = {
    messages: []
  };

  componentDidMount() {
    this.socket = io({ transports: ["websocket"] });

    this.socket.on("test", this._onMessage);
  }

  _onMessage = msg => {
    console.log(msg);
    this.setState(e => ({ messages: [...e.messages, msg] }));
  };

  render() {
    const { messages } = this.state;
    return (
      <div className="container">
        <style jsx>{`
          .container {
            max-width: 40rem;
            margin: 0 auto;
            margin-top: 10rem;
          }
        `}</style>
        <h1>Socket test</h1>
        {messages.map(e => (
          <p>{JSON.stringify(e)}</p>
        ))}
      </div>
    );
  }
}

export default SocketTest;
