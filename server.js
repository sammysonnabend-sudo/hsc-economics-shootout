const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");

const BANK = [
 {t:"Economic Growth",kind:"Stats",type:"stat",q:"Type the stat: Australia had approximately ___ years of uninterrupted growth from 1991 to 2020.",a:29,tol:.5,e:"Australia's 29-year growth record is a key example of sustained expansion before COVID.",remember:"29 years uninterrupted growth"},
 {t:"Economic Growth",kind:"Stats",type:"stat",q:"Type the stat: June quarter 2020 real GDP fell by approximately ___%.",a:-6.8,tol:.15,e:"The COVID recession caused a severe −6.8% quarterly fall in real GDP.",remember:"-6.8% GDP fall"},
 {t:"Economic Growth",kind:"Stats",type:"stat",q:"Type the stat: 2025 consumption contributed about +___ percentage points to GDP growth.",a:1.3,tol:.1,e:"Consumption was the largest positive AD contribution, showing household spending drives short-run growth.",remember:"consumption +1.3"},
 {t:"Economic Growth",kind:"Stats",type:"stat",q:"Type the stat: 2025 GDP per capita growth was approximately ___%.",a:.9,tol:.1,e:"GDP per capita growth of about 0.9% shows living standards improved less than total GDP.",remember:"GDP per capita 0.9%"},
 {t:"Economic Growth",kind:"Positive/Negative",type:"mcq",q:"Best evaluation of economic growth:",o:["Growth lifts living standards, but GDP ignores distribution and environmental costs","Growth lowers imports, wages and aggregate demand","Growth improves CAD but always reduces productive capacity","Growth raises CPI and removes productivity reform"],a:0,e:"Growth is valuable, but GDP does not capture distribution, unpaid work or environmental costs.",remember:"living standards but GDP limits"},
 {t:"Economic Growth",kind:"Positive/Negative",type:"mcq",q:"Which is the best negative effect of excessive growth?",o:["Inflationary pressure and environmental damage","Lower productive capacity and falling AD","Permanent deflation and lower investment","Reduced participation and lower imports"],a:0,e:"If AD grows beyond AS, inflation rises; resource-heavy growth can also damage the environment.",remember:"inflation and environment"},
 {t:"Economic Growth",kind:"Causes/Effects",type:"mcq",q:"Which factor is most important for long-run sustainable growth?",o:["Productivity and aggregate supply improvements","Temporary consumption and import increases","Higher inflation and weaker real wages","Persistent CAD and lower saving"],a:0,e:"Sustainable long-run growth depends on AS: productivity, technology, education, infrastructure and efficiency.",remember:"productivity aggregate supply"},

 {t:"Inflation",kind:"Stats",type:"stat",q:"Type the stat: CPI peaked at approximately ___% in December 2022.",a:7.8,tol:.1,e:"CPI peaked at about 7.8%, far above the RBA target.",remember:"CPI 7.8%"},
 {t:"Inflation",kind:"Stats",type:"stat",q:"Type the stat: The cash rate rose from 0.1% to ___%.",a:4.35,tol:.05,e:"The cash rate rose to 4.35% to reduce inflation pressure.",remember:"cash rate 4.35%"},
 {t:"Inflation",kind:"Stats",type:"stat",q:"Type the stat: Non-tradable inflation was about ___% in Feb 2026.",a:5,tol:.1,e:"Non-tradable inflation at 5% shows persistent domestic pressures.",remember:"non-tradable 5%"},
 {t:"Inflation",kind:"Stats",type:"stat",q:"Type the stat: Tradable inflation was about ___% in Feb 2026.",a:1.3,tol:.1,e:"Tradable inflation at 1.3% shows lower imported price pressure at that point.",remember:"tradable 1.3%"},
 {t:"Inflation",kind:"Positive/Negative",type:"mcq",q:"Which is the best positive effect of low stable inflation?",o:["It supports confidence, planning and sustainable growth","It increases uncertainty, wage claims and cost pressures","It lowers real incomes, saving and investment confidence","It removes spare capacity and guarantees full employment"],a:0,e:"Low stable inflation improves certainty for households and businesses.",remember:"confidence planning growth"},
 {t:"Inflation",kind:"Positive/Negative",type:"mcq",q:"Which is the clearest negative effect of high inflation?",o:["Lower purchasing power and increased uncertainty","Higher real wages and stronger consumer confidence","Lower cash rates and increased household borrowing","Improved terms of trade and lower import prices"],a:0,e:"High inflation reduces purchasing power and makes planning, saving and investment harder.",remember:"purchasing power uncertainty"},
 {t:"Inflation",kind:"Evaluation",type:"mcq",q:"Best evaluation of monetary policy against inflation:",o:["It reduces demand-pull inflation, but is weaker against imported cost-push inflation","It directly controls global energy and oil prices","It targets structural unemployment with little effect on AD","It raises productivity quickly but not consumption"],a:0,e:"Interest rates reduce AD, but cannot directly fix global oil, energy or supply shocks.",remember:"weak against imported cost-push"},

 {t:"Unemployment",kind:"Stats",type:"stat",q:"Type the stat: March 2026 unemployment was about ___%.",a:4.3,tol:.1,e:"Unemployment around 4.3% is near the NAIRU estimate.",remember:"unemployment 4.3%"},
 {t:"Unemployment",kind:"Stats",type:"stat",q:"Type the stat: COVID underutilisation reached about ___%.",a:18.7,tol:.2,e:"Underutilisation at 18.7% shows unemployment alone misses spare capacity.",remember:"underutilisation 18.7%"},
 {t:"Unemployment",kind:"Stats",type:"stat",q:"Type the stat: Youth accounted for about ___% of lockdown job losses.",a:55,tol:1,e:"Youth job losses show unemployment's unequal social costs.",remember:"youth 55% job losses"},
 {t:"Unemployment",kind:"Positive/Negative",type:"mcq",q:"Which is an economic cost of unemployment?",o:["Lost output, lower tax revenue and higher welfare spending","Higher productive capacity and stronger confidence","Lower inequality, higher wages and lower welfare spending","Higher terms of trade and stronger external stability"],a:0,e:"Unemployment wastes labour resources and worsens the budget.",remember:"lost output tax welfare"},
 {t:"Unemployment",kind:"Positive/Negative",type:"mcq",q:"Which is a social cost of unemployment?",o:["Poverty, inequality, skill loss and social exclusion","Higher export prices, stronger ToT and higher BOGS","Improved business confidence and stronger investment","Lower hidden unemployment and stronger participation"],a:0,e:"Unemployment has serious social costs beyond lost GDP.",remember:"poverty inequality skill loss"},
 {t:"Unemployment",kind:"Evaluation",type:"mcq",q:"Best evaluation of the unemployment rate:",o:["Useful, but it excludes hidden unemployment and underemployment","Accurate because one hour means full labour utilisation","Less useful because it includes discouraged workers and retirees","A price index because it measures inflation pressure"],a:0,e:"The official rate misses discouraged workers and underemployed workers.",remember:"hidden unemployment underemployment"},

 {t:"External Stability",kind:"Stats",type:"stat",q:"Type the stat: Australia's CAD was around ___% of GDP.",a:2.1,tol:.15,e:"A CAD around 2.1% of GDP is moderate compared with historical 3–6% CADs.",remember:"CAD 2.1% of GDP"},
 {t:"External Stability",kind:"Stats",type:"stat",q:"Type the stat: Net foreign debt was about ___% of GDP.",a:50.8,tol:.2,e:"NFD was about 50.8% of GDP.",remember:"NFD 50.8% of GDP"},
 {t:"External Stability",kind:"Stats",type:"stat",q:"Type the stat: Terms of trade peaked around ___ in 2022.",a:144,tol:1,e:"Terms of trade peaked around 144 due to high commodity prices.",remember:"terms of trade 144"},
 {t:"External Stability",kind:"Stats",type:"stat",q:"Type the stat: Terms of trade were around ___ at the end of 2025.",a:115,tol:1,e:"Terms of trade were still elevated but below the 2022 peak.",remember:"terms of trade 115"},
 {t:"External Stability",kind:"Positive/Negative",type:"mcq",q:"Which is a positive effect of a high terms of trade?",o:["Higher export income and stronger national income","Lower import prices and guaranteed disinflation","Permanent CAD removal and zero foreign liabilities","Lower participation and weaker household income"],a:0,e:"A high ToT raises export purchasing power and can improve national income.",remember:"export income national income"},
 {t:"External Stability",kind:"Positive/Negative",type:"mcq",q:"Which is a cost of high foreign debt?",o:["Debt servicing and vulnerability to global rates or confidence changes","Higher HDI and stronger income equality over time","Lower import prices and permanently stronger terms of trade","Guaranteed BOGS surplus and less need for exports"],a:0,e:"High foreign debt creates servicing costs and exposure to global financial conditions.",remember:"debt servicing vulnerability"},
 {t:"External Stability",kind:"Evaluation",type:"mcq",q:"Best evaluation of a current account deficit:",o:["It can fund productive investment, but persistent large CADs create vulnerability","It always causes a crisis because all foreign investment is unstable","It is always beneficial because foreign liabilities need no servicing","It is unrelated to savings, investment and foreign liabilities"],a:0,e:"CADs can fund investment, but persistent large CADs can create vulnerability.",remember:"investment but vulnerability"},

 {t:"Mixed Links",kind:"Evaluation",type:"mcq",q:"Which answer best evaluates fiscal stimulus?",o:["It supports growth and jobs in downturns, but can worsen inflation, debt or CAD","It improves external stability by reducing consumption and weakening AD","It lowers inflation by directly reducing household disposable income","It has no multiplier effect and cannot affect employment"],a:0,e:"Fiscal stimulus can support AD and jobs, but overuse risks inflation, debt and external pressures.",remember:"stimulus jobs but inflation debt CAD"},
 {t:"Mixed Links",kind:"Evaluation",type:"mcq",q:"Which answer best evaluates monetary tightening?",o:["It helps reduce inflation, but can slow growth, raise unemployment and hurt borrowers","It increases aggregate demand, raising output and employment immediately","It directly improves labour productivity through stronger investment","It has no household impact because only firms respond"],a:0,e:"Higher rates reduce inflation by slowing AD, but can harm growth and employment.",remember:"reduce inflation but slow growth"},
 {t:"Mixed Links",kind:"Evaluation",type:"mcq",q:"Which policy mix best manages growth trade-offs?",o:["Macro policy stabilises AD while micro reform lifts AS and productivity","Permanent stimulus increases AD regardless of capacity constraints","Higher interest rates forever maximise long-run aggregate demand","Import restrictions lower competition and improve productivity"],a:0,e:"A good policy mix stabilises demand while lifting long-run supply capacity.",remember:"macro AD micro AS"}
];

const rooms = new Map();

function makeRoom(id) {
  return {
    id,
    players: [],
    started: false,
    finished: false,
    mode: "five",
    score: [0,0],
    turn: 0,
    shooter: 0,
    phase: "waiting",
    results: [[],[]],
    used: [],
    rematch: [],
    missed: [[],[]],
    q: null,
    order: [],
    shot: null,
    lock: null,
    feedback: null,
    log: []
  };
}

function publicState(room) {
  const activeIndex = activePlayer(room);
  const q = room.q ? publicQuestion(room) : null;
  return {
    id: room.id,
    players: room.players.map(p => ({name: p.name})),
    started: room.started,
    finished: room.finished,
    mode: room.mode,
    score: room.score,
    turn: room.turn,
    shooter: room.shooter,
    activeIndex,
    phase: room.phase,
    results: room.results,
    q,
    lock: room.lock ? {player: room.lock.player, remember: room.lock.remember} : null,
    feedback: room.feedback,
    rematchCount: room.rematch.length,
    missedCounts: room.missed.map(m => m.length),
    log: room.log.slice(-8)
  };
}

function publicQuestion(room) {
  const q = room.q;
  if (q.type === "mcq") {
    return {
      t: q.t, kind: q.kind, type: q.type, q: q.q,
      options: room.order.map(i => q.o[i]),
      repeat: !!q.repeat
    };
  }
  return {t:q.t, kind:q.kind, type:q.type, q:q.q, repeat:!!q.repeat};
}

function activePlayer(room) {
  if (!room.started || room.finished) return null;
  if (room.phase === "shoot_q" || room.phase === "choose_shot") return room.shooter;
  if (room.phase === "defend_q" || room.phase === "choose_dive") return 1 - room.shooter;
  if (room.phase === "resolved") return null;
  return null;
}

function broadcast(room) {
  const msg = JSON.stringify({type:"state", state: publicState(room)});
  for (const p of room.players) {
    if (p.ws.readyState === WebSocket.OPEN) p.ws.send(msg);
  }
}

function sendError(ws, text) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({type:"error", text}));
}

function randomRoomId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i=0;i<5;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i=a.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function pickQuestion(room, playerIndex) {
  const due = room.rematch.filter(x => x.player === playerIndex && x.due <= room.turn);
  if (due.length && Math.random() < 0.75) {
    const item = due[Math.floor(Math.random()*due.length)];
    room.rematch = room.rematch.filter(x => x.id !== item.id);
    return {...item.q, repeat:true};
  }

  if (room.used.length >= BANK.length) room.used = [];
  const available = BANK.map((_,i)=>i).filter(i => !room.used.includes(i));
  const evals = available.filter(i => BANK[i].kind === "Evaluation" || BANK[i].kind === "Positive/Negative");
  const stats = available.filter(i => BANK[i].type !== "mcq");
  let pool = available;
  if (Math.random() < 0.45 && evals.length) pool = evals;
  else if (Math.random() < 0.30 && stats.length) pool = stats;
  const idx = pool[Math.floor(Math.random()*pool.length)];
  room.used.push(idx);
  return {...BANK[idx], repeat:false};
}

function prepareQuestion(room, playerIndex) {
  room.q = pickQuestion(room, playerIndex);
  room.order = room.q.type === "mcq" ? shuffle(room.q.o.map((_,i)=>i)) : [];
  room.feedback = null;
}

function startMatch(room) {
  room.started = true;
  room.finished = false;
  room.score = [0,0];
  room.turn = 0;
  room.shooter = 0;
  room.phase = "shoot_q";
  room.results = [[],[]];
  room.used = [];
  room.rematch = [];
  room.missed = [[],[]];
  room.shot = null;
  room.lock = null;
  room.feedback = null;
  room.log = [];
  prepareQuestion(room, room.shooter);
}

function scheduleRematch(room, player, q) {
  room.rematch.push({
    id: Date.now() + Math.random(),
    player,
    due: room.turn + 3 + Math.floor(Math.random()*3),
    q: {...q}
  });
}

function answerQuestion(room, playerIndex, payload) {
  if (room.lock) return {error:"Memory lock must be completed first."};
  if (activePlayer(room) !== playerIndex) return {error:"It is not your turn."};
  if (!(room.phase === "shoot_q" || room.phase === "defend_q")) return {error:"No question to answer right now."};
  const q = room.q;
  let ok = false;

  if (q.type === "mcq") {
    const displayIdx = Number(payload.displayIndex);
    const originalIdx = room.order[displayIdx];
    ok = originalIdx === q.a;
  } else {
    const num = parseFloat(String(payload.value ?? "").replace("%","").trim());
    ok = Number.isFinite(num) && Math.abs(num - q.a) <= q.tol;
  }

  if (ok) {
    room.feedback = {kind:"good", title:"Correct", text:q.e};
    if (room.phase === "shoot_q") room.phase = "choose_shot";
    else room.phase = "choose_dive";
  } else {
    room.missed[playerIndex].push(q);
    scheduleRematch(room, playerIndex, q);
    room.lock = {player: playerIndex, remember: q.remember};
    if (room.phase === "shoot_q") {
      room.results[room.shooter].push("✗");
      room.feedback = {kind:"bad", title:"Wrong — chance wasted", text:wrongText(q, payload)};
      room.phase = "resolved";
      room.log.push(`${room.players[room.shooter]?.name || "Shooter"} missed after a wrong answer.`);
    } else {
      room.score[room.shooter]++;
      room.results[room.shooter].push("●");
      room.feedback = {kind:"bad", title:"Wrong — goal conceded", text:wrongText(q, payload)};
      room.phase = "resolved";
      room.log.push(`${room.players[room.shooter]?.name || "Shooter"} scored because defender missed the question.`);
    }
  }
  return {ok};
}

function wrongText(q, payload) {
  if (q.type === "mcq") {
    return `The strongest answer was: ${q.o[q.a]}. ${q.e}`;
  }
  return `Correct stat: ${q.a}. ${q.e}`;
}

function chooseShot(room, playerIndex, dir) {
  if (room.lock) return {error:"Memory lock must be completed first."};
  if (room.phase !== "choose_shot" || room.shooter !== playerIndex) return {error:"You cannot shoot right now."};
  if (!["top-left","left","center","right","top-right"].includes(dir)) return {error:"Invalid shot."};
  room.shot = dir;
  room.phase = "defend_q";
  prepareQuestion(room, 1 - room.shooter);
  room.feedback = {kind:"neutral", title:"Shot chosen", text:"Defender must answer to read the shot."};
  return {ok:true};
}

function chooseDive(room, playerIndex, dir) {
  if (room.lock) return {error:"Memory lock must be completed first."};
  if (room.phase !== "choose_dive" || playerIndex !== 1 - room.shooter) return {error:"You cannot dive right now."};
  if (!["top-left","left","center","right","top-right"].includes(dir)) return {error:"Invalid dive."};

  if (dir === room.shot) {
    room.results[room.shooter].push("🧤");
    room.feedback = {kind:"good", title:"SAVE", text:"Correct answer and correct dive."};
    room.log.push(`${room.players[playerIndex]?.name || "Defender"} saved the penalty.`);
  } else {
    room.score[room.shooter]++;
    room.results[room.shooter].push("●");
    room.feedback = {kind:"bad", title:"GOAL", text:`The shot went ${room.shot}.`};
    room.log.push(`${room.players[room.shooter]?.name || "Shooter"} scored.`);
  }
  room.phase = "resolved";
  return {ok:true};
}

function completeLock(room, playerIndex, text) {
  if (!room.lock) return {error:"No memory lock."};
  if (room.lock.player !== playerIndex) return {error:"Only the player who got it wrong can unlock this."};
  const typed = String(text || "").toLowerCase();
  const words = room.lock.remember.toLowerCase().split(/\s+/).filter(w => w.length > 2).slice(0,4);
  const ok = words.every(w => typed.includes(w.replace("%","")));
  if (!ok) return {error:"Type the correction more closely."};
  room.lock = null;
  return {ok:true};
}

function nextTurn(room) {
  if (room.lock) return {error:"Memory lock must be completed first."};
  if (room.phase !== "resolved") return {error:"Current turn is not finished."};
  if (room.mode === "five" && room.turn >= 9 && room.score[0] !== room.score[1]) {
    room.finished = true;
    return {ok:true};
  }
  room.turn++;
  room.shooter = 1 - room.shooter;
  room.phase = "shoot_q";
  room.shot = null;
  room.feedback = null;
  prepareQuestion(room, room.shooter);
  return {ok:true};
}

const server = http.createServer((req,res) => {
  let filePath = req.url.split("?")[0];
  if (filePath === "/" || filePath === "") filePath = "/index.html";
  const full = path.join(PUBLIC_DIR, filePath);
  if (!full.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); res.end("Forbidden"); return;
  }
  fs.readFile(full, (err,data) => {
    if (err) { res.writeHead(404); res.end("Not found"); return; }
    const ext = path.extname(full);
    const type = ext === ".html" ? "text/html" : ext === ".css" ? "text/css" : ext === ".js" ? "application/javascript" : "application/octet-stream";
    res.writeHead(200, {"Content-Type": type});
    res.end(data);
  });
});

const wss = new WebSocket.Server({server});

wss.on("connection", ws => {
  ws.roomId = null;
  ws.playerIndex = null;

  ws.on("message", raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { sendError(ws,"Bad message."); return; }

    if (msg.type === "create") {
      let id;
      do { id = randomRoomId(); } while (rooms.has(id));
      const room = makeRoom(id);
      rooms.set(id, room);
      joinRoom(ws, room, msg.name || "Player 1");
      return;
    }

    if (msg.type === "join") {
      const id = String(msg.room || "").toUpperCase().trim();
      if (!id) { sendError(ws,"Room code missing."); return; }
      const room = rooms.get(id) || makeRoom(id);
      rooms.set(id, room);
      joinRoom(ws, room, msg.name || `Player ${room.players.length+1}`);
      return;
    }

    const room = rooms.get(ws.roomId);
    if (!room) { sendError(ws,"Join a room first."); return; }

    let result = {ok:false};
    if (msg.type === "start") {
      if (room.players.length < 2) result = {error:"Need two players first."};
      else { startMatch(room); result = {ok:true}; }
    } else if (msg.type === "answer") result = answerQuestion(room, ws.playerIndex, msg);
    else if (msg.type === "shot") result = chooseShot(room, ws.playerIndex, msg.dir);
    else if (msg.type === "dive") result = chooseDive(room, ws.playerIndex, msg.dir);
    else if (msg.type === "lock") result = completeLock(room, ws.playerIndex, msg.text);
    else if (msg.type === "next") result = nextTurn(room);
    else result = {error:"Unknown action."};

    if (result.error) sendError(ws, result.error);
    broadcast(room);
  });

  ws.on("close", () => {
    const room = rooms.get(ws.roomId);
    if (!room) return;
    const p = room.players.find(p => p.ws === ws);
    if (p) p.connected = false;
    broadcast(room);
  });
});

function joinRoom(ws, room, name) {
  let existing = room.players.find(p => !p.connected);
  if (existing) {
    existing.ws = ws;
    existing.connected = true;
    existing.name = name || existing.name;
    ws.playerIndex = existing.index;
  } else {
    if (room.players.length >= 2) {
      sendError(ws, "Room already has two players.");
      return;
    }
    ws.playerIndex = room.players.length;
    room.players.push({index: ws.playerIndex, name, ws, connected:true});
  }
  ws.roomId = room.id;
  ws.send(JSON.stringify({type:"joined", room:room.id, playerIndex:ws.playerIndex}));
  broadcast(room);
}

server.listen(PORT, () => {
  console.log(`HSC Economics realtime shootout running on port ${PORT}`);
});
