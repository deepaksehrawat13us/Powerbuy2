const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// --- UPDATED PORT ---
const port = 5000;

// Middleware
app.use(express.json()); // To parse JSON bodies
app.use(express.static('public')); // To serve static files like HTML, CSS, JS

// --- Database file paths ---
const SIGNUPS_FILE = path.join(__dirname, 'signups.json');
const JOINS_FILE = path.join(__dirname, 'joins.json');
const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

// --- Helper Functions for JSON Reading/Writing ---

/**
 * Reads data from a JSON file.
 * Returns an empty array if the file doesn't exist or is empty.
 * @param {string} filePath
 * @returns {Promise<Array<any>>}
 */
async function readData(filePath) {
    try {
        await fs.access(filePath); // Check if file exists
        const data = await fs.readFile(filePath, 'utf8');
        if (data === "") { // Handle empty file
            return [];
        }
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') { // File doesn't exist
            return []; // Return empty array if no file
        }
        // Handle other errors (like malformed JSON)
        console.error(`Error reading data from ${filePath}:`, error);
        throw new Error(`Could not read data from ${filePath}`);
    }
}


/**
 * Writes data to a JSON file.
 * @param {string} filePath
 ** @param {Array<any>} data
 * @returns {Promise<boolean>} True on success, false on failure.
 */
// *** UPDATED THIS FUNCTION ***
async function writeData(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Successfully wrote data to ${filePath}`); // Added success log
        return true; // Return true on success
    } catch (error) {
        console.error(`Error writing data to ${filePath}:`, error);
        return false; // Return false on failure
    }
}

// --- API Routes ---

// 1. Sign Up
app.post('/signup', async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

        // Basic validation
        if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        }

        const signups = await readData(SIGNUPS_FILE);
        const existingUser = signups.find(user => user.email === email);

        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const newUser = {
            id: Date.now().toString(),
            fullName,
            email,
            phoneNumber,
            password 
        };

        signups.push(newUser);
        const success = await writeData(SIGNUPS_FILE, signups); // Check for success
        
        if (!success) {
            throw new Error('Failed to write signup data.');
        }

        res.status(201).json({
            message: 'Signup successful!',
            user: {
                fullName: newUser.fullName,
                email: newUser.email,
                phoneNumber: newUser.phoneNumber
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup. Please try again later.' });
    }
});

// 2. Sign In
app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const signups = await readData(SIGNUPS_FILE);
        const user = signups.find(u => u.email === email);

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        
        res.status(200).json({
            message: 'Sign in successful!',
            user: {
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber
            }
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Server error during signin.' });
    }
});

// 3. Join PowerBuy
app.post('/join', async (req, res) => {
    try {
        const { fullName, email, phoneNumber, powerbuyId, brand, type, specs, notes } = req.body;
        
        if (!email || !powerbuyId) {
            return res.status(400).json({ message: 'Email and PowerBuy ID are required.' });
        }
        
        const joins = await readData(JOINS_FILE);
        
        const alreadyJoined = joins.find(j => j.email === email && j.powerbuyId === powerbuyId);
        if (alreadyJoined) {
            return res.status(400).json({ message: 'You have already joined this PowerBuy.' });
        }

        const newJoin = {
            id: Date.now().toString(),
            joinedAt: new Date().toISOString(),
            fullName,
            email,
            phoneNumber,
            powerbuyId,
            brand,
            type,
            specs,
            notes
        };
        
        joins.push(newJoin);
        const success = await writeData(JOINS_FILE, joins); // Check for success
        
        if (!success) {
            throw new Error('Failed to write join data.');
        }
        
        res.status(201).json({ message: 'Successfully joined PowerBuy!', join: newJoin });
    
    } catch (error) {
        console.error('Join PowerBuy error:', error);
        res.status(500).json({ message: 'Server error while joining. Please try again later.' });
    }
});

// 4. Get Dashboard Data
app.get('/dashboard-data', async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ message: 'Email query parameter is required.' });
        }

        const signups = await readData(SIGNUPS_FILE);
        const joins = await readData(JOINS_FILE);

        const user = signups.find(u => u.email === email);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const joinedPowerbuys = joins.filter(j => j.email === email);

        res.status(200).json({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            joinedPowerbuys: joinedPowerbuys
        });
        
    } catch (error) {
        console.error('Get dashboard data error:', error);
        res.status(500).json({ message: 'Server error while fetching dashboard data.' });
    }
});

// 5. Leave PowerBuy
app.delete('/leave-powerbuy', async (req, res) => {
    try {
        const { email, powerbuyId } = req.body;
        if (!email || !powerbuyId) {
            return res.status(400).json({ message: 'Email and PowerBuy ID are required.' });
        }

        const joins = await readData(JOINS_FILE);
        
        let found = false;
        const updatedJoins = joins.filter(join => {
            if (join.email === email && join.powerbuyId === powerbuyId) {
                found = true;
                return false; 
            }
            return true; 
        });

        if (!found) {
            return res.status(404).json({ message: 'You are not part of this PowerBuy.' });
        }

        const success = await writeData(JOINS_FILE, updatedJoins); // Check for success
        
        if (!success) {
            throw new Error('Failed to write leave data.');
        }
        
        res.status(200).json({ message: 'Successfully left the PowerBuy.' });
    
    } catch (error) {
        console.error('Leave PowerBuy error:', error);
        res.status(500).json({ message: 'Server error while leaving. Please try again later.' });
    }
});

// 6. Contact Us
app.post('/contact', async (req, res) => {
    // *** THIS IS THE UPDATED ROUTE ***
    try {
        const { email, message, fullName } = req.body;
        if (!email || !message) {
            return res.status(400).json({ message: 'Email and message are required.' });
        }

        const contacts = await readData(CONTACTS_FILE);
        
        const newContact = {
            id: Date.now().toString(),
            submittedAt: new Date().toISOString(),
            email,
            fullName: fullName || 'N/A (Not logged in)',
            message
        };

        contacts.push(newContact);
        
        // Explicitly check for write success
        const success = await writeData(CONTACTS_FILE, contacts); 
        
        if (success) {
            res.status(201).json({ message: 'Message received successfully!' });
        } else {
            // If writeData returned false, throw an error to be caught
            throw new Error('Failed to write contact data to file.');
        }
    
    } catch (error) {
        // This will now catch errors from readData AND writeData
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Server error while submitting message. Please try again later.' });
    }
});


// --- Final catch-all for 404s (if no static file or API route matched) ---
app.use((req, res) => {
    res.status(404).send("404: Page Not Found");
});

// Start the server
app.listen(port, () => {
    // --- UPDATED LOG MESSAGE ---
    console.log(`Server running at http://localhost:${port}`);
});