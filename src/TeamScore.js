import React, { useState } from 'react';

function TeamScore({ name, score, onScoreChange, onNameChange, color, onColorChange }) {
  const [showPalette, setShowPalette] = useState(false);
  const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE'];

  return (
    <div className="team" style={{ backgroundColor: color }}>
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="team-name"
      />
      <div className="score">{score}</div>
      <button onClick={() => onScoreChange(1)}>+</button>
      <button onClick={() => onScoreChange(-1)}>-</button>
      <div className="color-icon" onClick={() => setShowPalette(!showPalette)}>🎨</div>
      {showPalette && (
        <div className="color-palette">
          {colors.map(c => (
            <button
              key={c}
              style={{ backgroundColor: c }}
              onClick={() => { onColorChange(c); setShowPalette(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TeamScore;