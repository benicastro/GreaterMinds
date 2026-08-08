import { useNavigate } from 'react-router-dom';
import { GAME_NAME } from '@greater-minds/shared';
import { PoweredByFooter } from '../components/PoweredByFooter';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <h1>{GAME_NAME}</h1>
      <div className="landing-actions">
        <button onClick={() => navigate('/host/new')}>Host a Game</button>
        <button onClick={() => navigate('/join')}>Join a Game</button>
      </div>
      <PoweredByFooter />
    </div>
  );
}
