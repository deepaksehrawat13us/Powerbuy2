// session.js — shared login state + UI management (robust)
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("powerbuyUser"));
  
    // Find ANY element linking to signup.html (handles "/signup.html" or "signup.html")
    const signupEls = Array.from(document.querySelectorAll("a,button")).filter(el => {
      const href = (el.getAttribute("href") || "").toLowerCase();
      // endsWith covers "/signup.html" and "signup.html"
      return href.endsWith("signup.html") || href.endsWith("/signup.html");
    });
  
    // Utility: ensure welcome + logout exist in a given container (desktop nav or mobile menu)
    function ensureWelcomeAndLogout(container, variant = "desktop") {
      if (!container) return;
      const welcomeId = variant === "desktop" ? "welcomeUser" : "mobileWelcome";
      const logoutId  = variant === "desktop" ? "logoutBtn"   : "mobileLogout";
  
      if (!document.getElementById(welcomeId)) {
        const span = document.createElement("span");
        span.id = welcomeId;
        span.textContent = `👋 Welcome, ${user.name}`;
        span.className = variant === "desktop"
          ? "text-sm font-medium text-gray-700 ml-4"
          : "block text-sm font-medium text-gray-700 mt-3";
        container.appendChild(span);
      }
      if (!document.getElementById(logoutId)) {
        const btn = document.createElement("button");
        btn.id = logoutId;
        btn.textContent = "Logout";
        btn.className = variant === "desktop"
          ? "text-sm text-gray-500 underline ml-2"
          : "text-sm text-gray-500 underline mt-1 block";
        btn.addEventListener("click", () => {
          localStorage.removeItem("powerbuyUser");
          // go home after logout so UI resets consistently
          window.location.href = "index.html";
        });
        container.appendChild(btn);
      }
    }
  
    if (user) {
      // Hide every Sign up link/button we found
      signupEls.forEach(el => (el.style.display = "none"));
  
      // Add welcome + logout to desktop nav
      const desktopNav = document.querySelector("header nav");
      ensureWelcomeAndLogout(desktopNav, "desktop");
  
      // Add welcome + logout to mobile menu if present
      const mobileMenu = document.getElementById("mobileMenu");
      ensureWelcomeAndLogout(mobileMenu, "mobile");
    } else {
      // Not logged in → make sure Sign up links are visible
      signupEls.forEach(el => (el.style.display = ""));
      // Remove any leftover welcome/logout if they exist (guards against cached DOM after SPA-ish navigation)
      ["welcomeUser", "logoutBtn", "mobileWelcome", "mobileLogout"].forEach(id => {
        const n = document.getElementById(id);
        if (n && n.parentNode) n.parentNode.removeChild(n);
      });
    }
  });
  