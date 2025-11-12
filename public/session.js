console.log('session.js has been loaded and executed.');

// This file manages the user's session in the browser's sessionStorage

/**
 * Saves user data to sessionStorage.
 * @param {object} user - The user object (e.g., { fullName, email, phoneNumber })
 */
function saveUserSession(user) {
    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem('powerbuyUser', JSON.stringify(user));
    } else {
        console.error('Session storage is not supported in this browser.');
    }
}

/**
 * Retrieves user data from sessionStorage.
 * @returns {object | null} The user object or null if not found.
 */
function getUserSession() {
    if (typeof(Storage) !== "undefined") {
        const user = sessionStorage.getItem('powerbuyUser');
        return user ? JSON.parse(user) : null;
    }
    return null;
}

/**
 * Clears all user data from sessionStorage (logs the user out).
 */
function clearUserSession() {
    if (typeof(Storage) !== "undefined") {
        sessionStorage.removeItem('powerbuyUser');
    }
}

/**
 * Checks if a user is currently logged in.
 * @returns {boolean} True if a user session exists, false otherwise.
 */
function isLoggedIn() {
    return getUserSession() !== null;
}

// --- ALL THE AUTH-CHECK LOGIC IS NOW HERE ---
// This will run on every page that includes session.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- THIS IS THE AUTH LOGIC ---
    
    // Check if the user is logged in
    if (typeof isLoggedIn === 'function' && isLoggedIn()) {
        const user = getUserSession();
        
        if (user) {
            // 1. Get the nav containers
            const desktopNav = document.getElementById('desktopNav');
            const mobileMenu = document.getElementById('mobileMenu');

            // 2. Create authenticated links
            // Using your original classes to maintain formatting
            const welcomeMessage = `
                <span class="text-gray-700">Welcome, ${user.fullName.split(' ')[0]}!</span>
            `;
            
            const desktopLinks = `
                <a href="index.html#how" class="hover:text-gray-500">How it Works</a>
                <a href="powerbuys.html" class="hover:text-gray-500">PowerBuys</a>
                <a href="dashboard.html" class="hover:text-gray-500">My PowerBuys</a>
                ${welcomeMessage}
                <a href="#" id="signOutBtn" class="text-red-600 hover:text-red-800">Sign Out</a>
            `;

            const mobileLinks = `
                <a href="index.html#how" class="block px-4 py-2 hover:bg-gray-100">How it Works</a>
                <a href="powerbuys.html" class="block px-4 py-2 hover:bg-gray-100">PowerBuys</a>
                <a href="dashboard.html" class="block px-4 py-2 hover:bg-gray-100">My PowerBuys</a>
                <a href="#" id="mobileSignOutBtn" class="block px-4 py-2 text-red-600 hover:bg-gray-100">Sign Out</a>
            `;

            // 3. Update the navigation bars
            if (desktopNav) {
                desktopNav.innerHTML = desktopLinks;
            }
            if (mobileMenu) {
                mobileMenu.innerHTML = mobileLinks;
            }

            // 4. Add sign-out functionality
            const signOutBtn = document.getElementById('signOutBtn');
            const mobileSignOutBtn = document.getElementById('mobileSignOutBtn');

            function handleSignOut(event) {
                event.preventDefault();
                if (typeof clearUserSession === 'function') {
                    clearUserSession();
                }
                window.location.href = '/index.html'; // Redirect to home
            }

            if (signOutBtn) {
                signOutBtn.addEventListener('click', handleSignOut);
            }
            if (mobileSignOutBtn) {
                mobileSignOutBtn.addEventListener('click', handleSignOut);
            }
        }
    }
    // --- END OF AUTH LOGIC ---

    // --- Page load logic (year, mobile menu) ---
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    const menuBtn = document.getElementById("menuBtn");
    const mm = document.getElementById("mobileMenu");
    menuBtn?.addEventListener("click", () => mm.classList.toggle("hidden"));
});