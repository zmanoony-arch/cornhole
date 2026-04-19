import React from 'react';

function TeamScore({ name, score, onScoreChange, onNameChange }) {
  return (
    <div className="team">
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="team-name"
      />
      <div className="score">{score}</div>
      <button onClick={() => onScoreChange(1)}>+</button>
      <button onClick={() => onScoreChange(-1)}>-</button>
    </div>
  );
}

export default TeamScore;