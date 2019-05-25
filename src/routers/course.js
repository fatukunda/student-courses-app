const express = require('express')
const Course = require('../models/course')
const auth = require('../middleware/auth')

const router = express.Router()

router.post('/courses', auth, async(req, res) => {
    //Register for a course
    const course = new Course({
        ...req.body,
        student: req.student._id
    })
    try {
        await course.save()
        res.status(201).send(course)
    } catch (error) {
        res.status(500).send(error)
    }

})

router.get('/courses', auth, async(req, res) => {
    //Get a list of courses for the logged in student
    try {
        await req.student.populate({
            path: 'courses',
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: {
                    createdAt: -1
                }
            }
        }).execPopulate()
        res.send(req.student.courses)
    } catch (error) {
        res.status(400).send(error)
    }
    
})

router.get('/courses/:id', auth, async(req, res) => {
    //Get a single course for the logged in student
    try {
        const course = await Course.findOne( { _id: req.params.id, student: req.student.id } )
        if (!course) {
            throw new Error('Course not found')
        }
        res.send(course)
    } catch (error) {
        res.status(400).send(error)
    }
})
debugger
router.patch('/courses/:id', auth, async(req, res) => {
    //Edit a course for a logged in user
    const allowedEditOptions = ['code', 'name']
    const receivedOptions = Object.keys(req.body)
    const isAllowedOption = receivedOptions.every(option => allowedEditOptions.includes(option))
    
    if (!isAllowedOption) {
        return res.status(400).send({ error: 'Invalid update option!'})
    }
    try {
        const course = await Course.findOne({_id: req.params.id, student: req.student._id})
        if (!course) {
            return res.status(400).send({error: 'Course not found'})
        }
        receivedOptions.forEach(option => course[option] = req.body[option])
        await course.save()
        res.send(course)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/courses/:id', auth, async (req, res) => {
    try {
        const course = await Course.findOneAndDelete({_id: req.params.id, student: req.student._id})
        if (!course) {
            res.status(404).send('Course not found')
        }
        res.send(course)
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router