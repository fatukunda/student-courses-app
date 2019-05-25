const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const Student = require('../models/student')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/students', async (req, res) => {
    //Register a new student
    const student = new Student(req.body)
    try {
        await student.save()
        const token = await student.generateAuthToken()
        res.status(201).send( { student, token})
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/students/login', async (req, res) => {
    //Student login
    try {
        const { email, password } = req.body
        const student = await Student.findByCredentials(email, password)
        const token = await student.generateAuthToken()
        res.send({ student, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            cb(new Error('Please upload an image'))
        }
        cb(undefined, true)
    }
})

router.post('/students/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    //Upload a profile picture
    const buffer = await sharp(req.file.buffer).resize({width: 300, height: 300}).png().toBuffer()
    req.student.avatar = buffer
    await req.student.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
})

router.delete('/students/me/avatar', auth, async(req, res) => {
    //Remove a student profile picture.
    req.student.avatar = undefined
    await req.student.save()
    res.send(req.student)
})

router.get('/students/:id/avatar', async(req, res) => {
    try {
        const student = await Student.findById(req.params.id)
        if (!student || !student.avatar) {
            throw new Error({error: 'No avatar found'})
        }  
        res.set('Content-Type', 'image/jpg')
        res.send(student.avatar)
    } catch (error) {
        res.status(404).send(error)
    }
})

router.get('/students/me', auth, async(req, res) => {
    //Get Student Profile
    res.send(req.student)
})

router.patch('/students/me', auth, async(req, res) => {
    //Edit student profile
    const student = req.student
    const allowedEditOptions = ['name', 'age', 'email', 'password']
    const receivedEditOptions = Object.keys(req.body) 
    const isUpdateOption = receivedEditOptions.every((option) => allowedEditOptions.includes(option))
    if (!isUpdateOption) {
        return res.status(400).send( { error: 'Invalid update option' } )
    }
    try {
        receivedEditOptions.forEach((option) => student[option] = req.body[option])
        await student.save()
        res.send(student)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/students/me', auth, async (req, res) => {
    try {
        await req.student.remove()  
        res.send(req.student)
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router