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
  const [byeCandidates, setByeCandidates] = useState([]);
  const [showByeModal, setShowByeModal] = useState(false);
  const [pendingRoundData, setPendingRoundData] = useState(null);

  const hasBracket = selectedTournament && matches.length > 0;

  // Fetch tournaments
  const fetchTournaments = async () => {
    const { data } = await supabase.from('tournaments').select('*');
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

    const teamIds = shuffled.map(t => t.id);

    // 🟡 ODD CHECK AT START
    if (teamIds.length > 1 && teamIds.length % 2 !== 0) {
      setByeCandidates(teamIds);
      setPendingRoundData({
        tournamentId: selectedTournament.id,
        round: 1,
        initial: true // 👈 important flag
      });
      setShowByeModal(true);
      return;
    }

    const matches = [];

    for (let i = 0; i < teamIds.length; i += 2) {
      if (teamIds[i + 1]) {
        matches.push({
          tournament_id: selectedTournament.id,
          team1_id: teamIds[i],
          team2_id: teamIds[i + 1],
          round: 1
        });
      }
    }

    await supabase.from('matches').insert(matches);

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

  // Play match
  const playMatch = (m) => {
    navigate('/cornhole', {
      state: {
        matchId: m.id,
        team1: m.team1,
        team2: m.team2
      }
    });
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
    await advanceRound(match.tournament_id);
  };

  // Advance round if all matches in current round are finished
  const advanceRound = async (tournamentId) => {
    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('round', { ascending: true });

    if (!matchesData) return;

    if (matchesData.length === 1 && matchesData[0].winner_id) {
      console.log("🏆 Tournament finished");
      return;
    }

    const latestRound = Math.max(...matchesData.map(m => m.round || 1));
    const currentRoundMatches = matchesData.filter(m => m.round === latestRound);

    const unfinished = currentRoundMatches.filter(m => !m.winner_id);
    if (unfinished.length > 0) return;

    const winners = currentRoundMatches.map(m => m.winner_id);

    if (winners.length === 1) {
      console.log("Champion determined:", winners[0]);
      return;
    }

    if (winners.length % 2 !== 0) {
      setByeCandidates(winners);
      setPendingRoundData({ tournamentId, round: latestRound });
      setShowByeModal(true);
      return;
    }

    const nextRound = latestRound + 1;
    createNextRound(tournamentId, nextRound, winners);
  };

  const createNextRound = async (tournamentId, nextRound, winners, byeTeamId = null) => {
    const { data: existingNext } = await supabase
      .from('matches')
      .select('id')
      .eq('tournament_id', tournamentId)
      .eq('round', nextRound);

    if (existingNext.length > 0) return;

    if (winners.length < 2) return;
    let pool = [...winners];

    const matches = [];

    // remove bye team if selected
    if (byeTeamId) {
      pool = pool.filter(id => id !== byeTeamId);

      // auto-insert bye advancement match
      matches.push({
        tournament_id: tournamentId,
        team1_id: byeTeamId,
        team2_id: null,
        winner_id: byeTeamId,
        round: nextRound
      });
    }

    for (let i = 0; i < pool.length; i += 2) {
      if (pool[i + 1]) {
        matches.push({
          tournament_id: tournamentId,
          team1_id: pool[i],
          team2_id: pool[i + 1],
          round: nextRound
        });
      }
    }

    await supabase.from('matches').insert(matches);

    await fetchMatches(tournamentId);
  };

  // const getNextRound = async (tournamentId) => {
  //   const { data } = await supabase
  //     .from('matches')
  //     .select('round')
  //     .eq('tournament_id', tournamentId);

  //   if (!data || data.length === 0) return 1;

  //   return Math.max(...data.map(m => m.round || 1)) + 1;
  // };

  const handleSelectBye = async (teamId) => {
    setShowByeModal(false);

    const { tournamentId, round } = pendingRoundData;

    const { data: matchesData } = await supabase
      .from('matches')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('round', round);

    const winners = matchesData
      .map(m => m.winner_id)
      .filter(id => id && id !== teamId);

    const nextRound = round + 1;

    const newMatches = [];

    for (let i = 0; i < winners.length; i += 2) {
      if (winners[i + 1]) {
        newMatches.push({
          tournament_id: tournamentId,
          team1_id: winners[i],
          team2_id: winners[i + 1],
          round: nextRound
        });
      }
    }

    newMatches.push({
      tournament_id: tournamentId,
      team1_id: teamId,
      team2_id: null,
      winner_id: teamId,
      round: nextRound
    });

    await supabase.from('matches').insert(newMatches);
    await fetchMatches(tournamentId);

    setByeCandidates([]);
    setPendingRoundData(null);
  };

  // const getCurrentRound = async (tournamentId) => {
  //   const { data } = await supabase
  //     .from('matches')
  //     .select('round')
  //     .eq('tournament_id', tournamentId);

  //   if (!data || data.length === 0) return 1;

  //   return Math.max(...data.map(m => m.round || 1));
  // };

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
                style={{ cursor: 'pointer' }}
                >
                  <span>
                    <strong>Round {m.round}:</strong>{" "}
                    {m.team1?.name} vs{" "}
                    {m.team2_id === null ? (
                      <span className="text-muted">BYE</span>
                    ) : (
                      m.team2?.name
                    )}
                  </span>

                  <span>
                    {m.team1_score} - {m.team2_score}
                  </span>
                  
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => playMatch(m)}
                      disabled={m.team2_id === null}
                    >
                      Play Match
                    </button>
                    <button
                      className={`btn btn-sm ${
                        m.winner_id === m.team1_id
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setWinner(m, m.team1_id);
                      }}
                      disabled={m.team2_id === null}
                    >
                      {m.team1?.name} Wins
                    </button>

                    <button
                      className={`btn btn-sm ${
                        m.winner_id === m.team2_id
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setWinner(m, m.team2_id);
                      }}
                      disabled={m.team2_id === null}
                    >
                      {m.team2?.name} Wins
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {showByeModal && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">

              <div className="modal-header">
                <h5 className="modal-title">Select Bye Team</h5>
              </div>

              <div className="modal-body">
                <p>Odd number of teams detected. Choose one team to advance:</p>

                <ul className="list-group">
                  {byeCandidates.map((teamId) => {
                    const team =
                      teams.find(t => t.id === teamId) ||
                      matches.flatMap(m => [m.team1, m.team2]).find(t => t?.id === teamId);

                    return (
                      <li
                        key={teamId}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectBye(teamId)}
                      >
                        {team?.name || "Unknown Team"}
                      </li>
                    );
                  })}
                </ul>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

