const Student = require('../models/student')
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const data = jwt.verify(token, process.env.SECRET_KEY)
        const student = await Student.findOne({_id: data._id, 'tokens.token': token})
        if (!student) {
            throw new Error( { error:'Authentication is required.' } )
        }
        req.student = student
        req.token = token
        next()
    } catch (error) {
        res.status(401).send(error)
    }
}

module.exports = auth