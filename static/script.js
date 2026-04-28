/* =========================================================
   PRITIREKHA MISHRA — PORTFOLIO INTERACTIONS
   ========================================================= */

(() => {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* -------- LOADING SCREEN -------- */
  const loader = $('#loadingScreen');
  const loaderBar = $('#loaderBar');
  let p = 0;
  const tick = setInterval(() => {
    p += Math.random() * 14 + 6;
    if (p >= 100) { p = 100; clearInterval(tick); setTimeout(hideLoader, 350); }
    if (loaderBar) loaderBar.style.width = p + '%';
  }, 120);
  function hideLoader() {
    loader?.classList.add('hidden');
    document.body.style.overflow = '';
    setTimeout(() => loader?.remove(), 700);
  }
  document.body.style.overflow = 'hidden';

  /* -------- CUSTOM CURSOR -------- */
  const glow = $('#cursorGlow');
  const dot  = $('#cursorDot');
  if (glow && dot && matchMedia('(pointer: fine)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2;
    let gx = mx, gy = my;
    addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      gx += (mx - gx) * 0.12;
      gy += (my - gy) * 0.12;
      glow.style.transform = `translate(${gx}px, ${gy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    $$('a, button, .btn, .project-card, .skill-card, input, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => dot.classList.add('active'));
      el.addEventListener('mouseleave', () => dot.classList.remove('active'));
    });
  }

  /* -------- PARTICLES -------- */
  const particles = $('#particles');
  if (particles) {
    const COUNT = innerWidth < 640 ? 20 : 45;
    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('span');
      el.className = 'particle';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.animationDuration = (12 + Math.random() * 18) + 's';
      el.style.animationDelay = -Math.random() * 20 + 's';
      el.style.opacity = .3 + Math.random() * .6;
      el.style.transform = `scale(${.5 + Math.random() * 1.4})`;
      particles.appendChild(el);
    }
  }

  /* -------- NAVBAR + SCROLLSPY -------- */
  const navbar = $('#navbar');
  const navLinks = $$('.nav-link');
  const sections = $$('section[id]');
  const onScroll = () => {
    const y = scrollY;
    navbar?.classList.toggle('scrolled', y > 30);
    backTop?.classList.toggle('visible', y > 600);

    let current = sections[0]?.id;
    sections.forEach(sec => {
      if (sec.offsetTop - 120 <= y) current = sec.id;
    });
    navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === current));
  };
  addEventListener('scroll', onScroll, { passive: true });

  /* -------- MOBILE MENU -------- */
  const mt = $('#mobileToggle');
  const mm = $('#mobileMenu');
  const closeMenu = () => { mt?.classList.remove('active'); mm?.classList.remove('open'); document.body.style.overflow = ''; };
  mt?.addEventListener('click', () => {
    const open = mm?.classList.toggle('open');
    mt.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMenu));

  /* -------- SMOOTH SCROLL -------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const t = $(id);
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      }
    });
  });

  /* -------- ROTATING TITLES -------- */
  const rotating = $$('.rotating-text');
  let rIdx = 0;
  if (rotating.length > 1) {
    setInterval(() => {
      rotating[rIdx].classList.remove('active');
      rIdx = (rIdx + 1) % rotating.length;
      rotating[rIdx].classList.add('active');
    }, 2400);
  }

  /* -------- REVEAL ON SCROLL -------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add('in-view');
        // skill bars
        $$('.skill-progress', en.target).forEach(b => {
          b.style.width = (b.dataset.progress || 0) + '%';
        });
        // counters
        $$('.stat-number', en.target).forEach(c => animateCount(c));
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
  $$('[data-reveal]').forEach(el => io.observe(el));
  $$('.skill-card').forEach(el => io.observe(el));

  function animateCount(el) {
    const target = +el.dataset.count || 0;
    const dur = 1600;
    const start = performance.now();
    const tickC = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased);
      if (t < 1) requestAnimationFrame(tickC);
    };
    requestAnimationFrame(tickC);
  }

  /* -------- 3D TILT -------- */
  $$('[data-tilt]').forEach(card => {
    const inner = card.querySelector('.project-card-inner') || card;
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      inner.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(0)`;
    });
    card.addEventListener('mouseleave', () => {
      inner.style.transform = '';
    });
  });

  /* -------- AVATAR PARALLAX -------- */
  const avatar = $('#avatarContainer');
  if (avatar) {
    const card = avatar.querySelector('.avatar-card');
    avatar.addEventListener('mousemove', e => {
      const r = avatar.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      if (card) card.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg)`;
    });
    avatar.addEventListener('mouseleave', () => { if (card) card.style.transform = ''; });
  }

  /* -------- HERO MOUSE PARALLAX (orbs) -------- */
  const heroGrad = $('.hero-gradient');
  if (heroGrad) {
    addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth  - 0.5) * 30;
      const y = (e.clientY / innerHeight - 0.5) * 30;
      heroGrad.style.transform = `translate(${x}px, ${y}px)`;
    });
  }

  /* -------- BUTTON RIPPLE -------- */
  $$('.btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--rx', `${e.clientX - r.left}px`);
      btn.style.setProperty('--ry', `${e.clientY - r.top}px`);
    });
  });

  /* -------- BACK TO TOP -------- */
  const backTop = $('#backToTop');
  backTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  /* -------- CONTACT FORM -------- */
const sendOtpBtn = $('#sendOtpBtn');
const otpWrap = $('#otpWrap');
const verifyBtn = $('#verifyBtn');
const statusMsg = $('#statusMsg');

let otpTimer;
let secondsLeft = 120;

sendOtpBtn?.addEventListener('click', async () => {
    const email = $('#email').value.trim();

    if (!email) {
        statusMsg.innerText = "Please enter your email.";
        return;
    }

    sendOtpBtn.disabled = true;
    sendOtpBtn.querySelector('.btn-text').textContent = "Sending OTP...";

    const res = await fetch('/send-otp', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ email })
    });

    const data = await res.json();

    if (data.success) {
        otpWrap.style.display = 'block';
        verifyBtn.style.display = 'block';

        statusMsg.innerText = `Verification code sent to ${email}`;

        clearInterval(otpTimer);
        secondsLeft = 120;

        otpTimer = setInterval(() => {
            let min = Math.floor(secondsLeft / 60);
            let sec = secondsLeft % 60;

            statusMsg.innerText =
              `OTP sent to ${email} • Expires in ${min}:${sec < 10 ? '0' : ''}${sec}`;

            secondsLeft--;

            if (secondsLeft < 0) {
                clearInterval(otpTimer);
                statusMsg.innerText = "OTP expired. Please request a new code.";
            }
        }, 1000);

    } else {
        statusMsg.innerText = data.message;
    }

    sendOtpBtn.disabled = false;
    sendOtpBtn.querySelector('.btn-text').textContent = "Send OTP";
});


$('#contactForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
        name: $('#name').value.trim(),
        email: $('#email').value.trim(),
        message: $('#message').value.trim(),
        otp: $('#otp').value.trim()
    };

    verifyBtn.disabled = true;
    verifyBtn.querySelector('.btn-text').textContent = "Verifying...";

    const res = await fetch('/verify-contact', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
        clearInterval(otpTimer);
        statusMsg.innerText = "Message sent successfully ";
        e.target.reset();
        otpWrap.style.display = "none";
        verifyBtn.style.display = "none";
    } else {
        statusMsg.innerText = data.message;
    }

    verifyBtn.disabled = false;
    verifyBtn.querySelector('.btn-text').textContent = "Verify & Send Message";
});
  

  onScroll();
})();
