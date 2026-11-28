import {
  LIVE_OPENER_PROMPT_IDS,
  LIVE_PROMPT_REGISTRY,
  LIVE_PROMPTS_BY_ID,
  LIVE_TIER_LABELS,
  type LivePromptDefinition,
  type RoundSelectionMode,
} from '@greater-minds/shared';

function PromptTags({ prompt, showOpener }: { prompt: LivePromptDefinition; showOpener: boolean }) {
  const openerIndex = showOpener ? LIVE_OPENER_PROMPT_IDS.indexOf(prompt.id) : -1;
  return (
    <span className="prompt-tags">
      {openerIndex >= 0 && <span className="prompt-tag prompt-tag-opener">Opener {openerIndex + 1}</span>}
      <span className={`prompt-tag prompt-tag-${prompt.tier}`}>{LIVE_TIER_LABELS[prompt.tier]}</span>
      {prompt.funny && <span className="prompt-tag prompt-tag-funny">Funny</span>}
    </span>
  );
}

/**
 * Three Strikes' prompt list. In Fixed order it's the exact round sequence (reorderable). In
 * Adaptive order it's just the pool: the game picks by tier and shuffles within each tier, so the
 * order arrows are hidden.
 */
export function LivePromptPicker({
  selectedIds,
  onChange,
  roundSelectionMode,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  roundSelectionMode: RoundSelectionMode;
}) {
  const fixed = roundSelectionMode === 'fixed';
  const selectedSet = new Set(selectedIds);
  const unselected = LIVE_PROMPT_REGISTRY.filter((prompt) => !selectedSet.has(prompt.id));

  function move(id: string, direction: -1 | 1) {
    const index = selectedIds.indexOf(id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next);
  }

  return (
    <div className="prompt-picker">
      <h3>
        {fixed ? 'Round Order' : 'Prompt Pool'} ({selectedIds.length} selected)
      </h3>
      <p className="prompt-empty-hint">
        {fixed
          ? 'Rounds play top to bottom. The game ends early once only one player is left.'
          : 'The two Opener prompts always play first. After that, each round picks a prompt from the tier that fits the players still in: Big for 8+, Medium for 4–7, Small for the last 2–3. If a tier runs out, the next smaller one is used. Remove any prompt you don’t want played.'}
      </p>
      <ol className="prompt-list">
        {selectedIds.map((id, index) => {
          const prompt = LIVE_PROMPTS_BY_ID.get(id);
          return (
            <li key={id} className="prompt-row prompt-row-selected">
              {fixed && <span className="prompt-order">{index + 1}</span>}
              <span className="prompt-name">
                {prompt?.category ?? id}
                {prompt && <PromptTags prompt={prompt} showOpener={!fixed} />}
                {prompt && <span className="prompt-text-preview"> — {prompt.promptText}</span>}
              </span>
              <div className="prompt-row-actions">
                {fixed && (
                  <>
                    <button type="button" onClick={() => move(id, -1)} disabled={index === 0} aria-label="Move up">
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => move(id, 1)}
                      disabled={index === selectedIds.length - 1}
                      aria-label="Move down"
                    >
                      ↓
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="prompt-remove"
                  onClick={() => onChange(selectedIds.filter((existing) => existing !== id))}
                  aria-label="Remove prompt"
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {unselected.length > 0 && (
        <>
          <h4>Add a Prompt</h4>
          <ul className="prompt-list prompt-list-add">
            {unselected.map((prompt) => (
              <li key={prompt.id} className="prompt-row">
                <span className="prompt-name">
                  {prompt.category}
                  <PromptTags prompt={prompt} showOpener={!fixed} />
                </span>
                <button type="button" onClick={() => onChange([...selectedIds, prompt.id])}>
                  + Add
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
