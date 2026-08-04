import { useTheme } from '../context/ThemeContext'

export default function FancyButton({ onClick, children }) {
  const { accent } = useTheme()
  
  return (
    <>
      <style>{`
        .fancy-btn {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: white;
          background-color: #37352F;
          padding: 0.6em 1.4em;
          border: none;
          border-radius: 8px;
          position: relative;
          cursor: pointer;
          overflow: hidden;
        }
        .fancy-btn span:not(.fancy-text) {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          height: 30px;
          width: 30px;
          background-color: ${accent};
          border-radius: 50%;
          transition: 0.6s ease;
        }
        .fancy-btn .fancy-text { position: relative; }
        .fancy-btn span:nth-child(1) { transform: translate(-3.3em, -4em); }
        .fancy-btn span:nth-child(2) { transform: translate(-6em, 1.3em); }
        .fancy-btn span:nth-child(3) { transform: translate(-.2em, 1.8em); }
        .fancy-btn span:nth-child(4) { transform: translate(3.5em, 1.4em); }
        .fancy-btn span:nth-child(5) { transform: translate(3.5em, -3.8em); }
        .fancy-btn:hover span:not(.fancy-text) {
          transform: translate(-50%, -50%) scale(4);
          transition: 1.5s ease;
        }
      `}</style>
      <button className="fancy-btn" onClick={onClick}>
        <span /><span /><span /><span /><span />
        <span className="fancy-text">{children}</span>
      </button>
    </>
  )
}