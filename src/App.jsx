import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ChevronDown, ChevronUp, Dumbbell, Calendar, TrendingUp, ClipboardList,
  Info, Check, Flame, RotateCcw, X,
} from "lucide-react";

/* ----------------------------- PROGRAM DATA ----------------------------- */
// Source: The Min-Max Program (5x/Week) by Jeff Nippard -- transcribed from the user's spreadsheet.

const DAY_ORDER = ["Upper 1", "Lower 1", "Rest", "Upper 2", "Lower 2", "Arms/Delts", "Rest"];
const TRAIN_DAYS = ["Upper 1", "Lower 1", "Upper 2", "Lower 2", "Arms/Delts"];

const EXERCISES = {
  "Upper 1": [
    { id: "u1-incline-press", name: "Barbell Incline Press", warmup: "2-4", working: 2, reps: "6-8", rest: "3-5 min", sub1: "Smith Machine Incline Press", sub2: "DB Incline Press", notes: "30° or 45° bench. Pause 1 second at the bottom while keeping tension on the pecs.", normalRIR: [1, 0], introRIR: [2, 1], technique: null },
    { id: "u1-pec-deck", name: "Pec Deck", warmup: "1-2", working: 2, reps: "6-8", rest: "1-2 min", sub1: "DB Flye", sub2: "Cable Flye", notes: "Pause 1 second at the bottom while keeping tension on the pecs.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Two Drop Sets (~25% per)" },
    { id: "u1-incline-yraise", name: "Incline DB Y-Raise", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "Cable Y-Raise", sub2: "Machine Lateral Raise", notes: "30° incline bench, back against it. Lift the weight up and out in a Y shape.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
    { id: "u1-pullup", name: "Pull-Up (Wide Grip)", warmup: "1-2", working: 2, reps: "6-8", rest: "2-3 min", sub1: "Lat Pulldown (Wide Grip)", sub2: "1-Arm Cable Pulldown", notes: "Control the negative and feel your lats pulling apart. Full ROM.", normalRIR: [1, 0], introRIR: [2, 1], technique: "Lengthened Partials (Extend Set)" },
    { id: "u1-kelso", name: "Kelso Shrug", warmup: "1-2", working: 2, reps: "6-8", rest: "2-3 min", sub1: "Seated Cable Kelso Shrug", sub2: "Incline DB Kelso Shrug", notes: "Pause ~1 second at the top, then let shoulder blades peel apart on the way down, under control.", normalRIR: [1, 0], introRIR: [2, 1], technique: null },
    { id: "u1-preacher-curl", name: "EZ-Bar Preacher Curl", warmup: "0-1", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Machine Preacher Curl", sub2: "DB Preacher Curl", notes: "Keep triceps pinned to the pad. Smooth, controlled reps.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Myo-reps" },
    { id: "u1-pressdown", name: "Triceps Pressdown", warmup: "0-1", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Close-Grip Bench Press", sub2: "Smith Machine JM Press", notes: "Rope or bar attachment, whichever feels more comfortable.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Myo-reps" },
    { id: "u1-dragon-flag", name: "Dragon Flag", warmup: "0-1", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Bent-Knee Dragon Flag", sub2: "Lying Leg Raise", notes: "Keep your body as rigid as possible through the full ROM.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
  ],
  "Lower 1": [
    { id: "l1-leg-curl", name: "Lying Leg Curl", warmup: "1-2", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Seated Leg Curl", sub2: "Nordic Ham Curl", notes: "Biggest stretch possible at the bottom. Don't let your butt pop up as you curl.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Lengthened Partials (Extend Set)" },
    { id: "l1-squat", name: "Squat (Your Choice)", warmup: "2-4", working: 2, reps: "6-8", rest: "3-5 min", sub1: "See notes", sub2: "See notes", notes: "Barbell Back Squat, Front Squat, Pendulum, Hack, Belt, or Smith Machine Squat.", normalRIR: [1, 0], introRIR: [3, 2], technique: null },
    { id: "l1-lunge", name: "Smith Machine Lunge", warmup: "2-4", working: 1, reps: "6-8", rest: "2-4 min", sub1: "DB Lunge", sub2: "Barbell Lunge", notes: "Minimize contribution from your back leg.", normalRIR: [0, null], introRIR: [1, null], technique: null },
    { id: "l1-leg-ext", name: "Leg Extension", warmup: "1-2", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Reverse Nordic", sub2: "Sissy Squat", notes: "Seat back as far as comfortable. Pull your butt into the seat -- straps can help.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Lengthened Partials (Extend Set)" },
    { id: "l1-hip-abd", name: "Machine Hip Abduction", warmup: "0-1", working: 1, reps: "6-8", rest: "1-2 min", sub1: "Cable Hip Abduction", sub2: "Standing Plate Abduction", notes: "Foam pads between knees and the machine pads increase ROM if available.", normalRIR: [0, null], introRIR: [0, null], technique: null },
    { id: "l1-calf", name: "Standing Calf Raise", warmup: "0-1", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Leg Press Calf Press", sub2: "Donkey Calf Raise", notes: "1-2 sec pause at the bottom; roll your ankle on the balls of your feet.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Lengthened Partials (Extend Set)" },
  ],
  "Upper 2": [
    { id: "u2-cg-pulldown", name: "Close-Grip Lat Pulldown", warmup: "2-3", working: 2, reps: "8-10", rest: "2-3 min", sub1: "Close-Grip Pull-Up", sub2: "1-Arm Cable Pulldown", notes: "Lean back ~15°, drive elbows down, squeeze shoulder blades together. Mix of lats and mid-traps.", normalRIR: [1, 0], introRIR: [2, 1], technique: "Lengthened Partials (Extend Set)" },
    { id: "u2-tbar-row", name: "Chest-Supported T-Bar Row", warmup: "2-3", working: 2, reps: "8-10", rest: "2-3 min", sub1: "Chest-Supported Machine Row", sub2: "Chest-Supported DB Row", notes: "Flare elbows ~45° and squeeze shoulder blades together hard at the top.", normalRIR: [1, 0], introRIR: [2, 1], technique: "Two Drop Sets (~25% per)" },
    { id: "u2-shrug", name: "Machine Shrug", warmup: "1-2", working: 1, reps: "6-8", rest: "1-2 min", sub1: "Barbell Shrug", sub2: "Cable Shrug-In", notes: "Shrug \"up to your ears.\" Use straps if possible.", normalRIR: [0, null], introRIR: [1, null], technique: null },
    { id: "u2-chest-press", name: "Machine Chest Press", warmup: "2-4", working: 2, reps: "8-10", rest: "3-5 min", sub1: "Smith Machine Bench Press", sub2: "DB Bench Press", notes: "1 second pause at the bottom while keeping tension on the pecs.", normalRIR: [1, 0], introRIR: [2, 1], technique: "Weighted Static Hold (30 sec)" },
    { id: "u2-hc-lateral", name: "High-Cable Lateral Raise", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "DB Lateral Raise", sub2: "Machine Lateral Raise", notes: "Cable at hip height. Let your hand pass slightly past your midline at the bottom for a deep stretch.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
    { id: "u2-rev-pec-deck", name: "1-Arm Reverse Pec Deck", warmup: "0-1", working: 1, reps: "8-10", rest: "1-2 min", sub1: "Lying Reverse DB Flye", sub2: "Reverse Cable Crossover", notes: "Sweep the weight out to create the largest semi-circle possible with your arm.", normalRIR: [0, null], introRIR: [0, null], technique: null },
    { id: "u2-cable-crunch", name: "Cable Crunch", warmup: "0-1", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Weighted Crunch", sub2: "Machine Crunch", notes: "Round your lower back as you crunch. Maintain a mind-muscle connection.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
  ],
  "Lower 2": [
    { id: "l2-leg-ext", name: "Leg Extension", warmup: "1-2", working: 2, reps: "8-10", rest: "1-2 min", sub1: "Reverse Nordic", sub2: "Sissy Squat", notes: "Seat back as far as comfortable. Pull your butt into the seat -- straps can help.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Lengthened Partials (Extend Set)" },
    { id: "l2-rdl", name: "Barbell RDL", warmup: "2-3", working: 2, reps: "6-8", rest: "2-3 min", sub1: "DB RDL", sub2: "Seated Cable Deadlift", notes: "Glutes straight back, bar centered over mid-foot. Deep stretch, keep your spine neutral.", normalRIR: [2, 1], introRIR: [3, 2], technique: null },
    { id: "l2-hip-thrust", name: "Machine Hip Thrust", warmup: "2-4", working: 2, reps: "6-8", rest: "2-3 min", sub1: "Barbell Hip Thrust", sub2: "45° Hyperextension", notes: "Squeeze glutes hard at the top and control the weight on the way down.", normalRIR: [1, 0], introRIR: [2, 1], technique: null },
    { id: "l2-leg-press", name: "Leg Press", warmup: "2-4", working: 1, reps: "6-8", rest: "2-3 min", sub1: "Smith Machine Squat", sub2: "Barbell Squat", notes: "Feet lower on the platform for more quad focus. Get deep without excessive back rounding.", normalRIR: [0, null], introRIR: [1, null], technique: null },
    { id: "l2-calf", name: "Standing Calf Raise", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "Leg Press Calf Press", sub2: "Donkey Calf Raise", notes: "1-2 sec pause at the bottom; roll your ankle on the balls of your feet.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Lengthened Partials (Extend Set)" },
  ],
  "Arms/Delts": [
    { id: "ad-bayesian-curl", name: "Bayesian Cable Curl", warmup: "0-1", working: 2, reps: "6-8", rest: "1-2 min", sub1: "Incline DB Curl", sub2: "Standing DB Curl", notes: "Optionally lean forward to keep the cable off your wrist. Control the negative for a deep stretch.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
    { id: "ad-oh-triceps", name: "Overhead Cable Triceps Extension", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "Overhead DB Triceps Extension", sub2: "Skull Crusher", notes: "Feel a deep stretch on the triceps throughout the entire negative.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
    { id: "ad-zottman", name: "Modified Zottman Curl", warmup: "0-1", working: 1, reps: "8-10", rest: "1-2 min", sub1: "DB Hammer Curl", sub2: "Preacher Hammer Curl", notes: "Hammer curl on the way up, supinated (palms up) curl on the way down.", normalRIR: [0, null], introRIR: [0, null], technique: null },
    { id: "ad-kickback", name: "Cable Triceps Kickback", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "Seated Dip Machine", sub2: "Close-Grip Dip", notes: "Keep your upper arm behind your torso throughout the ROM.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Two Drop Sets (~25% per)" },
    { id: "ad-wrist-curl", name: "DB Wrist Curl", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "Cable Wrist Curl", sub2: null, notes: "Smooth, controlled reps.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
    { id: "ad-wrist-ext", name: "DB Wrist Extension", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "Cable Wrist Extension", sub2: null, notes: "Smooth, controlled reps.", normalRIR: [0, 0], introRIR: [1, 0], technique: null },
    { id: "ad-alt-curl", name: "Alternating DB Curl", warmup: "0-1", working: 1, reps: "6-8", rest: "1-2 min", sub1: "Barbell Curl", sub2: "EZ-Bar Curl", notes: "Slow, controlled reps.", normalRIR: [0, null], introRIR: [0, null], technique: "Two Drop Sets (~25% per)" },
    { id: "ad-lateral", name: "Machine Lateral Raise", warmup: "0-1", working: 2, reps: "8-10", rest: "1-2 min", sub1: "High-Cable Lateral Raise", sub2: "DB Lateral Raise", notes: "Focus on squeezing your side delt to move the weight.", normalRIR: [0, 0], introRIR: [1, 0], technique: "Myo-reps" },
    { id: "ad-dead-hang", name: "Dead Hang (optional)", warmup: "0-1", working: 2, reps: "N/A", rest: "1-2 min", sub1: null, sub2: null, notes: "Try to add a few more seconds each week.", normalRIR: [0, 0], introRIR: [0, 0], technique: null },
  ],
};

const ALL_EXERCISES = Object.values(EXERCISES).flat();

const PHASE_INFO = {
  intro: { label: "Intro Week", color: "bg-amber-500", text: "text-amber-400" },
  accumulation: { label: "Accumulation", color: "bg-neutral-500", text: "text-neutral-300" },
  deload: { label: "Deload Week", color: "bg-red-500", text: "text-red-400" },
  intensification: { label: "Intensification", color: "bg-orange-500", text: "text-orange-400" },
};

function getPhase(week) {
  if (week === 1) return "intro";
  if (week === 7) return "deload";
  if (week >= 8) return "intensification";
  return "accumulation";
}
function isIntroPhase(week) { return week === 1 || week === 7; }
function hasTechnique(week) { return week >= 8; }

function estOneRM(load, reps) {
  if (!load || !reps) return 0;
  if (reps <= 1) return load;
  return Math.round(load * (1 + reps / 30));
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ------------------------------- STORAGE --------------------------------
   Uses the browser's localStorage so data persists on-device between
   sessions (works fully offline once the app is installed). */
async function loadKey(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function saveKey(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("storage save failed", e);
  }
}

/* --------------------------------- APP ----------------------------------- */
export default function App() {
  const [tab, setTab] = useState("today");
  const [logs, setLogs] = useState(null);
  const [checkins, setCheckins] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    (async () => {
      setLogs(await loadKey("minmax-logs", []));
      setCheckins(await loadKey("minmax-checkins", []));
      setSettings(await loadKey("minmax-settings", { startDate: null }));
    })();
  }, []);

  const ready = logs !== null && checkins !== null && settings !== null;

  const persistLogs = useCallback(async (next) => {
    setLogs(next);
    await saveKey("minmax-logs", next);
  }, []);
  const persistCheckins = useCallback(async (next) => {
    setCheckins(next);
    await saveKey("minmax-checkins", next);
  }, []);
  const persistSettings = useCallback(async (next) => {
    setSettings(next);
    await saveKey("minmax-settings", next);
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="text-neutral-500 font-mono text-sm tracking-wide">LOADING PROGRAM…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans pb-24">
      <Header />
      <NavTabs tab={tab} setTab={setTab} />
      <main className="max-w-3xl mx-auto px-4 pt-5">
        {tab === "today" && (
          <TodayTab logs={logs} setLogs={persistLogs} settings={settings} setSettings={persistSettings} />
        )}
        {tab === "progress" && <ProgressTab logs={logs} />}
        {tab === "checkin" && <CheckInTab checkins={checkins} setCheckins={persistCheckins} />}
        {tab === "schedule" && <ScheduleTab settings={settings} setSettings={persistSettings} />}
      </main>
    </div>
  );
}

/* -------------------------------- HEADER --------------------------------- */
function Header() {
  return (
    <div className="border-b border-neutral-800 bg-neutral-950 sticky top-0 z-20">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-sm bg-orange-500 flex items-center justify-center shrink-0">
          <Dumbbell size={18} className="text-neutral-950" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight leading-none">MIN-MAX</h1>
          <p className="text-[11px] text-neutral-500 font-mono tracking-widest uppercase">5x Program Tracker</p>
        </div>
      </div>
    </div>
  );
}

function NavTabs({ tab, setTab }) {
  const items = [
    { id: "today", label: "Today", icon: Calendar },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "checkin", label: "Check-In", icon: ClipboardList },
    { id: "schedule", label: "Schedule", icon: Info },
  ];
  return (
    <div className="border-b border-neutral-800 bg-neutral-950 sticky top-[65px] z-10">
      <div className="max-w-3xl mx-auto px-4 flex">
        {items.map((it) => {
          const Icon = it.icon;
          const active = tab === it.id;
          return (
            <button
              key={it.id}
              onClick={() => setTab(it.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 border-b-2 transition-colors ${
                active ? "border-orange-500 text-orange-400" : "border-transparent text-neutral-500"
              }`}
            >
              <Icon size={16} />
              <span className="text-[11px] font-mono tracking-wide uppercase">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- WEEK STRIP ------------------------------- */
function WeekStrip({ week, setWeek }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 12 }, (_, i) => i + 1).map((w) => {
        const phase = getPhase(w);
        const info = PHASE_INFO[phase];
        const active = w === week;
        return (
          <button
            key={w}
            onClick={() => setWeek(w)}
            title={`Week ${w} -- ${info.label}`}
            className={`flex-1 h-7 rounded-sm relative transition-all ${active ? "ring-2 ring-offset-2 ring-offset-neutral-950 ring-orange-500" : "opacity-60 hover:opacity-100"}`}
          >
            <div className={`absolute inset-0 rounded-sm ${info.color}`} />
            <span className="relative text-[10px] font-mono font-bold text-neutral-950">{w}</span>
          </button>
        );
      })}
    </div>
  );
}

/* --------------------------------- TODAY ---------------------------------- */
function TodayTab({ logs, setLogs, settings, setSettings }) {
  const recommended = useMemo(() => {
    if (!settings.startDate) return { week: 1, dayIdx: 0 };
    const start = new Date(settings.startDate + "T00:00:00");
    const now = new Date();
    const daysSince = Math.max(0, Math.floor((now - start) / 86400000));
    const dayIdx = daysSince % 7;
    const week = Math.min(12, Math.floor(daysSince / 7) + 1);
    return { week, dayIdx };
  }, [settings.startDate]);

  const [week, setWeek] = useState(recommended.week);
  const [dayIdx, setDayIdx] = useState(recommended.dayIdx);
  const [date, setDate] = useState(todayISO());
  const [inputs, setInputs] = useState({});
  const [openNotes, setOpenNotes] = useState({});
  const [saved, setSaved] = useState(false);

  const dayType = DAY_ORDER[dayIdx];
  const exercises = EXERCISES[dayType] || [];
  const phase = getPhase(week);
  const intro = isIntroPhase(week);
  const tech = hasTechnique(week);

  const lastPerformance = useCallback(
    (exId) => {
      for (let i = logs.length - 1; i >= 0; i--) {
        const ex = logs[i].exercises.find((e) => e.id === exId);
        if (ex) return { date: logs[i].date, sets: ex.sets };
      }
      return null;
    },
    [logs]
  );

  useEffect(() => {
    const init = {};
    exercises.forEach((ex) => {
      const prev = lastPerformance(ex.id);
      init[ex.id] = Array.from({ length: ex.working }, (_, i) => ({
        load: "",
        reps: "",
        placeholderLoad: prev?.sets?.[i]?.load ?? "",
        placeholderReps: prev?.sets?.[i]?.reps ?? "",
      }));
    });
    setInputs(init);
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayType, week]);

  function updateSet(exId, setIdx, field, value) {
    setInputs((prev) => {
      const next = { ...prev };
      const sets = [...next[exId]];
      sets[setIdx] = { ...sets[setIdx], [field]: value };
      next[exId] = sets;
      return next;
    });
  }

  function thisWeekSessions() {
    if (!settings.startDate) return logs.filter((l) => l.date === date).length;
    return logs.filter((l) => l.week === week).length;
  }

  async function handleSave() {
    const exObjs = exercises
      .map((ex) => {
        const sets = (inputs[ex.id] || [])
          .map((s) => ({ load: s.load === "" ? null : Number(s.load), reps: s.reps === "" ? null : Number(s.reps) }))
          .filter((s) => s.load !== null || s.reps !== null);
        return sets.length ? { id: ex.id, name: ex.name, sets } : null;
      })
      .filter(Boolean);

    if (!exObjs.length) return;

    const session = { id: `${Date.now()}`, date, week, dayType, exercises: exObjs };
    const next = [...logs, session];
    await setLogs(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function useRecommended() {
    setWeek(recommended.week);
    setDayIdx(recommended.dayIdx);
  }

  const isOffRecommended = week !== recommended.week || dayIdx !== recommended.dayIdx;

  return (
    <div className="space-y-5">
      {!settings.startDate && (
        <StartDatePrompt onSet={(d) => setSettings({ ...settings, startDate: d })} />
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-500">Week {week} of 12</span>
          <span className={`text-[11px] font-mono uppercase tracking-widest ${PHASE_INFO[phase].text}`}>
            {PHASE_INFO[phase].label}
          </span>
        </div>
        <WeekStrip week={week} setWeek={setWeek} />
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {DAY_ORDER.map((d, i) => {
          const active = i === dayIdx;
          const isRest = d === "Rest";
          return (
            <button
              key={i}
              onClick={() => setDayIdx(i)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wide border transition-colors ${
                active
                  ? "bg-orange-500 border-orange-500 text-neutral-950 font-bold"
                  : isRest
                  ? "border-neutral-800 text-neutral-600"
                  : "border-neutral-800 text-neutral-300 hover:border-neutral-600"
              }`}
            >
              {isRest ? `Rest` : d}
            </button>
          );
        })}
      </div>

      {settings.startDate && isOffRecommended && (
        <button
          onClick={useRecommended}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-orange-400 font-mono"
        >
          <RotateCcw size={12} /> Jump to recommended (Week {recommended.week}, {DAY_ORDER[recommended.dayIdx]})
        </button>
      )}

      {dayType === "Rest" ? (
        <RestCard week={week} sessions={thisWeekSessions()} />
      ) : (
        <>
          <div className="flex items-center justify-between bg-neutral-900 border border-neutral-800 rounded-sm px-3 py-2.5">
            <div>
              <div className="text-sm font-bold">{dayType}</div>
              <div className="text-[11px] text-neutral-500 font-mono">{exercises.length} exercises</div>
            </div>
            <label className="flex items-center gap-2 text-xs text-neutral-400">
              Date
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1 text-neutral-200 text-xs font-mono"
              />
            </label>
          </div>

          <div className="space-y-3">
            {exercises.map((ex) => (
              <ExerciseCard
                key={ex.id}
                ex={ex}
                week={week}
                intro={intro}
                tech={tech}
                inputs={inputs[ex.id] || []}
                updateSet={updateSet}
                open={!!openNotes[ex.id]}
                toggleOpen={() => setOpenNotes((p) => ({ ...p, [ex.id]: !p[ex.id] }))}
                last={lastPerformance(ex.id)}
              />
            ))}
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold py-3 rounded-sm flex items-center justify-center gap-2 transition-colors"
          >
            {saved ? (
              <>
                <Check size={18} /> Saved
              </>
            ) : (
              "Log Workout"
            )}
          </button>
        </>
      )}
    </div>
  );
}

function StartDatePrompt({ onSet }) {
  const [val, setVal] = useState(todayISO());
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 flex items-center justify-between gap-3">
      <div className="text-xs text-neutral-400">
        Set your program start date so Today can recommend your week &amp; workout automatically.
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="date"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          className="bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1 text-neutral-200 text-xs font-mono"
        />
        <button
          onClick={() => onSet(val)}
          className="bg-orange-500 text-neutral-950 text-xs font-bold px-3 py-1.5 rounded-sm"
        >
          Set
        </button>
      </div>
    </div>
  );
}

function RestCard({ week, sessions }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-8 text-center">
      <div className="text-2xl mb-1">😴</div>
      <div className="font-bold mb-1">Rest Day</div>
      <p className="text-xs text-neutral-500 max-w-xs mx-auto">
        Recovery is where the adaptation happens. You've logged {sessions} of 5 sessions for Week {week}.
      </p>
    </div>
  );
}

function ExerciseCard({ ex, week, intro, tech, inputs, updateSet, open, toggleOpen, last }) {
  const rir = intro ? ex.introRIR : ex.normalRIR;
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-sm overflow-hidden">
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-semibold text-sm leading-tight">{ex.name}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] font-mono text-neutral-500">
              <span>Warm-up {ex.warmup}</span>
              <span>{ex.working} working × {ex.reps}</span>
              <span>Rest {ex.rest}</span>
            </div>
          </div>
          {tech && ex.technique && (
            <span className="shrink-0 text-[10px] font-mono uppercase tracking-wide bg-neutral-800 text-orange-400 border border-orange-900 rounded-sm px-1.5 py-0.5">
              {ex.technique}
            </span>
          )}
        </div>

        {last && (
          <div className="mt-2 text-[11px] text-neutral-500 font-mono">
            Last ({fmtDate(last.date)}): {last.sets.map((s, i) => `${s.load ?? "–"}×${s.reps ?? "–"}`).join(", ")}
          </div>
        )}

        <div className="mt-3 space-y-1.5">
          {inputs.map((s, i) => {
            const targetRIR = rir[i];
            const isFailure = targetRIR === 0;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-10 text-[11px] font-mono text-neutral-500">Set {i + 1}</span>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder={s.placeholderLoad !== "" ? String(s.placeholderLoad) : "lbs"}
                  value={s.load}
                  onChange={(e) => updateSet(ex.id, i, "load", e.target.value)}
                  className="w-20 bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1.5 text-sm font-mono text-neutral-100 placeholder-neutral-600"
                />
                <span className="text-neutral-600 text-xs">×</span>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder={s.placeholderReps !== "" ? String(s.placeholderReps) : "reps"}
                  value={s.reps}
                  onChange={(e) => updateSet(ex.id, i, "reps", e.target.value)}
                  className="w-16 bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1.5 text-sm font-mono text-neutral-100 placeholder-neutral-600"
                />
                {targetRIR !== null && targetRIR !== undefined && (
                  <span
                    className={`ml-auto text-[10px] font-mono uppercase tracking-wide px-1.5 py-0.5 rounded-sm border ${
                      isFailure
                        ? "bg-orange-950 text-orange-400 border-orange-800"
                        : "bg-neutral-950 text-neutral-400 border-neutral-700"
                    }`}
                  >
                    {isFailure ? "Failure" : `RIR ${targetRIR}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={toggleOpen}
          className="mt-2 flex items-center gap-1 text-[11px] text-neutral-500 hover:text-neutral-300"
        >
          {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Notes &amp; substitutions
        </button>

        {open && (
          <div className="mt-2 pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
            <p>{ex.notes}</p>
            {(ex.sub1 || ex.sub2) && (
              <p className="text-neutral-500">
                Subs: {[ex.sub1, ex.sub2].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------- PROGRESS --------------------------------- */
function ProgressTab({ logs }) {
  const exNames = useMemo(() => {
    const seen = new Set();
    const arr = [];
    ALL_EXERCISES.forEach((e) => {
      if (!seen.has(e.name) && e.reps !== "N/A") {
        seen.add(e.name);
        arr.push({ id: e.id, name: e.name });
      }
    });
    return arr;
  }, []);

  const [selected, setSelected] = useState(exNames[0]?.id || "");

  const history = useMemo(() => {
    return logs
      .filter((l) => l.exercises.some((e) => e.id === selected))
      .map((l) => {
        const ex = l.exercises.find((e) => e.id === selected);
        const validSets = ex.sets.filter((s) => s.load && s.reps);
        const topSet = validSets.reduce(
          (best, s) => (estOneRM(s.load, s.reps) > estOneRM(best.load, best.reps) ? s : best),
          validSets[0] || { load: 0, reps: 0 }
        );
        return {
          date: l.date,
          label: fmtDate(l.date),
          topLoad: topSet.load || 0,
          topReps: topSet.reps || 0,
          est1RM: estOneRM(topSet.load, topSet.reps),
          volume: ex.sets.reduce((sum, s) => sum + (s.load || 0) * (s.reps || 0), 0),
        };
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [logs, selected]);

  const totalSessions = logs.length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        <StatBox label="Sessions Logged" value={totalSessions} />
        <StatBox label="Exercises Tracked" value={new Set(logs.flatMap((l) => l.exercises.map((e) => e.id))).size} />
        <StatBox
          label="This Week"
          value={
            logs.filter((l) => {
              const d = new Date(l.date);
              const now = new Date();
              const diff = (now - d) / 86400000;
              return diff <= 7 && diff >= 0;
            }).length
          }
        />
      </div>

      <div>
        <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 block mb-1.5">
          Exercise
        </label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-sm px-3 py-2 text-sm text-neutral-100"
        >
          {exNames.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>

      {history.length === 0 ? (
        <EmptyState text="No logged sets for this exercise yet. Log a workout on the Today tab to start tracking progress." />
      ) : (
        <>
          <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 mb-2">
              Top Set Load &amp; Est. 1RM
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
                <XAxis dataKey="label" stroke="#737373" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <YAxis stroke="#737373" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                <Tooltip
                  contentStyle={{ background: "#171717", border: "1px solid #404040", borderRadius: 2, fontSize: 12 }}
                  labelStyle={{ color: "#a3a3a3" }}
                />
                <Line type="monotone" dataKey="topLoad" name="Top Set (lbs)" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="est1RM" name="Est. 1RM" stroke="#60a5fa" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-sm divide-y divide-neutral-800">
            {[...history].reverse().map((h, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 text-xs font-mono">
                <span className="text-neutral-500">{h.label}</span>
                <span className="text-neutral-200">
                  {h.topLoad} × {h.topReps}
                </span>
                <span className="text-neutral-500">~{h.est1RM} 1RM</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-2.5 text-center">
      <div className="text-xl font-bold font-mono text-orange-400">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-neutral-500 font-mono mt-0.5">{label}</div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-neutral-900 border border-dashed border-neutral-800 rounded-sm p-8 text-center text-xs text-neutral-500">
      {text}
    </div>
  );
}

/* -------------------------------- CHECK-IN --------------------------------- */
function CheckInTab({ checkins, setCheckins }) {
  const [form, setForm] = useState({
    date: todayISO(),
    bodyweight: "",
    steps: "",
    sleep: 3,
    energy: 3,
    soreness: 3,
    adherence: 5,
    notes: "",
  });
  const [saved, setSaved] = useState(false);

  async function submit() {
    const entry = { id: `${Date.now()}`, ...form, bodyweight: form.bodyweight === "" ? null : Number(form.bodyweight), steps: form.steps === "" ? null : Number(form.steps) };
    const next = [...checkins, entry];
    await setCheckins(next);
    setSaved(true);
    setForm({ date: todayISO(), bodyweight: "", steps: "", sleep: 3, energy: 3, soreness: 3, adherence: 5, notes: "" });
    setTimeout(() => setSaved(false), 2500);
  }

  const weightHistory = useMemo(
    () =>
      checkins
        .filter((c) => c.bodyweight)
        .map((c) => ({ label: fmtDate(c.date), weight: c.bodyweight, date: c.date }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [checkins]
  );

  return (
    <div className="space-y-5">
      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4 space-y-4">
        <div className="text-sm font-bold">Weekly Check-In</div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date">
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1.5 text-xs font-mono text-neutral-100"
            />
          </Field>
          <Field label="Bodyweight (lbs)">
            <input
              type="number"
              inputMode="decimal"
              placeholder="--"
              value={form.bodyweight}
              onChange={(e) => setForm({ ...form, bodyweight: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1.5 text-xs font-mono text-neutral-100 placeholder-neutral-600"
            />
          </Field>
          <Field label="Steps">
            <input
              type="number"
              inputMode="numeric"
              placeholder="--"
              value={form.steps}
              onChange={(e) => setForm({ ...form, steps: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1.5 text-xs font-mono text-neutral-100 placeholder-neutral-600"
            />
          </Field>
        </div>

        <SliderField label="Sleep Quality" value={form.sleep} onChange={(v) => setForm({ ...form, sleep: v })} />
        <SliderField label="Energy Level" value={form.energy} onChange={(v) => setForm({ ...form, energy: v })} />
        <SliderField label="Soreness" value={form.soreness} onChange={(v) => setForm({ ...form, soreness: v })} reverse />
        <Field label={`Sessions Completed This Week: ${form.adherence} / 5`}>
          <input
            type="range"
            min="0"
            max="5"
            value={form.adherence}
            onChange={(e) => setForm({ ...form, adherence: Number(e.target.value) })}
            className="w-full accent-orange-500"
          />
        </Field>

        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="How did this week feel? Any aches, PRs, or program tweaks to consider?"
            rows={3}
            className="w-full bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1.5 text-xs text-neutral-100 placeholder-neutral-600"
          />
        </Field>

        <button
          onClick={submit}
          className="w-full bg-orange-500 hover:bg-orange-400 text-neutral-950 font-bold py-2.5 rounded-sm flex items-center justify-center gap-2"
        >
          {saved ? (
            <>
              <Check size={16} /> Saved
            </>
          ) : (
            "Save Check-In"
          )}
        </button>
      </div>

      {weightHistory.length > 1 && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-3">
          <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 mb-2">Bodyweight Trend</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="#262626" strokeDasharray="3 3" />
              <XAxis dataKey="label" stroke="#737373" tick={{ fontSize: 11, fontFamily: "monospace" }} />
              <YAxis stroke="#737373" tick={{ fontSize: 11, fontFamily: "monospace" }} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#171717", border: "1px solid #404040", borderRadius: 2, fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {checkins.length === 0 ? (
        <EmptyState text="No check-ins yet. Your weekly reflections will show up here." />
      ) : (
        <div className="space-y-2">
          {[...checkins].reverse().map((c) => (
            <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-sm p-3 text-xs">
              <div className="flex justify-between font-mono text-neutral-400 mb-1">
                <span>{fmtDate(c.date)}</span>
                <span>{c.bodyweight ? `${c.bodyweight} lbs` : ""}</span>
              </div>
              <div className="flex gap-3 text-[11px] text-neutral-500 font-mono mb-1">
                {c.steps ? <span>{c.steps} steps</span> : null}
                <span>Sleep {c.sleep}/5</span>
                <span>Energy {c.energy}/5</span>
                <span>Soreness {c.soreness}/5</span>
                <span>{c.adherence}/5 sessions</span>
              </div>
              {c.notes && <p className="text-neutral-400">{c.notes}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 block mb-1">{label}</label>
      {children}
    </div>
  );
}

function SliderField({ label, value, onChange, reverse }) {
  const colors = reverse
    ? ["text-emerald-400", "text-emerald-400", "text-amber-400", "text-orange-400", "text-red-400"]
    : ["text-red-400", "text-orange-400", "text-amber-400", "text-emerald-400", "text-emerald-400"];
  return (
    <Field label={`${label}: ${value}/5`}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="1"
          max="5"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full accent-orange-500"
        />
        <span className={`font-mono text-xs w-6 text-right ${colors[value - 1]}`}>{value}</span>
      </div>
    </Field>
  );
}

/* -------------------------------- SCHEDULE --------------------------------- */
function ScheduleTab({ settings, setSettings }) {
  return (
    <div className="space-y-5">
      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4">
        <div className="text-sm font-bold mb-2">Program Start Date</div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={settings.startDate || ""}
            onChange={(e) => setSettings({ ...settings, startDate: e.target.value })}
            className="bg-neutral-950 border border-neutral-700 rounded-sm px-2 py-1.5 text-xs font-mono text-neutral-100"
          />
          {settings.startDate && (
            <button
              onClick={() => setSettings({ ...settings, startDate: null })}
              className="text-neutral-500 hover:text-red-400"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <p className="text-[11px] text-neutral-500 mt-2">
          Used to auto-recommend your current week and workout on the Today tab.
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4">
        <div className="text-sm font-bold mb-3">12-Week Structure</div>
        <div className="space-y-2">
          <BlockRow color={PHASE_INFO.intro.color} title="Week 1 -- Intro Week" desc="Lighter effort to learn the movements before ramping intensity." />
          <BlockRow color={PHASE_INFO.accumulation.color} title="Weeks 2–6 -- Block 1" desc="Most sets taken to failure or 1 rep shy. Progressive overload via load/reps." />
          <BlockRow color={PHASE_INFO.deload.color} title="Week 7 -- Deload Week" desc="Reduced effort to dissipate fatigue before Block 2." />
          <BlockRow color={PHASE_INFO.intensification.color} title="Weeks 8–12 -- Block 2" desc="Same effort as Block 1, plus last-set intensity techniques (drop sets, myo-reps, lengthened partials, static holds)." />
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4">
        <div className="text-sm font-bold mb-3">Weekly Split</div>
        <div className="divide-y divide-neutral-800">
          {DAY_ORDER.map((d, i) => (
            <div key={i} className="flex justify-between py-1.5 text-xs font-mono">
              <span className="text-neutral-500">Day {i + 1}</span>
              <span className={d === "Rest" ? "text-neutral-600" : "text-neutral-200"}>{d}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-sm p-4 space-y-2 text-xs text-neutral-400">
        <div className="text-sm font-bold text-neutral-100 mb-1">Reps in Reserve (RIR)</div>
        <p>RIR 0 means failure -- zero reps left in the tank. RIR 1 means stopping one rep shy.</p>
        <p>For heavy compounds (Squat, Incline Press, Leg Press, Smith Lunge), RIR 0 means you couldn't get another rep -- you don't need to actually attempt and fail it for safety.</p>
        <p>For everything else, RIR 0 means go until you physically can't complete the rep.</p>
        <p className="pt-1 border-t border-neutral-800 mt-2">Start every session with ~5 minutes of light cardio, then the listed exercise-specific warm-up sets -- light, not fatiguing.</p>
      </div>
    </div>
  );
}

function BlockRow({ color, title, desc }) {
  return (
    <div className="flex gap-2.5">
      <div className={`w-1 rounded-full ${color} shrink-0`} />
      <div>
        <div className="text-xs font-semibold text-neutral-200">{title}</div>
        <div className="text-[11px] text-neutral-500">{desc}</div>
      </div>
    </div>
  );
}
