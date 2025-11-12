const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const port = 5000;

// Middleware to parse JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// File path for signups
const SIGNUPS_FILE = path.join(__dirname, 'signups.json');
const JOINS_FILE = path.join(__dirname, 'joins.json');

// Helper function to read JSON data
async function readData(filePath) {
    try {
        await fs.access(filePath);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw error;
    }
}

// Helper function to write JSON data
async function writeData(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// --- Root Route ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- Signup Route ---
app.post('/signup', async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, confirmPassword } = req.body;

        if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match.' });
        }
        
        // In a real-world app, HASH passwords here using bcrypt
        
        const signups = await readData(SIGNUPS_FILE);

        const userExists = signups.some(user => user.email === email);
        if (userExists) {
            return res.status(400).json({ message: 'Email already in use.' });
        }

        const newSignup = { 
            fullName, 
            email, 
            phoneNumber,
            password: password // Storing plain text password (NOT RECOMMENDED)
        };
        signups.push(newSignup);

        await writeData(SIGNUPS_FILE, signups);

        res.status(201).json({ 
            message: 'Signup successful!',
            user: {
                fullName: newSignup.fullName,
                email: newSignup.email,
                phoneNumber: newSignup.phoneNumber
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});

// --- Signin Route ---
app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const signups = await readData(SIGNUPS_FILE);
        const user = signups.find(u => u.email === email);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // In a real-world app, COMPARE hashes here using bcrypt
        
        if (user.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials.' });
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
        res.status(500).json({ message: 'Server error during sign in.' });
    }
});


// --- "Join a Powerbuy" Route ---
app.post('/join', async (req, res) => {
    try {
        const { fullName, email, powerbuyId } = req.body;

        if (!fullName || !email || !powerbuyId) {
            return res.status(400).json({ message: 'Full name, email, and Powerbuy ID are required.' });
        }

        const joins = await readData(JOINS_FILE);

        const alreadyJoined = joins.some(join => join.email === email && join.powerbuyId === powerbuyId);
        if (alreadyJoined) {
            return res.status(400).json({ message: 'You have already joined this Powerbuy.' });
        }

        const newJoin = { 
            fullName, 
            email, 
            powerbuyId,
            joinedAt: new Date().toISOString() 
        };
        joins.push(newJoin);

        await writeData(JOINS_FILE, joins);

        res.status(201).json({ message: 'Successfully joined the Powerbuy!' });

    } catch (error) {
        console.error('Join error:', error);
        res.status(500).json({ message: 'Server error while joining.' });
    }
});

// --- Get Dashboard Data Route ---
app.get('/dashboard-data', async (req, res) => {
    try {
        const { email } = req.query; 

        if (!email) {
            return res.status(400).json({ message: 'Email parameter is required.' });
        }

        const joins = await readData(JOINS_FILE);
        const signups = await readData(SIGNUPS_FILE);

        const user = signups.find(u => u.email === email);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userJoins = joins.filter(join => join.email === email);

        res.status(200).json({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            joinedPowerbuys: userJoins
        });

    } catch (error) {
        console.error('Dashboard data error:', error);
        res.status(500).json({ message: 'Server error retrieving dashboard data.' });
    }
});

// *** NEW *** --- "Leave a Powerbuy" Route ---
app.delete('/leave-powerbuy', async (req, res) => {
    try {
        const { email, powerbuyId } = req.body;

        if (!email || !powerbuyId) {
            return res.status(400).json({ message: 'Email and Powerbuy ID are required.' });
        }

        const joins = await readData(JOINS_FILE);

        // Find the index of the join to remove
        const indexToRemove = joins.findIndex(join => join.email === email && join.powerbuyId === powerbuyId);

        if (indexToRemove === -1) {
            // Join not found
            return res.status(404).json({ message: 'You are not a member of this Powerbuy.' });
        }

        // Remove the join from the array
        joins.splice(indexToRemove, 1);

        // Write the updated array back to the file
        await writeData(JOINS_FILE, joins);

        res.status(200).json({ message: 'Successfully left the Powerbuy.' });

    } catch (error) {
        console.error('Leave Powerbuy error:', error);
        res.status(500).json({ message: 'Server error while leaving the Powerbuy.' });
    }
});


// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});