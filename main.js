// OctoPay site: theme toggle and waitlist form.

// Where waitlist sign-ups are sent. Set this to the form service's endpoint
// (Formspree, Tally, Loops...) once one is chosen. Until then the form only
// says it isn't connected, so nobody thinks they've signed up.
const WAITLIST_ENDPOINT = '';

(function theme() {
  const root = document.documentElement;
  const btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  const isDark = () =>
    root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  btn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
})();

(function waitlist() {
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  document.querySelectorAll('[data-waitlist]').forEach((form) => {
    const email = form.querySelector('input[name="email"]');
    const button = form.querySelector('button');
    const status = form.querySelector('.form-status');
    const say = (text, kind) => { status.textContent = text; status.className = 'form-status ' + (kind || ''); };

    email.addEventListener('input', () => email.removeAttribute('aria-invalid'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const value = email.value.trim();
      if (!EMAIL.test(value)) {
        email.setAttribute('aria-invalid', 'true');
        say('Please enter a valid email address.', 'err');
        email.focus();
        return;
      }
      if (!WAITLIST_ENDPOINT) {
        say("Preview only: the waitlist isn't connected yet, so this email wasn't saved.", 'err');
        return;
      }

      const data = new FormData(form);
      data.set('email', value);
      button.disabled = true;
      say('Adding you…');
      try {
        const res = await fetch(WAITLIST_ENDPOINT, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(String(res.status));
        form.classList.add('done');
        say("You're on the list. We'll email you when OctoPay launches.", 'ok');
      } catch (err) {
        say('Something went wrong. Please try again in a minute.', 'err');
      } finally {
        button.disabled = false;
      }
    });
  });
})();
