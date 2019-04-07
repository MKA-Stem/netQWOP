import PropTypes from "prop-types";

const handler = (cb, pressed) => e => {
  e.preventDefault();
  cb(pressed);
};

const Key = ({ children, pressed, onChange, height, width, ...rest }) => {
  return (
    <button
      type="button"
      onMouseDown={handler(onChange, true)}
      onMouseUp={handler(onChange, false)}
      onTouchStart={handler(onChange, true)}
      onTouchEnd={handler(onChange, false)}
      dataPressed={pressed}
      {...rest}
    >
      <style jsx>{`
        button {
          display: inline-block;
          border: none;
          border-radius: 1rem;
          background-color: white;
          box-shadow: 0 calc(${height} * 0.1) calc(${width} * 0.5)
            rgba(0, 0, 0, 0.3);

          height: ${height};
          width: ${width};
          line-height: ${height};
          font-size: calc(${height} * 0.5);
          text-align: center;
          font-family: inherit;
          text-transform: uppercase;

          transition: box-shadow 0.1s, transform 0.1s;
          user-select: none;

          ${pressed &&
            `
            box-shadow: 0 0.5rem 2rem rgba(0,0,0,0.5);
            transform: scale(0.95);
            background-color: rgba(0,0,0,0.03);
          `}
        }

        button:focus {
          outline: none;
        }
      `}</style>
      {children}
    </button>
  );
};

Key.defaultProps = {
  pressed: false,
  height: "20rem",
  width: "15rem",
  children: null,
  onChange: () => {}
};

Key.propTypes = {
  pressed: PropTypes.bool,
  children: PropTypes.node,
  height: PropTypes.string,
  width: PropTypes.string,
  onChange: PropTypes.func
};

export default Key;
