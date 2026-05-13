import React, { useState, useEffect } from 'react';
import { Sword, Volume2, VolumeX } from 'lucide-react';

const QuestTracker = () => {
  const [player, setPlayer] = useState(null);
  const [soundOn, setSoundOn] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('questPlayer');
    if (saved) {
      setPlayer(JSON.parse(saved));
    } else {
      const newPlayer = {
        name: 'Adventurer',
        level: 1,
        xp: 0,
        maxXp: 100,
        hp: 100,
        maxHp: 100,
        gold: 0,
        streak: 0,
        quests: [
          { id: 1, title: '💪 Exercise', reward: 50, completed: false, difficulty: 'hard' },
          { id: 2, title: '🧘 Meditate', reward: 30, completed: false, difficulty: 'medium' },
          { id: 3, title: '💧 Drink Water', reward: 20, completed: false, difficulty: 'easy' },
          { id: 4, title: '📚 Read', reward: 40, completed: false, difficulty: 'medium' },
        ],
        inventory: [],
        achievements: [],
      };
      setPlayer(newPlayer);
      localStorage.setItem('questPlayer', JSON.stringify(newPlayer));
    }
  }, []);

  const playSound = (type) => {
    if (!soundOn) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);

    if (type === 'quest-complete') {
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.2);
    } else if (type === 'level-up') {
      osc.frequency.setValueAtTime(400, audioContext.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.3);
    }
  };

  const completeQuest = (questId) => {
    const quest = player.quests.find(q => q.id === questId);
    if (!quest || quest.completed) return;

    playSound('quest-complete');

    const newXp = player.xp + quest.reward;
    const xpNeeded = player.maxXp;
    let newLevel = player.level;
    let finalXp = newXp;

    if (newXp >= xpNeeded) {
      newLevel = player.level + 1;
      finalXp = newXp - xpNeeded;
      playSound('level-up');
    }

    const updatedPlayer = {
      ...player,
      xp: finalXp,
      level: newLevel,
      maxXp: 100 + (newLevel - 1) * 50,
      gold: player.gold + quest.reward,
      streak: player.streak + 1,
      quests: player.quests.map(q => q.id === questId ? { ...q, completed: true } : q),
    };

    setPlayer(updatedPlayer);
    localStorage.setItem('questPlayer', JSON.stringify(updatedPlayer));
  };

  const resetDaily = () => {
    const updatedPlayer = {
      ...player,
      quests: player.quests.map(q => ({ ...q, completed: false })),
    };
    setPlayer(updatedPlayer);
    localStorage.setItem('questPlayer', JSON.stringify(updatedPlayer));
  };

  if (!player) return <div className="flex items-center justify-center h-screen bg-gradient-to-b from-purple-900 to-black text-white text-xl">⚔️ Loading...</div>;

  const completedCount = player.quests.filter(q => q.completed).length;
  const totalQuests = player.quests.length;
  const xpProgress = (player.xp / player.maxXp) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-black to-black text-white p-4 font-bold">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-black" style={{ textShadow: '0 0 20px rgba(168, 85, 247, 0.8)' }}>
            ⚔️ QUEST TRACKER
          </h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition"
          >
            {soundOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>

        {showSettings && (
          <div className="bg-gray-900 p-4 rounded-lg mb-4">
            <button
              onClick={() => setSoundOn(!soundOn)}
              className="w-full p-2 bg-purple-600 hover:bg-purple-700 rounded mb-2"
            >
              {soundOn ? '🔊 Sound ON' : '🔇 Sound OFF'}
            </button>
            <button
              onClick={resetDaily}
              className="w-full p-2 bg-orange-600 hover:bg-orange-700 rounded"
            >
              🔄 Reset Daily
            </button>
          </div>
        )}

        {/* Player Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-b from-purple-700 to-purple-900 p-4 rounded-lg text-center border-2 border-purple-500">
            <div className="text-3xl font-black">⭐</div>
            <div className="text-xs text-purple-300">LEVEL</div>
            <div className="text-2xl">{player.level}</div>
          </div>
          <div className="bg-gradient-to-b from-yellow-700 to-yellow-900 p-4 rounded-lg text-center border-2 border-yellow-500">
            <div className="text-3xl font-black">💰</div>
            <div className="text-xs text-yellow-300">GOLD</div>
            <div className="text-2xl">{player.gold}</div>
          </div>
          <div className="bg-gradient-to-b from-red-700 to-red-900 p-4 rounded-lg text-center border-2 border-red-500">
            <div className="text-3xl font-black">🔥</div>
            <div className="text-xs text-red-300">STREAK</div>
            <div className="text-2xl">{player.streak}</div>
          </div>
          <div className="bg-gradient-to-b from-blue-700 to-blue-900 p-4 rounded-lg text-center border-2 border-blue-500">
            <div className="text-3xl font-black">❤️</div>
            <div className="text-xs text-blue-300">HP</div>
            <div className="text-2xl">{player.hp}/{player.maxHp}</div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="bg-gray-900 p-4 rounded-lg border-2 border-purple-500 mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-purple-300">Experience</span>
            <span className="text-sm text-purple-300">{player.xp}/{player.maxXp}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ width: `${xpProgress}%` }}
            >
              {xpProgress > 10 && `${Math.round(xpProgress)}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Quests Section */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
          <Sword size={28} /> TODAY'S QUESTS
        </h2>

        <div className="space-y-3 mb-6">
          {player.quests.map((quest) => (
            <button
              key={quest.id}
              onClick={() => !quest.completed && completeQuest(quest.id)}
              disabled={quest.completed}
              className={`w-full p-4 rounded-lg border-2 transition transform hover:scale-105 active:scale-95 ${
                quest.completed
                  ? 'bg-gray-800 border-gray-600 opacity-50'
                  : quest.difficulty === 'easy'
                  ? 'bg-gradient-to-r from-green-700 to-green-900 border-green-500 hover:from-green-600 hover:to-green-800'
                  : quest.difficulty === 'medium'
                  ? 'bg-gradient-to-r from-yellow-700 to-yellow-900 border-yellow-500 hover:from-yellow-600 hover:to-yellow-800'
                  : 'bg-gradient-to-r from-red-700 to-red-900 border-red-500 hover:from-red-600 hover:to-red-800'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{quest.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black">+{quest.reward} XP</span>
                  {quest.completed ? (
                    <span className="text-2xl">✅</span>
                  ) : (
                    <span className="text-2xl">⚔️</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-gradient-to-r from-purple-900 to-black p-6 rounded-lg border-2 border-purple-500 text-center">
          <div className="text-4xl font-black mb-2">
            {completedCount === totalQuests ? '🏆 PERFECT DAY!' : `${completedCount}/${totalQuests} Quests Complete`}
          </div>
          <div className="text-lg text-purple-300">
            {completedCount === totalQuests
              ? '⭐ You are unstoppable! ⭐'
              : `${totalQuests - completedCount} quest${totalQuests - completedCount !== 1 ? 's' : ''} remaining`}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestTracker;
