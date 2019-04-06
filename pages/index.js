import { withRouter } from "next/router";
import React from "react";
import PropTypes from "prop-types";
import isMobile from "is-mobile";

class Index extends React.Component {
  componentDidMount() {
    const { router } = this.props;
    if (isMobile()) {
      router.replace("/join");
    } else {
      router.replace("/host");
    }
  }

  render() {
    const color = "rgba(0,0,0,0.2)";
    return (
      <div>
        <style jsx>{`
          p {
            width: 16rem;
            height: 4rem;
            line-height: 4rem;
            font-size: 2rem;

            text-align: center;
            color: ${color};
            font-variant: small-caps;

            margin: 0 auto;
            margin-top: 10rem;
            border: 1px solid ${color};
          }
        `}</style>
        <p>loading</p>
      </div>
    );
  }
}

Index.propTypes = {
  router: PropTypes.object.isRequired
};

export default withRouter(Index);
