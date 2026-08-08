import { useState, type FormEvent } from 'react';

export function NicknameForm({ onSubmit, error }: { onSubmit: (nickname: string) => void; error: string | null }) {
  const [nickname, setNickname] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!nickname.trim()) return;
    onSubmit(nickname.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="nickname-form">
      <input
        value={nickname}
        onChange={(event) => setNickname(event.target.value)}
        placeholder="Your nickname"
        maxLength={24}
        autoFocus
      />
      <button type="submit" disabled={!nickname.trim()}>
        Join
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}
