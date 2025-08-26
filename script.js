const PROFILE_PATH = './profile.json';

function select(selector) { return document.querySelector(selector); }
function create(elementName, className, textContent) {
  const element = document.createElement(elementName);
  if (className) element.className = className;
  if (textContent !== undefined) element.textContent = textContent;
  return element;
}

function formatDateRange(start, end) {
  if (!start && !end) return '';
  const endLabel = end && end.toLowerCase() !== 'present' ? end : 'حتى الآن';
  return [start, endLabel].filter(Boolean).join(' - ');
}

function applySavedThemePreference() {
  const saved = localStorage.getItem('cv-theme');
  const html = document.documentElement;
  if (saved === 'dark' || (saved === null && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    html.setAttribute('data-theme', 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('cv-theme', next);
}

function wireControls() {
  const themeToggleButton = select('#theme-toggle');
  const printButton = select('#print-button');
  themeToggleButton?.addEventListener('click', toggleTheme);
  printButton?.addEventListener('click', () => window.print());
}

function setLastUpdated() {
  const target = select('#last-updated');
  const now = new Date();
  const formatted = new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' }).format(now);
  if (target) target.textContent = `آخر تحديث: ${formatted}`;
}

function renderProfileHeader(profile) {
  select('#profile-name').textContent = profile.name || 'الاسم';
  select('#profile-title').textContent = profile.title || '';
  select('#profile-location').textContent = profile.location || '';

  const contactsContainer = select('#profile-contacts');
  contactsContainer.innerHTML = '';
  const contacts = profile.contacts || {};
  const addContact = (label, value, href) => {
    if (!value) return;
    const link = create('a', 'btn btn-outline');
    link.href = href || value;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = label;
    contactsContainer.appendChild(link);
  };
  addContact('📧 بريد', contacts.email, `mailto:${contacts.email}`);
  addContact('🌐 موقع', contacts.website, contacts.website);
  addContact('💼 LinkedIn', contacts.linkedin, contacts.linkedin);
  addContact('💻 GitHub', contacts.github, contacts.github);
  addContact('📞 هاتف', contacts.phone, `tel:${contacts.phone}`);

  const pdfLink = select('#pdf-link');
  if (profile.pdf_url) {
    pdfLink.classList.remove('hidden');
    pdfLink.href = profile.pdf_url;
  } else {
    pdfLink.classList.add('hidden');
  }
}

function renderSummary(profile) {
  select('#profile-summary').textContent = profile.summary || '';
}

function renderChips(containerSelector, items) {
  const container = select(containerSelector);
  container.innerHTML = '';
  (items || []).forEach(item => {
    const chip = create('span', 'chip', typeof item === 'string' ? item : (item.name || ''));
    container.appendChild(chip);
  });
}

function renderSkills(profile) {
  const allSkills = (profile.skills || []).flatMap(group => Array.isArray(group.items) ? group.items : group);
  renderChips('#skills-content', allSkills);
}

function renderLanguages(profile) {
  const languages = (profile.languages || []).map(l => l.level ? `${l.name} – ${l.level}` : l.name);
  renderChips('#languages-content', languages);
}

function renderInterests(profile) {
  renderChips('#interests-content', profile.interests || []);
}

function renderCard(containerSelector, title, subtitle, meta, bodyNodes) {
  const container = select(containerSelector);
  const card = create('article', 'card');
  const h3 = create('h3', null, title);
  const subtitleElement = subtitle ? create('div', 'meta', subtitle) : null;
  const metaElement = meta ? create('div', 'meta', meta) : null;
  card.appendChild(h3);
  if (subtitleElement) card.appendChild(subtitleElement);
  if (metaElement) card.appendChild(metaElement);
  (bodyNodes || []).forEach(n => card.appendChild(n));
  container.appendChild(card);
}

function renderExperience(profile) {
  const containerSelector = '#experience-content';
  select(containerSelector).innerHTML = '';
  (profile.experience || []).forEach(job => {
    const bullets = create('ul');
    (job.achievements || []).forEach(line => bullets.appendChild(create('li', null, line)));
    const meta = [job.company, job.location].filter(Boolean).join(' • ');
    const date = formatDateRange(job.start, job.end);
    const subtitle = [meta, date].filter(Boolean).join(' – ');
    renderCard(containerSelector, job.role || '', subtitle, null, [bullets]);
  });
}

function renderProjects(profile) {
  const containerSelector = '#projects-content';
  select(containerSelector).innerHTML = '';
  (profile.projects || []).forEach(proj => {
    const details = create('div');
    if (proj.description) details.appendChild(create('p', null, proj.description));
    if (Array.isArray(proj.highlights) && proj.highlights.length) {
      const ul = create('ul');
      proj.highlights.forEach(line => ul.appendChild(create('li', null, line)));
      details.appendChild(ul);
    }
    if (Array.isArray(proj.stack) && proj.stack.length) {
      const stackRow = create('div', 'chips');
      proj.stack.forEach(s => stackRow.appendChild(create('span', 'chip', s)));
      details.appendChild(stackRow);
    }

    const title = proj.link ? `${proj.name} ↗` : (proj.name || '');
    renderCard(containerSelector, title, proj.link || '', null, [details]);
    if (proj.link) {
      const lastCard = select(containerSelector).lastElementChild;
      lastCard.querySelector('h3').style.cursor = 'pointer';
      lastCard.querySelector('h3').addEventListener('click', () => window.open(proj.link, '_blank', 'noopener'));
    }
  });
}

function renderEducation(profile) {
  const containerSelector = '#education-content';
  select(containerSelector).innerHTML = '';
  (profile.education || []).forEach(ed => {
    const meta = [ed.institution, ed.location].filter(Boolean).join(' • ');
    const date = formatDateRange(ed.start, ed.end);
    const subtitle = [meta, date].filter(Boolean).join(' – ');
    renderCard(containerSelector, ed.degree || '', subtitle, null, []);
  });
}

async function loadProfile() {
  try {
    const response = await fetch(PROFILE_PATH, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const profile = await response.json();
    renderProfileHeader(profile);
    renderSummary(profile);
    renderSkills(profile);
    renderExperience(profile);
    renderProjects(profile);
    renderEducation(profile);
    renderLanguages(profile);
    renderInterests(profile);
  } catch (error) {
    console.error('Failed to load profile:', error);
    const summary = select('#summary');
    summary.insertAdjacentHTML('beforeend', '<p style="color: #b91c1c">تعذر تحميل بيانات السيرة الذاتية. تأكد من تشغيل خادم محلي.</p>');
  }
}

(function init() {
  applySavedThemePreference();
  wireControls();
  setLastUpdated();
  loadProfile();
})();