const BENCHMARK = 1_000_000_000_000; // $1 trillion
const PER_DAY = 10_000_000;          // $10 million / day
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const dob = document.getElementById('dob');
const btn = document.getElementById('calcBtn');
const results = document.getElementById('results');
const errorEl = document.getElementById('error');

// Auto-insert slashes as the user types digits, while still allowing backspace.
dob.addEventListener('input', () => {
  const digits = dob.value.replace(/\D/g, '').slice(0, 8);
  let out = digits.slice(0, 2);
  if (digits.length >= 3) out += '/' + digits.slice(2, 4);
  if (digits.length >= 5) out += '/' + digits.slice(4, 8);
  dob.value = out;
});

// Parse "MM/DD/YYYY" into a Date, returning null if it isn't a real calendar date.
function parseDOB(str) {
  const m = str.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const month = +m[1], day = +m[2], year = +m[3];
  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null; // e.g. 02/30/2000 rolled over
  }
  return d;
}

function fmtMoney(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

// Rounded, word-scale form: "$40.2 billion", "$1.1 trillion", "$50 million".
function fmtMoneyShort(n) {
  const units = [[1e12, 'trillion'], [1e9, 'billion'], [1e6, 'million']];
  for (const [v, name] of units) {
    if (Math.abs(n) >= v) {
      const str = (n / v).toFixed(1).replace(/\.0$/, '');
      return '$' + str + ' ' + name;
    }
  }
  return fmtMoney(n);
}

function fmtPct(p) {
  if (p === 0) return '0%';
  if (p < 0.0001) return p.toExponential(2) + '%';
  if (p < 0.01) return p.toFixed(4) + '%';
  if (p < 1) return p.toFixed(2) + '%';
  return p.toFixed(1) + '%';
}

function calculate() {
  errorEl.textContent = '';
  if (!dob.value.trim()) {
    errorEl.textContent = 'Please enter a date of birth.';
    return;
  }
  const birth = parseDOB(dob.value);
  if (!birth) {
    errorEl.textContent = 'Please enter a valid date as MM/DD/YYYY.';
    return;
  }
  const now = new Date();
  if (birth > now) {
    errorEl.textContent = "That date is in the future.";
    return;
  }

  const days = Math.floor((now - birth) / MS_PER_DAY);
  const years = (days / 365.25);
  const total = days * PER_DAY;
  const pct = (total / BENCHMARK) * 100;

  document.getElementById('totalAmount').textContent = fmtMoneyShort(total);
  document.getElementById('daysCaption').textContent =
    `earned over ${years.toFixed(1)} years`;
  document.getElementById('pctVal').textContent = fmtMoneyShort(total);

  document.getElementById('leadPara').innerHTML =
    `In the <strong>${days.toLocaleString('en-US')} days</strong> since you were born, ` +
    `a steady ten million dollars a day would leave you ` +
    `with <strong>${fmtMoney(total)}</strong>.`;

  const yearsLabel = document.getElementById('yearsToGo');
  const aboveBar = document.getElementById('aboveBar');
  const peoplePara = document.getElementById('peoplePara');
  let context;
  if (total >= BENCHMARK) {
    yearsLabel.textContent = '';
    aboveBar.innerHTML = `That clears the <strong>$1 trillion</strong> mark.`;
    context = `A feat no single lifetime of $10M days could normally reach.`;
    peoplePara.innerHTML = '';
  } else {
    const yearsToGo = (BENCHMARK - total) / PER_DAY / 365.25;
    const perDayNeeded = BENCHMARK / days;
    const reachDate = new Date(birth.getTime() + (BENCHMARK / PER_DAY) * MS_PER_DAY);
    yearsLabel.textContent = `≈ ${Math.round(yearsToGo).toLocaleString('en-US')} more years to go`;
    aboveBar.innerHTML = `That is about <strong>${fmtPct(pct)}</strong> of $1 trillion, ` +
      `which means that, even at $10 million per day, it will still take you until <strong>${reachDate.getFullYear()}</strong> to become a trillionaire.`;
      const others = Math.round(BENCHMARK / total) - 1;
    peoplePara.innerHTML = `To already have $1 trillion, it would have taken you and ` +
      `<strong>${others.toLocaleString('en-US')} other people</strong> born on ${dob.value} ` +
      `earning $10 million a day since birth.`;
    context = `Put another way: You would have needed to earn about ` +
      `<strong>${fmtMoneyShort(perDayNeeded)}</strong> every single day since you were born to be a trillionaire.`;
  }
  document.getElementById('contextPara').innerHTML = context;

  results.classList.add('show');
  const fill = document.getElementById('barFill');
  fill.style.width = '0';
  requestAnimationFrame(() => {
    fill.style.width = Math.min(pct, 100) + '%';
  });
}

btn.addEventListener('click', calculate);
dob.addEventListener('keydown', (e) => { if (e.key === 'Enter') calculate(); });
