// ── Password Gate ──
const PASSWORD = 'mlb';

function checkPassword() {
  const input = document.getElementById('password-input').value;
  if (input === PASSWORD) {
    sessionStorage.setItem('auth', '1');
    document.getElementById('password-gate').classList.add('hidden');
  } else {
    document.getElementById('password-error').textContent = 'Incorrect password.';
    document.getElementById('password-input').value = '';
    document.getElementById('password-input').focus();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('auth') === '1') {
    document.getElementById('password-gate').classList.add('hidden');
  }
  document.getElementById('password-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') checkPassword();
  });
});

function copyBib() {
  const text = document.getElementById('bib-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.copy-btn');
    btn.textContent = 'Copied!';
    setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
  });
}

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
