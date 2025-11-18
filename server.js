const express = require('express');
const path = require('path');
const app = express();

// Server configuration
const port = process.env.PORT || 8080;

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Add CORS headers (helpful for development)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    next();
});

// Middleware - serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Redirect root to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Simple health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Static file server is running',
        timestamp: new Date().toISOString()
    });
});


// Catch-all for 404s
app.use((req, res) => {
    res.status(404).send("404: Page Not Found");
});

// Start the server
app.listen(port, () => {
    console.log(`╔════════════════════════════════════════════════╗`);
    console.log(`║   PowerBuy Static Server                      ║`);
    console.log(`║   Running at: http://localhost:${port}        ║`);
    console.log(`║   API Backend: http://localhost:3000/api/v1    ║`);
    console.log(`╚════════════════════════════════════════════════╝`);
    console.log('');
    console.log(`Open http://localhost:${port} in your browser`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Please use a different port.`);
        console.error(`   Try: PORT=8081 node server.js`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});