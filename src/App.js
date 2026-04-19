import React, { useState } from 'react';
import './App.css';
import TeamScore from './TeamScore';

function App() {
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);

  const handleScoreChange = (team, delta) => {
    if (team === 1) {
      setTeam1Score(prev => Math.max(0, prev + delta));
    } else {
      setTeam2Score(prev => Math.max(0, prev + delta));
    }
  };

  const resetScores = () => {
    setTeam1Score(0);
    setTeam2Score(0);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cornhole Scorekeeper</h1>
      </header>
      <div className="teams">
        <TeamScore name="Team 1" score={team1Score} onScoreChange={(delta) => handleScoreChange(1, delta)} />
        <TeamScore name="Team 2" score={team2Score} onScoreChange={(delta) => handleScoreChange(2, delta)} />
      </div>
      <button onClick={resetScores} className="reset">Reset Scores</button>
    </div>
  );
}

export default App;