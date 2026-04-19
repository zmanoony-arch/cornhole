import React, { useState } from 'react';
import './App.css';
import TeamScore from './TeamScore';

function App() {
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');

  const handleScoreChange = (team, delta) => {
    if (team === 1) {
      setTeam1Score(prev => Math.max(0, prev + delta));
    } else {
      setTeam2Score(prev => Math.max(0, prev + delta));
    }
  };

  const handleNameChange = (team, newName) => {
    if (team === 1) setTeam1Name(newName);
    else setTeam2Name(newName);
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
        <TeamScore name={team1Name} score={team1Score} onScoreChange={(delta) => handleScoreChange(1, delta)} onNameChange={(newName) => handleNameChange(1, newName)} />
        <TeamScore name={team2Name} score={team2Score} onScoreChange={(delta) => handleScoreChange(2, delta)} onNameChange={(newName) => handleNameChange(2, newName)} />
      </div>
      <button onClick={resetScores} className="reset">Reset Scores</button>
    </div>
  );
}

export default App;