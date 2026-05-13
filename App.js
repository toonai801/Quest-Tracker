import React, { useState, useEffect } from 'react';

export default function App() {
  const [player, setPlayer] = useState(null);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('player');
    if (saved) {
      setPlayer(JSON.parse(saved));
    } else {
      setPlayer({
        level: 1,
        xp: 0,
        maxXp: 100,
        gold: 0,
        streak: 0,
        quests: [
          { id: 1, name: '💪 Exercise', xp: 50, done: false },
          { id: 2, name: '🧘 Meditate', xp: 30, done: false },
          { id: 3, name: '💧 Drink Water', xp: 20, done: false },
          { id: 4, name: '📚 Read', xp: 40, done: false },
        ],
      });
    }
  }, []);

  if (!player) return <div style={{ textAlign: 'center', paddingTop: '50px', fontSize: '24px' }}>Loading...</div>;

  const playSound = () => {
    if (!sound) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  };

  const completeQuest = (id) => {
    const quest = player.quests.find(q => q.id === id);
    if (quest.done) return;

    playSound();

    let newXp = player.xp + quest.xp;
    let newLevel = player.level;
    let finalXp = newXp;

    if (newXp >= player.maxXp) {
      newLevel += 1;
      finalXp = newXp - player.maxXp;
    }

    const newPlayer = {
      ...player,
      xp: finalXp,
      level: newLevel,
      gold: player.gold + quest.xp,
      streak: player.streak + 1,
      quests: player.quests.map(q => (q.id === id ? { ...q, done: true } : q)),
    };

    setPlayer(newPlayer);
    localStorage.setItem('player', JSON.stringify(newPlayer));
  };

  const reset = () => {
    const newPlayer = {
      ...player,
      quests: player.quests.map(q => ({ ...q, done: false })),
    };
    setPlayer(newPlayer);
    localStorage.setItem('player', JSON.stringify(newPlayer));
  };

  const done = player.quests.filter(q => q.done).length;
  const total = player.quests.length;
  const progress = (player.xp / player.maxXp) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a0033 0%, #0a0e27 100%)',
      color: '#fff',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', textShadow: '0 0 20px rgba(0,255,255,0.5)' }}>
            ⚔️ QUEST TRACKER
          </h1>
          <p style={{ margin: '0', fontSize: '18px', color: '#00ffff' }}>Level {player.level} Adventurer</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{
            background: 'linear-gradient(to bottom, #663399, #330066)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #9933ff',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>⭐</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>LEVEL</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{player.level}</div>
          </div>
          <div style={{
            background: 'linear-gradient(to bottom, #666600, #333300)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #ffff00',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>💰</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>GOLD</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{player.gold}</div>
          </div>
          <div style={{
            background: 'linear-gradient(to bottom, #660000, #330000)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #ff3333',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>🔥</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>STREAK</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{player.streak}</div>
          </div>
          <div style={{
            background: 'linear-gradient(to bottom, #003366, #000033)',
            padding: '15px',
            borderRadius: '10px',
            border: '2px solid #0099ff',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>❤️</div>
            <div style={{ fontSize: '12px', color: '#aaa' }}>XP</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{player.xp}/{player.maxXp}</div>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{
          background: '#1a1a1a',
          padding: '15px',
          borderRadius: '10px',
          border: '2px solid #00ffff',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
            <span>Experience</span>
            <span>{player.xp}/{player.maxXp}</span>
          </div>
          <div style={{
            width: '100%',
            height: '30px',
            background: '#333',
            borderRadius: '15px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
              transition: 'width 0.3s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              fontWeight: 'bold',
              fontSize: '12px',
            }}>
              {Math.round(progress)}%
            </div>
          </div>
        </div>

        {/* Quests */}
        <h2 style={{ fontSize: '24px', marginBottom: '15px', margin: '20px 0 15px 0' }}>🗡️ TODAY'S QUESTS</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {player.quests.map(quest => (
            <button
              key={quest.id}
              onClick={() => completeQuest(quest.id)}
              disabled={quest.done}
              style={{
                padding: '20px',
                fontSize: '18px',
                fontWeight: 'bold',
                border: '2px solid',
                borderRadius: '10px',
                cursor: quest.done ? 'default' : 'pointer',
                background: quest.done ? '#333' : 'linear-gradient(135deg, #663399, #330066)',
                borderColor: quest.done ? '#666' : '#9933ff',
                color: quest.done ? '#666' : '#fff',
                textDecoration: quest.done ? 'line-through' : 'none',
                transition: 'all 0.2s',
                transform: quest.done ? 'scale(0.95)' : 'scale(1)',
              }}
              onMouseEnter={(e) => {
                if (!quest.done) e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                if (!quest.done) e.target.style.transform = 'scale(1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{quest.name}</span>
                <span>{quest.done ? '✅' : `⚔️ +${quest.xp}`}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Progress */}
        <div style={{
          background: 'linear-gradient(135deg, #330066, #000033)',
          padding: '25px',
          borderRadius: '10px',
          border: '2px solid #00ffff',
          textAlign: 'center',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
            {done === total ? '🏆 PERFECT DAY!' : `${done}/${total} Complete`}
          </div>
          <div style={{ fontSize: '14px', color: '#00ffff' }}>
            {done === total ? '⭐ YOU ARE UNSTOPPABLE! ⭐' : `${total - done} quest${total - done !== 1 ? 's' : ''} remaining`}
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setSound(!sound)}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              background: sound ? '#663399' : '#333',
              border: '2px solid #9933ff',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            {sound ? '🔊 Sound ON' : '🔇 Sound OFF'}
          </button>
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '14px',
              fontWeight: 'bold',
              background: '#663300',
              border: '2px solid #ff9900',
              color: '#fff',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            🔄 Reset Daily
          </button>
        </div>
      </div>
    </div>
  );
}
