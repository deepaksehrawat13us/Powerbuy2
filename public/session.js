console.log('session.js has been loaded and executed.');

// This file manages the user's session in the browser's localStorage (changed from sessionStorage for persistence)

/**
 * Saves user data and authentication tokens to localStorage.
 * @param {object} user - The user object (e.g., { id, name, phone_number })
 * @param {string} accessToken - JWT access token (optional)
 * @param {string} refreshToken - JWT refresh token (optional)
 */
function saveUserSession(user, accessToken = null, refreshToken = null) {
    console.log('🔵 saveUserSession called with:', { user, hasAccessToken: !!accessToken, hasRefreshToken: !!refreshToken });
    
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('powerbuyUser', JSON.stringify(user));
        console.log('✅ Saved powerbuyUser to localStorage');
        
        // Store user ID separately for easy access
        if (user && user.id) {
            localStorage.setItem('userId', user.id);
            console.log('✅ Saved userId to localStorage:', user.id);
        }
        
        // Store tokens if provided
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
            console.log('✅ Saved accessToken to localStorage (length:', accessToken.length, ')');
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
            console.log('✅ Saved refreshToken to localStorage (length:', refreshToken.length, ')');
        }
        
        // Verify it was saved
        const verification = {
            user: localStorage.getItem('powerbuyUser'),
            userId: localStorage.getItem('userId'),
            accessToken: localStorage.getItem('accessToken'),
            refreshToken: localStorage.getItem('refreshToken')
        };
        console.log('✅ Verification - localStorage now contains:', verification);
        console.log('✅ User session saved to localStorage successfully');
    } else {
        console.error('❌ Local storage is not supported in this browser.');
    }
}

/**
 * Retrieves user data from localStorage.
 * @returns {object | null} The user object or null if not found.
 */
function getUserSession() {
    if (typeof(Storage) !== "undefined") {
        const user = localStorage.getItem('powerbuyUser');
        return user ? JSON.parse(user) : null;
    }
    return null;
}

/**
 * Clears all user data from localStorage (logs the user out).
 */
function clearUserSession() {
    if (typeof(Storage) !== "undefined") {
        localStorage.removeItem('powerbuyUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        console.log('✅ User session cleared from localStorage');
    }
}

/**
 * Checks if a user is currently logged in.
 * @returns {boolean} True if a user session exists, false otherwise.
 */
function isLoggedIn() {
    const userSession = getUserSession();
    const hasSession = userSession !== null;
    console.log('🔍 isLoggedIn() check:', {
        hasSession,
        userSession,
        localStorageUser: localStorage.getItem('powerbuyUser'),
        localStorageToken: localStorage.getItem('accessToken')
    });
    return hasSession;
}

// --- ALL THE AUTH-CHECK LOGIC IS NOW HERE ---
// This will run on every page that includes session.js

document.addEventListener('DOMContentLoaded', () => {
    
    // --- NEW: Inject Contact Modal and Toast HTML into the page ---
    const modalHtml = `
        <!-- Contact Us Modal -->
        <div id="contactModal" class="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 class="text-2xl font-bold mb-4">Contact Us</h3>
                <form id="contactForm">
                    <div class="space-y-4">
                        <div>
                            <label for="contactEmail" class="block text-sm font-medium text-gray-700">Your Email</label>
                            <input type="email" id="contactEmail" name="email" required
                                   class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                        </div>
                        <div>
                            <label for="contactMessage" class="block text-sm font-medium text-gray-700">Message</label>
                            <textarea id="contactMessage" name="message" rows="4" required
                                      class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                      placeholder="How can we help?"></textarea>
                        </div>
                    </div>
                    <div class="flex justify-end gap-3 mt-6">
                        <button type="button" id="contactCancel"
                                class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100">
                            Cancel
                        </button>
                        <button type="submit"
                                class="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800">
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
        
        <!-- Success Toast Notification -->
        <div id="successToast" class="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg hidden z-50">
            Thank you for reaching out! We will respond within 2 business days.
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // --- END: Inject Modal ---


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
            // Handle both old (fullName) and new (name) field names for compatibility
            const userName = user.name || user.fullName || 'User';
            const welcomeMessage = `
                <span class="text-gray-700">Welcome, ${userName.split(' ')[0]}!</span>
            `;
            
            const desktopLinks = `
                <a href="#contact" id="contactLinkDynamic" class="hover:text-gray-500">Contact Us</a>
                <a href="powerbuys.html" class="hover:text-gray-500">PowerBuys</a>
                <a href="dashboard.html" class="hover:text-gray-500">My PowerBuys</a>
                ${welcomeMessage}
                <a href="#" id="signOutBtn" class="text-red-600 hover:text-red-800">Sign Out</a>
            `;

            const mobileLinks = `
                <a href="#contact" id="mobileContactLinkDynamic" class="block px-4 py-2 hover:bg-gray-100">Contact Us</a>
                <a href="powerbuys.html" class="block px-4 py-2 hover:bg-gray-100">PowerBuys</a>
                <a href="dashboard.html" class="block px-4 py-2 hover:bg-gray-100">My PowerBuys</a>
                <a href="#" id="mobileSignOutBtn" class="block px-4 py-2 text-red-600 hover:bg-gray-1Of-type(1)0">Sign Out</a>
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
    
    // --- *** NEW: Contact Modal Logic (FIXED ORDER) *** ---
    
    // 1. DEFINE variables for modal elements first
    const contactModal = document.getElementById('contactModal');
    const contactForm = document.getElementById('contactForm');
    const contactCancel = document.getElementById('contactCancel');
    const contactEmailInput = document.getElementById('contactEmail');
    const successToast = document.getElementById('successToast');

    // 2. DEFINE functions that use those variables
    // Function to open the modal
    function openContactModal(event) {
        event.preventDefault();
        // Pre-fill email if user is logged in
        if (isLoggedIn()) {
            const user = getUserSession();
            // Handle both old (email) and new (phone_number) field names
            contactEmailInput.value = user.email || user.phone_number || '';
            contactEmailInput.readOnly = true; // Don't let them change it
        } else {
            contactEmailInput.value = '';
            contactEmailInput.readOnly = false;
        }
        contactModal.classList.remove('hidden');
        contactModal.classList.add('flex');
    }

    // Function to close the modal
    function closeContactModal() {
        contactModal.classList.add('hidden');
        contactModal.classList.remove('flex');
    }

    // 3. ATTACH event listeners
    // Find all "Contact Us" links (static and dynamic) and attach event
    // We search the whole document to find all links, static or dynamic
    document.querySelectorAll('a[href="index.html#how"], a[href="#contact"]').forEach(link => {
        link.textContent = 'Contact Us';
        link.href = '#contact'; // Ensure href is consistent
        link.addEventListener('click', openContactModal);
    });

    // Close button
    if (contactCancel) {
        contactCancel.addEventListener('click', closeContactModal);
    }

    // Form submission
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = contactEmailInput.value;
            const message = document.getElementById('contactMessage').value;
            let fullName = null;

            if (isLoggedIn()) {
                const user = getUserSession();
                fullName = user.name || user.fullName || null;
            }

            try {
                const response = await fetch('/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, message, fullName })
                });

                if (response.ok) {
                    closeContactModal();
                    contactForm.reset(); // Clear the form
                    // Show success toast
                    successToast.classList.remove('hidden');
                    setTimeout(() => {
                        successToast.classList.add('hidden');
                    }, 3000); // Hide after 3 seconds
                } else {
                    const error = await response.json();
                    alert(`Error: ${error.message}`);
                }
            } catch (err) {
                console.error('Contact form submission error:', err);
                alert('A network error occurred. Please try again.');
            }
        });
    }
    // --- END: Contact Modal Logic ---
});