/**
 * Bracket Module: 16-Team Tournament Double Elimination & Supabase Integration
 */
const BracketModule = (function () {
  let appState = null;
  const ADMIN_SALT = "CHICKEN_WARS_SALT_2026";
  const EXPECTED_ADMIN_HASH = "905c94df0c5fb55acdac418663b7637e53f895a58dbc1535602db6efbaae136e";

  function createInitialState() {
    const T = AppConfig.TEAMS;
    return {
      activeStage: 1,
      champion: null,
      bouts: {
        'W1': { id: 'W1', stage: 1, bracket: 'winners', round: 1, t1: T[0], t2: T[1], v1: 0, v2: 0, locked: false, winner: null },
        'W2': { id: 'W2', stage: 1, bracket: 'winners', round: 1, t1: T[2], t2: T[3], v1: 0, v2: 0, locked: false, winner: null },
        'W3': { id: 'W3', stage: 1, bracket: 'winners', round: 1, t1: T[4], t2: T[5], v1: 0, v2: 0, locked: false, winner: null },
        'W4': { id: 'W4', stage: 1, bracket: 'winners', round: 1, t1: T[6], t2: T[7], v1: 0, v2: 0, locked: false, winner: null },
        'W5': { id: 'W5', stage: 1, bracket: 'winners', round: 1, t1: T[8], t2: T[9], v1: 0, v2: 0, locked: false, winner: null },
        'W6': { id: 'W6', stage: 1, bracket: 'winners', round: 1, t1: T[10], t2: T[11], v1: 0, v2: 0, locked: false, winner: null },
        'W7': { id: 'W7', stage: 1, bracket: 'winners', round: 1, t1: T[12], t2: T[13], v1: 0, v2: 0, locked: false, winner: null },
        'W8': { id: 'W8', stage: 1, bracket: 'winners', round: 1, t1: T[14], t2: T[15], v1: 0, v2: 0, locked: false, winner: null },
        'W9':  { id: 'W9', stage: 2, bracket: 'winners', round: 2, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
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
        'L9':  { id: 'L9', stage: 4, bracket: 'losers', round: 3, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L10': { id: 'L10', stage: 4, bracket: 'losers', round: 3, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L11': { id: 'L11', stage: 5, bracket: 'losers', round: 4, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L12': { id: 'L12', stage: 5, bracket: 'losers', round: 4, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'L13': { id: 'L13', stage: 6, bracket: 'losers', round: 5, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null },
        'GF': { id: 'GF', stage: 7, bracket: 'grand', round: 1, t1: null, t2: null, v1: 0, v2: 0, locked: true, winner: null }
      }
    };
  }

  function getLocalLedger() {
    try {
      return JSON.parse(localStorage.getItem(AppConfig.VOTES_LEDGER_KEY)) || {};
    } catch (e) {
      return {};
    }
  }

  async function handleVote(boutId, teamIndex) {
    const user = AuthModule.getCurrentUser();
    if (!user) {
      AuthModule.promptSwitchUser();
      return;
    }

    const bout = appState.bouts[boutId];
    if (!bout || bout.locked) return;

    const ledger = getLocalLedger();
    const existing = ledger[boutId];

    if (existing && Number(existing.teamIndex) === Number(teamIndex)) {
      return; // Already voted for this team
    }

    // Play Cluck Sound on vote!
    AudioModule.playCluck();

    if (Number(teamIndex) === 1) bout.v1++;
    else bout.v2++;

    const chosenTeam = Number(teamIndex) === 1 ? bout.t1 : bout.t2;
    ledger[boutId] = {
      teamIndex: Number(teamIndex),
      predictedTeamName: chosenTeam ? chosenTeam.name : '',
      predictedSeed: chosenTeam ? chosenTeam.seed : null
    };
    localStorage.setItem(AppConfig.VOTES_LEDGER_KEY, JSON.stringify(ledger));

    renderBracket();

    // Sync to Supabase
    const userHash = await AuthModule.sha256(`HASH_${user}`);
    await window.supabaseClient.from('chicken_wars_votes').upsert([{
      player_name: user,
      user_hash: userHash,
      bout_id: boutId,
      stage: bout.stage,
      team_index: Number(teamIndex),
      predicted_seed: chosenTeam ? chosenTeam.seed : null,
      predicted_team_name: chosenTeam ? chosenTeam.name : ''
    }], { onConflict: 'user_hash,bout_id' });

    syncUserScore();
  }

  async function syncUserScore() {
    const user = AuthModule.getCurrentUser();
    if (!user) return;
    const ledger = getLocalLedger();
    let correct = 0;
    Object.values(appState.bouts).forEach(bout => {
      if (bout.winner && ledger[bout.id]) {
        if (Number(ledger[bout.id].predictedSeed) === Number(bout.winner.seed)) {
          correct++;
        }
      }
    });

    const totalScore = correct * 10;
    document.getElementById('current-player-score').innerText = totalScore;

    const userHash = await AuthModule.sha256(`HASH_${user}`);
    await window.supabaseClient.from('chicken_wars_scores').upsert([{
      player_name: user,
      user_hash: userHash,
      score: totalScore,
      correct_picks: correct,
      updated_at: new Date().toISOString()
    }], { onConflict: 'player_name' });
  }

  function renderBracket() {
    const ledger = getLocalLedger();
    const stageTitles = {
      1: 'ROUND OF 16', 2: 'QUARTERFINALS', 3: 'SEMIFINALS',
      4: 'ROUND 4', 5: 'ROUND 5', 6: 'LOSERS FINAL', 7: 'GRAND FINALS'
    };
    document.getElementById('current-stage-title').innerText = stageTitles[appState.activeStage] || `STAGE ${appState.activeStage}`;

    if (appState.champion) {
      document.getElementById('champion-name').innerText = appState.champion.name;
      document.getElementById('champion-marquee').style.display = 'block';
    } else {
      document.getElementById('champion-marquee').style.display = 'none';
    }

    let totalVotes = 0;
    let activeBouts = 0;
    let userVotedCount = 0;

    Object.values(appState.bouts).forEach(b => {
      if (b.stage === appState.activeStage) totalVotes += (b.v1 + b.v2);
    });
    document.getElementById('total-ballots').innerText = totalVotes;

    Object.values(appState.bouts).forEach(bout => {
      const isGreyed = (bout.stage > appState.activeStage);
      const isBoutActive = (bout.stage === appState.activeStage && !bout.locked && (bout.t1 || bout.t2));
      if (isBoutActive) activeBouts++;

      const userVote = ledger[bout.id];
      const hasVoted = !!userVote;
      const votedIdx = hasVoted ? Number(userVote.teamIndex) : null;
      if (isBoutActive && hasVoted) userVotedCount++;

      let badgeHtml = '';
      if (bout.winner && hasVoted && Number(userVote.predictedSeed) === Number(bout.winner.seed)) {
        badgeHtml = '<span class="points-awarded-badge">+10 PTS ✔</span>';
      }

      const html = `
        <div class="bout-card ${bout.locked ? 'locked-bout' : ''} ${isGreyed ? 'greyed-out' : ''}" id="card-${bout.id}">
          <div class="bout-header-bar">
            <span>BOUT [${bout.id}] ${badgeHtml}</span>
            <span>${bout.locked ? '<span class="locked-badge">LOCKED</span>' : '<span class="open-badge">OPEN</span>'}</span>
          </div>
          <div class="team-slot ${bout.winner && bout.winner.seed === bout.t1?.seed ? 'winner-slot' : ''}">
            <div class="team-info">
              <span class="seed-badge">${bout.t1 ? '#' + bout.t1.seed : '--'}</span>
              <span class="team-name" title="${bout.t1 ? bout.t1.name : 'TBD'}">${bout.t1 ? bout.t1.name : 'TBD'}</span>
            </div>
            <div class="action-col">
              <span class="vote-count">${bout.v1}</span>
              <button class="vote-btn ${votedIdx === 1 ? 'has-voted' : ''}" onclick="BracketModule.handleVote('${bout.id}', 1)" ${bout.locked || !bout.t1 || isGreyed ? 'disabled' : ''}>
                ${votedIdx === 1 ? 'VOTED' : 'CLUCK'}
              </button>
            </div>
          </div>
          <div class="vs-badge">- VS -</div>
          <div class="team-slot ${bout.winner && bout.winner.seed === bout.t2?.seed ? 'winner-slot' : ''}">
            <div class="team-info">
              <span class="seed-badge">${bout.t2 ? '#' + bout.t2.seed : '--'}</span>
              <span class="team-name" title="${bout.t2 ? bout.t2.name : 'TBD'}">${bout.t2 ? bout.t2.name : 'TBD'}</span>
            </div>
            <div class="action-col">
              <span class="vote-count">${bout.v2}</span>
              <button class="vote-btn ${votedIdx === 2 ? 'has-voted' : ''}" onclick="BracketModule.handleVote('${bout.id}', 2)" ${bout.locked || !bout.t2 || isGreyed ? 'disabled' : ''}>
                ${votedIdx === 2 ? 'VOTED' : 'CLUCK'}
              </button>
            </div>
          </div>
        </div>
      `;

      const container = getBoutContainer(bout);
      if (container) {
        const existing = container.querySelector(`#card-${bout.id}`);
        if (!existing) container.insertAdjacentHTML('beforeend', html);
        else existing.outerHTML = html;
      }
    });

    document.getElementById('user-credits').innerText = Math.max(0, activeBouts - userVotedCount);
  }

  function getBoutContainer(bout) {
    if (bout.bracket === 'winners') return document.getElementById(`winners-round-${bout.round}`);
    if (bout.bracket === 'losers') return document.getElementById(`losers-round-${bout.round}`);
    if (bout.bracket === 'grand') return document.getElementById('grand-finals-bout');
    return null;
  }

  function switchView(viewName) {
    const winners = document.getElementById('winners-view');
    const losers = document.getElementById('losers-view');
    const grand = document.getElementById('grand-view');
    const lead = document.getElementById('leaderboard-view');
    const toolbar = document.getElementById('full-bracket-toolbar');
    const dividers = document.querySelectorAll('.section-divider-title');

    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    toolbar.style.display = 'none';
    dividers.forEach(d => d.style.display = 'none');
    winners.classList.remove('active-view');
    losers.classList.remove('active-view');
    grand.classList.remove('active-view');
    lead.classList.remove('active-view');

    if (viewName === 'all') {
      winners.classList.add('active-view');
      losers.classList.add('active-view');
      grand.classList.add('active-view');
      toolbar.style.display = 'flex';
      dividers.forEach(d => d.style.display = 'block');
      document.getElementById('tab-all').classList.add('active');
    } else if (viewName === 'winners') {
      winners.classList.add('active-view');
      document.getElementById('tab-winners').classList.add('active');
    } else if (viewName === 'losers') {
      losers.classList.add('active-view');
      document.getElementById('tab-losers').classList.add('active');
    } else if (viewName === 'grand') {
      grand.classList.add('active-view');
      document.getElementById('tab-grand').classList.add('active');
    } else if (viewName === 'leaderboard') {
      lead.classList.add('active-view');
      document.getElementById('tab-leaderboard').classList.add('active');
      fetchCloudLeaderboard();
    }
  }

  async function fetchCloudLeaderboard() {
    const tbody = document.getElementById('leaderboard-tbody');
    const status = document.getElementById('cloud-table-status');
    if (status) status.innerText = 'SYNCING TOWN SCORES...';

    const { data, error } = await window.supabaseClient
      .from('chicken_wars_scores')
      .select('*')
      .order('score', { ascending: false });

    if (error || !data) {
      if (status) status.innerText = 'OFFLINE / ERROR';
      return;
    }

    if (status) status.innerText = `CONNECTED (${data.length} FARMERS)`;
    tbody.innerHTML = '';
    const active = AuthModule.getCurrentUser();

    data.forEach((row, i) => {
      const isCur = (row.player_name === active);
      const tr = document.createElement('tr');
      if (isCur) tr.className = 'current-user-row';
      tr.innerHTML = `
        <td>#${i + 1}</td>
        <td>${row.player_name} ${isCur ? '(YOU)' : ''}</td>
        <td style="text-align:center;">${row.correct_picks}</td>
        <td style="text-align:right; font-weight:bold;">${row.score} PTS</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function setBracketZoom(zoom) {
    const wrap = document.getElementById('zoomable-bracket-wrapper');
    if (wrap) wrap.style.transform = `scale(${zoom})`;
  }

  // Admin and Stage Progression
  async function advanceCurrentStage() {
    const s = appState.activeStage;
    if (s === 1) {
      for (let i = 1; i <= 8; i++) {
        const bout = appState.bouts['W' + i];
        bout.winner = (bout.v1 >= bout.v2) ? bout.t1 : bout.t2;
        bout.locked = true;
      }
      appState.bouts['W9'].t1 = appState.bouts['W1'].winner;
      appState.bouts['W9'].t2 = appState.bouts['W2'].winner;
      appState.bouts['W9'].locked = false;
      appState.activeStage = 2;
    }
    renderBracket();
    await window.supabaseClient.from('chicken_wars_state').upsert([{ id: 1, state_json: appState }]);
    alert("Round advanced!");
  }

  function requestAdminAuth() {
    document.getElementById('admin-pass-modal').style.display = 'flex';
  }

  function closeAdminAuthModal() {
    document.getElementById('admin-pass-modal').style.display = 'none';
  }

  async function verifyAdminPassword() {
    const input = document.getElementById('admin-password-input').value;
    const hash = await AuthModule.sha256(ADMIN_SALT + input);
    if (hash === EXPECTED_ADMIN_HASH) {
      closeAdminAuthModal();
      document.getElementById('admin-overlay').style.display = 'flex';
    } else {
      document.getElementById('admin-pass-error').style.display = 'block';
    }
  }

  function closeAdmin() {
    document.getElementById('admin-overlay').style.display = 'none';
  }

  function init() {
    const stored = localStorage.getItem(AppConfig.STORAGE_STATE_KEY);
    appState = stored ? JSON.parse(stored) : createInitialState();
    renderBracket();
  }

  return {
    init: init,
    handleVote: handleVote,
    switchView: switchView,
    setBracketZoom: setBracketZoom,
    fetchCloudLeaderboard: fetchCloudLeaderboard,
    requestAdminAuth: requestAdminAuth,
    closeAdminAuthModal: closeAdminAuthModal,
    verifyAdminPassword: verifyAdminPassword,
    closeAdmin: closeAdmin,
    advanceCurrentStage: advanceCurrentStage,
    onUserAuthenticated: () => {
      syncUserScore();
      renderBracket();
    }
  };
})();
