import React, { useState } from 'react';
import './App.css';
import TeamScore from './TeamScore';

function App() {
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [team1Color, setTeam1Color] = useState('#F20D0D');
  const [team2Color, setTeam2Color] = useState('#0D0DF2');

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
        <div className="container h-100 d-flex align-items-center justify-content-center">
          <h1 className="h3 mb-0">Cornhole Scorekeeper</h1>
        </div>
      </header>

      <main className="main-content container d-flex flex-column justify-content-center">
        <div className="row gx-3 gy-4 justify-content-center">
          <div className="col-12 col-md-8">
            <TeamScore
              name={team1Name}
              score={team1Score}
              onScoreChange={(delta) => handleScoreChange(1, delta)}
              onNameChange={(newName) => handleNameChange(1, newName)}
              color={team1Color}
              onColorChange={setTeam1Color}
            />
          </div>
          <div className="col-12 col-md-8">
            <TeamScore
              name={team2Name}
              score={team2Score}
              onScoreChange={(delta) => handleScoreChange(2, delta)}
              onNameChange={(newName) => handleNameChange(2, newName)}
              color={team2Color}
              onColorChange={setTeam2Color}
            />
          </div>
        </div>
      </main>

      <footer className="App-footer d-flex align-items-center justify-content-center">
        <button type="button" onClick={resetScores} className="btn btn-danger btn-lg px-4">
          Reset Scores
        </button>
      </footer>
    </div>
  );
}

export default App;
