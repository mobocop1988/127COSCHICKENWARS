/**
 * bracket.js
 * 16-man double elimination tournament bracket, voting, and operator panel
 */
const BracketModule = (() => {
  const STORAGE_KEY = 'CW26_TOURNAMENT_STATE_V1';
  const VOTE_STORAGE_KEY = 'CW26_LOCAL_VOTES';
  const ADMIN_PASSWORD_PLAINTEXT = "admin127";

  let appState = null;
  let pendingVoteChange = null;

  function createInitialState() {
    const T = AppConfig.TEAMS;
    return {
      activeStage: 1,
      champion: null,
      bouts: {
        'W1': { id: 'W1', stage: 1, bracket: 'winners', round: 1, t1: T[0],  t2: T[1],  v1: 0, v2: 0, locked: false, winner: null },
        'W2': { id: 'W2', stage: 1, bracket: 'winners', round: 1, t1: T[2],  t2: T[3],  v1: 0, v2: 0, locked: false, winner: null },
        'W3': { id: 'W3', stage: 1, bracket: 'winners', round: 1, t1: T[4],  t2: T[5],  v1: 0, v2: 0, locked: false, winner: null },
        'W4': { id: 'W4', stage: 1, bracket: 'winners', round: 1, t1: T[6],  t2: T[7],  v1: 0, v2: 0, locked: false, winner: null },
        'W5': { id: 'W5', stage: 1, bracket: 'winners', round: 1, t1: T[8],  t2: T[9],  v1: 0, v2: 0, locked: false, winner: null },
        'W6': { id: 'W6', stage: 1, bracket: 'winners', round: 1, t1: T[10], t2: T[11], v1: 0, v2: 0, locked: false, winner: null },
        'W7': { id: 'W7', stage: 1, bracket: 'winners', round: 1, t1: T[12], t2: T[13], v1: 0, v2: 0, locked: false, winner: null },
        'W8': { id: 'W8', stage: 1, bracket: 'winners', round: 1, t1: T[14], t2: T[15], v1: 0, v2: 0, locked: false, winner: null },

        'W9':  { id: 'W9',  stage: 2, bracket: 'winners', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'W10': { id: 'W10', stage: 2, bracket: 'winners', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'W11': { id: 'W11', stage: 2, bracket: 'winners', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'W12': { id: 'W12', stage: 2, bracket: 'winners', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },

        'W13': { id: 'W13', stage: 3, bracket: 'winners', round: 3, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'W14': { id: 'W14', stage: 3, bracket: 'winners', round: 3, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'W15': { id: 'W15', stage: 4, bracket: 'winners', round: 4, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },

        'L1': { id: 'L1', stage: 2, bracket: 'losers', round: 1, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L2': { id: 'L2', stage: 2, bracket: 'losers', round: 1, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L3': { id: 'L3', stage: 2, bracket: 'losers', round: 1, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L4': { id: 'L4', stage: 2, bracket: 'losers', round: 1, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },

        'L5': { id: 'L5', stage: 3, bracket: 'losers', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L6': { id: 'L6', stage: 3, bracket: 'losers', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L7': { id: 'L7', stage: 3, bracket: 'losers', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L8': { id: 'L8', stage: 3, bracket: 'losers', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },

        'L9':  { id: 'L9',  stage: 4, bracket: 'losers', round: 3, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L10': { id: 'L10', stage: 4, bracket: 'losers', round: 3, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L11': { id: 'L11', stage: 5, bracket: 'losers', round: 4, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L12': { id: 'L12', stage: 5, bracket: 'losers', round: 4, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L13': { id: 'L13', stage: 6, bracket: 'losers', round: 5, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },

        'GF': { id: 'GF', stage: 7, bracket: 'grand', round: 1, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null }
      }
    };
  }

  function init() {
    loadState();
    renderBracket();
    fetchCloudTournamentState();
    fetchCloudLeaderboard();

    document.getElementById('confirm-switch-btn').addEventListener('click', executeVoteSwitch);
  }

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        appState = JSON.parse(raw);
        return;
      } catch (e) {}
    }
    appState = createInitialState();
    saveState();
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }

  function onUserAuthenticated() {
    renderBracket();
    updateUserScore();
    fetchCloudLeaderboard();
  }

  function getLocalVotes() {
    try {
      return JSON.parse(localStorage.getItem(VOTE_STORAGE_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  function saveLocalVotes(votes) {
    localStorage.setItem(VOTE_STORAGE_KEY, JSON.stringify(votes));
  }

  async function handleVoteClick(boutId, teamIndex) {
    const user = AuthModule.getCurrentUser();
    if (!user.lastName) {
      AuthModule.promptSwitchUser();
      return;
    }

    const bout = appState.bouts[boutId];
    if (!bout || bout.locked) return;

    const votes = getLocalVotes();
    const existing = votes[boutId];

    if (existing && existing.teamIndex === teamIndex) {
      return;
    }

    if (existing && existing.teamIndex !== teamIndex) {
      const prevName = existing.teamIndex === 1 ? bout.t1.name : bout.t2.name;
      const newName = teamIndex === 1 ? bout.t1.name : bout.t2.name;
      pendingVoteChange = { boutId, teamIndex, prevIndex: existing.teamIndex };
      document.getElementById('confirm-modal-text').innerText = 
        `Switch your prediction from "${prevName}" to "${newName}"?`;
      document.getElementById('confirm-modal').style.display = 'flex';
      return;
    }

    // First-time vote
    if (teamIndex === 1) bout.v1++;
    else bout.v2++;

    const chosenTeam = teamIndex === 1 ? bout.t1 : bout.t2;
    votes[boutId] = { teamIndex, predictedSeed: chosenTeam.seed };
    saveLocalVotes(votes);
    saveState();

    AudioModule.playCluck();
    renderBracket();
    await syncVoteToSupabase(boutId, teamIndex, chosenTeam);
  }

  async function executeVoteSwitch() {
    if (!pendingVoteChange) return;
    const { boutId, teamIndex, prevIndex } = pendingVoteChange;
    const bout = appState.bouts[boutId];
    closeConfirmModal();

    if (bout && !bout.locked) {
      if (prevIndex === 1 && bout.v1 > 0) bout.v1--;
      if (prevIndex === 2 && bout.v2 > 0) bout.v2--;

      if (teamIndex === 1) bout.v1++;
      if (teamIndex === 2) bout.v2++;

      const chosenTeam = teamIndex === 1 ? bout.t1 : bout.t2;
      const votes = getLocalVotes();
      votes[boutId] = { teamIndex, predictedSeed: chosenTeam.seed };
      saveLocalVotes(votes);
      saveState();

      AudioModule.playCluck();
      renderBracket();
      await syncVoteToSupabase(boutId, teamIndex, chosenTeam);
    }
  }

  function closeConfirmModal() {
    pendingVoteChange = null;
    document.getElementById('confirm-modal').style.display = 'none';
  }

  async function syncVoteToSupabase(boutId, teamIndex, team) {
    const user = AuthModule.getCurrentUser();
    if (!user.lastName || !window.supabaseClient) return;

    try {
      await window.supabaseClient.from('chicken_wars_votes').upsert({
        player_name: user.lastName,
        user_hash: user.userHash,
        bout_id: boutId,
        stage: appState.bouts[boutId].stage,
        team_index: teamIndex,
        predicted_seed: team.seed,
        predicted_team_name: team.name,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_hash,bout_id' });
    } catch (e) {
      console.warn("Supabase vote sync error:", e);
    }
    updateUserScore();
  }

  function updateUserScore() {
    const votes = getLocalVotes();
    let correct = 0;
    Object.values(appState.bouts).forEach(bout => {
      if (bout.winner && votes[bout.id]) {
        if (Number(votes[bout.id].predictedSeed) === Number(bout.winner.seed)) {
          correct++;
        }
      }
    });

    const score = correct * 10;
    document.getElementById('current-player-score').innerText = score;

    const user = AuthModule.getCurrentUser();
    if (user.lastName && window.supabaseClient) {
      window.supabaseClient.from('chicken_wars_scores').upsert({
        user_hash: user.userHash,
        player_name: user.lastName,
        score: score,
        correct_picks: correct,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_hash' }).then(() => fetchCloudLeaderboard());
    }
  }

  async function fetchCloudTournamentState() {
    if (!window.supabaseClient) return;
    try {
      const { data } = await window.supabaseClient
        .from('chicken_wars_state')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (data && data.state_json) {
        appState = data.state_json;
        saveState();
        renderBracket();
        updateUserScore();
      }
    } catch (e) {}
  }

  async function syncTournamentStateToCloud() {
    if (!window.supabaseClient) return;
    try {
      await window.supabaseClient.from('chicken_wars_state').upsert({
        id: 1,
        state_json: appState,
        updated_at: new Date().toISOString()
      });
    } catch (e) {}
  }

  async function fetchCloudLeaderboard() {
    const statusEl = document.getElementById('cloud-table-status');
    if (!window.supabaseClient) {
      if (statusEl) statusEl.innerText = "OFFLINE MODE";
      return;
    }
    try {
      const { data } = await window.supabaseClient
        .from('chicken_wars_scores')
        .select('*')
        .order('score', { ascending: false })
        .order('correct_picks', { ascending: false })
        .limit(50);

      renderLeaderboard(data || []);
      if (statusEl) statusEl.innerText = `ONLINE (${data ? data.length : 0} FARMERS)`;
    } catch (e) {
      if (statusEl) statusEl.innerText = "COOP NETWORK OFFLINE";
    }
  }

  function renderLeaderboard(data) {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const currentUser = AuthModule.getCurrentUser().lastName;
    data.forEach((row, i) => {
      const tr = document.createElement('tr');
      if (row.player_name === currentUser) tr.className = 'current-user-row';
      tr.innerHTML = `
        <td>#${i + 1}</td>
        <td>${row.player_name}</td>
        <td style="text-align:center;">${row.correct_picks}</td>
        <td style="text-align:right; font-family:'VT323'; font-size:1.3rem;">${row.score} PTS</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderBracket() {
    const votes = getLocalVotes();
    let totalVotes = 0;
    let activeBouts = 0;
    let userVotedActive = 0;

    const stages = {
      1: "ROUND OF 16", 2: "QUARTERFINALS", 3: "SEMIFINALS",
      4: "WINNERS FINAL", 5: "LOSERS ROOST", 6: "LOSERS FINAL", 7: "GRAND FINALS"
    };
    document.getElementById('current-stage-title').innerText = stages[appState.activeStage] || `STAGE ${appState.activeStage}`;

    if (appState.champion) {
      document.getElementById('champion-name').innerText = appState.champion.name;
      document.getElementById('champion-marquee').style.display = 'block';
    } else {
      document.getElementById('champion-marquee').style.display = 'none';
    }

    Object.values(appState.bouts).forEach(bout => {
      if (bout.stage === appState.activeStage) {
        totalVotes += (bout.v1 + bout.v2);
      }
      const isBoutActive = (bout.stage === appState.activeStage && !bout.locked && (bout.t1 || bout.t2));
      if (isBoutActive) activeBouts++;

      const isGreyed = (bout.stage > appState.activeStage);
      const userPick = votes[bout.id] ? votes[bout.id].teamIndex : null;
      if (isBoutActive && userPick) userVotedActive++;

      let awardHtml = '';
      if (bout.winner && votes[bout.id]) {
        if (Number(votes[bout.id].predictedSeed) === Number(bout.winner.seed)) {
          awardHtml = '<span class="points-awarded-badge">+10 PTS ✔</span>';
        }
      }

      const cardHtml = `
        <div class="bout-card ${bout.locked ? 'locked-bout' : ''} ${isGreyed ? 'greyed-out' : ''}" id="card-${bout.id}">
          <div class="bout-header-bar">
            <span>BOUT [${bout.id}] ${awardHtml}</span>
            <span>${bout.locked ? '<span class="locked-badge">LOCKED</span>' : '<span class="open-badge">OPEN</span>'}</span>
          </div>

          <div class="team-slot ${bout.winner && bout.winner.seed === bout.t1?.seed ? 'winner-slot' : ''}">
            <div class="team-info">
              <span class="seed-badge">${bout.t1 ? '#' + bout.t1.seed : '--'}</span>
              <span class="team-name">${bout.t1 ? bout.t1.name : 'TBD'}</span>
            </div>
            <div class="action-col">
              <span class="vote-count">${bout.v1}</span>
              <button class="vote-btn ${userPick === 1 ? 'has-voted' : ''}"
                onclick="BracketModule.handleVoteClick('${bout.id}', 1)"
                ${bout.locked || !bout.t1 || isGreyed ? 'disabled' : ''}>
                ${userPick === 1 ? 'VOTED' : 'VOTE'}
              </button>
            </div>
          </div>

          <div class="vs-badge">- VS -</div>

          <div class="team-slot ${bout.winner && bout.winner.seed === bout.t2?.seed ? 'winner-slot' : ''}">
            <div class="team-info">
              <span class="seed-badge">${bout.t2 ? '#' + bout.t2.seed : '--'}</span>
              <span class="team-name">${bout.t2 ? bout.t2.name : 'TBD'}</span>
            </div>
            <div class="action-col">
              <span class="vote-count">${bout.v2}</span>
              <button class="vote-btn ${userPick === 2 ? 'has-voted' : ''}"
                onclick="BracketModule.handleVoteClick('${bout.id}', 2)"
                ${bout.locked || !bout.t2 || isGreyed ? 'disabled' : ''}>
                ${userPick === 2 ? 'VOTED' : 'VOTE'}
              </button>
            </div>
          </div>
        </div>
      `;

      const target = getContainerForBout(bout);
      if (target) {
        const existing = target.querySelector(`#card-${bout.id}`);
        if (!existing) target.insertAdjacentHTML('beforeend', cardHtml);
        else existing.outerHTML = cardHtml;
      }
    });

    document.getElementById('total-ballots').innerText = totalVotes;
    document.getElementById('user-credits').innerText = Math.max(0, activeBouts - userVotedActive);
  }

  function getContainerForBout(bout) {
    if (bout.bracket === 'winners') return document.getElementById(`winners-round-${bout.round}`);
    if (bout.bracket === 'losers') return document.getElementById(`losers-round-${bout.round}`);
    if (bout.bracket === 'grand') return document.getElementById('grand-finals-bout');
    return null;
  }

  function switchView(view) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.bracket-container').forEach(c => c.classList.remove('active-view'));
    document.querySelectorAll('.section-divider-title').forEach(d => d.style.display = 'none');
    document.getElementById('full-bracket-toolbar').style.display = 'none';

    if (view === 'all') {
      document.querySelectorAll('.bracket-container').forEach(c => c.classList.add('active-view'));
      document.querySelectorAll('.section-divider-title').forEach(d => d.style.display = 'block');
      document.getElementById('full-bracket-toolbar').style.display = 'flex';
      document.getElementById('tab-all').classList.add('active');
    } else {
      const el = document.getElementById(`${view}-view`);
      if (el) el.classList.add('active-view');
      const tab = document.getElementById(`tab-${view}`);
      if (tab) tab.classList.add('active');
    }
  }

  function setBracketZoom(scale) {
    document.getElementById('zoomable-bracket-wrapper').style.transform = `scale(${scale})`;
  }

  /* Admin Passkey & Operator Panel */
  function requestAdminAuth() {
    document.getElementById('admin-password-input').value = '';
    document.getElementById('admin-pass-error').style.display = 'none';
    document.getElementById('admin-pass-modal').style.display = 'flex';
    document.getElementById('admin-password-input').focus();
  }

  function closeAdminAuthModal() {
    document.getElementById('admin-pass-modal').style.display = 'none';
  }

  function verifyAdminPassword() {
    const input = document.getElementById('admin-password-input').value.trim();
    if (input === ADMIN_PASSWORD_PLAINTEXT) {
      closeAdminAuthModal();
      openAdmin();
    } else {
      document.getElementById('admin-pass-error').style.display = 'block';
    }
  }

  function openAdmin() {
    renderAdminBouts();
    document.getElementById('admin-overlay').style.display = 'flex';
  }

  function closeAdmin() {
    document.getElementById('admin-overlay').style.display = 'none';
  }

  function renderAdminBouts() {
    const container = document.getElementById('admin-bout-controls');
    container.innerHTML = '';
    Object.values(appState.bouts).forEach(bout => {
      const t1 = bout.t1 ? bout.t1.name : 'TBD';
      const t2 = bout.t2 ? bout.t2.name : 'TBD';
      const row = document.createElement('div');
      row.className = 'admin-bout-row';
      row.innerHTML = `
        <div>
          <strong>[${bout.id}]</strong> ${t1} vs ${t2} (${bout.v1} - ${bout.v2})
        </div>
        <button class="stardew-btn btn-sm ${bout.locked ? 'btn-danger' : 'btn-success'}"
          onclick="BracketModule.toggleSingleBout('${bout.id}')">
          ${bout.locked ? 'LOCKED' : 'OPEN'}
        </button>
      `;
      container.appendChild(row);
    });
  }

  function toggleSingleBout(id) {
    if (appState.bouts[id]) {
      appState.bouts[id].locked = !appState.bouts[id].locked;
      saveState();
      syncTournamentStateToCloud();
      renderAdminBouts();
      renderBracket();
    }
  }

  function toggleAllBouts(locked) {
    Object.values(appState.bouts).forEach(b => b.locked = locked);
    saveState();
    syncTournamentStateToCloud();
    renderAdminBouts();
    renderBracket();
  }

  function advanceCurrentStage() {
    const s = appState.activeStage;
    if (s === 1) {
      const w1 = getWin(appState.bouts['W1']), l1 = getLose(appState.bouts['W1']);
      const w2 = getWin(appState.bouts['W2']), l2 = getLose(appState.bouts['W2']);
      const w3 = getWin(appState.bouts['W3']), l3 = getLose(appState.bouts['W3']);
      const w4 = getWin(appState.bouts['W4']), l4 = getLose(appState.bouts['W4']);
      const w5 = getWin(appState.bouts['W5']), l5 = getLose(appState.bouts['W5']);
      const w6 = getWin(appState.bouts['W6']), l6 = getLose(appState.bouts['W6']);
      const w7 = getWin(appState.bouts['W7']), l7 = getLose(appState.bouts['W7']);
      const w8 = getWin(appState.bouts['W8']), l8 = getLose(appState.bouts['W8']);

      popBout('W9', w1, w2); popBout('W10', w3, w4);
      popBout('W11', w5, w6); popBout('W12', w7, w8);
      popBout('L1', l1, l2); popBout('L2', l3, l4);
      popBout('L3', l5, l6); popBout('L4', l7, l8);

      ['W1','W2','W3','W4','W5','W6','W7','W8'].forEach(id => appState.bouts[id].locked = true);
      ['W9','W10','W11','W12','L1','L2','L3','L4'].forEach(id => appState.bouts[id].locked = false);
      appState.activeStage = 2;
    } else if (s === 2) {
      const w9 = getWin(appState.bouts['W9']), l9 = getLose(appState.bouts['W9']);
      const w10 = getWin(appState.bouts['W10']), l10 = getLose(appState.bouts['W10']);
      const w11 = getWin(appState.bouts['W11']), l11 = getLose(appState.bouts['W11']);
      const w12 = getWin(appState.bouts['W12']), l12 = getLose(appState.bouts['W12']);
      const l1 = getWin(appState.bouts['L1']), l2 = getWin(appState.bouts['L2']);
      const l3 = getWin(appState.bouts['L3']), l4 = getWin(appState.bouts['L4']);

      popBout('W13', w9, w10); popBout('W14', w11, w12);
      popBout('L5', l1, l12); popBout('L6', l2, l11);
      popBout('L7', l3, l10); popBout('L8', l4, l9);

      ['W9','W10','W11','W12','L1','L2','L3','L4'].forEach(id => appState.bouts[id].locked = true);
      ['W13','W14','L5','L6','L7','L8'].forEach(id => appState.bouts[id].locked = false);
      appState.activeStage = 3;
    } else if (s === 3) {
      const w13 = getWin(appState.bouts['W13']);
      const w14 = getWin(appState.bouts['W14']);
      const l5 = getWin(appState.bouts['L5']), l6 = getWin(appState.bouts['L6']);
      const l7 = getWin(appState.bouts['L7']), l8 = getWin(appState.bouts['L8']);

      popBout('W15', w13, w14);
      popBout('L9', l5, l6); popBout('L10', l7, l8);

      ['W13','W14','L5','L6','L7','L8'].forEach(id => appState.bouts[id].locked = true);
      ['W15','L9','L10'].forEach(id => appState.bouts[id].locked = false);
      appState.activeStage = 4;
    } else if (s === 4) {
      const w13_l = getLose(appState.bouts['W13']), w14_l = getLose(appState.bouts['W14']);
      const l9 = getWin(appState.bouts['L9']), l10 = getWin(appState.bouts['L10']);

      popBout('L11', l9, w14_l); popBout('L12', l10, w13_l);
      ['W15','L9','L10'].forEach(id => appState.bouts[id].locked = true);
      ['L11','L12'].forEach(id => appState.bouts[id].locked = false);
      appState.activeStage = 5;
    } else if (s === 5) {
      const l11 = getWin(appState.bouts['L11']), l12 = getWin(appState.bouts['L12']);
      popBout('L13', l11, l12);
      ['L11','L12'].forEach(id => appState.bouts[id].locked = true);
      ['L13'].forEach(id => appState.bouts[id].locked = false);
      appState.activeStage = 6;
    } else if (s === 6) {
      const w15 = getWin(appState.bouts['W15']), l13 = getWin(appState.bouts['L13']);
      popBout('GF', w15, l13);
      ['L13'].forEach(id => appState.bouts[id].locked = true);
      ['GF'].forEach(id => appState.bouts[id].locked = false);
      appState.activeStage = 7;
    } else if (s === 7) {
      const champ = getWin(appState.bouts['GF']);
      appState.champion = champ;
      appState.bouts['GF'].locked = true;
      alert(`★ CROWNED CHAMPION: ${champ.name}! ★`);
    }

    saveState();
    syncTournamentStateToCloud();
    renderBracket();
    renderAdminBouts();
    updateUserScore();
  }

  function getWin(b) {
    if (!b.t1) return b.t2;
    if (!b.t2) return b.t1;
    const w = (b.v1 >= b.v2) ? b.t1 : b.t2;
    b.winner = w;
    return w;
  }

  function getLose(b) {
    if (!b.t1 || !b.t2) return null;
    return (b.v1 >= b.v2) ? b.t2 : b.t1;
  }

  function popBout(id, t1, t2) {
    if (appState.bouts[id]) {
      appState.bouts[id].t1 = t1;
      appState.bouts[id].t2 = t2;
      appState.bouts[id].v1 = 0;
      appState.bouts[id].v2 = 0;
    }
  }

  function resetTournamentPrompt() {
    if (confirm("Reset the entire Chicken Wars tournament and ballots?")) {
      appState = createInitialState();
      localStorage.removeItem(VOTE_STORAGE_KEY);
      saveState();
      syncTournamentStateToCloud();
      renderBracket();
      renderAdminBouts();
      updateUserScore();
    }
  }

  return {
    init,
    handleVoteClick,
    closeConfirmModal,
    switchView,
    setBracketZoom,
    requestAdminAuth,
    closeAdminAuthModal,
    verifyAdminPassword,
    closeAdmin,
    toggleSingleBout,
    toggleAllBouts,
    advanceCurrentStage,
    resetTournamentPrompt,
    fetchCloudLeaderboard,
    onUserAuthenticated
  };
})();
