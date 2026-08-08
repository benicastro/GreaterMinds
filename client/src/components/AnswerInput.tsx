import { useState, type FormEvent } from 'react';

export function AnswerInput({ onSubmit, disabled }: { onSubmit: (answer: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!value.trim() || disabled) return;
    onSubmit(value.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="answer-input">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={disabled}
        placeholder="Type your answer..."
        maxLength={60}
        autoFocus
      />
      <button type="submit" disabled={disabled || !value.trim()}>
        Submit
      </button>
    </form>
  );
}
