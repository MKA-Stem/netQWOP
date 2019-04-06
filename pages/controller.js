import React from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";
import Key from "../components/Key";

export default class Controller extends React.Component {
  static getInitialProps({ query: { room, control } }) {
    return { room, control };
  }

  static propTypes = {
    room: PropTypes.string.isRequired,
    control: PropTypes.string.isRequired
  };

  state = {
    state: false,
    connected: false
  };

  componentDidMount() {
    this.socket = io({ transports: ["websocket"] });
    this.socket.on("connect", this._onConnect);
  }

  _onConnect = () => {
    const { room } = this.props;
    this.socket.emit("join", room);
    this.setState({ connected: true });
  };

  _handleInteract = state => event => {
    event.preventDefault();
    const { control } = this.props;
    this.socket.emit("button", { control, state });
    this.setState({ state });
  };

  render() {
    const { room, control } = this.props;
    const { state, connected } = this.state;
    return (
      <div
        onMouseDown={this._handleInteract(true)}
        onMouseUp={this._handleInteract(false)}
        onTouchStart={this._handleInteract(true)}
        onTouchEnd={this._handleInteract(false)}
        className="cover"
      >
        <style jsx>{`
          .cover {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            user-select: none;

            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }

          .cover:focus {
            outline: none;
          }

          button {
            width: 100%;
            height: 20rem;
          }

          .room {
            text-transform: uppercase;
            color: rgba(0, 0, 0, 0.3);
            margin-bottom: 1rem;
            font-family: monospace;
          }

          .connecting {
            color: rgba(0, 0, 0, 0.5);
            text-transform: uppercase;
          }
        `}</style>
        {connected ? (
          <>
            <span className="room">room: {room}</span>
            <Key pressed={state} onChange={this._handleInteract}>
              {control}
            </Key>
          </>
        ) : (
          <span className="connecting">connecting...</span>
        )}
      </div>
    );
  }
}
