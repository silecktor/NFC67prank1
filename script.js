const page = document.getElementById('page');
const browserIcon = document.getElementById('browserIcon');
const titleElement = document.getElementById('title');
const subtitleElement = document.getElementById('subtitle');
const errorCodeElement = document.getElementById('errorCode');
const hintText = document.getElementById('hintText');
const refreshButton = document.getElementById('refreshButton');
const audio = document.getElementById('prankAudio');
let audioStarted = false;
let audioContext;
const browserInfo = {
  chrome: {
    icon: '😕',
    title: 'Не удаётся получить доступ к сайту',
    subtitle: 'Проверьте подключение к сети или повторите попытку позже.',
    code: 'ERR_CONNECTION_TIMED_OUT',
    button: 'Обновить',
    hint: 'Нажмите «Обновить», чтобы повторить запрос.'
  },
  safari: {
    icon: '😟',
    title: 'Страница недоступна',
    subtitle: 'Не удалось загрузить страницу.',
    code: 'Соединение отсутствует',
    button: 'Загрузить снова',
    hint: 'Нажмите «Загрузить снова» и подождите.'
  },
  firefox: {
    icon: '😵',
    title: 'Не удалось подключиться',
    subtitle: 'Страница недоступна.',
    code: 'Ресурс не отвечает',
    button: 'Попробовать снова',
    hint: 'Проверьте соединение и повторите попытку.'
  },
  yandex: {
    icon: '🙁',
    title: 'Сайт недоступен',
    subtitle: 'Попробуйте обновить страницу.',
    code: 'ERR_CONNECTION_TIMED_OUT',
    button: 'Обновить',
    hint: 'Нажмите «Обновить», чтобы повторить запрос.'
  },
  edge: {
    icon: '😟',
    title: 'Не удалось подключиться',
    subtitle: 'Сервер слишком долго отвечает.',
    code: 'STATUS_CONNECTION_TIMED_OUT',
    button: 'Повторить',
    hint: 'Нажмите «Повторить» для обновления страницы.'
  },
  generic: {
    icon: '😕',
    title: 'Сайт недоступен',
    subtitle: 'Ошибка подключения.',
    code: 'ERR_CONNECTION_TIMED_OUT',
    button: 'Обновить',
    hint: 'Нажмите кнопку для повторной загрузки.'
  }
};
function detectBrowser() {
  const ua = navigator.userAgent;
  if (/YaBrowser/i.test(ua)) return 'yandex';
  if (/Edg\//.test(ua) || /Edge\//.test(ua)) return 'edge';
  if (/OPR\//.test(ua) || /Opera\//.test(ua)) return 'chrome';
  if (/Firefox\//.test(ua)) return 'firefox';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua) && !/Chromium\//.test(ua)) return 'safari';
  if (/Chrome\//.test(ua) || /CriOS\//.test(ua)) return 'chrome';
  return 'generic';
}
function applyBrowserStyles(browser) {
  const info = browserInfo[browser] || browserInfo.generic;
  page.className = `page ${browser}`;
  browserIcon.textContent = info.icon;
  titleElement.textContent = info.title;
  subtitleElement.textContent = info.subtitle;
  errorCodeElement.textContent = info.code;
  refreshButton.textContent = info.button;
  hintText.textContent = info.hint;
}
function blockBack() {
  history.pushState(null, '', location.href);
}
function disableRefreshKeys(event) {
  if (event.key === 'F5' || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r')) {
    event.preventDefault();
  }
}
function preventPullToRefresh(event) {
  if (window.scrollY === 0 && event.touches.length === 1) {
    event.preventDefault();
  }
}
function startAudio() {
  if (audioStarted) return;
  audioStarted = true;
  refreshButton.disabled = true;
  refreshButton.textContent = 'Запуск...';
  audio.volume = 1;
  audio.muted = false;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(audio);
      source.connect(audioContext.destination);
      audioContext.resume().catch(() => {});
    }
  } catch (error) {
    // Некоторые браузеры не позволяют создавать контекст повторно
  }
  audio.play().catch(() => {
    // Если воспроизведение не стартует, оставляем кнопку активной для повторной попытки
    refreshButton.disabled = false;
    refreshButton.textContent = browserInfo[detectBrowser()].button;
  });
  page.classList.add('playing');
  refreshButton.textContent = 'Звук запущен';
  hintText.textContent = 'Закройте вкладку, чтобы остановить звук.';
  blockBack();
  history.pushState(null, '', location.href);
}
window.addEventListener('load', () => {
  applyBrowserStyles(detectBrowser());
  blockBack();
});
window.addEventListener('popstate', () => {
  blockBack();
});
refreshButton.addEventListener('click', startAudio);
window.addEventListener('keydown', disableRefreshKeys, { passive: false });
window.addEventListener('touchmove', preventPullToRefresh, { passive: false });
window.addEventListener('visibilitychange', () => {
  if (audioStarted && audio.paused) {
    audio.play().catch(() => {});
  }
});
