import PropTypes from "prop-types";
import css from "styled-jsx/css";
import Key from "./Key";

const GameTopBar = ({ buttons, room }) => {
  const { className: keyClass, styles: keyStyles } = css.resolve`
      button {
        margin-right: 2rem;
      }
    `;
  const [keyWidth, keyHeight] = ["8rem", "10rem"];

  return (
    <div className="top">
      <style jsx>{`
        .top {
          display: flex;
          flex-direction: row;
          justify-content: space-around;
          margin-top: 2rem;
        }

        .room {
          padding: 1rem;

          width: 8rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 0.5rem 3rem rgba(0, 0, 0, 0.1);
          text-align: center;
          text-transform: uppercase;
        }

        .room > .code {
          font-family: monospace;
          font-size: 1.5rem;
          letter-spacing: 0.2rem;
        }

        .room > .room-label {
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 0.5rem;
        }

        .top-group {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .pair-label {
          margin-top: 2rem;
          font-size: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1rem;
        }

        .key-pair {
          margin-right: -2rem;
        }
      `}</style>
      {keyStyles}
      <div className="top-group">
        <div className="key-pair">
          <Key
            className={keyClass}
            width={keyWidth}
            height={keyHeight}
            pressed={buttons.q}
          >
            Q
          </Key>
          <Key
            className={keyClass}
            width={keyWidth}
            height={keyHeight}
            pressed={buttons.w}
          >
            W
          </Key>
        </div>
        <div className="pair-label">Thighs</div>
      </div>
      <div>
        <div className="room">
          <div className="room-label">join code</div>
          <div className="code">{room}</div>
        </div>
      </div>
      <div className="top-group">
        <div className="key-pair">
          <Key
            className={keyClass}
            width={keyWidth}
            height={keyHeight}
            pressed={buttons.o}
          >
            O
          </Key>
          <Key
            className={keyClass}
            width={keyWidth}
            height={keyHeight}
            pressed={buttons.p}
          >
            P
          </Key>
        </div>
        <div className="pair-label">Calves</div>
      </div>
    </div>
  );
};

GameTopBar.defaultProps = {
  room: ""
};

GameTopBar.propTypes = {
  buttons: PropTypes.object.isRequired,
  room: PropTypes.string
};

export default GameTopBar;
