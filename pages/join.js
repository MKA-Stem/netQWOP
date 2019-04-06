import { withRouter } from "next/router";
import React from "react";
import PropTypes from "prop-types";

class Join extends React.Component {
  static propTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    room: "",
    control: "q"
  };

  _goToController = e => {
    const { router } = this.props;
    const { room, control } = this.state;

    e.preventDefault(); // don't reload on form submit
    if (!this._valid()) {
      return; // if invalid, do nothing
    }

    router.push({ pathname: "/controller", query: { room, control } });
  };

  _valid = () => {
    const { room } = this.state;
    return room.length === 6;
  };

  _onChange = e => {
    let text = e.target.value;

    if (text.length > 6) {
      text = text.substring(0, 6);
    }

    text = text.toLowerCase();

    this.setState({ room: text });
  };

  render() {
    const { control, room } = this.state;

    const between = `
      margin-top:2rem;
      margin-bottom:2rem;
    `;
    const sizing = `
      height: 4rem;
      line-height: 4rem;
    `;
    const rounding = `
      border-radius: 0.5rem;
    `;
    const shade = "rgba(0,0,0,0.5)";
    const light = "rgba(0,0,0,0.1)";
    return (
      <div className="root">
        <style jsx>{`
          .root {
            margin: 0 auto;
            padding: 2rem;
            max-width: 20rem;
          }

          .title {
            border-bottom: 1px solid ${light};
            color: ${shade};
            font-size: 1.5rem;
          }

          .prompt {
            font-size: 2rem;
          }

          input {
            display: block;
            width: 100%;
            ${between}

            letter-spacing: 0.33rem;
            font-weight: bold;
            font-family: monospace;
            text-transform: uppercase;

            ${rounding}
            ${sizing}
            font-size: 3rem;
            padding-left: 2rem;

            border: none;
            font-size: 2rem;
            background-color: ${light};
          }

          input::placeholder {
            font-weight: regular;
            color: ${shade};
          }

          input:focus {
            outline: none;
          }

          button {
            display: block;
            ${between}

            ${rounding}
            background-color: orangered;
            color: white;
            font-weight: bold;

            ${sizing}
            font-size: 2rem;
            width: 100%;
            border: none;
            box-shadow: 0 0 20px ${light};

            transition: 0.2s;
          }

          label {
            display: flex;
            flex-direction: row;
            align-items: center;
          }

          label > div {
            text-transform: uppercase;
            margin-right: 1rem;
          }

          select {
            ${rounding}
            background-color: ${light};
            border:none;

            width: 100%;
            height: 2rem;
            padding: 0 0.5rem;

            font-size: 1rem;
          }

          select:focus {
            outline: none;
          }

          button:disabled {
            background-color: ${light};
          }
        `}</style>
        <h1 className="title">netQWOP</h1>
        <h2 className="prompt">Join a Game</h2>
        <form onSubmit={this._goToController}>
          <input
            placeholder="XXXXXX"
            value={room}
            maxLength={6}
            onChange={this._onChange}
          />
          <label>
            <div>role</div>
            <select
              value={control}
              onChange={e => this.setState({ control: e.target.value })}
            >
              <option value="q">Q | thighs +</option>
              <option value="w">W | thighs -</option>
              <option value="o">O | calves +</option>
              <option value="p">P | calves -</option>
            </select>
          </label>
          <button disabled={!this._valid()} type="submit">
            Go!
          </button>
        </form>
      </div>
    );
  }
}

export default withRouter(Join);
