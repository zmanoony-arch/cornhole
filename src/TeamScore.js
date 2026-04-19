import React, { useState, useRef } from 'react';

function TeamScore({ name, score, onScoreChange, onNameChange, color, onColorChange }) {
  const [showPalette, setShowPalette] = useState(false);
  const nameInputRef = useRef(null);
  const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE'];

  return (
    <div className="team" style={{ backgroundColor: color }}>
      <div className="team-name-wrapper">
        <input
          ref={nameInputRef}
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="team-name"
        />
        <span className="team-name-icon" onClick={() => nameInputRef.current?.focus()} title="Edit team name">✏️</span>
      </div>
      <div className="score">{score}</div>
      <button onClick={() => onScoreChange(1)}>+</button>
      <button onClick={() => onScoreChange(-1)}>-</button>
      <div className="color-icon" onClick={() => setShowPalette(!showPalette)}>
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="9.5" fill="none" stroke="black" stroke-width="4"/>
          <path d="M10,10 L20,10 A10,10 0 0,1 16.18,17.86 Z" fill="#FF0000"/>
          <path d="M10,10 L16.18,17.86 A10,10 0 0,1 6.81,19.51 Z" fill="#FFA500"/>
          <path d="M10,10 L6.81,19.51 A10,10 0 0,1 1.81,16.88 Z" fill="#FFFF00"/>
          <path d="M10,10 L1.81,16.88 A10,10 0 0,1 1.81,4.12 Z" fill="#008000"/>
          <path d="M10,10 L1.81,4.12 A10,10 0 0,1 6.81,0.49 Z" fill="#0000FF"/>
          <path d="M10,10 L6.81,0.49 A10,10 0 0,1 16.18,2.14 Z" fill="#4B0082"/>
          <path d="M10,10 L16.18,2.14 A10,10 0 0,1 20,10 Z" fill="#EE82EE"/>
        </svg>
      </div>
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