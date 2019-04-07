import PropTypes from "prop-types";
import css from "styled-jsx/css";
import Key from "./Key";

const GameTopBar = ({ buttons, room, score }) => {
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

          width: 12rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 0.5rem 3rem rgba(0, 0, 0, 0.1);
          text-align: center;
          text-transform: uppercase;
        }

        .code {
          font-family: monospace;
          font-size: 1.5rem;
          letter-spacing: 0.2rem;
        }

        .top-group {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .status-label {
          margin-top: 1rem;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1rem;
          color: rgba(0, 0, 0, 0.5);
          margin-bottom: 0.5rem;
        }

        .key-pair {
          margin-right: -2rem;
        }

        .score {
          font-size: 2rem;
          margin-top: 1rem;
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
        <div className="status-label">Thighs</div>
      </div>
      <div>
        <div className="room">
          <div className="status-label">join code</div>
          <div className="code">{room}</div>
          <div className="status-label">score</div>
          <div className="score">{score.toFixed(2)}</div>
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
        <div className="status-label">Calves</div>
      </div>
    </div>
  );
};

GameTopBar.defaultProps = {
  room: "",
  score: 0
};

GameTopBar.propTypes = {
  buttons: PropTypes.object.isRequired,
  room: PropTypes.string,
  score: PropTypes.number
};

export default GameTopBar;
