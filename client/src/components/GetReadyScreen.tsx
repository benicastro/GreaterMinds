const INTRO_SLIDES = ['/title-bg.png', '/infographic.png'];

export function GetReadyScreen({
  slideIndex,
  onAdvance,
  className,
  slides = INTRO_SLIDES,
}: {
  slideIndex: number;
  onAdvance?: () => void;
  className?: string;
  /** Slide images to step through; defaults to Classic's title + rules infographic. */
  slides?: string[];
}) {
  const isHost = Boolean(onAdvance);
  const isLastSlide = slideIndex >= slides.length - 1;
  const activeImage = slides[slideIndex] ?? slides[0];

  return (
    <div className={`get-ready-screen${className ? ` ${className}` : ''}`} role="status" aria-live="polite">
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
