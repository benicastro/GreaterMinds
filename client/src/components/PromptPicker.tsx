import { PROMPT_REGISTRY } from '@greater-minds/shared';

interface PromptPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  hostAnswers: Record<string, string>;
  onHostAnswerChange: (promptId: string, answer: string) => void;
}

export function PromptPicker({ selectedIds, onChange, hostAnswers, onHostAnswerChange }: PromptPickerProps) {
  const selectedSet = new Set(selectedIds);
  const unselected = PROMPT_REGISTRY.filter((prompt) => !selectedSet.has(prompt.id));

  function addPrompt(id: string) {
    onChange([...selectedIds, id]);
  }

  function removePrompt(id: string) {
    onChange(selectedIds.filter((existing) => existing !== id));
  }

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
      <h3>Selected Prompts ({selectedIds.length} selected)</h3>
      {selectedIds.length === 0 && <p className="prompt-empty-hint">Add prompts below to build the pool.</p>}
      {selectedIds.length > 0 && (
        <p className="prompt-empty-hint">
          Rounds are drawn automatically as the game goes — whichever selected prompt's answer
          count best matches how many players are still active, so the field gets tighter as
          players are eliminated. The order below only breaks ties between equally-tight prompts.
        </p>
      )}
      <ol className="prompt-list">
        {selectedIds.map((id, index) => {
          const prompt = PROMPT_REGISTRY.find((candidate) => candidate.id === id);
          return (
            <li key={id} className="prompt-row prompt-row-selected">
              <span className="prompt-order">{index + 1}</span>
              <span className="prompt-name">{prompt?.category ?? id}</span>
              {prompt && (
                <label className="prompt-host-answer">
                  Host's answer:
                  <select
                    value={hostAnswers[id] ?? prompt.hostAnswer}
                    onChange={(event) => onHostAnswerChange(id, event.target.value)}
                  >
                    {prompt.canonicalAnswers.map((answer) => (
                      <option key={answer} value={answer}>
                        {answer}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className="prompt-row-actions">
                <button type="button" onClick={() => move(id, -1)} disabled={index === 0} aria-label="Move up">
                  ↑
                </button>
                <button type="button" onClick={() => move(id, 1)} disabled={index === selectedIds.length - 1} aria-label="Move down">
                  ↓
                </button>
                <button type="button" className="prompt-remove" onClick={() => removePrompt(id)} aria-label="Remove prompt">
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
                <button type="button" onClick={() => addPrompt(prompt.id)}>
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
