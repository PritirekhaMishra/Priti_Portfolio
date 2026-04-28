const BASE_URL = "http://192.168.1.22:5000";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    lucide.createIcons();
    type();
    createParticles();
    setupScrollReveal();
    setupNavbar();
    setupMobileMenu();
    setupContactForm();
    loadProjects(); // 🔥 dynamic projects
});

// ================= TYPING =================
const typingElement = document.getElementById('typing-text');
const phrases = ['Full Stack Developer', 'Problem Solver', 'Tech Enthusiast'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const current = phrases[phraseIndex];

    typingElement.textContent = isDeleting
        ? current.substring(0, charIndex--)
        : current.substring(0, charIndex++);

    if (!isDeleting && charIndex === current.length) {
        isDeleting = true;
        setTimeout(type, 1500);
        return;
    }

    if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
    }

    setTimeout(type, isDeleting ? 50 : 100);
}

// ================= NAVBAR =================
function setupNavbar() {
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.classList.add('py-2');
            navbar.classList.remove('py-4');
        } else {
            navbar.classList.add('py-4');
            navbar.classList.remove('py-2');
        }
    });
}

// ================= MOBILE MENU =================
function setupMobileMenu() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });
}

// ================= PARTICLES =================
function createParticles() {
    const container = document.getElementById('particles');

    for (let i = 0; i < 30; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 10 + 's';
        container.appendChild(p);
    }
}

// ================= SCROLL REVEAL =================
function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('active');
            }
        });
    });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ================= PROJECT FETCH (🔥 IMPORTANT) =================
async function loadProjects() {
    try {
        const res = await fetch(`${BASE_URL}/api/projects/`);
        const data = await res.json();

        console.log("Projects from backend:", data);

        const container = document.getElementById("projectsContainer");

        if (!container) {
            console.error("projectsContainer not found");
            return;
        }

        container.innerHTML = "";

        const projects = data.results || data;

        projects.forEach(p => {
            const projectHTML = `
            <div class="glass rounded-2xl p-6 hover:scale-[1.02] transition-all">
                
                <div class="flex flex-wrap gap-2 mb-3">
                    ${(p.tech_stack || []).map(t => `
                        <span class="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                            ${t}
                        </span>
                    `).join("")}
                </div>

                <h3 class="text-xl font-bold text-white mb-2">
                    ${p.title}
                </h3>

                <p class="text-gray-400 mb-4 text-sm">
                    ${p.description}
                </p>

                <div class="flex gap-3">
                    ${p.demo_link ? `
                        <a href="${p.demo_link}" target="_blank"
                           class="px-4 py-2 bg-cyan-500 rounded text-white text-sm">
                           Live
                        </a>
                    ` : ""}

                    ${p.github_link ? `
                        <a href="${p.github_link}" target="_blank"
                           class="px-4 py-2 bg-gray-700 rounded text-white text-sm">
                           GitHub
                        </a>
                    ` : ""}
                </div>

            </div>
            `;

            container.innerHTML += projectHTML;
        });

    } catch (err) {
        console.error("Error fetching projects:", err);
    }
}

// ================= CONTACT FORM =================
function setupContactForm() {
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const inputs = form.querySelectorAll("input, textarea");

        const data = {
            name: inputs[0].value,
            email: inputs[1].value,
            subject: inputs[2].value,
            message: inputs[3].value
        };

        try {
            await fetch(`${BASE_URL}/api/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            showNotification("Message sent successfully!");
            form.reset();

        } catch (err) {
            console.error(err);
            showNotification("Error sending message");
        }
    });
}

// ================= RESUME DOWNLOAD FIX =================
function downloadResume() {
    const link = document.createElement("a");

    link.href = "Pritirekha Mishra resume-1.docx";  
    link.download = "Pritirekha_Mishra_Resume.docx";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ================= NOTIFICATION =================
function showNotification(message) {
    const n = document.createElement('div');
    n.className = 'fixed bottom-4 right-4 glass px-5 py-3 rounded-xl text-white';
    n.innerText = message;

    document.body.appendChild(n);

    setTimeout(() => n.remove(), 3000);
}