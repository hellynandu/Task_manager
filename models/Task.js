const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: '' },
    completed: { type: Boolean, default: false },
    dueDate: {
        type: Date,
        required: false
    },
    category:{
        type: String,
        enum: ['Work', 'Personal', 'Shopping', 'Others'],
        default: 'Others'
    },
      priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    createdAt: { type: Date, default: Date.now }
});

// Create and export the Task model
module.exports = mongoose.model('Task', taskSchema);
