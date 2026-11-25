import { LIVE_PROMPT_REGISTRY, LIVE_PROMPTS_BY_ID } from '@greater-minds/shared';

/** Live Mode's round list: free-text prompts played top to bottom. */
export function LivePromptPicker({ selectedIds, onChange }: { selectedIds: string[]; onChange: (ids: string[]) => void }) {
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
      <h3>Round Order ({selectedIds.length} selected)</h3>
      <p className="prompt-empty-hint">
        Rounds play top to bottom. The game ends early once only one player is left.
      </p>
      <ol className="prompt-list">
        {selectedIds.map((id, index) => {
          const prompt = LIVE_PROMPTS_BY_ID.get(id);
          return (
            <li key={id} className="prompt-row prompt-row-selected">
              <span className="prompt-order">{index + 1}</span>
              <span className="prompt-name">
                {prompt?.category ?? id}
                {prompt && <span className="prompt-text-preview"> — {prompt.promptText}</span>}
              </span>
              <div className="prompt-row-actions">
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
                <span className="prompt-name">{prompt.category}</span>
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
