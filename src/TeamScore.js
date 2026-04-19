import React from 'react';

function TeamScore({ name, score, onScoreChange }) {
  return (
    <div className="team">
      <h2>{name}</h2>
      <div className="score">{score}</div>
      <button onClick={() => onScoreChange(1)}>+</button>
      <button onClick={() => onScoreChange(-1)}>-</button>
    </div>
  );
}

export default TeamScore;