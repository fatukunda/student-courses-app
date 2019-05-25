const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Course = require('./course')

const studentSchema = mongoose.Schema({
    name: {
        required: true,
        type: String,
        trim: true
    },
    age: {
        type: Number,
        trim: true,
        min: 4
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: value => {
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email address!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate: (value) => {
            if (validator.contains(value, 'password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
},{
    timestamps: true
})

studentSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'student'
})

studentSchema.pre('save', async function(next) {
    const student = this
    if (student.isModified('password')) {
        student.password = await bcrypt.hash(student.password, 8)
    }
    next()
})

studentSchema.pre('remove', async (next) => {
    const student = this
    await Course.deleteMany({ student: student._id})
    next()
})

studentSchema.methods.generateAuthToken = async function() {
    const student = this
    const token = jwt.sign({_id: student._id}, process.env.SECRET_KEY)
    student.tokens = student.tokens.concat({token})
    await student.save()
    return token
}
studentSchema.methods.toJSON = function() {
    const student = this
    const studentObject = student.toObject()
    delete studentObject.tokens
    delete studentObject.password
    delete studentObject.avatar
    return studentObject
}

studentSchema.statics.findByCredentials = async (email, password) => {
    const student = await Student.findOne({ email} )
    if (!student) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    const isPasswordMatch = await bcrypt.compare(password, student.password)
    if (!isPasswordMatch) {
        throw new Error({ error: 'Invalid login credentials' })
    }
    return student

}

const Student = mongoose.model('Student', studentSchema)

module.exports = Student