const express = require('express');
const path = require('path');
const app = express();

// what port localhost will be going to
const PORT = 3000;

// link to the frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
