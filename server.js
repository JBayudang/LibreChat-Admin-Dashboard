const express = require('express');
const session = require('express-session');
const si = require('systeminformation');
const mongoose = require('mongoose');
const { exec } = require('child_process');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'soul-calibre-admin-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

mongoose.connect('mongodb://172.18.0.4:27017/LibreChat')
  .then(() => console.log('Connected to LibreChat DB'))
  .catch(err => console.error('DB Connection Error:', err));

const ADMIN_USER = "SampleAdminUsername";
const ADMIN_PASS = "SampleAdminPassword";

const checkAuth = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.loggedIn = true;
        res.redirect('/');
    } else {
        res.send('<h2>Invalid Credentials</h2><a href="/login">Try Again</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/api', checkAuth);
app.use(express.static('public'));

app.post('/api/banner', (req, res) => {
    const { from, to, msg, isPublic, isPersistable } = req.body;
    const cmd = `docker exec LibreChat npm run update-banner "${from}" "${to}" "${msg}" "${isPublic}" "${isPersistable}"`;
    
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Banner Exec Error: ${error.message}`);
            return res.status(500).send("Error updating banner");
        }
        res.send("Banner updated successfully!");
    });
});

app.get('/api/stats', async (req, res) => {
    try {
        const mem = await si.mem();
        const disk = await si.fsSize();
        const mainDisk = disk.find(d => d.mount === '/') || disk[0];
        const combinedTotal = mem.total + mem.swaptotal;
        const combinedUsed = mem.active + mem.swapused;
        res.json({
            ram: { used: combinedUsed, total: combinedTotal },
            disk: { used: mainDisk.used, total: mainDisk.size }
        });
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await mongoose.connection.db.collection('users').find({}).toArray();
        const msgStats = await mongoose.connection.db.collection('messages').aggregate([
            { $group: { _id: "$user", count: { $sum: 1 } } }
        ]).toArray();
        const countMap = Object.fromEntries(msgStats.map(s => [s._id ? s._id.toString() : 'null', s.count]));
        const formatted = users.map(u => ({
            ...u,
            totalMessages: countMap[u._id.toString()] || 0
        }));
        res.json(formatted);
    } catch (e) { res.status(500).send(e.message); }
});

app.get('/api/usage-history', async (req, res) => {
    try {
        const history = [];
        for (let i = 6; i >= 0; i--) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            start.setDate(start.getDate() - i);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            const count = await mongoose.connection.db.collection('messages').countDocuments({
                createdAt: { $gte: start, $lte: end }
            });
            history.push({
                date: start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                count: count
            });
        }
        res.json(history);
    } catch (e) { res.status(500).send(e.message); }
});

app.delete('/api/users/:email', (req, res) => {
    const email = req.params.email.toLowerCase();
    mongoose.connection.db.collection('users').deleteOne({ email: email })
        .then(result => {
            if (result.deletedCount === 0) return res.status(404).send("User not found.");
            exec(`docker exec LibreChat npm run delete-user ${email} -y`, () => {
                res.send("Deleted");
            });
        }).catch(err => res.status(500).send("DB Error"));
});

app.put('/api/users/:email', async (req, res) => {
    try {
        const originalEmail = req.params.email.toLowerCase();
        const { name, username, email, role } = req.body;
        const normalizedEmail = email.toLowerCase(); 
        await mongoose.connection.db.collection('users').updateOne(
            { email: originalEmail },
            { $set: { name, username, email: normalizedEmail, role } }
        );
        res.send("Updated");
    } catch (e) { res.status(500).send("Update Error"); }
});

app.listen(2025, '127.0.0.1', () => console.log('Dashboard running on port 2025'));
