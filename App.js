import React, { useState, useEffect } from 'react';

function App() {
  const [player, setPlayer] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editXp, setEditXp] = useState(0);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('questGame');
      if (saved) {
        setPlayer(JSON.parse(saved));
      } else {
        const newPlayer = {
          level: 1,
          xp: 0,
          maxXp: 100,
          gold: 0,
          streak: 0,
          quests: [
            { id: 1, title: '💪 Exercise', xp: 50, done: false },
            { id: 2, title: '🧘 Meditate', xp: 30, done: false },
            { id: 3, title: '💧 Drink Water', xp: 20, done: false },
            { id: 4, title: '📚 Read', xp: 40, done: false },
          ],
        };
        setPlayer(newPlayer);
        localStorage.setItem('questGame', JSON.stringify(newPlayer));
      }
    } catch (e) {
      console.error('Error loading player:', e);
      setPlayer({
        level: 1,
        xp: 0,
        maxXp: 100,
        gold: 0,
        streak: 0,
        quests: [
          { id: 1, title: '💪 Exercise', xp: 50, done: false },
          { id: 2, title: '🧘 Meditate', xp: 30, done: false },
          { id: 3, title: '💧 Drink Water', xp: 20, done: false },
          { id: 4, title: '📚 Read', xp: 40, done: false },
        ],
      });
    }
  }, []);

  const playSound = (freq = 800, duration = 150) => {
    if (!sound) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {}
  };

  const showToast = (message, color = '#00ff00') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const completeQuest = (id) => {
    const quest = player.quests.find(q => q.id === id);
    if (!quest || quest.done) return;

    playSound(800, 150);
    showToast(`+${quest.xp} XP!`, '#00ff00');

    let newXp = player.xp + quest.xp;
    let newLevel = player.level;
    let finalXp = newXp;

    if (newXp >= player.maxXp) {
      newLevel += 1;
      finalXp = newXp - player.maxXp;
      playSound(400, 300);
      playSound(600, 300);
      showToast(`⭐ LEVEL UP! ${newLevel}`, '#ffff00');
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
    localStorage.setItem('questGame', JSON.stringify(newPlayer));
  };

  const startEdit = (quest) => {
    setEditingId(quest.id);
    setEditTitle(quest.title);
    setEditXp(quest.xp);
  };

  const saveEdit = () => {
    if (!editTitle.trim()) {
      showToast('Quest name required!', '#ff3333');
      return;
    }

    const newPlayer = {
      ...player,
      quests: player.quests.map(q =>
        q.id === editingId ? { ...q, title: editTitle, xp: Math.max(10, editXp) } : q
      ),
    };

    setPlayer(newPlayer);
    localStorage.setItem('questGame', JSON.stringify(newPlayer));
    setEditingId(null);
    showToast('Quest updated!', '#00ffff');
    playSound(1000, 100);
  };

  const deleteQuest = (id) => {
    if (player.quests.length <= 1) {
      showToast('Need at least 1 quest!', '#ff3333');
      return;
    }
    const newPlayer = {
      ...player,
      quests: player.quests.filter(q => q.id !== id),
    };
    setPlayer(newPlayer);
    localStorage.setItem('questGame', JSON.stringify(newPlayer));
    showToast('Quest deleted', '#ff6600');
  };

  const addQuest = () => {
    const newQuest = {
      id: Date.now(),
      title: '⚔️ New Quest',
      xp: 30,
      done: false,
    };
    const newPlayer = {
      ...player,
      quests: [...player.quests, newQuest],
    };
    setPlayer(newPlayer);
    localStorage.setItem('questGame', JSON.stringify(newPlayer));
    showToast('New quest created!', '#00ffff');
  };

  const reset = () => {
    const newPlayer = {
      ...player,
      quests: player.quests.map(q => ({ ...q, done: false })),
    };
    setPlayer(newPlayer);
    localStorage.setItem('questGame', JSON.stringify(newPlayer));
    showToast('Daily reset!', '#ff6600');
  };

  if (!player) {
    return (
      <div style={{
        background: '#000',
        color: '#0f0',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
      }}>
        ⚔️ Loading...
      </div>
    );
  }

  const done = player.quests.filter(q => q.done).length;
  const total = player.quests.length;
  const progress = (player.xp / player.maxXp) * 100;

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0015 0%, #150030 50%, #0a0015 100%)',
      minHeight: '100vh',
      color: '#fff',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background grid */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundImage: 'linear-gradient(0deg, rgba(0,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.9)',
          border: '3px solid ' + toast.color,
          color: toast.color,
          padding: '15px 30px',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          zIndex: 1000,
          boxShadow: '0 0 20px ' + toast.color,
        }}>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '3px solid #00ffff',
        }}>
          <h1 style={{
            fontSize: '48px',
            margin: '0 0 10px 0',
            color: '#00ffff',
            textShadow: '0 0 30px rgba(0,255,255,0.8), 0 0 60px rgba(255,0,255,0.5)',
            letterSpacing: '3px',
          }}>
            ⚔️ QUEST TRACKER
          </h1>
          <p style={{ margin: '0', fontSize: '14px', color: '#00ffff', letterSpacing: '2px' }}>
            LEVEL {player.level} ADVENTURER
          </p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '12px',
          marginBottom: '25px',
        }}>
          {[
            { label: 'LEVEL', value: player.level, emoji: '⭐', color: '#9933ff' },
            { label: 'GOLD', value: player.gold, emoji: '💰', color: '#ffff00' },
            { label: 'STREAK', value: player.streak, emoji: '🔥', color: '#ff3333' },
            { label: 'HP', value: player.xp + '/' + player.maxXp, emoji: '❤️', color: '#ff0099' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(0,0,0,0.6)',
              border: '2px solid ' + stat.color,
              borderRadius: '8px',
              padding: '15px',
              textAlign: 'center',
              boxShadow: '0 0 15px ' + stat.color + '33',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '5px' }}>{stat.emoji}</div>
              <div style={{ fontSize: '10px', color: '#999', letterSpacing: '1px' }}>{stat.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* XP Bar */}
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          border: '2px solid #00ffff',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '25px',
          boxShadow: '0 0 20px rgba(0,255,255,0.3)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px', color: '#00ffff' }}>
            <span>EXPERIENCE</span>
            <span>{player.xp}/{player.maxXp}</span>
          </div>
          <div style={{
            width: '100%',
            height: '25px',
            background: 'rgba(0,0,0,0.5)',
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid #00ffff',
          }}>
            <div style={{
              width: progress + '%',
              height: '100%',
              background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
              transition: 'width 0.5s ease-out',
              boxShadow: '0 0 15px rgba(0,255,255,0.8)',
            }} />
          </div>
        </div>

        {/* Edit Modal */}
        {editingId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1a0033, #0a0015)',
              border: '3px solid #00ffff',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '400px',
              boxShadow: '0 0 40px rgba(0,255,255,0.5)',
            }}>
              <h2 style={{ marginTop: 0, color: '#00ffff' }}>✏️ EDIT QUEST</h2>
              
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#00ffff' }}>QUEST NAME</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #00ffff',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#0f0',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#00ffff' }}>XP REWARD</label>
                <input
                  type="number"
                  value={editXp}
                  onChange={(e) => setEditXp(Math.max(10, parseInt(e.target.value) || 0))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #00ffff',
                    background: 'rgba(0,0,0,0.5)',
                    color: '#0f0',
                    borderRadius: '5px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={saveEdit}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'linear-gradient(135deg, #00ff00, #00ffaa)',
                    border: 'none',
                    color: '#000',
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  SAVE
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'rgba(255,50,50,0.3)',
                    border: '2px solid #ff3333',
                    color: '#ff3333',
                    fontWeight: 'bold',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quests Section */}
        <h2 style={{ fontSize: '20px', marginBottom: '15px', color: '#00ffff', letterSpacing: '2px' }}>
          QUESTS ({done}/{total})
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          {player.quests.map(quest => (
            <div
              key={quest.id}
              style={{
                background: quest.done ? 'rgba(0,0,0,0.5)' : 'linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1))',
                border: '2px solid ' + (quest.done ? '#666' : '#00ffff'),
                borderRadius: '8px',
                padding: '15px',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                cursor: 'pointer',
              }}
            >
              <button
                onClick={() => completeQuest(quest.id)}
                disabled={quest.done}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '2px solid ' + (quest.done ? '#666' : '#00ffff'),
                  background: quest.done ? 'rgba(0,255,255,0.2)' : 'transparent',
                  color: '#00ffff',
                  fontSize: '20px',
                  cursor: quest.done ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {quest.done ? '✅' : '⚔️'}
              </button>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: quest.done ? '#999' : '#fff',
                }}>
                  {quest.title}
                </div>
                <div style={{ fontSize: '12px', color: '#00ffff' }}>
                  +{quest.xp} XP
                </div>
              </div>

              <button
                onClick={() => startEdit(quest)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(0,150,255,0.3)',
                  border: '1px solid #0099ff',
                  color: '#0099ff',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                EDIT
              </button>

              <button
                onClick={() => deleteQuest(quest.id)}
                style={{
                  padding: '8px 12px',
                  background: 'rgba(255,50,50,0.3)',
                  border: '1px solid #ff3333',
                  color: '#ff3333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                DELETE
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={addQuest}
            style={{
              flex: 1,
              padding: '15px',
              background: 'linear-gradient(135deg, #00ffff, #00ff00)',
              border: 'none',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ADD QUEST
          </button>
          <button
            onClick={reset}
            style={{
              flex: 1,
              padding: '15px',
              background: 'linear-gradient(135deg, #ff6600, #ffaa00)',
              border: 'none',
              color: '#000',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            RESET DAY
          </button>
          <button
            onClick={() => setSound(!sound)}
            style={{
              padding: '15px 20px',
              background: sound ? 'linear-gradient(135deg, #00ff00, #00ffaa)' : 'rgba(100,100,100,0.3)',
              border: '2px solid ' + (sound ? '#00ff00' : '#666'),
              color: sound ? '#000' : '#999',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            {sound ? '🔊' : '🔇'}
          </button>
        </div>

        {/* Progress Message */}
        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          padding: '15px',
          background: 'rgba(0,0,0,0.6)',
          border: '2px solid #ff00ff',
          borderRadius: '8px',
          color: '#ff00ff',
          fontWeight: 'bold',
          fontSize: '16px',
        }}>
          {done === total ? '🏆 PERFECT DAY! 🏆' : (total - done) + ' quest' + (total - done !== 1 ? 's' : '') + ' remaining'}
        </div>
      </div>
    </div>
  );
}

export default App;
