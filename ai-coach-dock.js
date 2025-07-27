(function () {
  'use strict';
  
  // Elementy DOM
  const dock = document.getElementById('ai-coach-dock');
  const aiIcon = document.getElementById('ai-coach-icon');
  const aiSvg = document.getElementById('ai-icon-svg');
  const aiLoader = document.getElementById('ai-coach-loader');
  const dockText = document.getElementById('ai-coach-dock-text');
  const btnPause = document.getElementById('ai-coach-pause');
  const btnResume = document.getElementById('ai-coach-resume');

  // Stan
  let paused = localStorage.getItem('ai_coach_pause') === '1';
  let idleTimer = null;
  let aiMode = "rest"; // 'rest' | 'thinking' | 'assist' | 'paused'

  // Podpowiedzi dla kalkulatora pomp ciepła
  const aiTips = [
    "Możesz pominąć pole 'Ilość okien' – nie musisz wpisywać dokładnie!",
    "Nie wiesz jaką moc wybrać? Kliknij 'Oblicz' – podpowiem automatycznie.",
    "Pamiętaj: im lepsza izolacja, tym mniejsza pompa wystarczy.",
    "Jeśli nie znasz roku budowy – wpisz przybliżony.",
    "Sprawdź strefę klimatyczną na mapie – to wpływa na dobór pompy.",
    "Dla budynków po 2000 roku wybierz lepszą izolację.",
    "CWU to ciepła woda użytkowa – zaznacz jeśli potrzebujesz.",
    "Wysokość kondygnacji standardowo to 2,7m.",
    "Typ ogrzewania wpływa na wydajność pompy ciepła.",
    "Im więcej okien, tym większe straty ciepła."
  ];

  // Stan domyślny
  function setRestMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "rest";
    aiSvg.style.display = "";
    aiLoader.hidden = true;
    dockText.textContent = "INTELIGENTNA POMOC";
    if (btnPause) btnPause.hidden = false;
    if (btnResume) btnResume.hidden = true;
    dock.classList.remove('ai-coach-paused');
  }

  // AI „myśli/ładuje się" (po 4s idle)
  function setThinkingMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "thinking";
    aiSvg.style.display = "none";
    aiLoader.hidden = false;
    dockText.textContent = "Wyszukiwanie wskazówki…";
    if (btnPause) btnPause.hidden = false;
    if (btnResume) btnResume.hidden = true;
  }

  // AI wyświetla podpowiedź
  function setAssistMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "assist";
    aiSvg.style.display = "none";
    aiLoader.hidden = true;
    const tip = aiTips[Math.floor(Math.random() * aiTips.length)];
    dockText.textContent = tip;
    if (btnPause) btnPause.hidden = false;
    if (btnResume) btnResume.hidden = true;
  }

  // Tryb OFF/PAUSE
  function setPausedMode() {
    if (!dock || !dockText || !aiSvg || !aiLoader) return;
    
    aiMode = "paused";
    aiSvg.style.display = "none";
    aiLoader.hidden = true;
    dockText.textContent = "SZTUCZNA INTELIGENCJA WYŁĄCZONA – BRAK WSPARCIA AI-ASSISTANT";
    if (btnPause) btnPause.hidden = true;
    if (btnResume) btnResume.hidden = false;
    dock.classList.add('ai-coach-paused');
  }

  // Przejście do trybu pauzy
  function pauseAI() {
    paused = true;
    localStorage.setItem('ai_coach_pause', '1');
    clearTimeout(idleTimer);
    setPausedMode();
  }
  
  // Wznów AI
  function resumeAI() {
    paused = false;
    localStorage.setItem('ai_coach_pause', '0');
    setRestMode();
    startIdleTimer();
  }

  // Start od właściwego trybu
  function initializeAI() {
    if (!dock) return;
    
    if (paused) {
      setPausedMode();
    } else {
      setRestMode();
      startIdleTimer();
    }
  }

  // Główna logika idle
  function startIdleTimer() {
    if (paused || !dock) return;
    clearTimeout(idleTimer);
    setRestMode();
    idleTimer = setTimeout(() => {
      setThinkingMode();
      setTimeout(() => {
        if (aiMode === "thinking") setAssistMode();
      }, 1600); // animacja „myślenia"
    }, 4000);
  }

  // Reset na dowolną akcję użytkownika
  function resetIdleTimer() {
    if (paused || !dock) return;
    clearTimeout(idleTimer);
    setRestMode();
    startIdleTimer();
  }

  // Inicjalizacja po załadowaniu DOM
  function initialize() {
    // Sprawdź czy elementy istnieją
    if (!dock) {
      console.warn('AI Coach Dock: Element #ai-coach-dock nie został znaleziony');
      return;
    }

    // Dodaj nasłuchiwanie na akcje użytkownika
    ['input','change','click','keydown','mousemove','touchstart'].forEach(ev =>
      window.addEventListener(ev, resetIdleTimer, true)
    );

    // Przycisk pauzy / wznów
    if (btnPause) btnPause.addEventListener('click', pauseAI);
    if (btnResume) btnResume.addEventListener('click', resumeAI);

    // Dostępność – kliknięcie ikony „AI"
    if (aiIcon) {
      aiIcon.addEventListener('click', function () {
        if (paused) return;
        setAssistMode();
      });
    }

    // Inicjalizuj AI
    initializeAI();
  }

  // API dla deva: wywołaj asystenta ręcznie
  window.aiCoachDockShow = setAssistMode;
  window.aiCoachDockPause = pauseAI;
  window.aiCoachDockResume = resumeAI;

  // Inicjalizuj gdy DOM jest gotowy
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();