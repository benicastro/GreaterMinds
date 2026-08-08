const INTRO_SLIDES = ['/title-bg.png', '/infographic.png'];

export function GetReadyScreen({ slideIndex, onAdvance }: { slideIndex: number; onAdvance?: () => void }) {
  const isHost = Boolean(onAdvance);
  const isLastSlide = slideIndex >= INTRO_SLIDES.length - 1;
  const activeImage = INTRO_SLIDES[slideIndex] ?? INTRO_SLIDES[0];

  return (
    <div className="get-ready-screen" role="status" aria-live="polite">
      <div className="get-ready-image-area" style={{ backgroundImage: `url(${activeImage})` }} />
      <div className="get-ready-content">
        {isHost ? (
          <button className="get-ready-button" onClick={onAdvance}>
            {isLastSlide ? 'Start Round 1' : 'Next'}
          </button>
        ) : (
          <p className="get-ready-caption get-ready-caption-pulse">Waiting for the host to continue…</p>
        )}
      </div>
    </div>
  );
}
