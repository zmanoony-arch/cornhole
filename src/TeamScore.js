import React, { useState, useRef } from 'react';

function getContrastVariant(hex) {
  const normalized = hex.replace('#', '').length === 3
    ? hex.replace('#', '').split('').map(c => c + c).join('')
    : hex.replace('#', '');
  const r = parseInt(normalized.substr(0, 2), 16);
  const g = parseInt(normalized.substr(2, 2), 16);
  const b = parseInt(normalized.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? 'dark' : 'light';
}

function TeamScore({ name, score, onScoreChange, onNameChange, color, onColorChange }) {
  const [showPalette, setShowPalette] = useState(false);
  const nameInputRef = useRef(null);
  const colors = ['#FF0000', '#FFA500', '#FFFF00', '#008000', '#0000FF', '#4B0082', '#EE82EE'];
  const contrast = getContrastVariant(color);
  const outlineClass = contrast === 'light' ? 'btn-outline-light' : 'btn-outline-dark';
  const controlClass = contrast === 'light' ? 'btn-light' : 'btn-dark';

  return (
    <div className={`card team-card h-100 ${contrast === 'light' ? 'text-white' : 'text-dark'}`} style={{ backgroundColor: color }}>
      <div className="card-body d-flex flex-column h-100">
        <div className="d-flex align-items-center mb-3 position-relative">
          <input
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="form-control me-2"
          />
          <button
            type="button"
            className={`btn ${outlineClass} btn-sm me-2`}
            onClick={() => nameInputRef.current?.focus()}
            title="Edit team name"
          >
            ✏️
          </button>
          <div className="position-relative">
            <button
              type="button"
              className={`btn ${outlineClass} btn-sm`}
              onClick={() => setShowPalette(!showPalette)}
              title="Choose team color"
            >
              🎨
            </button>
            {showPalette && (
              <div className="color-palette position-absolute shadow-sm rounded bg-white p-2">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    className="color-button"
                    style={{ backgroundColor: c }}
                    onClick={() => { onColorChange(c); setShowPalette(false); }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="score d-flex align-items-center justify-content-center flex-grow-1">
          <span className="display-4 fw-bold">{score}</span>
        </div>

        <div className="btn-group w-100 mt-3" role="group">
          <button type="button" className={`btn ${controlClass} btn-lg`} onClick={() => onScoreChange(1)}>
            +
          </button>
          <button type="button" className={`btn ${controlClass} btn-lg`} onClick={() => onScoreChange(-1)}>
            -
          </button>
        </div>
      </div>
    </div>
  );
}

export default TeamScore;
