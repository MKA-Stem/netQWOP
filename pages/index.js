import QWOP from "../components/QWOP";

const Index = () => (
  <div>
    <style jsx>{`
      div {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-center;

        /* cover entire screen on mobile */
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
      }

      h1 {
        user-select: none;
        display: inline-block;
        padding: 2rem 3rem;
        margin-top: 20rem;
        border-radius: 0.5rem;
        box-shadow: 0 1rem 10rem rgba(0, 0, 0, 0.3);
        margin: 0 auto;
      }
    `}</style>
    <h1>netQWOP</h1>
    <QWOP />
  </div>
);

export default Index;
