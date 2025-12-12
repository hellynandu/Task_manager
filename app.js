// ...existing code...
const jwt = require('jsonwebtoken');
// ...existing code...
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const User = require('./models/user');
const Task = require('./models/Task');
const { isLoggedIn } = require('./middleware/auth');

const app = express();
const PORT = 3000;

// CONNECT MONGODB
mongoose.connect('mongodb://localhost:27017/taskmanager')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

// MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: "supersecret123",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://localhost:27017/taskmanager',
        collection: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

app.set('view engine', 'ejs');

/// ...existing code...

// ======= AUTH ROUTES =======

// REGISTER PAGE
app.get('/register', (req, res) => {
    res.render('register');
});

// HANDLE REGISTER
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.send("Email already exists!");

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed
        });

        // Removed: req.session.user = user; (no auto-login)
        res.redirect('/login');  // Changed: redirect to login instead of /tasks
    } catch (err) {
        res.status(500).send(`Registration error: ${err.message}`);
    }
});

// LOGIN PAGE
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/tasks');
    }
    res.render('login');
});

// ...existing code...

// LOGIN PAGE
app.get('/login', (req, res) => {
    res.render('login');
});

// HANDLE LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.send("User not found");

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.send("Incorrect password");

        req.session.user = user;
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send(`Login error: ${err.message}`);
    }
});

// LOGOUT
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

// ======= PROTECTED TASK ROUTES =======

// HOME REDIRECT
app.get('/', (req, res) => {
    res.redirect('/tasks');
});

// ...existing code...

// LOGIN PAGE
// ...existing code...

// LOGIN PAGE
app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/tasks');
    }
    res.render('login');
});

// ...existing code...


// ...existing code...
// SHOW ALL TASKS (user-specific)
app.get('/tasks', isLoggedIn, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.session.user._id }).sort({ createdAt: -1 });
        res.render('home', { tasks });
    } catch (err) {
        res.status(500).send(`Error loading tasks: ${err.message}`);
    }
});

// ADD NEW TASK PAGE
app.get('/tasks/new', isLoggedIn, (req, res) => {
    res.render('addTask');
});

// CREATE TASK
app.post('/tasks/create', isLoggedIn, async (req, res) => {
    try {
        const { title, description, dueDate, category, priority } = req.body;

        await Task.create({
            title,
            description,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            category,
            priority,
            userId: req.session.user._id
        });

        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send(`Error creating task: ${err.message}`);
    }
});

// COMPLETE TASK
app.post('/tasks/:id/complete', isLoggedIn, async (req, res) => {
    try {
        await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.user._id },
            { completed: true }
        );
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send(`Error completing task: ${err.message}`);
    }
});

// DELETE TASK
app.post('/tasks/:id/delete', isLoggedIn, async (req, res) => {
    try {
        await Task.deleteOne({ _id: req.params.id, userId: req.session.user._id });
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send(`Error deleting task: ${err.message}`);
    }
});

// EDIT TASK PAGE
app.get('/tasks/:id/edit', isLoggedIn, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.session.user._id });
        res.render('editTask', { task });
    } catch (err) {
        res.status(500).send(`Error loading task: ${err.message}`);
    }
});

// UPDATE TASK
app.post('/tasks/:id/update', isLoggedIn, async (req, res) => {
    try {
        const { title, description, completed, dueDate, category, priority } = req.body;

        await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.session.user._id },
            {
                title,
                description,
                completed: completed === "on",
                dueDate: dueDate ? new Date(dueDate) : undefined,
                category,
                priority
            }
        );
        res.redirect('/tasks');
    } catch (err) {
        res.status(500).send(`Error updating task: ${err.message}`);
    }
});

// SEARCH TASKS
app.get('/tasks/search', isLoggedIn, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.redirect('/tasks');
        }
        const tasks = await Task.find({
            userId: req.session.user._id,
            $or: [
                { title: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') }
            ]
        }).sort({ createdAt: -1 });
        res.render('home', { tasks });
    } catch (err) {
        res.status(500).send(`Error searching tasks: ${err.message}`);
    }
});
const path = require('path');
// ...existing code...

// HANDLE REGISTER
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.send("Email already exists!");

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed
        });

        // Removed: req.session.user = user; (no auto-login)
        res.redirect('/login');  // Changed: redirect to login instead of /tasks
    } catch (err) {
        res.status(500).send(`Registration error: ${err.message}`);
    }
});
// ...existing code...

// ======= AUTH API ROUTES =======

// API REGISTER
app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ error: "Email already exists!" });

        const hashed = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashed
        });

        res.json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: `Registration error: ${err.message}` });
    }
});

// API LOGIN
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ error: "Incorrect password" });

        const token = jwt.sign({ userId: user._id }, 'supersecret123', { expiresIn: '1d' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: `Login error: ${err.message}` });
    }
});

// ...existing code...

// START SERVER
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
