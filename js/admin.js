const BASE_URL = "http://127.0.0.1:5000";

// ================= INIT =================
document.addEventListener("DOMContentLoaded", () => {
    bindLoginForm();
    bindProjectForm();
    bindSidebarLinks();
    bindLogout();
    bindPasswordToggle();
    bindMobileMenu();

    const token = localStorage.getItem("token");
    if (token) {
        showDashboard();
        loadDashboardData();
    } else {
        showLogin();
    }
});

// ================= STATE UI =================
function showLogin() {
    const loginPage = document.getElementById("loginPage");
    const dashboardPage = document.getElementById("dashboardPage");
    if (loginPage) loginPage.classList.remove("hidden");
    if (dashboardPage) dashboardPage.classList.add("hidden");
}

function showDashboard() {
    const loginPage = document.getElementById("loginPage");
    const dashboardPage = document.getElementById("dashboardPage");
    if (loginPage) loginPage.classList.add("hidden");
    if (dashboardPage) dashboardPage.classList.remove("hidden");
}

function switchPage(pageName) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.add("hidden");
    });

    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.classList.remove("active");
    });

    const targetSection = document.getElementById(`${pageName}Section`);
    if (targetSection) targetSection.classList.remove("hidden");

    const activeLink = document.querySelector(`.sidebar-link[data-page="${pageName}"]`);
    if (activeLink) activeLink.classList.add("active");

    if (pageName === "projects") loadProjects();
}

// ================= LOGIN =================
function bindLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("loginEmail")?.value.trim();
        const password = document.getElementById("loginPassword")?.value.trim();

        try {
            const res = await fetch(`${BASE_URL}/api/token/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok || !data.access) {
                showToast("Invalid credentials", "error");
                return;
            }

            localStorage.setItem("token", data.access);
            showDashboard();
            loadDashboardData();
            showToast("Login successful", "success");
        } catch (err) {
            console.error("Login error:", err);
            showToast("Server error during login", "error");
        }
    });
}

// ================= DASHBOARD DATA =================
async function loadDashboardData() {
    await loadProjects();
    switchPage("dashboard");
}

// ================= PROJECTS =================
async function loadProjects() {
    try {
        const res = await fetch(`${BASE_URL}/api/projects/`);
        const data = await res.json();

        const grid = document.getElementById("projectsGrid");
        if (!grid) return;

        grid.innerHTML = "";

        const projects = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];

        if (projects.length === 0) {
            grid.innerHTML = `
                <div class="glass-card p-6 col-span-full text-center text-gray-400">
                    No projects added yet.
                </div>
            `;
        } else {
            projects.forEach((p) => {
                const card = `
                    <div class="glass-card p-5">
                        <div class="mb-3">
                            <h3 class="text-xl font-bold mb-2">${escapeHtml(p.title || "")}</h3>
                            <p class="text-gray-400 text-sm mb-3">${escapeHtml(p.description || "")}</p>
                        </div>

                        <div class="flex flex-wrap gap-2 mb-4">
                            ${(p.tech_stack || []).map(t => `<span class="tag">${escapeHtml(String(t).trim())}</span>`).join("")}
                        </div>

                        <div class="flex flex-wrap gap-2 mb-4">
                            ${p.demo_link ? `<a href="${p.demo_link}" target="_blank" class="text-cyan-400 text-sm underline">Live Demo</a>` : ""}
                            ${p.github_link ? `<a href="${p.github_link}" target="_blank" class="text-purple-400 text-sm underline">GitHub</a>` : ""}
                        </div>

                        <div class="flex justify-end gap-3 mt-3">
                            <button onclick="fillProjectForm(${p.id}, '${jsEscape(p.title || "")}', '${jsEscape(p.description || "")}', '${jsEscape((p.tech_stack || []).join(", "))}', '${jsEscape(p.image || "")}', '${jsEscape(p.demo_link || "")}', '${jsEscape(p.github_link || "")}', ${p.featured ? "true" : "false"})"
                                class="text-cyan-400 hover:text-cyan-300">
                                Edit
                            </button>
                            <button onclick="deleteProject(${p.id})" class="text-red-400 hover:text-red-300">
                                Delete
                            </button>
                        </div>
                    </div>
                `;
                grid.innerHTML += card;
            });
        }

        const totalProjects = document.getElementById("totalProjects");
        if (totalProjects) totalProjects.innerText = String(projects.length);
    } catch (err) {
        console.error("Load projects error:", err);
        showToast("Failed to load projects", "error");
    }
}

function bindProjectForm() {
    const projectForm = document.getElementById("projectForm");
    if (!projectForm) return;

    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const token = localStorage.getItem("token");
        if (!token) {
            showToast("Please login first", "error");
            showLogin();
            return;
        }

        const projectId = document.getElementById("projectId")?.value.trim();

        // ✅ GET VALUES
        const title = document.getElementById("projectTitle")?.value.trim();
        const description = document.getElementById("projectDescription")?.value.trim();
        const demoLink = document.getElementById("projectDemo")?.value.trim();

        // ✅ VALIDATION (🔥 IMPORTANT FIX)
        if (!title || !description || !demoLink) {
            showToast("Title, Description and Demo link are required", "error");
            return;
        }

        // ✅ CREATE OBJECT
        const project = {
            title,
            description,
            tech_stack: (document.getElementById("projectTech")?.value || "")
                .split(",")
                .map(x => x.trim())
                .filter(Boolean),
            image: document.getElementById("projectImage")?.value.trim(),
            demo_link: demoLink,
            github_link: document.getElementById("projectGithub")?.value.trim(),
            featured: document.getElementById("projectFeatured")?.classList.contains("active")
        };

        const isEdit = Boolean(projectId);
        const url = isEdit
            ? `${BASE_URL}/api/projects/${projectId}/`
            : `${BASE_URL}/api/projects/`;

        const method = isEdit ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                },
                body: JSON.stringify(project)
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error("Backend error:", errText);
                showToast(isEdit ? "Update failed" : "Project add failed", "error");
                return;
            }

            closeProjectModal();
            await loadProjects();

            const totalProjects = document.getElementById("totalProjects");
            if (totalProjects) {
                totalProjects.innerText = document.querySelectorAll("#projectsGrid .glass-card").length;
            }

            showToast(isEdit ? "Project updated" : "Project added", "success");

        } catch (err) {
            console.error("Project save error:", err);
            showToast("Server error while saving project", "error");
        }
    });
}


async function deleteProject(id) {
    const token = localStorage.getItem("token");
    if (!token) {
        showToast("Please login first", "error");
        return;
    }

    const confirmDelete = confirm("Delete this project?");
    if (!confirmDelete) return;

    try {
        const res = await fetch(`${BASE_URL}/api/projects/${id}/`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!res.ok) {
            showToast("Delete failed", "error");
            return;
        }

        await loadProjects();
        showToast("Project deleted", "success");
    } catch (err) {
        console.error("Delete error:", err);
        showToast("Server error while deleting", "error");
    }
}

function openProjectModal() {
    const modal = document.getElementById("projectModal");
    if (modal) modal.classList.remove("hidden");

    // 🔥 IMPORTANT FIX
    const projectId = document.getElementById("projectId");
    if (projectId) projectId.value = "";
}
function closeProjectModal() {
    const modal = document.getElementById("projectModal");
    if (modal) modal.classList.add("hidden");

    const form = document.getElementById("projectForm");
    if (form) form.reset();

    const projectId = document.getElementById("projectId");
    if (projectId) projectId.value = "";

    const title = document.getElementById("projectModalTitle");
    if (title) title.textContent = "Add Project";

    const featured = document.getElementById("projectFeatured");
    if (featured) featured.classList.remove("active");
}

function fillProjectForm(id, title, description, tech, image, demo, github, featured) {
    openProjectModal();

    document.getElementById("projectId").value = id;
    document.getElementById("projectTitle").value = title;
    document.getElementById("projectDescription").value = description;
    document.getElementById("projectTech").value = tech;
    document.getElementById("projectImage").value = image;
    document.getElementById("projectDemo").value = demo;
    document.getElementById("projectGithub").value = github;

    const modalTitle = document.getElementById("projectModalTitle");
    if (modalTitle) modalTitle.textContent = "Edit Project";

    const featuredToggle = document.getElementById("projectFeatured");
    if (featuredToggle) {
        if (featured) featuredToggle.classList.add("active");
        else featuredToggle.classList.remove("active");
    }
}

// ================= SIDEBAR =================
function bindSidebarLinks() {
    document.querySelectorAll(".sidebar-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) switchPage(page);
        });
    });
}

// ================= LOGOUT =================
function bindLogout() {
    const logoutBtn = document.getElementById("logoutBtn");
    const mobileLogoutBtn = document.getElementById("mobileLogoutBtn");

    const logout = () => {
        localStorage.removeItem("token");
        showLogin();
        showToast("Logged out", "success");
    };

    if (logoutBtn) logoutBtn.addEventListener("click", logout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener("click", logout);
}

// ================= PASSWORD TOGGLE =================
function bindPasswordToggle() {
    const toggleBtn = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("loginPassword");
    if (!toggleBtn || !passwordInput) return;

    toggleBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        toggleBtn.innerHTML = isPassword
            ? '<i class="fas fa-eye-slash"></i>'
            : '<i class="fas fa-eye"></i>';
    });
}

// ================= MOBILE MENU =================
function bindMobileMenu() {
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.getElementById("sidebar");
    if (!mobileMenuBtn || !sidebar) return;

    mobileMenuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("open");
    });
}

// ================= TOAST =================
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type} px-4 py-3 text-white`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ================= HELPERS =================
function escapeHtml(str) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function jsEscape(str) {
    return String(str)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "");
}