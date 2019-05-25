const mongoose = require('mongoose')

const courseSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        trim: true,
        required: true
    },
    student: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }
},{
    timestamps: true
})

const Course = mongoose.model('Course', courseSchema)

module.exports = Course