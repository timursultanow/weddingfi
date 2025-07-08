import React, { useRef, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';

const WEDDING_DATE = new Date('2025-07-27T16:30:00');
const PHRASES = [
  'ещё есть время придумать, в чём ты придёшь',
  'не забудь позвонить бабушке. она уже переживает',
  'успеешь: выспаться, купить подарок, и передумать. но не надо.',
  'главное — не забыть хорошее настроение',
  'платье гладится, туфли наточены, всё почти готово...'
];
const PRO_MODE = [
  'ты активировал режим: гость-профессионал',
  'тебе можно дважды взять салат',
  'ты имеешь право хлопать первым после тоста',
  'тебе можно зевать, но с уважением'
];
const LIFEHACKS = [
  'вход — только в хорошем настроении',
  'дресс-код: "всё, в чём ты готов пить шампанское стоя"',
  'подарки: можно, не можно — уточни позже',
  'опоздания: допускаются, но без понтов',
  'поцелуи: в пределах нормы'
];

// --- Telegram WebApp SDK ---
declare global {
  interface Window {
    Telegram?: any;
  }
}
const tg = typeof window !== 'undefined' && window.Telegram ? window.Telegram.WebApp : undefined;

function useTelegramInit() {
  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
    }
  }, []);
}

function useTelegramTheme() {
  const [theme, setTheme] = useState({
    bg_color: '#000',
    text_color: '#fff',
    button_color: '#1976d2',
    button_text_color: '#fff',
  });
  useEffect(() => {
    if (tg && tg.themeParams) {
      setTheme({
        bg_color: tg.themeParams.bg_color || '#000',
        text_color: tg.themeParams.text_color || '#fff',
        button_color: tg.themeParams.button_color || '#1976d2',
        button_text_color: tg.themeParams.button_text_color || '#fff',
      });
    }
  }, []);
  return theme;
}

function downloadICS() {
  const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:Свадьба Тимурки и Викуши\nDTSTART;TZID=Europe/Moscow:20250727T163000\nDTEND;TZID=Europe/Moscow:20250727T200000\nLOCATION:Москва, ул. Примерная, д. 1\nDESCRIPTION:Главное событие года!\nEND:VEVENT\nEND:VCALENDAR`;
  const blob = new Blob([ics.replace(/\n/g, '\r\n')], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'wedding.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function MainScreen() {
  useTelegramInit();
  const theme = useTelegramTheme();
  const navigate = useNavigate();
  // Получение имени пользователя из Telegram
  const [user, setUser] = useState<{first_name?: string, username?: string} | null>(null);
  useEffect(() => {
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
      setUser(tg.initDataUnsafe.user);
    }
  }, []);
  return (
    <div className="App" style={{background: theme.bg_color, color: theme.text_color, minHeight:'100vh'}}>
      <div className="header">
        <div className="title">💍 тимурка + викуша</div>
        <div className="subtitle">
          {user ? `привет, ${user.first_name || user.username || 'гость'}! ` : ''}
          нажми кнопку, получи веселье. смарт-контракт уже начался
        </div>
      </div>
      <div className="main-buttons">
        <button className="main-btn" style={{background: theme.button_color, color: theme.button_text_color}} onClick={() => navigate('/info')}>📅 что, где, когда</button>
        <button className="main-btn" style={{background: theme.button_color, color: theme.button_text_color}} onClick={() => navigate('/quiz')}>🧠 экзамен</button>
        <button className="main-btn" style={{background: theme.button_color, color: theme.button_text_color}} onClick={() => navigate('/alcometer')}>🍹 алкометр</button>
        <button className="main-btn" style={{background: theme.button_color, color: theme.button_text_color}} onClick={() => navigate('/toast')}>🎤 говори красиво</button>
      </div>
    </div>
  );
}

function InfoScreen() {
  const [phraseIdx, setPhraseIdx] = React.useState(() => Math.floor(Math.random() * PHRASES.length));
  const [lifehacks, setLifehacks] = React.useState(false);
  const [proMode, setProMode] = React.useState(false);
  const [proMsg, setProMsg] = React.useState('');
  const [secTap, setSecTap] = React.useState(0);
  const [cursor, setCursor] = React.useState(true);
  const secTapTimeout = useRef<NodeJS.Timeout | null>(null);
  React.useEffect(() => {
    const blink = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(blink);
  }, []);
  React.useEffect(() => {
    if (secTap === 5) {
      setProMode(true);
      setProMsg(PRO_MODE[Math.floor(Math.random() * PRO_MODE.length)]);
      const timeout = setTimeout(() => setProMode(false), 3500);
      setSecTap(0);
      return () => clearTimeout(timeout);
    }
  }, [secTap]);
  // Таймер
  const [timeLeft, setTimeLeft] = React.useState(WEDDING_DATE.getTime() - Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(WEDDING_DATE.getTime() - Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  if (timeLeft <= 0) return <div className="App"><div className="header"><div className="title">ты идёшь{cursor ? '_' : ''}</div></div><div className="event-card">Смарт-контракт уже начался!</div></div>;
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);
  return (
    <div className="App">
      <div className="header">
        <div className="title">ты идёшь{cursor ? '_' : ''}</div>
      </div>
      <div className="event-card">
        <div className="event-row"><b>Дата:</b> 27 июля 2025, 16:30</div>
        <div className="event-row"><b>Адрес:</b> Москва, ул. Примерная, д. 1</div>
        <a className="event-map" href="https://yandex.ru/maps/?text=Москва, ул. Примерная, д. 1" target="_blank" rel="noopener noreferrer">🔗 Открыть на карте</a>
      </div>
      <div className="timer-label-fat">до начала осталось:</div>
      <div className="timer-fat">
        <span className="timer-fat-cell">{days} д</span>
        <span className="timer-fat-cell">{hours} ч</span>
        <span className="timer-fat-cell">{minutes} м</span>
        <span className="timer-fat-cell" onClick={() => setSecTap(t => t+1)} style={{cursor:'pointer'}}>{seconds} с</span>
      </div>
      <div className="timer-phrase" onClick={() => setPhraseIdx((i) => (i+1)%PHRASES.length)}>
        {proMode ? <b style={{color:'#00e5e5'}}>{proMsg}</b> : PHRASES[phraseIdx]}
      </div>
      <button className="main-btn" style={{maxWidth:340, margin:'0 auto 16px auto'}} onClick={() => setLifehacks(l => !l)}>🧠 что важно знать?</button>
      {lifehacks && (
        <div className="event-lifehacks">
          {LIFEHACKS.map((l, i) => <div key={i} className="event-lifehack-row">{l}</div>)}
        </div>
      )}
      <div className="event-bottom-phrase">если ты дочитал до сюда — ты уже морально на месте.</div>
      <button className="info-bottom-btn" onClick={() => window.history.back()}>← Назад</button>
    </div>
  );
}

function QuizScreen() {
  const questions = [
    {
      q: 'как зовут жениха?',
      options: [
        'Тимур',
        'Темур',
        'Арнольд',
        'я забыл(а), но он красавчик',
      ],
      correct: 0,
      memes: [
        '👍 Одобрено!',
        '😼 Почти!',
        '🕷️ Спайдермен не приедет',
        '😎 Главное — честность!',
      ],
    },
    {
      q: 'что символизирует белое платье невесты?',
      options: [
        'чистоту и нежность',
        'способность выгуливать наряд без капель кетчупа',
        'белую бумагу для whitepaper',
        'это просто рофл — изначально был костюм Человека-Паука',
      ],
      correct: 0,
      memes: [
        '🤍 Классика!',
        '🍅 Уважение к навыкам!',
        '📄 Крипто-ответ!',
        '🕸️ Marvel style!',
      ],
    },
  ];
  const [step, setStep] = React.useState(0);
  const [selected, setSelected] = React.useState<number|null>(null);
  const [showMeme, setShowMeme] = React.useState(false);
  const handleSelect = (idx: number) => {
    setSelected(idx);
    setShowMeme(true);
    setTimeout(() => {
      setShowMeme(false);
      setSelected(null);
      setStep(s => (s + 1 < questions.length ? s + 1 : 0));
    }, 1200);
  };
  const q = questions[step];
  return (
    <div className="App">
      <div className="header">
        <div className="title">🧠 экзамен</div>
        <div className="subtitle">мини-квиз для гостей</div>
      </div>
      <div className="event-card" style={{textAlign:'center'}}>
        <div style={{fontSize:'1.15rem', marginBottom:16}}>{q.q}</div>
        {q.options.map((opt, i) => (
          <button
            key={i}
            className="main-btn"
            style={{marginBottom:10, background: selected===i ? '#42a5f5' : undefined}}
            onClick={() => handleSelect(i)}
            disabled={selected!==null}
          >
            {String.fromCharCode(97+i)}) {opt}
          </button>
        ))}
        {showMeme && selected!==null && (
          <div style={{marginTop:18, fontSize:'1.3rem'}}>{q.memes[selected]}</div>
        )}
      </div>
      <button className="info-bottom-btn" onClick={() => window.history.back()}>← Назад</button>
    </div>
  );
}

function AlcometerScreen() {
  const stages = [
    { label: 'Трезвый', meme: ['🧊 Ты в зоне тамады', '🧊 Пока только нюхаешь бокал', '🧊 Сохраняешь ясность мысли'], emoji: '🍾', taps: 4, window: 2000 },
    { label: 'Разогрев', meme: ['🍸 Уже веселее!', '🍸 Первый тост пошёл!', '🍸 Греешься, как надо'], emoji: '🍸', taps: 6, window: 1800 },
    { label: 'В процессе', meme: ['🍹 Ты уже в зоне танцпола', '🍹 Пора на бар!', '🍹 Селфи с женихом — done'], emoji: '🍹', taps: 8, window: 1600 },
    { label: 'На взлёте', meme: ['🥳 Ещё один шот — и ты на фото с тёщей', '🥳 Ты уже в stories у всех', '🥳 Танцуешь, как будто никто не видит'], emoji: '🥃', taps: 10, window: 1400 },
    { label: 'Вдохновение', meme: ['🎤 Ты готов к тосту!', '🎤 Пора сказать пару слов', '🎤 Микрофон уже у тебя'], emoji: '🥂', taps: 12, window: 1200 },
    { label: 'Философ', meme: ['🦉 Ты рассуждаешь о смысле жизни', '🦉 Пора вспомнить анекдот', '🦉 Глубокие разговоры с барменом'], emoji: '🍷', taps: 14, window: 1000 },
    { label: 'Wasted', meme: ['💀 Если ты это читаешь — ты уже пьян', '💀 Ты на фото с тёщей в обнимку', '💀 Пора домой... или на бис!'], emoji: '🥴', taps: 10, window: 1000 },
  ];
  const [level, setLevel] = React.useState(0);
  const [tapCount, setTapCount] = React.useState(0);
  const [tapStart, setTapStart] = React.useState<number|null>(null);
  const [shaking, setShaking] = React.useState(false);
  const [memeIdx, setMemeIdx] = React.useState(() => Math.floor(Math.random()*3));
  const [egg, setEgg] = React.useState(false);
  React.useEffect(() => { setMemeIdx(Math.floor(Math.random()*3)); }, [level]);
  React.useEffect(() => {
    if (tapCount === stages[level].taps) {
      setTimeout(() => {
        setLevel(l => (l < stages.length - 1 ? l + 1 : l));
        setTapCount(0);
        setTapStart(null);
      }, 200);
    }
  }, [tapCount, level]);
  React.useEffect(() => {
    if (tapStart !== null) {
      const timer = setTimeout(() => {
        setTapCount(0);
        setTapStart(null);
      }, stages[level].window);
      return () => clearTimeout(timer);
    }
  }, [tapStart, tapCount, level]);
  // Easter egg: если на Wasted натапать ещё 10 раз за 1 сек — пасхалка
  React.useEffect(() => {
    if (level === stages.length-1 && tapCount === 10) {
      setEgg(true);
      setTimeout(() => setEgg(false), 3500);
      setTapCount(0);
      setTapStart(null);
    }
  }, [tapCount, level]);
  const handleTap = () => {
    setShaking(true);
    setTimeout(() => setShaking(false), 120);
    if (tapStart === null) {
      setTapStart(Date.now());
      setTapCount(1);
    } else {
      setTapCount(c => Math.min(c+1, stages[level].taps));
    }
  };
  const handleReset = () => { setLevel(0); setTapCount(0); setTapStart(null); setEgg(false); };
  const progress = tapCount / stages[level].taps;
  return (
    <div className="App">
      <div className="header">
        <div className="title">🍹 алкометр</div>
        <div className="subtitle">тапай по бутылке, чтобы перейти на новый уровень</div>
      </div>
      <div className="event-card" style={{textAlign:'center', minHeight: 320, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:18}}>
          {stages.map((s, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: '50%',
              background: i <= level ? (i===level ? '#42a5f5' : '#1E88E5') : '#222',
              border: i === level ? '3px solid #fff' : '2px solid #444',
              display:'flex', alignItems:'center', justifyContent:'center',
              color:'#fff', fontWeight:700, fontSize: i===stages.length-1? '1.1rem':'1rem',
              transition:'background 0.2s, border 0.2s',
              animation: i===level && shaking ? 'alco-pulse 0.2s infinite alternate' : undefined,
              boxShadow: i===level && level===stages.length-1 ? '0 0 16px 4px #f00' : undefined,
              filter: i===level && level===stages.length-1 ? 'brightness(1.5)' : undefined,
            }}>{i+1}</div>
          ))}
        </div>
        <div style={{margin:'0 0 18px 0', width:'100%', maxWidth:220, display:'flex', flexDirection:'column', alignItems:'center'}}>
          <div
            onClick={level===stages.length-1?undefined:handleTap}
            style={{
              fontSize: 48,
              cursor: level===stages.length-1?'not-allowed':'pointer',
              userSelect:'none',
              display:'inline-block',
              animation: shaking ? 'shake 0.15s infinite alternate' : undefined,
              filter: level===stages.length-1 ? 'grayscale(0.7)' : undefined,
              marginBottom: 8,
              transition:'filter 0.2s',
            }}
            aria-label="Бутылка"
          >{stages[level].emoji}</div>
          {level!==stages.length-1 && (
            <div style={{height:10, background:'#222', borderRadius:6, width:'100%', maxWidth:180, overflow:'hidden', marginBottom:8}}>
              <div style={{height:10, background:'#1E88E5', width:`${progress*100}%`, borderRadius:6, transition:'width 0.2s'}}></div>
            </div>
          )}
          {level!==stages.length-1 && (
            <div style={{fontSize:12, color:'#888', marginBottom:8}}>
              тапни {stages[level].taps} раз за {stages[level].window/1000} сек, чтобы перейти дальше
            </div>
          )}
        </div>
        <div style={{fontSize:'1.1rem', margin:'12px 0 18px 0', minHeight:32, transition:'color 0.2s', color: level===stages.length-1 ? '#f00' : '#fff'}}>
          {egg ? <b>🥚 Ты активировал режим: бармен-профи!<br/>Теперь тебе можно наливать без очереди!</b> : stages[level].meme[memeIdx]}
        </div>
        <button className="event-ics" onClick={handleReset} style={{marginBottom:0, background:'#222', color:'#fff', border:'none'}}>обнулить</button>
      </div>
      <button className="info-bottom-btn" onClick={() => window.history.back()}>← Назад</button>
      <style>{`
        @keyframes alco-pulse {
          0% { box-shadow: 0 0 0 0 #1E88E5; }
          100% { box-shadow: 0 0 16px 4px #1E88E5; }
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
          75% { transform: translateX(-3px); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function ToastScreen() {
  const TOASTS = [
    'за то, чтобы в холодильнике всегда было что-то вкусное и странное одновременно',
    'за любовь, которая не спрашивает курс доллара',
    'пусть чебурек не упадёт маслом на белое',
    'за смех, который начинается там, где заканчивается здравый смысл',
    'чтобы никто не вышел голодным и грустным',
    'за новые свитшоты и старые шутки',
    'за утро, которое не стыдно вспомнить',
    'пусть морс льётся рекой и никогда не кончается vpn',
    'за людей, которые умеют сидеть на полу и быть счастливыми',
    'чтобы бабушка сказала: ну ладно, живите',
    'за танец, который начнётся случайно',
    'пусть ваши разговоры будут дольше зарядки на айфоне',
    'за мир, где никто не делит плед',
    'пусть форель будет свежей, а новости — нет',
    'за тишину, в которой слышно: всё ок',
    'пусть списки Вики спасают мир',
    'за Тимура, который всегда найдёт enter',
    'пусть коты приходят вовремя, даже если их нет',
    'за смелость покупать странные вещи ночью',
    'пусть любовь не знает дедлайнов',
    'за окна, через которые видно только хорошее',
    'пусть дождь будет только для антуража',
    'за кофе, который наливают молча, но с добром',
    'пусть никто не забудет тапочки',
    'за тех, кто хлопает первым',
    'пусть все фото будут без кринжа, но с правдой',
    'за списки, которые никогда не заканчиваются',
    'пусть торты будут с сюрпризами, но без изюма',
    'за тех, кто не боится выкинуть мусор ночью',
    'пусть плед укроет всё, что надо укрыть',
    'за ту музыку, под которую не стыдно плакать',
    'пусть никто не потеряет носки',
    'за смех под одеялом',
    'пусть картошка всегда будет горячей',
    'за людей, которые умеют просто сидеть рядом',
    'пусть никакой баг не сломает смарт-контракт любви',
    'за окна, которые открываются легко',
    'пусть морс будет кислым, но жизнь — сладкой',
    'за гостей, которые не боятся громко зевать',
    'пусть телефон вовремя выключается сам',
    'за соседей, которые умеют не слышать',
    'пусть все вилки вернутся домой',
    'за тот самый момент: "ну ладно, остаёмся"',
    'пусть никто не вспомнит пароль от грусти',
    'за диван, который держит всех',
    'пусть никто не опоздает на медляк',
    'за тех, кто всегда верит: "ну будет лучше"',
    'пусть чай никогда не остывает раньше времени',
    'за дурацкие кружки с надписями',
    'пусть ложка не упадёт на белое',
    'за память, которая хранит смешное',
    'пусть всё важное будет написано на ладони',
    'за глаза, которые улыбаются раньше рта',
    'пусть розетки будут ближе, чем кажется',
    'за шампанское, которое не заканчивается внезапно',
    'пусть никто не спрячется от фотоаппарата',
    'за тех, кто громко хлопает дверью, но возвращается',
    'пусть все ключи будут у правильных людей',
    'за разговоры после двух',
    'пусть кто-то всегда скажет: "ну и пусть"',
    'за дороги домой без ям',
    'пусть никто не забудет пароль от вайфая',
    'за окна, которые никогда не закрываются полностью',
    'пусть форель будет мягче курса биткоина',
    'за тосты, которые не стыдно перечитать утром',
    'пусть никто не вынесет мусор до того, как всё скажет',
    'за смех под одеялом, ещё раз',
    'пусть кот придёт вовремя',
    'за тех, кто не боится быть странным',
    'пусть в холодильнике всегда будет что-то неожиданное',
    'за смелость выключить свет, когда страшно',
    'пусть никто не проснётся один',
    'за перчатки, которые не теряются',
    'пусть носки всегда есть пара',
    'за кофе, который наливают с молчаливым согласием',
    'пусть все списки будут дописаны',
    'за окна, которые моют раз в год и ничего',
    'пусть не будет вопросов без обнимашек',
    'за плед, который старше всех нас',
    'пусть никто не забудет выключить утюг',
    'за глупые стикеры в телеге',
    'пусть голосовые будут короче, чем ожидалось',
    'за смех, который делает нас ближе',
    'пусть никто не забудет захватить пакет',
    'за морс, который спасает разговор',
    'пусть все кружки будут чистыми вовремя',
    'за "ну давай ещё посидим"',
    'пусть никто не скажет: "пора расходиться"',
    'за ключи, которые не теряются в сумке',
    'пусть повара будут счастливы',
    'за музыку, которая найдёт тебя сама',
    'пусть никто не прольёт шампанское на кроссовки',
    'за фотки, которые смешнее, чем хотелось бы',
    'пусть никто не стесняется громко хлопать',
    'за гостей, которые не заберут вилки',
    'пусть дождь будет тёплым',
    'за странные подарки без повода',
    'пусть всё хорошее повторится',
    'за то, что мы все здесь',
    'пусть любовь будет такой, какой хочется',
  ];
  const [toast, setToast] = React.useState(() => TOASTS[Math.floor(Math.random()*TOASTS.length)]);
  const handleToast = () => {
    let next;
    do {
      next = TOASTS[Math.floor(Math.random()*TOASTS.length)];
    } while (next === toast && TOASTS.length > 1);
    setToast(next);
  };
  return (
    <div className="App">
      <div className="header">
        <div className="title">🎤 говори красиво</div>
        <div className="subtitle">нажми кнопку — получи тост</div>
      </div>
      <div className="event-card" style={{textAlign:'center', minHeight:120, display:'flex', flexDirection:'column', justifyContent:'center'}}>
        <div style={{fontSize:'1.25rem', marginBottom:24, minHeight:60, lineHeight:1.3}}>{toast}</div>
        <button className="main-btn" onClick={handleToast}>дай тост</button>
      </div>
      <button className="info-bottom-btn" onClick={() => window.history.back()}>← Назад</button>
    </div>
  );
}

function App() {
  return (
    <Router basename="/weddingfi">
      <Routes>
        <Route path="/" element={<MainScreen />} />
        <Route path="/info" element={<InfoScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/alcometer" element={<AlcometerScreen />} />
        <Route path="/toast" element={<ToastScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
