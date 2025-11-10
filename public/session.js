// session.js — shared login state + UI management (universal version)
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("powerbuyUser"));
  
    // Find ANY element related to "signup" (covers all link formats)
    const signupEls = Array.from(document.querySelectorAll("a, button")).filter(el => {
      const href = (el.getAttribute("href") || "").toLowerCase();
      return href.includes("signup");
    });
  
    // Utility function: create Welcome + Logout if not already present
    function ensureWelcomeAndLogout(container, variant = "desktop") {
      if (!container || !user) return;
  
      const welcomeId = variant === "desktop" ? "welcomeUser" : "mobileWelcome";
      const logoutId  = variant === "desktop" ? "logoutBtn"   : "mobileLogout";
  
      // 👋 Welcome message
      if (!document.getElementById(welcomeId)) {
        const span = document.createElement("span");
        span.id = welcomeId;
        span.textContent = `👋 Welcome, ${user.name}`;
        span.className =
          variant === "desktop"
            ? "text-sm font-medium text-gray-700 ml-4"
            : "block text-sm font-medium text-gray-700 mt-3";
        container.appendChild(span);
      }
  
      // 🚪 Logout button
      if (!document.getElementById(logoutId)) {
        const btn = document.createElement("button");
        btn.id = logoutId;
        btn.textContent = "Logout";
        btn.className =
          variant === "desktop"
            ? "text-sm text-gray-500 underline ml-2"
            : "text-sm text-gray-500 underline mt-1 block";
        btn.addEventListener("click", () => {
          localStorage.removeItem("powerbuyUser");
          window.location.href = "index.html"; // reload homepage after logout
        });
        container.appendChild(btn);
      }
    }
  
    if (user) {
      // ✅ Hide all Sign Up links/buttons everywhere
      signupEls.forEach(el => (el.style.display = "none"));
  
      // ✅ Add Welcome + Logout in desktop nav
      const desktopNav = document.querySelector("header nav");
      ensureWelcomeAndLogout(desktopNav, "desktop");
  
      // ✅ Add Welcome + Logout in mobile menu
      const mobileMenu = document.getElementById("mobileMenu");
      ensureWelcomeAndLogout(mobileMenu, "mobile");
    } else {
      // 🚫 Not logged in — make sure Sign Up links show again
      signupEls.forEach(el => (el.style.display = ""));
      // Remove any leftover welcome/logout elements
      ["welcomeUser", "logoutBtn", "mobileWelcome", "mobileLogout"].forEach(id => {
        const el = document.getElementById(id);
        if (el && el.parentNode) el.parentNode.removeChild(el);
      });
    }
  });
  