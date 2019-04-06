import React from "react";
import PropTypes from "prop-types";
import io from "socket.io-client";

export default class Controller extends React.Component {
  static getInitialProps({ query: { room } }) {
    return { room };
  }

  static propTypes = {
    room: PropTypes.string.isRequired
  };

  state = {
    control: "q",
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
    const { control } = this.state;
    event.preventDefault();
    this.socket.emit("button", { control, state });
  };

  render() {
    const { room } = this.props;
    const { control, connected } = this.state;
    return (
      <div>
        <style jsx>{`
          button {
            width: 100%;
            height: 20rem;
          }
        `}</style>
        <div>room: {room}</div>

        <input
          value={control}
          onChange={e => this.setState({ control: e.target.value })}
        />
        <button
          type="button"
          disabled={!connected}
          onMouseDown={this._handleInteract(true)}
          onMouseUp={this._handleInteract(false)}
          onTouchStart={this._handleInteract(true)}
          onTouchEnd={this._handleInteract(false)}
        >
          Send Event
        </button>
      </div>
    );
  }
}
