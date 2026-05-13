import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Plus, Trash2, Edit2, Check, BarChart3, Settings, Home, List, Heart, Trophy, Download, Upload, Volume2, VolumeX, AlertCircle, Zap, TrendingUp } from 'lucide-react';

const DailyQuestTracker = () => {
  const [gameState, setGameState] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAchievementPopup, setShowAchievementPopup] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [theme, setTheme] = useState('dark-neon');
  const audioRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('questTrackerState');
    const savedSettings = localStorage.getItem('questTrackerSettings');
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setSoundEnabled(settings.soundEnabled ?? true);
      setAnimationsEnabled(settings.animationsEnabled ?? true);
      setTheme(settings.theme ?? 'dark-neon');
    }

    if (saved) {
      try {
        const state = JSON.parse(saved);
        const today = new Date().toDateString();
        if (state.lastPlayDate !== today) {
          state.lastPlayDate = today;
          state.goals = state.goals.map(g => ({
            ...g,
            completed: false,
          }));
          state.dailyStreak = calculateStreak(state);
        }
        setGameState(state);
      } catch (e) {
        console.error('Failed to load state:', e);
        setGameState(getInitialState());
      }
    } else {
      setGameState(getInitialState());
    }
  }, []);

  useEffect(() => {
    if (gameState) {
      localStorage.setItem('questTrackerState', JSON.stringify(gameState));
    }
  }, [gameState]);

  useEffect(() => {
    localStorage.setItem('questTrackerSettings', JSON.stringify({
      soundEnabled,
      animationsEnabled,
      theme,
    }));
  }, [soundEnabled, animationsEnabled, theme]);

  const playSound = (type = 'complete') => {
    if (!soundEnabled) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'complete') {
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } else if (type === 'level-up') {
      oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.2);
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    }
  };

  const getInitialState = () => ({
    lastPlayDate: new Date().toDateString(),
    xp: 0,
    coins: 0,
    level: 1,
    dailyStreak: 0,
    maxStreak: 0,
    mood: null,
    totalQuestsCompleted: 0,
    goals: [
      { id: 1, title: 'Take meds', category: 'health', difficulty: 'easy', completed: false, recurring: true, xpReward: 50, coinsReward: 10 },
      { id: 2, title: 'Drink 8 glasses of water', category: 'health', difficulty: 'easy', completed: false, recurring: true, xpReward: 30, coinsReward: 5 },
      { id: 3, title: 'Go outside for 15 min', category: 'self-care', difficulty: 'medium', completed: false, recurring: true, xpReward: 75, coinsReward: 15 },
    ],
    lists: { todos: [], groceries: [], ideas: [] },
    achievements: [
      { id: 'first-quest', icon: '⚔️', name: 'First Quest', description: 'Complete your first goal', unlocked: false },
      { id: 'first-streak', icon: '🔥', name: 'On Fire', description: 'Complete 3 consecutive days', unlocked: false },
      { id: 'level-up', icon: '⭐', name: 'Level Climber', description: 'Reach level 5', unlocked: false },
      { id: 'coin-collector', icon: '🪙', name: 'Coin Collector', description: 'Earn 500 coins', unlocked: false },
      { id: 'xp-master', icon: '💫', name: 'XP Master', description: 'Earn 2000 XP', unlocked: false },
      { id: 'week-warrior', icon: '🏆', name: 'Week Warrior', description: 'Complete 7-day streak', unlocked: false },
      { id: 'month-legend', icon: '👑', name: 'Month Legend', description: 'Reach 30-day streak', unlocked: false },
      { id: 'perfect-day', icon: '✨', name: 'Perfect Day', description: 'Complete all daily quests', unlocked: false },
      { id: 'recovery-hero', icon: '💛', name: 'Recovery Hero', description: 'Use minimum victory mode', unlocked: false },
      { id: 'mood-tracker', icon: '📊', name: 'Mood Tracker', description: 'Log mood for 7 consecutive days', unlocked: false },
    ],
    unlockedThemes: ['dark-neon', 'dark-purple', 'cyberpunk-pink'],
    unlockedBadges: ['warrior', 'sage'],
    unlockedPets: [],
    moodHistory: [],
    completedGoalsHistory: {},
    recoveryPromptsViewed: [],
  });

  const calculateStreak = (state) => {
    const today = new Date();
    let streak = 0;
    let checkDate = new Date(today);
    while (streak < 365) {
      const dateStr = checkDate.toDateString();
      const completedCount = state.completedGoalsHistory[dateStr]?.length || 0;
      if (completedCount > 0) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const updateState = (updates) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  const checkAchievements = (updatedState) => {
    const achievements = updatedState.achievements.map(ach => {
      let shouldUnlock = false;
      if (ach.id === 'first-quest' && updatedState.totalQuestsCompleted >= 1) shouldUnlock = true;
      if (ach.id === 'first-streak' && updatedState.dailyStreak >= 3) shouldUnlock = true;
      if (ach.id === 'level-up' && updatedState.level >= 5) shouldUnlock = true;
      if (ach.id === 'coin-collector' && updatedState.coins >= 500) shouldUnlock = true;
      if (ach.id === 'xp-master' && updatedState.xp >= 2000) shouldUnlock = true;
      if (ach.id === 'week-warrior' && updatedState.dailyStreak >= 7) shouldUnlock = true;
      if (ach.id === 'month-legend' && updatedState.dailyStreak >= 30) shouldUnlock = true;
      if (ach.id === 'mood-tracker' && updatedState.moodHistory.length >= 7) shouldUnlock = true;
      return { ...ach, unlocked: ach.unlocked || shouldUnlock };
    });
    return achievements;
  };

  const completeGoal = (goalId) => {
    const goal = gameState.goals.find(g => g.id === goalId);
    if (!goal || goal.completed) return;

    playSound('complete');

    const today = new Date().toDateString();
    const newXp = gameState.xp + goal.xpReward;
    const newCoins = gameState.coins + goal.coinsReward;
    const newLevel = Math.floor(newXp / 500) + 1;
    const completedToday = gameState.goals.filter(g => g.completed).length + 1;
    const totalGoals = gameState.goals.length;
    let newStreak = gameState.dailyStreak;
    let maxStreak = gameState.maxStreak;
    const newTotalCompleted = gameState.totalQuestsCompleted + 1;

    if (completedToday === totalGoals) {
      newStreak = (gameState.dailyStreak || 0) + 1;
      maxStreak = Math.max(newStreak, gameState.maxStreak);
      playSound('level-up');
      setShowAchievementPopup({
        title: '🔥 PERFECT DAY!',
        description: `Streak: ${newStreak} days`,
        animation: 'bounce',
      });
      setTimeout(() => setShowAchievementPopup(null), 3000);
    }

    const history = { ...gameState.completedGoalsHistory };
    history[today] = [...(history[today] || []), goalId];

    const newState = {
      goals: gameState.goals.map(g => g.id === goalId ? { ...g, completed: true } : g),
      xp: newXp,
      coins: newCoins,
      level: newLevel,
      dailyStreak: newStreak,
      maxStreak,
      totalQuestsCompleted: newTotalCompleted,
      completedGoalsHistory: history,
    };

    newState.achievements = checkAchievements(newState);
    updateState(newState);
  };

  const addOrEditGoal = (goalData) => {
    if (editingGoal) {
      updateState({
        goals: gameState.goals.map(g => g.id === editingGoal.id ? { ...editingGoal, ...goalData } : g),
      });
    } else {
      const newGoal = {
        id: Math.max(...gameState.goals.map(g => g.id), 0) + 1,
        xpReward: goalData.difficulty === 'easy' ? 50 : goalData.difficulty === 'medium' ? 75 : 100,
        coinsReward: goalData.difficulty === 'easy' ? 10 : goalData.difficulty === 'medium' ? 15 : 25,
        completed: false,
        recurring: true,
        ...goalData,
      };
      updateState({
        goals: [...gameState.goals, newGoal],
      });
    }
    setShowAddGoal(false);
    setEditingGoal(null);
  };

  const deleteGoal = (goalId) => {
    updateState({
      goals: gameState.goals.filter(g => g.id !== goalId),
    });
  };

  const setMood = (mood) => {
    const today = new Date().toDateString();
    const newMoodHistory = [...gameState.moodHistory, { date: today, mood }];
    const newState = { mood, moodHistory: newMoodHistory };
    newState.achievements = checkAchievements(newState);
    updateState(newState);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(gameState, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quest-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result || '{}');
        localStorage.setItem('questTrackerState', JSON.stringify(imported));
        setGameState(imported);
        setShowAchievementPopup({
          title: '✨ DATA RESTORED',
          description: 'Your backup has been loaded!',
        });
        setTimeout(() => setShowAchievementPopup(null), 3000);
      } catch (err) {
        alert('Failed to import data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  const progressToday = gameState?.goals.filter(g => g.completed).length || 0;
  const totalGoals = gameState?.goals.length || 0;
  const progressPercent = totalGoals > 0 ? (progressToday / totalGoals) * 100 : 0;

  const moodEmojis = { bad: '😞', low: '😟', okay: '😐', good: '😊', great: '🥳' };

  const themeConfig = {
    'dark-neon': { bg: 'linear-gradient(135deg, #0a0e27 0%, #1a0033 100%)', primary: '#00ffff', accent: '#ff00ff', border: 'border-cyan-500/30', text: 'text-cyan-300' },
    'dark-purple': { bg: 'linear-gradient(135deg, #1a0f2e 0%, #2d1b4e 100%)', primary: '#a78bfa', accent: '#c084fc', border: 'border-purple-500/30', text: 'text-purple-300' },
    'cyberpunk-pink': { bg: 'linear-gradient(135deg, #2d1b3d 0%, #3d0e4c 100%)', primary: '#ff006e', accent: '#ffbe0b', border: 'border-pink-500/30', text: 'text-pink-300' },
  };

  const currentTheme = themeConfig[theme] || themeConfig['dark-neon'];

  if (!gameState) return (
    <div className="flex items-center justify-center h-screen bg-black text-cyan-400 font-mono">
      <div className="text-center">
        <div className="text-4xl mb-4">⚡</div>
        <p className="text-xl">Loading your quest...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-white font-mono overflow-hidden" style={{ background: currentTheme.bg }}>
      <div className="fixed inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: `linear-gradient(0deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      {showAchievementPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div style={{ animation: animationsEnabled ? `${showAchievementPopup.animation || 'pulse'} 0.6s ease-in-out` : 'none' }}>
            <div className="text-6xl mb-4 drop-shadow-lg">{showAchievementPopup.title}</div>
            <div className="text-2xl drop-shadow-lg" style={{ color: currentTheme.primary }}>
              {showAchievementPopup.description}
            </div>
          </div>
          <style>{`
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
            @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.1); } }
          `}</style>
          <div className="absolute inset-0" onClick={() => setShowAchievementPopup(null)} />
        </div>
      )}

      <div className="relative z-10">
        {currentPage === 'dashboard' && (
          <DashboardPage gameState={gameState} completeGoal={completeGoal} setMood={setMood} setShowAddGoal={setShowAddGoal} moodEmojis={moodEmojis} progressPercent={progressPercent} progressToday={progressToday} totalGoals={totalGoals} animationsEnabled={animationsEnabled} theme={currentTheme} />
        )}
        {currentPage === 'goals' && (
          <GoalsPage gameState={gameState} setShowAddGoal={setShowAddGoal} editingGoal={editingGoal} setEditingGoal={setEditingGoal} deleteGoal={deleteGoal} addOrEditGoal={addOrEditGoal} completeGoal={completeGoal} theme={currentTheme} />
        )}
        {currentPage === 'lists' && (
          <ListsPage gameState={gameState} updateState={updateState} theme={currentTheme} />
        )}
        {currentPage === 'mood' && (
          <MoodPage gameState={gameState} animationsEnabled={animationsEnabled} theme={currentTheme} />
        )}
        {currentPage === 'rewards' && (
          <RewardsPage gameState={gameState} theme={currentTheme} />
        )}
        {currentPage === 'settings' && (
          <SettingsPage gameState={gameState} updateState={updateState} soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} animationsEnabled={animationsEnabled} setAnimationsEnabled={setAnimationsEnabled} theme={theme} setTheme={setTheme} exportData={exportData} importData={importData} currentTheme={currentTheme} />
        )}

        {showAddGoal && (
          <AddGoalModal
            onClose={() => { setShowAddGoal(false); setEditingGoal(null); }}
            onSave={addOrEditGoal}
            editingGoal={editingGoal}
            theme={currentTheme}
            animationsEnabled={animationsEnabled}
          />
        )}

        <nav className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur border-t z-20" style={{ borderColor: `${currentTheme.primary}4d` }}>
          <div className="flex justify-around items-center py-3 max-w-4xl mx-auto">
            {[
              { icon: Home, label: 'Home', page: 'dashboard' },
              { icon: List, label: 'Goals', page: 'goals' },
              { icon: Heart, label: 'Mood', page: 'mood' },
              { icon: BarChart3, label: 'Lists', page: 'lists' },
              { icon: Trophy, label: 'Rewards', page: 'rewards' },
              { icon: Settings, label: 'Settings', page: 'settings' },
            ].map(({ icon: Icon, label, page }) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded transition-all ${
                  currentPage === page ? `text-white border-b-2` : 'text-gray-400 hover:text-gray-200'
                }`}
                style={{ borderColor: currentPage === page ? currentTheme.primary : 'transparent' }}
              >
                <Icon size={20} />
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

// Page components - condensed for space
const DashboardPage = ({ gameState, completeGoal, setMood, setShowAddGoal, moodEmojis, progressPercent, progressToday, totalGoals, animationsEnabled, theme }) => {
  const todayGoals = gameState.goals.slice(0, 4);
  const recoveryPrompts = [
    { title: 'One Bad Round', text: "One bad round isn't game over. Pick ONE tiny recovery quest." },
    { title: 'Progress Matters', text: 'Missed goals? Streaks reset, but your progress stays. Jump back in.' },
    { title: 'Rest is Valid', text: 'Low energy? Rest IS productivity. You\'re not broken, you\'re recovering.' },
    { title: 'Small Wins', text: 'Tiny victories compound. Drink water. That counts. You count.' },
    { title: 'Evidence Check', text: 'Think you failed today? What\'s ONE thing you did right?' },
  ];
  const currentPrompt = recoveryPrompts[gameState.totalQuestsCompleted % recoveryPrompts.length];

  return (
    <div className="pb-24 px-4 pt-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-black mb-2" style={{ color: theme.primary, textShadow: `0 0 10px ${theme.primary}80` }}>
          ⚡ QUEST TRACKER
        </h1>
        <p style={{ color: theme.primary }} className="text-sm opacity-80">Level {gameState.level} Adventurer</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard icon="💫" label="XP" value={gameState.xp} theme={theme} />
        <StatCard icon="🪙" label="COINS" value={gameState.coins} theme={theme} />
        <StatCard icon="🔥" label="STREAK" value={gameState.dailyStreak} theme={theme} />
        <StatCard icon="👑" label="MAX STREAK" value={gameState.maxStreak} theme={theme} />
      </div>

      <div className="mb-6 p-4 rounded-lg border bg-black/30 backdrop-blur" style={{ borderColor: `${theme.primary}4d` }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold" style={{ color: theme.primary }}>TODAY'S PROGRESS</span>
          <span className="text-xs text-gray-400">{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-4 overflow-hidden border" style={{ borderColor: `${theme.primary}33` }}>
          <div
            className="h-full transition-all duration-300 rounded-full"
            style={{
              width: `${progressPercent}%`,
              background: `linear-gradient(90deg, ${theme.primary}, ${theme.accent})`,
              boxShadow: `0 0 10px ${theme.primary}cc`,
            }}
          />
        </div>
      </div>

      <div className="mb-6 p-4 rounded-lg border bg-black/30 backdrop-blur" style={{ borderColor: `${theme.primary}4d` }}>
        <p className="text-sm font-semibold mb-3" style={{ color: theme.primary }}>How's your vibe today?</p>
        <div className="flex justify-between gap-2">
          {Object.entries(moodEmojis).map(([mood, emoji]) => (
            <button
              key={mood}
              onClick={() => setMood(mood)}
              className={`flex-1 py-2 rounded transition-all text-2xl`}
              style={{
                borderColor: gameState.mood === mood ? theme.primary : 'rgb(75, 85, 99)',
                backgroundColor: gameState.mood === mood ? `${theme.primary}33` : 'transparent',
                border: '1px solid',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3 flex items-center gap-2" style={{ color: theme.primary }}>
          📋 TODAY'S QUESTS
        </h2>
        <div className="space-y-2">
          {todayGoals.map((goal) => (
            <div key={goal.id}>
              <GoalCard goal={goal} onComplete={() => completeGoal(goal.id)} theme={theme} />
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowAddGoal(true)}
          className="w-full mt-4 py-3 rounded-lg border-2 font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2"
          style={{
            borderColor: theme.primary,
            color: theme.primary,
            backgroundColor: `${theme.primary}11`,
          }}
        >
          <Plus size={20} /> Add New Quest
        </button>
      </div>

      {gameState.mood === 'bad' || gameState.mood === 'low' ? (
        <div className="p-4 rounded-lg border bg-yellow-900/20 backdrop-blur mb-6" style={{ borderColor: '#eab30833' }}>
          <p className="text-yellow-300 font-semibold mb-3">💛 Minimum Victory Mode Active</p>
          <p className="text-sm text-yellow-200 mb-3">Low energy day? Pick ONE tiny quest:</p>
          <div className="space-y-2">
            {['💧 Drink water', '🚪 Step outside 2 min', '🫁 Take 3 slow breaths', '📱 Take a break'].map((quest, idx) => (
              <div key={idx} className="p-2 bg-yellow-900/30 rounded text-yellow-300 text-sm flex items-center gap-2 border" style={{ borderColor: '#eab30866' }}>
                {quest}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {gameState.goals.filter(g => !g.completed).length > 0 && (
        <div className="p-4 rounded-lg border bg-black/30 backdrop-blur" style={{ borderColor: `${theme.primary}4d` }}>
          <h3 className="text-sm font-bold mb-2" style={{ color: theme.primary }}>💬 {currentPrompt.title}</h3>
          <p className="text-xs text-gray-300">{currentPrompt.text}</p>
        </div>
      )}
    </div>
  );
};

const GoalsPage = ({ gameState, setShowAddGoal, editingGoal, setEditingGoal, deleteGoal, completeGoal, theme }) => {
  const [filterCategory, setFilterCategory] = useState('all');
  const categories = ['all', 'health', 'chores', 'work', 'social', 'self-care', 'custom'];
  const filteredGoals = filterCategory === 'all' ? gameState.goals : gameState.goals.filter(g => g.category === filterCategory);

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="text-3xl font-black mb-6" style={{ color: theme.primary }}>All Quests</h1>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setFilterCategory(category)}
            className={`px-4 py-2 rounded text-sm font-semibold transition-all whitespace-nowrap flex-shrink-0`}
            style={{
              backgroundColor: filterCategory === category ? `${theme.primary}33` : 'transparent',
              borderColor: theme.primary,
              color: theme.primary,
              border: '1px solid',
              opacity: filterCategory === category ? 1 : 0.6,
            }}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-2 mb-6">
        {filteredGoals.map(goal => (
          <div key={goal.id} className="p-3 rounded-lg border bg-black/30 backdrop-blur hover:opacity-80 transition-all flex items-center justify-between group" style={{ borderColor: `${theme.primary}4d` }}>
            <div className="flex-1 min-w-0">
              <GoalCard goal={goal} onComplete={() => completeGoal(goal.id)} theme={theme} />
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <button onClick={() => { setEditingGoal(goal); setShowAddGoal(true); }} className="p-2 hover:opacity-80 rounded transition-all" style={{ color: '#60a5fa' }}>
                <Edit2 size={18} />
              </button>
              <button onClick={() => deleteGoal(goal.id)} className="p-2 hover:opacity-80 rounded transition-all" style={{ color: '#f87171' }}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => { setEditingGoal(null); setShowAddGoal(true); }}
        className="w-full py-3 rounded-lg border-2 font-bold hover:opacity-80 transition-all flex items-center justify-center gap-2"
        style={{
          borderColor: theme.primary,
          color: theme.primary,
          backgroundColor: `${theme.primary}11`,
        }}
      >
        <Plus size={20} /> Create New Quest
      </button>
    </div>
  );
};

const ListsPage = ({ gameState, updateState, theme }) => {
  const [activeList, setActiveList] = useState('todos');
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    const updatedLists = {
      ...gameState.lists,
      [activeList]: [...gameState.lists[activeList], { id: Date.now(), text: newItem, completed: false }]
    };
    updateState({ lists: updatedLists });
    setNewItem('');
  };

  const deleteItem = (id) => {
    const updatedLists = {
      ...gameState.lists,
      [activeList]: gameState.lists[activeList].filter(item => item.id !== id)
    };
    updateState({ lists: updatedLists });
  };

  const toggleItem = (id) => {
    const updatedLists = {
      ...gameState.lists,
      [activeList]: gameState.lists[activeList].map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    };
    updateState({ lists: updatedLists });
  };

  const listTypes = { todos: '📝 To-Do List', groceries: '🛒 Grocery List', ideas: '💡 Ideas' };

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="text-3xl font-black mb-6" style={{ color: theme.primary }}>Lists & Notes</h1>
      <div className="flex gap-2 mb-6">
        {Object.entries(listTypes).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveList(key)}
            className={`px-4 py-2 rounded-lg font-bold transition-all`}
            style={{
              backgroundColor: activeList === key ? `${theme.primary}33` : 'transparent',
              borderColor: theme.primary,
              color: theme.primary,
              border: '2px solid',
              opacity: activeList === key ? 1 : 0.6,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && addItem()}
          placeholder={`Add to ${listTypes[activeList]}...`}
          className="flex-1 px-3 py-2 bg-black/50 border rounded text-white placeholder-gray-500 focus:outline-none focus:opacity-100 transition-all"
          style={{ borderColor: `${theme.primary}4d` }}
        />
        <button
          onClick={addItem}
          className="px-4 py-2 rounded font-bold hover:opacity-80 transition-all"
          style={{
            backgroundColor: `${theme.primary}33`,
            borderColor: theme.primary,
            color: theme.primary,
            border: '2px solid',
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-2">
        {gameState.lists[activeList].map(item => (
          <div key={item.id} className="p-3 rounded-lg border bg-black/30 backdrop-blur hover:opacity-80 transition-all flex items-center gap-3 group" style={{ borderColor: `${theme.primary}4d` }}>
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => toggleItem(item.id)}
              className="w-5 h-5"
              style={{ accentColor: theme.primary }}
            />
            <span className={`flex-1 ${item.completed ? 'line-through text-gray-500' : 'text-white'}`}>
              {item.text}
            </span>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-2 opacity-0 group-hover:opacity-100 hover:opacity-80 rounded transition-all"
              style={{ color: '#f87171' }}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const MoodPage = ({ gameState, animationsEnabled, theme }) => {
  const moodData = gameState.moodHistory.slice(-30).map((entry, idx, arr) => {
    const moodValues = { bad: 1, low: 2, okay: 3, good: 4, great: 5 };
    return {
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: moodValues[entry.mood] || 0,
      mood: entry.mood,
    };
  });

  const moodEmojis = { bad: '😞', low: '😟', okay: '😐', good: '😊', great: '🥳' };
  const recoveryMindsets = [
    { icon: '🧠', title: 'Thought Record', desc: 'Notice thoughts without judgment. They\'re just thoughts, not facts.' },
    { icon: '🌱', title: 'Growth Mindset', desc: 'Struggling now = learning opportunity. You\'re building capacity.' },
    { icon: '💪', title: 'Behavioral Activation', desc: 'Do the quest first, feel better after. Action creates mood change.' },
    { icon: '🎯', title: 'Values Check', desc: 'Is this quest aligned with who you want to be? That\'s the real win.' },
    { icon: '❤️', title: 'Self-Compassion', desc: 'You\'d never shame a friend like this. Be gentle with yourself.' },
  ];

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="text-3xl font-black mb-6" style={{ color: theme.primary }}>Mood History</h1>
      <div className="p-4 rounded-lg border bg-black/30 backdrop-blur mb-6" style={{ borderColor: `${theme.primary}4d` }}>
        <p className="text-sm font-semibold mb-4" style={{ color: theme.primary }}>Last 30 Days</p>
        <div className="flex items-end justify-around h-48 gap-1 overflow-x-auto pb-2">
          {moodData.map((entry, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 flex-shrink-0" title={entry.date}>
              <div className="text-xl">{moodEmojis[entry.mood] || '❓'}</div>
              <div
                className="w-4 rounded-t transition-all hover:opacity-100"
                style={{
                  height: `${entry.value * 30}px`,
                  background: `linear-gradient(to top, ${theme.primary}, ${theme.accent})`,
                  opacity: 0.7,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4" style={{ color: theme.primary }}>📚 CBT Techniques</h2>
      <div className="space-y-3 mb-6">
        {recoveryMindsets.map((mindset, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg border bg-black/30 backdrop-blur hover:opacity-90 transition-all cursor-pointer"
            style={{ borderColor: `${theme.primary}4d` }}
          >
            <p className="text-2xl mb-2">{mindset.icon}</p>
            <p className="text-sm font-bold" style={{ color: theme.primary }}>{mindset.title}</p>
            <p className="text-xs text-gray-400 mt-1">{mindset.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RewardsPage = ({ gameState, theme }) => {
  const achievements = gameState.achievements;
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="text-3xl font-black mb-6" style={{ color: theme.primary }}>Achievements</h1>
      <div className="p-4 rounded-lg border bg-black/30 backdrop-blur mb-6" style={{ borderColor: `${theme.primary}4d` }}>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-400">Progress</p>
            <p className="text-2xl font-black" style={{ color: theme.primary }}>{unlockedCount}/{achievements.length}</p>
          </div>
          <div className="text-4xl">🏆</div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3" style={{ color: theme.primary }}>Quests Completed</h2>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {achievements.map((ach, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-lg border transition-all`}
            style={{
              borderColor: ach.unlocked ? `${theme.primary}99` : `${theme.primary}33`,
              backgroundColor: ach.unlocked ? `${theme.primary}22` : 'transparent',
              opacity: ach.unlocked ? 1 : 0.5,
            }}
          >
            <div className="text-3xl mb-2">{ach.icon}</div>
            <h3 className={`font-bold text-sm ${ach.unlocked ? 'text-white' : 'text-gray-600'}`}>
              {ach.name}
            </h3>
            <p className={`text-xs ${ach.unlocked ? 'text-gray-300' : 'text-gray-600'}`}>
              {ach.description}
            </p>
            {ach.unlocked && <div className="text-lg mt-2">✨</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsPage = ({ gameState, updateState, soundEnabled, setSoundEnabled, animationsEnabled, setAnimationsEnabled, theme: themeValue, setTheme, exportData, importData, currentTheme }) => {
  const [showConfirm, setShowConfirm] = useState(null);
  const fileInputRef = useRef(null);

  const handleResetDaily = () => {
    if (showConfirm === 'daily') {
      updateState({
        goals: gameState.goals.map(g => ({ ...g, completed: false })),
        mood: null,
      });
      setShowConfirm(null);
    }
  };

  const handleResetAll = () => {
    if (showConfirm === 'all') {
      localStorage.removeItem('questTrackerState');
      localStorage.removeItem('questTrackerSettings');
      window.location.reload();
    }
  };

  const themeOptions = [
    { id: 'dark-neon', name: '🌌 Dark Neon', color: '#00ffff' },
    { id: 'dark-purple', name: '💜 Dark Purple', color: '#a78bfa' },
    { id: 'cyberpunk-pink', name: '💗 Cyberpunk Pink', color: '#ff006e' },
  ];

  return (
    <div className="pb-24 px-4 pt-6">
      <h1 className="text-3xl font-black mb-6" style={{ color: currentTheme.primary }}>Settings</h1>

      <h2 className="text-lg font-bold mb-3" style={{ color: currentTheme.primary }}>⚙️ Preferences</h2>
      <div className="space-y-3 mb-6">
        <div className="p-4 rounded-lg border bg-black/30 backdrop-blur" style={{ borderColor: `${currentTheme.primary}4d` }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              <span className="font-bold text-white">Sound Effects</span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: currentTheme.primary }}
            />
          </div>
          <p className="text-xs text-gray-400">Audio feedback on quest completion</p>
        </div>

        <div className="p-4 rounded-lg border bg-black/30 backdrop-blur" style={{ borderColor: `${currentTheme.primary}4d` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white">Animations</span>
            <input
              type="checkbox"
              checked={animationsEnabled}
              onChange={(e) => setAnimationsEnabled(e.target.checked)}
              className="w-5 h-5"
              style={{ accentColor: currentTheme.primary }}
            />
          </div>
          <p className="text-xs text-gray-400">Animated transitions and popups</p>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-3" style={{ color: currentTheme.primary }}>🎨 Theme</h2>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {themeOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setTheme(opt.id)}
            className={`p-3 rounded-lg border transition-all font-bold text-sm`}
            style={{
              borderColor: themeValue === opt.id ? opt.color : `${opt.color}4d`,
              backgroundColor: themeValue === opt.id ? `${opt.color}33` : 'transparent',
              color: opt.color,
              opacity: themeValue === opt.id ? 1 : 0.6,
            }}
          >
            {opt.name}
          </button>
        ))}
      </div>

      <h2 className="text-lg font-bold mb-3" style={{ color: currentTheme.primary }}>💾 Data</h2>
      <div className="space-y-3 mb-6">
        <button
          onClick={exportData}
          className="w-full p-3 rounded-lg border bg-black/30 backdrop-blur hover:opacity-80 transition-all font-bold flex items-center justify-center gap-2"
          style={{ borderColor: `${currentTheme.primary}4d`, color: currentTheme.primary }}
        >
          <Download size={20} /> Export Data
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-3 rounded-lg border bg-black/30 backdrop-blur hover:opacity-80 transition-all font-bold flex items-center justify-center gap-2"
          style={{ borderColor: `${currentTheme.primary}4d`, color: currentTheme.primary }}
        >
          <Upload size={20} /> Import Data
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={importData}
          className="hidden"
        />
      </div>

      <h2 className="text-lg font-bold mb-3" style={{ color: '#f87171' }}>⚠️ Danger Zone</h2>
      <div className="space-y-3">
        <button
          onClick={() => setShowConfirm(showConfirm === 'daily' ? null : 'daily')}
          className="w-full p-3 rounded-lg border bg-yellow-900/20 backdrop-blur hover:opacity-80 transition-all font-bold"
          style={{ borderColor: '#eab30833', color: '#fbbf24' }}
        >
          🔄 Reset Today's Progress
        </button>

        <button
          onClick={() => setShowConfirm(showConfirm === 'all' ? null : 'all')}
          className="w-full p-3 rounded-lg border bg-red-900/20 backdrop-blur hover:opacity-80 transition-all font-bold"
          style={{ borderColor: '#f8717133', color: '#f87171' }}
        >
          🗑️ Delete All Data
        </button>

        {showConfirm === 'daily' && (
          <div className="p-4 rounded-lg border bg-yellow-900/30 backdrop-blur" style={{ borderColor: '#eab30866' }}>
            <p className="text-yellow-300 font-bold mb-3">Reset today's progress?</p>
            <div className="flex gap-2">
              <button
                onClick={handleResetDaily}
                className="flex-1 p-2 rounded font-bold hover:opacity-80 transition-all"
                style={{ backgroundColor: '#eab30844', color: '#fbbf24' }}
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 p-2 rounded font-bold hover:opacity-80 transition-all"
                style={{ backgroundColor: 'rgba(107, 114, 128, 0.3)', color: '#d1d5db' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showConfirm === 'all' && (
          <div className="p-4 rounded-lg border bg-red-900/30 backdrop-blur" style={{ borderColor: '#f8717166' }}>
            <p className="text-red-300 font-bold mb-3">⚠️ This cannot be undone!</p>
            <div className="flex gap-2">
              <button
                onClick={handleResetAll}
                className="flex-1 p-2 rounded font-bold hover:opacity-80 transition-all"
                style={{ backgroundColor: '#f8717144', color: '#f87171' }}
              >
                Yes, Delete All
              </button>
              <button
                onClick={() => setShowConfirm(null)}
                className="flex-1 p-2 rounded font-bold hover:opacity-80 transition-all"
                style={{ backgroundColor: 'rgba(107, 114, 128, 0.3)', color: '#d1d5db' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 rounded-lg border bg-black/30 backdrop-blur mt-8" style={{ borderColor: `${currentTheme.primary}4d` }}>
        <p className="text-xs text-gray-400">Version 1.0.0 BETA</p>
        <p className="text-xs text-gray-500 mt-2">Quest Tracker © 2024</p>
        <p className="text-xs text-gray-600 mt-1">Build your character one day at a time.</p>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, theme }) => (
  <div
    className={`p-4 rounded-lg border bg-gradient-to-br backdrop-blur cursor-pointer hover:opacity-90 transition-all`}
    style={{
      background: `linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.2) 100%)`,
      borderColor: `${theme.primary}4d`,
    }}
  >
    <div className="text-2xl mb-1">{icon}</div>
    <p className="text-xs text-gray-300 font-semibold">{label}</p>
    <p className="text-xl font-black text-white">{value}</p>
  </div>
);

const GoalCard = ({ goal, onComplete, theme }) => {
  const difficultyColors = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171' };
  const categoryEmojis = { health: '💪', chores: '🧹', work: '💼', social: '👥', 'self-care': '🧘', custom: '⭐' };

  return (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={onComplete}
        className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-all flex items-center justify-center`}
        style={{
          backgroundColor: goal.completed ? `${theme.primary}44` : 'transparent',
          borderColor: goal.completed ? theme.primary : '#4b5563',
          color: goal.completed ? theme.primary : 'transparent',
        }}
      >
        {goal.completed && <Check size={16} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${goal.completed ? 'line-through text-gray-500' : 'text-white'}`}>
          {categoryEmojis[goal.category]} {goal.title}
        </div>
        <div className="flex gap-2 text-xs mt-1 flex-wrap">
          <span style={{ color: difficultyColors[goal.difficulty] }}>
            {goal.difficulty === 'easy' ? '◆' : goal.difficulty === 'medium' ? '◆◆' : '◆◆◆'}
          </span>
          <span className="text-gray-400">+{goal.xpReward} XP • +{goal.coinsReward} 🪙</span>
        </div>
      </div>
    </div>
  );
};

const AddGoalModal = ({ onClose, onSave, editingGoal, theme, animationsEnabled }) => {
  const [title, setTitle] = useState(editingGoal?.title || '');
  const [category, setCategory] = useState(editingGoal?.category || 'health');
  const [difficulty, setDifficulty] = useState(editingGoal?.difficulty || 'medium');

  const handleSave = () => {
    if (title.trim()) {
      onSave({ title, category, difficulty });
      setTitle('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur flex items-end z-40">
      <div
        className="w-full bg-black border-t-2 p-6 rounded-t-2xl"
        style={{ borderColor: theme.primary }}
      >
        <h2 className="text-2xl font-black mb-4" style={{ color: theme.primary }}>
          {editingGoal ? '✏️ Edit Quest' : '✨ Create New Quest'}
        </h2>

        <div className="space-y-4 mb-6">
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSave()}
            placeholder="Quest title..."
            autoFocus
            className="w-full px-4 py-3 bg-gray-900 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:opacity-100 transition-all"
            style={{ borderColor: `${theme.primary}4d` }}
          />

          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: theme.primary }}>Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border rounded-lg text-white focus:outline-none focus:opacity-100 transition-all"
              style={{ borderColor: `${theme.primary}4d`, color: 'white' }}
            >
              {['health', 'chores', 'work', 'social', 'self-care', 'custom'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: theme.primary }}>Difficulty</label>
            <div className="flex gap-2">
              {['easy', 'medium', 'hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`flex-1 py-2 rounded-lg font-bold transition-all`}
                  style={{
                    backgroundColor: difficulty === diff ? `${theme.primary}33` : 'transparent',
                    borderColor: theme.primary,
                    color: theme.primary,
                    border: '1px solid',
                    opacity: difficulty === diff ? 1 : 0.6,
                  }}
                >
                  {diff === 'easy' ? '◆ Easy' : diff === 'medium' ? '◆◆ Medium' : '◆◆◆ Hard'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-lg border text-white font-bold hover:opacity-80 transition-all"
            style={{
              borderColor: '#4b5563',
              backgroundColor: 'rgba(75, 85, 99, 0.2)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-lg border-2 font-bold hover:opacity-80 transition-all"
            style={{
              backgroundColor: `${theme.primary}33`,
              borderColor: theme.primary,
              color: theme.primary,
            }}
          >
            Save Quest
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyQuestTracker;
