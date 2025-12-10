const express = require('express');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskmanager')
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.log('❌ MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');

// ROUTE 1: Home page - Show all tasks
app.get('/', (req, res) => {
    res.redirect('/tasks');
});

app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.render('home', { tasks });
    } catch (error) {
        res.status(500).send('Error fetching tasks: ' + error.message);
    }
});

// ROUTE 2: Show add task form
app.get('/tasks/new', (req, res) => {
    res.render('addTask');
});

// ROUTE 3: Create new task
app.post('/tasks/create', async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        await Task.create({ title, description, dueDate });
        res.redirect('/tasks');
    } catch (error) {
        res.status(500).send('Error creating task: ' + error.message);
    }
});

// ROUTE 4: Mark task as complete
app.post('/tasks/:id/complete', async (req, res) => {
    try {
        await Task.findByIdAndUpdate(req.params.id, { completed: true });
        res.redirect('/tasks');
    } catch (error) {
        res.status(500).send('Error completing task: ' + error.message);
    }
});

// ROUTE 5: Delete task
app.post('/tasks/:id/delete', async (req, res) => {
    try {
        await Task.findByIdAndDelete(req.params.id);
        res.redirect('/tasks');
    } catch (error) {
        res.status(500).send('Error deleting task: ' + error.message);
    }
});

// ROUTE 6: Search tasks
app.get('/tasks/search', async (req, res) => {
    try {
        const searchQuery = req.query.q || '';
        const tasks = await Task.find({
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        res.render('home', { tasks });
    } catch (error) {
        res.status(500).send('Error searching tasks: ' + error.message);
    }
});

// ROUTE 7: Filter tasks by status
app.get('/tasks/filter/:status', async (req, res) => {
    try {
        const status = req.params.status;
        let filter = {};

        if (status === 'completed') {
            filter.completed = true;
        } else if (status === 'pending') {
            filter.completed = false;
        }

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.render('home', { tasks });
    } catch (error) {
        res.status(500).send('Error filtering tasks: ' + error.message);
    }
});

// ROUTE 8: Show edit form
app.get('/tasks/:id/edit', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        res.render('editTask', { task });
    } catch (error) {
        res.status(500).send('Error loading task: ' + error.message);
    }
});

// ROUTE 9: Update task
app.post('/tasks/:id/update', async (req, res) => {
    try {
        const { title, description, completed, dueDate } = req.body;
        await Task.findByIdAndUpdate(req.params.id, {
            title,
            description,
            completed: completed === 'on',
            dueDate
        });
        res.redirect('/tasks');
    } catch (error) {
        res.status(500).send('Error updating task: ' + error.message);
    }
});

// ROUTE 10: Edited task
app.post('/tasks/category/:id/Edited', async (req, res) => {
    try {
        const { title, description, completed, dueDate, category } = req.body;
        await Task.findByIdAndUpdate(req.params.id, {
            title,
            description,
            completed: completed === 'on',
            category,
        });
        res.redirect('/tasks');
    } catch (error) {
        res.status(500).send('Error updating task: ' + error.message);
    }
});

// ROUTE 11: Edited task with priority
app.post('/tasks/category/priority/:id/Edited', async (req, res) => {
    try {
        const { title, description, completed, dueDate, category, priority } = req.body;
        await Task.findByIdAndUpdate(req.params.id, {
            title,
            description,
            completed: completed === 'on',
            category,
            priority,
        });
        res.redirect('/tasks');
    } catch (error) {
        res.status(500).send('Error updating task: ' + error.message);
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
