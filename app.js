const STORAGE_KEY = 'daily-fitness-tracker-v2';
const OLD_STORAGE_KEY = 'daily-fitness-tracker-v1';
let selectedDate = todayKey();
let deferredPrompt = null;

const $ = (id) => document.getElementById(id);
const els = {
  datePicker: $('datePicker'), formTitle: $('formTitle'), form: $('workoutForm'), condition: $('condition'),
  bodyWeight: $('bodyWeight'), runKm: $('runKm'), runMin: $('runMin'), runMemo: $('runMemo'), memo: $('memo'), exerciseList: $('exerciseList'),
  addExerciseBtn: $('addExerciseBtn'), clearDayBtn: $('clearDayBtn'), calendar: $('calendar'), history: $('history'),
  weekKm: $('weekKm'), weekSessions: $('weekSessions'), streak: $('streak'), latestWeight: $('latestWeight'), exportBtn: $('exportBtn'), installBtn: $('installBtn')
};

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function todayKey() { return toDateKey(new Date()); }
function loadAll() {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) return JSON.parse(current) || {};
    const old = localStorage.getItem(OLD_STORAGE_KEY);
    if (old) {
      localStorage.setItem(STORAGE_KEY, old);
      return JSON.parse(old) || {};
    }
    return {};
  } catch { return {}; }
}
function saveAll(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function fmt(dateKey) { const [y,m,d]=dateKey.split('-'); return `${m}/${d}`; }
function fullFmt(dateKey) { const [y,m,d]=dateKey.split('-'); return `${y}.${m}.${d}`; }

function emptyRecord() { return { condition: '보통', bodyWeight: '', runKm: '', runMin: '', runMemo: '', memo: '', exercises: [] }; }
function getRecord(dateKey) { return loadAll()[dateKey] || emptyRecord(); }

function addExercise(ex = {}) {
  const node = $('exerciseTemplate').content.cloneNode(true);
  const item = node.querySelector('.exercise-item');
  item.querySelector('.ex-name').value = ex.name || '';
  item.querySelector('.ex-weight').value = ex.weight || '';
  item.querySelector('.ex-reps').value = ex.reps || '';
  item.querySelector('.ex-sets').value = ex.sets || '';
  item.querySelector('.delete-ex').addEventListener('click', () => item.remove());
  els.exerciseList.appendChild(node);
}

function readForm() {
  const exercises = [...els.exerciseList.querySelectorAll('.exercise-item')].map(item => ({
    name: item.querySelector('.ex-name').value.trim(),
    weight: item.querySelector('.ex-weight').value,
    reps: item.querySelector('.ex-reps').value,
    sets: item.querySelector('.ex-sets').value
  })).filter(ex => ex.name || ex.weight || ex.reps || ex.sets);
  return {
    condition: els.condition.value,
    bodyWeight: els.bodyWeight.value,
    runKm: els.runKm.value,
    runMin: els.runMin.value,
    runMemo: els.runMemo.value.trim(),
    memo: els.memo.value.trim(),
    exercises,
    updatedAt: new Date().toISOString()
  };
}

function fillForm(dateKey) {
  const rec = getRecord(dateKey);
  els.formTitle.textContent = `${fullFmt(dateKey)} 운동 기록`;
  els.datePicker.value = dateKey;
  els.condition.value = rec.condition || '보통';
  els.bodyWeight.value = rec.bodyWeight || '';
  els.runKm.value = rec.runKm || '';
  els.runMin.value = rec.runMin || '';
  els.runMemo.value = rec.runMemo || '';
  els.memo.value = rec.memo || '';
  els.exerciseList.innerHTML = '';
  (rec.exercises && rec.exercises.length ? rec.exercises : [{}]).forEach(addExercise);
}

function hasMeaningful(rec) {
  return rec && (Number(rec.bodyWeight) > 0 || Number(rec.runKm) > 0 || Number(rec.runMin) > 0 || (rec.exercises || []).length || rec.memo || rec.runMemo || rec.condition === '휴식');
}

function renderCalendar() {
  const data = loadAll();
  const base = new Date(selectedDate + 'T00:00:00');
  const start = new Date(base); start.setDate(base.getDate() - 20);
  els.calendar.innerHTML = '';
  for (let i=0; i<35; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const key = toDateKey(d);
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'day'; btn.textContent = d.getDate();
    if (hasMeaningful(data[key])) btn.classList.add('has');
    if (key === selectedDate) btn.classList.add('active');
    btn.addEventListener('click', () => { selectedDate = key; fillForm(key); renderAll(); window.scrollTo({top: 0, behavior: 'smooth'}); });
    els.calendar.appendChild(btn);
  }
}

function renderSummary() {
  const data = loadAll();
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now); monday.setDate(now.getDate() - day + 1); monday.setHours(0,0,0,0);
  let km = 0, sessions = 0;
  Object.entries(data).forEach(([key, rec]) => {
    const date = new Date(key + 'T00:00:00');
    if (date >= monday && hasMeaningful(rec)) { km += Number(rec.runKm || 0); sessions++; }
  });
  let streak = 0;
  for (let i=0; i<365; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    if (hasMeaningful(data[key])) streak++; else break;
  }
  const latestWeightEntry = Object.entries(data)
    .filter(([, rec]) => Number(rec.bodyWeight) > 0)
    .sort((a, b) => b[0].localeCompare(a[0]))[0];
  els.weekKm.textContent = `${km.toFixed(km % 1 ? 1 : 0)} km`;
  els.weekSessions.textContent = `${sessions}회`;
  els.streak.textContent = `${streak}일`;
  els.latestWeight.textContent = latestWeightEntry ? `${Number(latestWeightEntry[1].bodyWeight).toFixed(1)} kg` : '- kg';
}

function renderHistory() {
  const data = loadAll();
  const entries = Object.entries(data).filter(([,rec]) => hasMeaningful(rec)).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,10);
  els.history.innerHTML = entries.length ? '' : '<p class="muted">아직 저장된 기록이 없습니다.</p>';
  entries.forEach(([key, rec]) => {
    const exText = (rec.exercises || []).map(ex => `${ex.name || '운동'} ${ex.weight || '-'}kg × ${ex.reps || '-'}회 × ${ex.sets || '-'}세트`).join('<br>');
    const div = document.createElement('div');
    div.className = 'history-item';
    div.innerHTML = `<strong>${fullFmt(key)} · ${rec.condition || '보통'}</strong>
      <p>${rec.bodyWeight ? '몸무게: ' + rec.bodyWeight + 'kg · ' : ''}러닝: ${rec.runKm || 0}km / ${rec.runMin || 0}분 ${rec.runMemo ? '· ' + rec.runMemo : ''}</p>
      ${exText ? `<p>${exText}</p>` : ''}
      ${rec.memo ? `<p>메모: ${rec.memo}</p>` : ''}`;
    div.addEventListener('click', () => { selectedDate = key; fillForm(key); renderAll(); window.scrollTo({top:0, behavior:'smooth'}); });
    els.history.appendChild(div);
  });
}
function renderAll() { renderCalendar(); renderSummary(); renderHistory(); }

els.datePicker.value = selectedDate;
els.datePicker.addEventListener('change', e => { selectedDate = e.target.value || todayKey(); fillForm(selectedDate); renderAll(); });
els.addExerciseBtn.addEventListener('click', () => addExercise());
els.form.addEventListener('submit', e => {
  e.preventDefault();
  const data = loadAll(); data[selectedDate] = readForm(); saveAll(data); renderAll();
  els.form.querySelector('.primary-btn').textContent = '저장 완료!';
  setTimeout(() => els.form.querySelector('.primary-btn').textContent = '기록 저장', 900);
});
els.clearDayBtn.addEventListener('click', () => {
  const data = loadAll(); delete data[selectedDate]; saveAll(data); fillForm(selectedDate); renderAll();
});
els.exportBtn.addEventListener('click', async () => {
  const blob = new Blob([JSON.stringify(loadAll(), null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a');
  a.href = url; a.download = `fitness-backup-${todayKey()}.json`; a.click(); URL.revokeObjectURL(url);
});

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; els.installBtn.classList.remove('hidden'); });
els.installBtn.addEventListener('click', async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; els.installBtn.classList.add('hidden'); });

if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
fillForm(selectedDate); renderAll();
