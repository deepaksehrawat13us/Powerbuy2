// session.js — manages global sign-in/sign-out across all pages
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("powerbuyUser"));
  
    const signupLinks = Array.from(document.querySelectorAll("a[href$='signup.html']"));
    const signinLinks = Array.from(document.querySelectorAll("a[href$='signin.html']"));
  
    function createLogoutElement() {
      const btn = document.createElement("button");
      btn.textContent = "Logout";
      btn.className = "text-sm text-gray-500 underline ml-3";
      btn.addEventListener("click", () => {
        localStorage.removeItem("powerbuyUser");
        window.location.href = "index.html";
      });
      return btn;
    }
  
    if (user) {
      // Hide sign-up and sign-in
      [...signupLinks, ...signinLinks].forEach(el => (el.style.display = "none"));
  
      // Add welcome message + logout
      const nav = document.querySelector("header nav") || document.querySelector("header div");
      if (nav) {
        const welcome = document.createElement("span");
        welcome.textContent = `👋 Welcome, ${user.name}`;
        welcome.className = "text-sm font-medium text-gray-700 ml-2";
        nav.appendChild(welcome);
        nav.appendChild(createLogoutElement());
      }
    } else {
      // Not logged in → ensure Sign In and Sign Up are visible
      [...signupLinks, ...signinLinks].forEach(el => (el.style.display = ""));
    }
  });
  