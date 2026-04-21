import React, { useState, useEffect } from 'react';
import './App.css';
import TeamScore from './TeamScore';
import Tournament from './Tournament';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';

// const { data } = await supabase.auth.signInAnonymously();
const supabase = createClient('https://fojauczthhwmcxngasvm.supabase.co', "sb_publishable_cLbjoFf-y7jFDNgXbwDGiQ_3wbC8ut9");

function Home({ navigate, ...props }) {
  const location = useLocation();
  const match = location.state;
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

  useEffect(() => {
    if (match) {
      setTeam1Name(match.team1.name);
      setTeam2Name(match.team2.name);
    }
  }, [match]);

  return (
    <div className="App">
      {/* HEADER */}
      <header className="App-header">
        <div className="container-fluid h-100 d-flex align-items-center justify-content-between p-2">
          <h1 className="h3 mb-0">Cornhole Scorekeeper</h1>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/tournament')}
          >
            Tournament
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="main-content h-100 container-fluid d-flex flex-column justify-content-center p-0">
        <div className="row gx-1 gy-1 justify-content-center m-0 w-100">
          <div className="col-12 col-md-6">
            <TeamScore
              name={team1Name}
              score={team1Score}
              onScoreChange={(delta) => handleScoreChange(1, delta)}
              onNameChange={(newName) => handleNameChange(1, newName)}
              color={team1Color}
              onColorChange={setTeam1Color}
            />
          </div>
          <div className="col-12 col-md-6">
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

      {/* FOOTER */}
      <footer className="App-footer content-fluid d-flex align-items-center justify-content-center p-0">
        <div className="col-6 col-md-3">
          <button type="button" onClick={resetScores} className="btn btn-danger btn-lg px-1 w-100">
            Reset Scores
          </button>
        </div>
          </footer>
    </div>
  );
}

function App() {
  const location = useLocation();
  const match = location.state;
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/cornhole"
        element={<Home navigate={navigate} />}
      />
      <Route
        path="/tournament"
        element={<Tournament />}
      />
    </Routes>
  );
}

export default App;
