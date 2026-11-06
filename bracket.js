/**
 * bracket.js - 16-Man Tournament Bracket Logic & Supabase Sync
 * Features built-in cryptographic fallback and resilient bout rendering
 */
const BracketModule = (function () {
  const ADMIN_PASSCODE = "rooster2026";
  let appState = null;
  let cloudLeaderboardData = [];
  let pendingVoteChange = null;

  // Safe SHA-256 with self-contained fallback so bracket rendering will never crash
  async function safeSha256(str) {
    if (typeof AuthModule !== 'undefined' && typeof AuthModule.sha256 === 'function') {
      try {
        return await AuthModule.sha256(str);
      } catch (e) {}
    }
    try {
      if (window.crypto && crypto.subtle) {
        const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch (e) {}
    return "TOKEN_" + encodeURIComponent(str).slice(0, 32);
  }

  function createDefaultState() {
    const teams = AppConfig.SEEDED_TEAMS;
    return {
      activeStage: 1,
      champion: null,
      leaderboard: {},
      bouts: {
        'W1': { id: 'W1', stage: 1, bracket: 'winners', round: 1, t1: teams[0], t2: teams[1], v1: 0, v2: 0, locked: false, winner: null },
        'W2': { id: 'W2', stage: 1, bracket: 'winners', round: 1, t1: teams[2], t2: teams[3], v1: 0, v2: 0, locked: false, winner: null },
        'W3': { id: 'W3', stage: 1, bracket: 'winners', round: 1, t1: teams[4], t2: teams[5], v1: 0, v2: 0, locked: false, winner: null },
        'W4': { id: 'W4', stage: 1, bracket: 'winners', round: 1, t1: teams[6], t2: teams[7], v1: 0, v2: 0, locked: false, winner: null },
        'W5': { id: 'W5', stage: 1, bracket: 'winners', round: 1, t1: teams[8], t2: teams[9], v1: 0, v2: 0, locked: false, winner: null },
        'W6': { id: 'W6', stage: 1, bracket: 'winners', round: 1, t1: teams[10], t2: teams[11], v1: 0, v2: 0, locked: false, winner: null },
        'W7': { id: 'W7', stage: 1, bracket: 'winners', round: 1, t1: teams[12], t2: teams[13], v1: 0, v2: 0, locked: false, winner: null },
        'W8': { id: 'W8', stage: 1, bracket: 'winners', round: 1, t1: teams[14], t2: teams[15], v1: 0, v2: 0, locked: false, winner: null },
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

  function loadState() {
    const raw = localStorage.getItem(AppConfig.STORAGE_KEYS.STATE);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.bouts && Object.keys(parsed.bouts).length >= 8) {
          appState = parsed;
          return parsed;
        }
      } catch (e) {}
    }
    appState = createDefaultState();
    saveState(appState);
    return appState;
  }

  function saveState(state) {
    localStorage.setItem(AppConfig.STORAGE_KEYS.STATE, JSON.stringify(state));
  }

  function getLocalVotesLedger() {
    try {
      return JSON.parse(localStorage.getItem(AppConfig.STORAGE_KEYS.VOTE_LEDGER)) || {};
    } catch (e) {
      return {};
    }
  }

  async function generateBoutSaltedHash(boutId) {
    const activeName = (localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME) || '').trim().toUpperCase();
    return await safeSha256(`CW26_BOUT_${boutId}_${activeName}`);
  }

  async function renderBracket() {
    if (!appState || !appState.bouts) {
      loadState();
    }

    const ledger = getLocalVotesLedger();
    let totalVotesCount = 0;
    let activeBoutsInRoundCount = 0;
    let userVotesInActiveRoundCount = 0;

    const stageTitles = {
      1: 'ROUND 1', 2: 'QUARTERFINALS', 3: 'SEMIFINALS', 
      4: 'ROUND 4', 5: 'ROUND 5', 6: 'LOSERS FINAL', 7: 'GRAND FINALS'
    };
    const stageElem = document.getElementById('current-stage-title');
    if (stageElem) stageElem.innerText = stageTitles[appState.activeStage] || `STAGE ${appState.activeStage}`;

    const champMarquee = document.getElementById('champion-marquee');
    if (champMarquee) {
      if (appState.champion) {
        document.getElementById('champion-name').innerText = appState.champion.name;
        champMarquee.style.display = 'block';
      } else {
        champMarquee.style.display = 'none';
      }
    }

    Object.values(appState.bouts).forEach(b => {
      if (b.stage === appState.activeStage) {
        totalVotesCount += (b.v1 + b.v2);
      }
    });
    const ballotsElem = document.getElementById('total-ballots');
    if (ballotsElem) ballotsElem.innerText = totalVotesCount;

    for (const bout of Object.values(appState.bouts)) {
      try {
        const isGreyed = (bout.stage > appState.activeStage);
        const isBoutActive = (bout.stage === appState.activeStage && !bout.locked && (bout.t1 || bout.t2));
        if (isBoutActive) activeBoutsInRoundCount++;

        const expectedToken = await generateBoutSaltedHash(bout.id);
        const hasVoted = ledger[bout.id] && ledger[bout.id].token === expectedToken;
        const votedTeamIndex = hasVoted ? Number(ledger[bout.id].teamIndex) : null;

        let predictionAwardedHtml = '';
        if (bout.winner && hasVoted) {
          const predSeed = Number(ledger[bout.id].predictedSeed);
          if (predSeed === Number(bout.winner.seed)) {
            predictionAwardedHtml = '<span class="points-awarded-badge">+10 PTS ✔</span>';
          }
        }

        if (isBoutActive && hasVoted) userVotesInActiveRoundCount++;

        const html = `
          <div class="bout-card ${bout.locked ? 'locked-bout' : ''} ${isGreyed ? 'greyed-out' : ''}" id="bout-card-${bout.id}">
            <div class="bout-header-bar">
              <span>BOUT [${bout.id}] ${predictionAwardedHtml}</span>
              <span>${bout.locked ? '<span class="locked-badge">LOCKED</span>' : '<span class="open-badge">OPEN</span>'}</span>
            </div>
            <div class="team-slot ${bout.winner && bout.winner.seed === bout.t1?.seed ? 'winner-slot' : ''}">
              <div class="team-info">
                <span class="seed-badge">${bout.t1 ? '#' + bout.t1.seed : '--'}</span>
                <span class="team-name" title="${bout.t1 ? bout.t1.name : 'TBD'}">${bout.t1 ? bout.t1.name : 'TBD'}</span>
              </div>
              <div class="action-col">
                <span class="vote-count">${bout.v1}</span>
                <button 
                  class="vote-btn ${votedTeamIndex === 1 ? 'has-voted' : ''}" 
                  onclick="BracketModule.handleVoteClick('${bout.id}', 1)"
                  ${bout.locked || !bout.t1 || isGreyed ? 'disabled' : ''}>
                  ${votedTeamIndex === 1 ? 'PICKED' : 'VOTE'}
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
                <button 
                  class="vote-btn ${votedTeamIndex === 2 ? 'has-voted' : ''}" 
                  onclick="BracketModule.handleVoteClick('${bout.id}', 2)"
                  ${bout.locked || !bout.t2 || isGreyed ? 'disabled' : ''}>
                  ${votedTeamIndex === 2 ? 'PICKED' : 'VOTE'}
                </button>
              </div>
            </div>
          </div>
        `;

        const targetContainer = getBoutContainer(bout);
        if (targetContainer) {
          const existing = targetContainer.querySelector(`#bout-card-${bout.id}`);
          if (!existing) {
            targetContainer.insertAdjacentHTML('beforeend', html);
          } else {
            existing.outerHTML = html;
          }
        }
      } catch (err) {
        console.warn(`Render error on bout ${bout.id}:`, err);
      }
    }

    const remainingCredits = Math.max(0, activeBoutsInRoundCount - userVotesInActiveRoundCount);
    const creditsElem = document.getElementById('user-credits');
    if (creditsElem) creditsElem.innerText = remainingCredits;
  }

  function getBoutContainer(bout) {
    if (bout.bracket === 'winners') {
      return document.getElementById(`winners-round-${bout.round}`);
    } else if (bout.bracket === 'losers') {
      return document.getElementById(`losers-round-${bout.round}`);
    } else if (bout.bracket === 'grand') {
      return document.getElementById('grand-finals-bout');
    }
    return null;
  }

  async function handleVoteClick(boutId, teamIndex) {
    const storedName = localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME);
    if (!storedName) {
      AuthModule.promptAuthModal('login');
      return;
    }

    const bout = appState.bouts[boutId];
    if (!bout || bout.locked) return;

    const ledger = getLocalVotesLedger();
    const existingVote = ledger[boutId];
    const expectedToken = await generateBoutSaltedHash(boutId);

    if (existingVote && existingVote.token === expectedToken && Number(existingVote.teamIndex) === Number(teamIndex)) {
      AudioModule.sfxBuzz();
      return;
    }

    if (existingVote && existingVote.token === expectedToken && Number(existingVote.teamIndex) !== Number(teamIndex)) {
      const prevTeamName = Number(existingVote.teamIndex) === 1 ? (bout.t1?.name || "Team 1") : (bout.t2?.name || "Team 2");
      const newTeamName = Number(teamIndex) === 1 ? (bout.t1?.name || "Team 1") : (bout.t2?.name || "Team 2");
      const chosenTeam = Number(teamIndex) === 1 ? bout.t1 : bout.t2;

      pendingVoteChange = { boutId, teamIndex: Number(teamIndex), prevTeamIndex: Number(existingVote.teamIndex), expectedToken, chosenTeam };
      document.getElementById('confirm-modal-text').innerText = 
        `You previously picked "${prevTeamName}". Would you like to switch your prediction to "${newTeamName}"?`;
      document.getElementById('confirm-modal').style.display = 'flex';
      AudioModule.sfxSwitch();
      return;
    }

    if (Number(teamIndex) === 1) bout.v1++;
    else bout.v2++;

    const chosenTeam = Number(teamIndex) === 1 ? bout.t1 : bout.t2;
    saveLocalVote(boutId, teamIndex, expectedToken, chosenTeam);
    saveState(appState);

    AudioModule.sfxChickenCluck();
    renderBracket();
    await syncVoteToCloud(boutId, bout.stage, teamIndex, chosenTeam);
  }

  function saveLocalVote(boutId, teamIndex, token, predictedTeam) {
    const ledger = getLocalVotesLedger();
    ledger[boutId] = {
      teamIndex: Number(teamIndex),
      token,
      predictedTeamName: predictedTeam ? predictedTeam.name : '',
      predictedSeed: predictedTeam ? Number(predictedTeam.seed) : null
    };
    localStorage.setItem(AppConfig.STORAGE_KEYS.VOTE_LEDGER, JSON.stringify(ledger));
    updateScoreboard();
  }

  function setupConfirmListener() {
    const btn = document.getElementById('confirm-switch-btn');
    if (!btn) return;
    btn.onclick = async () => {
      if (!pendingVoteChange) return;
      const { boutId, teamIndex, prevTeamIndex, expectedToken, chosenTeam } = pendingVoteChange;
      const bout = appState.bouts[boutId];
      closeConfirmModal();

      if (bout && !bout.locked) {
        if (prevTeamIndex === 1 && bout.v1 > 0) bout.v1--;
        if (prevTeamIndex === 2 && bout.v2 > 0) bout.v2--;
        if (teamIndex === 1) bout.v1++;
        if (teamIndex === 2) bout.v2++;

        saveLocalVote(boutId, teamIndex, expectedToken, chosenTeam);
        saveState(appState);
        AudioModule.sfxChickenCluck();
        renderBracket();
        await syncVoteToCloud(boutId, bout.stage, teamIndex, chosenTeam);
      }
    };
  }

  function closeConfirmModal() {
    pendingVoteChange = null;
    document.getElementById('confirm-modal').style.display = 'none';
  }

  function updateScoreboard() {
    const playerName = localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME);
    if (!playerName) return;

    const ledger = getLocalVotesLedger();
    let correctCount = 0;
    Object.values(appState.bouts).forEach(bout => {
      if (bout.winner && ledger[bout.id]) {
        if (Number(ledger[bout.id].predictedSeed) === Number(bout.winner.seed)) {
          correctCount++;
        }
      }
    });

    const score = correctCount * 10;
    document.getElementById('current-player-score').innerText = score;
    syncUserScoreToCloud(score, correctCount);
  }

  async function syncVoteToCloud(boutId, stage, teamIndex, predictedTeam) {
    const playerName = localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME);
    if (!playerName) return;

    const userHash = await AuthModule.getDeterministicUserHash(playerName);
    const payload = {
      player_name: playerName,
      user_hash: userHash,
      bout_id: boutId,
      stage: Number(stage),
      team_index: Number(teamIndex),
      predicted_seed: predictedTeam ? Number(predictedTeam.seed) : null,
      predicted_team_name: predictedTeam ? predictedTeam.name : '',
      updated_at: new Date().toISOString()
    };

    const checkRes = await executeSupabaseRest(`chicken_wars_votes?player_name=eq.${encodeURIComponent(playerName)}&bout_id=eq.${encodeURIComponent(boutId)}&select=id`);
    if (checkRes.success && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
      await executeSupabaseRest(`chicken_wars_votes?player_name=eq.${encodeURIComponent(playerName)}&bout_id=eq.${encodeURIComponent(boutId)}`, 'PATCH', payload);
    } else {
      await executeSupabaseRest('chicken_wars_votes', 'POST', payload);
    }
  }

  async function syncUserScoreToCloud(score, correctCount) {
    const playerName = localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME);
    if (!playerName) return;

    const userHash = await AuthModule.getDeterministicUserHash(playerName);
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const payload = {
      user_hash: userHash,
      player_name: playerName,
      score,
      correct_picks: correctCount,
      last_active_date: dateStr,
      updated_at: new Date().toISOString()
    };

    const checkRes = await executeSupabaseRest(`chicken_wars_scores?player_name=eq.${encodeURIComponent(playerName)}&select=id`);
    if (checkRes.success && Array.isArray(checkRes.data) && checkRes.data.length > 0) {
      await executeSupabaseRest(`chicken_wars_scores?player_name=eq.${encodeURIComponent(playerName)}`, 'PATCH', payload);
    } else {
      await executeSupabaseRest('chicken_wars_scores', 'POST', payload);
    }
    fetchCloudLeaderboard();
  }

  async function fetchCloudLeaderboard() {
    const statusElem = document.getElementById('cloud-table-status');
    if (statusElem) statusElem.innerText = 'SYNCING...';

    const res = await executeSupabaseRest('chicken_wars_scores?select=*&order=score.desc,correct_picks.desc&limit=100');
    if (res.success && Array.isArray(res.data)) {
      cloudLeaderboardData = res.data;
      if (statusElem) statusElem.innerText = `CONNECTED (${res.data.length} FARMERS)`;
      renderLeaderboardTable();
    } else {
      if (statusElem) {
        statusElem.innerText = 'OFFLINE (LOCAL SILO)';
        statusElem.style.color = '#bb342f';
      }
      renderLeaderboardTable();
    }
  }

  function renderLeaderboardTable() {
    const tbody = document.getElementById('leaderboard-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const activeUser = (localStorage.getItem(AppConfig.STORAGE_KEYS.PLAYER_NAME) || '').trim().toUpperCase();
    const data = cloudLeaderboardData.slice();

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 25px; color: var(--wood-medium);">NO PREDICTIONS RECORDED YET. CAST YOUR VOTES TO JOIN THE HALL OF CLUCK!</td></tr>`;
      return;
    }

    data.forEach((p, idx) => {
      const rank = idx + 1;
      const isCurrent = (p.player_name && p.player_name.trim().toUpperCase() === activeUser);
      const row = document.createElement('tr');
      if (isCurrent) row.className = 'current-user-row';
      row.innerHTML = `
        <td class="rank-col">#${rank} ${rank === 1 ? '👑' : ''}</td>
        <td><strong>${p.player_name}</strong> ${isCurrent ? '<span style="font-size:0.55rem; color:var(--stardew-dark-green);">(YOU)</span>' : ''}</td>
        <td style="text-align: center; font-family: var(--font-narrow); font-size: 1.4rem;">${p.correct_picks}</td>
        <td style="text-align: right; font-family: var(--font-narrow); font-size: 1.5rem; font-weight: bold; color: #8b0000;">${p.score} PTS</td>
      `;
      tbody.appendChild(row);
    });
  }

  async function fetchCloudTournamentState() {
    const res = await executeSupabaseRest('chicken_wars_state?id=eq.1&select=*');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      const remoteState = res.data[0].state_json;
      if (remoteState && remoteState.bouts && Object.keys(remoteState.bouts).length >= 8) {
        appState.activeStage = remoteState.activeStage || 1;
        appState.champion = remoteState.champion || null;
        Object.keys(remoteState.bouts).forEach(boutId => {
          if (appState.bouts[boutId]) {
            const rb = remoteState.bouts[boutId];
            appState.bouts[boutId].t1 = rb.t1;
            appState.bouts[boutId].t2 = rb.t2;
            appState.bouts[boutId].locked = rb.locked;
            appState.bouts[boutId].winner = rb.winner;
          }
        });
        saveState(appState);
        renderBracket();
        updateScoreboard();
      }
    }
  }

  async function syncTournamentStateToCloud() {
    const payload = {
      id: 1,
      state_json: {
        activeStage: appState.activeStage,
        champion: appState.champion,
        bouts: appState.bouts
      },
      updated_at: new Date().toISOString()
    };
    await executeSupabaseRest('chicken_wars_state?id=eq.1', 'PATCH', payload);
  }

  function switchView(viewName) {
    const winnersView = document.getElementById('winners-view');
    const losersView = document.getElementById('losers-view');
    const grandView = document.getElementById('grand-view');
    const leaderView = document.getElementById('leaderboard-view');
    const fullToolbar = document.getElementById('full-bracket-toolbar');
    const dividerTitles = document.querySelectorAll('.section-divider-title');

    document.querySelectorAll('.wood-tab-btn').forEach(b => {
      if (!b.classList.contains('admin-trigger-btn') && !b.classList.contains('fullscreen-btn')) {
        b.classList.remove('active');
      }
    });

    if (fullToolbar) fullToolbar.style.display = 'none';
    dividerTitles.forEach(el => el.style.display = 'none');
    if (winnersView) winnersView.classList.remove('active-view');
    if (losersView) losersView.classList.remove('active-view');
    if (grandView) grandView.classList.remove('active-view');
    if (leaderView) leaderView.classList.remove('active-view');

    if (viewName === 'all') {
      if (winnersView) winnersView.classList.add('active-view');
      if (losersView) losersView.classList.add('active-view');
      if (grandView) grandView.classList.add('active-view');
      if (fullToolbar) fullToolbar.style.display = 'flex';
      dividerTitles.forEach(el => el.style.display = 'block');
      const tabAll = document.getElementById('tab-all');
      if (tabAll) tabAll.classList.add('active');
    } else if (viewName === 'winners') {
      if (winnersView) winnersView.classList.add('active-view');
      const tabW = document.getElementById('tab-winners');
      if (tabW) tabW.classList.add('active');
    } else if (viewName === 'losers') {
      if (losersView) losersView.classList.add('active-view');
      const tabL = document.getElementById('tab-losers');
      if (tabL) tabL.classList.add('active');
    } else if (viewName === 'grand') {
      if (grandView) grandView.classList.add('active-view');
      const tabG = document.getElementById('tab-grand');
      if (tabG) tabG.classList.add('active');
    } else if (viewName === 'leaderboard') {
      if (leaderView) leaderView.classList.add('active-view');
      const tabLead = document.getElementById('tab-leaderboard');
      if (tabLead) tabLead.classList.add('active');
      fetchCloudLeaderboard();
    }
    AudioModule.sfxSwitch();
  }

  function setBracketZoom(level) {
    const wrapper = document.getElementById('zoomable-bracket-wrapper');
    if (wrapper) wrapper.style.transform = `scale(${level})`;
    document.querySelectorAll('.zoom-btn').forEach(b => b.classList.remove('active-zoom'));
    if (event && event.target && event.target.classList.contains('zoom-btn')) {
      event.target.classList.add('active-zoom');
    }
    AudioModule.sfxSwitch();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
    AudioModule.sfxCoin();
  }

  function requestAdminAuth() {
    document.getElementById('admin-password-input').value = '';
    document.getElementById('admin-pass-error').style.display = 'none';
    document.getElementById('admin-auth-modal').style.display = 'flex';
    document.getElementById('admin-password-input').focus();
  }

  function closeAdminAuthModal() {
    document.getElementById('admin-auth-modal').style.display = 'none';
  }

  function verifyAdminPassword() {
    const input = document.getElementById('admin-password-input').value.trim();
    if (input === ADMIN_PASSCODE) {
      closeAdminAuthModal();
      openAdminDrawer();
      AudioModule.sfxCoin();
    } else {
      document.getElementById('admin-pass-error').style.display = 'block';
      AudioModule.sfxBuzz();
    }
  }

  function openAdminDrawer() {
    renderAdminControls();
    document.getElementById('admin-overlay').style.display = 'flex';
  }

  function closeAdmin() {
    document.getElementById('admin-overlay').style.display = 'none';
  }

  function renderAdminControls() {
    const container = document.getElementById('admin-bout-controls');
    if (!container) return;
    container.innerHTML = '';

    Object.values(appState.bouts).forEach(bout => {
      const t1Name = bout.t1 ? `#${bout.t1.seed} ${bout.t1.name}` : 'TBD';
      const t2Name = bout.t2 ? `#${bout.t2.seed} ${bout.t2.name}` : 'TBD';
      const row = document.createElement('div');
      row.className = 'admin-bout-row';
      row.innerHTML = `
        <div>
          <strong style="color:var(--wood-dark);">[${bout.id}]</strong>
          <span>${t1Name} vs ${t2Name}</span>
          <span style="color:#8b0000; margin-left: 10px;">(${bout.v1} - ${bout.v2})</span>
        </div>
        <div>
          <button class="toggle-lock-btn ${bout.locked ? 'is-locked' : 'is-unlocked'}" onclick="BracketModule.toggleSingleBout('${bout.id}')">
            ${bout.locked ? 'LOCKED' : 'UNLOCKED'}
          </button>
        </div>
      `;
      container.appendChild(row);
    });
  }

  async function toggleSingleBout(id) {
    const b = appState.bouts[id];
    if (b) {
      b.locked = !b.locked;
      saveState(appState);
      await syncTournamentStateToCloud();
      renderAdminControls();
      renderBracket();
      AudioModule.sfxSwitch();
    }
  }

  async function toggleAllBouts(lockState) {
    Object.values(appState.bouts).forEach(b => b.locked = lockState);
    saveState(appState);
    await syncTournamentStateToCloud();
    renderAdminControls();
    renderBracket();
    AudioModule.sfxSwitch();
  }

  async function advanceCurrentStage() {
    const stage = appState.activeStage;
    AudioModule.sfxCoin();

    const getW = (b) => {
      if (!b.t1 && !b.t2) return null;
      if (!b.t1) return b.t2;
      if (!b.t2) return b.t1;
      const w = (b.v1 >= b.v2) ? b.t1 : b.t2;
      b.winner = w;
      return w;
    };
    const getL = (b) => {
      if (!b.t1 || !b.t2) return null;
      return (b.v1 >= b.v2) ? b.t2 : b.t1;
    };
    const setB = (id, t1, t2) => {
      const b = appState.bouts[id];
      if (b) { b.t1 = t1; b.t2 = t2; b.v1 = 0; b.v2 = 0; }
    };
    const lock = (ids) => ids.forEach(id => { if (appState.bouts[id]) appState.bouts[id].locked = true; });
    const unlock = (ids) => ids.forEach(id => { if (appState.bouts[id]) appState.bouts[id].locked = false; });

    if (stage === 1) {
      const w = [1,2,3,4,5,6,7,8].map(i => getW(appState.bouts['W' + i]));
      const l = [1,2,3,4,5,6,7,8].map(i => getL(appState.bouts['W' + i]));
      setB('W9', w[0], w[1]); setB('W10', w[2], w[3]); setB('W11', w[4], w[5]); setB('W12', w[6], w[7]);
      setB('L1', l[0], l[1]); setB('L2', l[2], l[3]); setB('L3', l[4], l[5]); setB('L4', l[6], l[7]);
      lock(['W1','W2','W3','W4','W5','W6','W7','W8']);
      unlock(['W9','W10','W11','W12','L1','L2','L3','L4']);
      appState.activeStage = 2;
    } else if (stage === 2) {
      setB('W13', getW(appState.bouts['W9']), getW(appState.bouts['W10']));
      setB('W14', getW(appState.bouts['W11']), getW(appState.bouts['W12']));
      setB('L5', getW(appState.bouts['L1']), getL(appState.bouts['W12']));
      setB('L6', getW(appState.bouts['L2']), getL(appState.bouts['W11']));
      setB('L7', getW(appState.bouts['L3']), getL(appState.bouts['W10']));
      setB('L8', getW(appState.bouts['L4']), getL(appState.bouts['W9']));
      lock(['W9','W10','W11','W12','L1','L2','L3','L4']);
      unlock(['W13','W14','L5','L6','L7','L8']);
      appState.activeStage = 3;
    } else if (stage === 3) {
      setB('W15', getW(appState.bouts['W13']), getW(appState.bouts['W14']));
      setB('L9', getW(appState.bouts['L5']), getW(appState.bouts['L6']));
      setB('L10', getW(appState.bouts['L7']), getW(appState.bouts['L8']));
      lock(['W13','W14','L5','L6','L7','L8']);
      unlock(['W15','L9','L10']);
      appState.activeStage = 4;
    } else if (stage === 4) {
      setB('L11', getW(appState.bouts['L9']), getL(appState.bouts['W14']));
      setB('L12', getW(appState.bouts['L10']), getL(appState.bouts['W13']));
      lock(['W15','L9','L10']);
      unlock(['L11','L12']);
      appState.activeStage = 5;
    } else if (stage === 5) {
      setB('L13', getW(appState.bouts['L11']), getW(appState.bouts['L12']));
      lock(['L11','L12']);
      unlock(['L13']);
      appState.activeStage = 6;
    } else if (stage === 6) {
      setB('GF', getW(appState.bouts['W15']), getW(appState.bouts['L13']));
      lock(['L13']);
      unlock(['GF']);
      appState.activeStage = 7;
    } else if (stage === 7) {
      const champ = getW(appState.bouts['GF']);
      appState.champion = champ;
      lock(['GF']);
      AudioModule.sfxFanfare();
      alert(`★ CONGRATULATIONS TO ${champ ? champ.name : 'THE WINNER'}! CHAMPION OF CHICKEN WARS '26! ★`);
    }

    saveState(appState);
    await syncTournamentStateToCloud();
    renderBracket();
    renderAdminControls();
    updateScoreboard();
  }

  async function resetTournamentPrompt() {
    if (confirm("DANGER: RESET ENTIRE TOURNAMENT BRACKET, VOTES, AND HIGH SCORES?")) {
      appState = createDefaultState();
      localStorage.removeItem(AppConfig.STORAGE_KEYS.VOTE_LEDGER);
      saveState(appState);

      await executeSupabaseRest('chicken_wars_votes?id=gt.0', 'DELETE');
      await executeSupabaseRest('chicken_wars_scores?score=gte.0', 'PATCH', { score: 0, correct_picks: 0 });
      await syncTournamentStateToCloud();

      renderBracket();
      renderAdminControls();
      updateScoreboard();
      AudioModule.sfxBuzz();
    }
  }

  async function executeSupabaseRest(endpoint, method = 'GET', body = null) {
    const cleanUrl = AppConfig.SUPABASE_URL.replace(/\/+$/, '');
    const headers = {
      'apikey': AppConfig.SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${AppConfig.SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    try {
      const opts = { method, headers };
      if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(`${cleanUrl}/rest/v1/${endpoint}`, opts);
      if (!res.ok) return { success: false, status: res.status, error: await res.text() };
      const text = await res.text();
      return { success: true, data: text ? JSON.parse(text) : [] };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  function onUserLogin(username, userHash) {
    updateScoreboard();
    renderBracket();
    fetchCloudLeaderboard();
  }

  function init() {
    loadState();
    setupConfirmListener();
    renderBracket();
    fetchCloudTournamentState();
    fetchCloudLeaderboard();

    document.getElementById('admin-password-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') verifyAdminPassword();
      if (e.key === 'Escape') closeAdminAuthModal();
    });
  }

  return {
    init,
    renderBracket,
    handleVoteClick,
    closeConfirmModal,
    switchView,
    setBracketZoom,
    toggleFullscreen,
    requestAdminAuth,
    closeAdminAuthModal,
    verifyAdminPassword,
    openAdminDrawer,
    closeAdmin,
    toggleSingleBout,
    toggleAllBouts,
    advanceCurrentStage,
    resetTournamentPrompt,
    fetchCloudLeaderboard,
    onUserLogin
  };
})();
