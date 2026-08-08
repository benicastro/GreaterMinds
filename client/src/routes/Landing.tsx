import { useNavigate } from 'react-router-dom';
import { GAME_NAME, PRIMARY_TAGLINE, CORE_PHILOSOPHY_LINES } from '@greater-minds/shared';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <h1>{GAME_NAME}</h1>
      <p className="tagline">{PRIMARY_TAGLINE}</p>
      <div className="philosophy">
        {CORE_PHILOSOPHY_LINES.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="landing-actions">
        <button onClick={() => navigate('/host/new')}>Host a Game</button>
        <button onClick={() => navigate('/join')}>Join a Game</button>
      </div>
    </div>
  );
}
