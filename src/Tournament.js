import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://fojauczthhwmcxngasvm.supabase.co',
  'sb_publishable_cLbjoFf-y7jFDNgXbwDGiQ_3wbC8ut9'
);

export default function Tournament() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState('');
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState('');
  const [matches, setMatches] = useState([]);
  const [showBracket, setShowBracket] = useState(false);

  const hasBracket = selectedTournament && matches.length > 0;

  // Fetch tournaments
  const fetchTournaments = async () => {
    const { data, error } = await supabase.from('tournaments').select('*');
    if (data) setTournaments(data);
  };

  // Create tournament
  const createTournament = async () => {
    if (!newTournament) return;
    await supabase.from('tournaments').insert({ name: newTournament });
    setNewTournament('');
    fetchTournaments();
  };

  // Select tournament + fetch teams
  const selectTournament = async (t) => {
    setSelectedTournament(t);
    const { data } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', t.id);

    if (data) setTeams(data);

    await fetchMatches(t.id);

    setShowBracket(true);
  };

  // Add team
  const addTeam = async () => {
    if (!newTeam || !selectedTournament) return;

    await supabase.from('teams').insert({
      name: newTeam,
      tournament_id: selectedTournament.id
    });

    setNewTeam('');
    selectTournament(selectedTournament);
  };

  // Generate bracket
  const generateBracket = async () => {
    if (!selectedTournament) return;

    const shuffled = [...teams].sort(() => Math.random() - 0.5);

    const newMatches = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (shuffled[i + 1]) {
        newMatches.push({
          tournament_id: selectedTournament.id,
          team1_id: shuffled[i].id,
          team2_id: shuffled[i + 1].id,
          round: 1
        });
      }
    }

    await supabase.from('matches').insert(newMatches);

    await fetchMatches(selectedTournament.id);
  };

  // Regenerate bracket
  const regenerateBracket = async () => {
    await deleteBracket();
    await generateBracket();
  };

  // Fetch matches
  const fetchMatches = async (tournamentId) => {
    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        team1:team1_id(name),
        team2:team2_id(name)
      `)
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true });

    if (data) {
      setMatches(data);
    }
  };

  // Delete bracket
  const deleteBracket = async () => {
    if (!selectedTournament) return;

    await supabase
      .from('matches')
      .delete()
      .eq('tournament_id', selectedTournament.id);

    setMatches([]);
  };

  // Set winner
  const setWinner = async (match, winnerId) => {
    if (!selectedTournament) return;

    // 1. Save winner
    await supabase
      .from('matches')
      .update({ winner_id: winnerId })
      .eq('id', match.id);

    // 2. Refresh matches
    await fetchMatches(selectedTournament.id);

    // 3. Try to advance bracket
    await advanceRound(match.tournament_id, match.round);
  };

  // Advance round if all matches in current round are finished
  const advanceRound = async (tournamentId, round) => {
    // Get all matches in this round
    const { data: matches } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round', round);

    if (!matches || matches.length === 0) return;

    // If not all matches are finished → stop
    const unfinished = matches.filter(m => !m.winner_id);
    if (unfinished.length > 0) return;

    // Collect winners
    const winners = matches.map(m => m.winner_id);

    // If only 1 winner → tournament over
    if (winners.length === 1) return;

    // Create next round matches
    const nextRound = [];

    for (let i = 0; i < winners.length; i += 2) {
      if (winners[i + 1]) {
        nextRound.push({
          tournament_id: tournamentId,
          team1_id: winners[i],
          team2_id: winners[i + 1],
          round: round + 1
        });
      }
    }

    await supabase.from('matches').insert(nextRound);

    await fetchMatches(tournamentId);
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament?.id) {
      fetchMatches(selectedTournament.id);
    }
  }, [selectedTournament]);

  return (
    <div className="container py-4">
      <h2>Tournaments</h2>

      {/* Create Tournament */}
      <div className="mb-3 d-flex gap-2">
        <input
          className="form-control"
          value={newTournament}
          onChange={(e) => setNewTournament(e.target.value)}
          placeholder="New tournament name"
        />
        <button className="btn btn-primary" onClick={createTournament}>
          Create
        </button>
      </div>

      {/* Tournament List */}
      <ul className="list-group mb-4">
        {tournaments.map((t) => (
          <li
            key={t.id}
            className="list-group-item list-group-item-action"
            onClick={() => selectTournament(t)}
            style={{ cursor: 'pointer' }}
          >
            {t.name}
          </li>
        ))}
      </ul>

      {/* Teams Section */}
      {selectedTournament && (
        <>
          <h3>{selectedTournament.name} - Teams</h3>

          <div className="mb-3 d-flex gap-2">
            <input
              className="form-control"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Team name"
            />
            <button className="btn btn-success" onClick={addTeam}>
              Add Team
            </button>
          </div>

          <ul className="list-group">
            {teams.map((team) => (
              <li key={team.id} className="list-group-item">
                {team.name}
              </li>
            ))}
          </ul>

          <h3 className="mt-4">Matches</h3>

          <div className="d-flex gap-2 mb-3">
            {/* Generate (only if no bracket exists) */}
            <button
              className="btn btn-warning"
              onClick={generateBracket}
              disabled={hasBracket}
            >
              Generate Bracket
            </button>

            {/* Regenerate (only if bracket exists) */}
            <button
              className="btn btn-danger"
              onClick={regenerateBracket}
              disabled={!hasBracket}
            >
              Regenerate Bracket
            </button>

            {/* Toggle view */}
            <button
              className="btn btn-primary"
              onClick={() => setShowBracket(!showBracket)}
              disabled={!hasBracket}
            >
              {showBracket ? "Hide Bracket" : "View Bracket"}
            </button>

          </div>

          {showBracket && (
            <ul className="list-group">
              {matches.map((m) => (
                <li
                  key={m.id}
                  className="list-group-item d-flex justify-content-between align-items-center"
                  onClick={() =>
                  navigate('/cornhole', {
                    state: {
                      matchId: m.id,
                      team1: m.team1,
                      team2: m.team2
                    }
                  })}
                style={{ cursor: 'pointer' }}
                >
                  <span>
                    {m.team1?.name} vs {m.team2?.name}
                  </span>

                  <span>
                    {m.team1_score} - {m.team2_score}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

