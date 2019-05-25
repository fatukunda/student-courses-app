const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const Student = require('../src/models/student')

const _id = new mongoose.Types.ObjectId()

const student1 = {
    _id,
    name: 'testUser1',
    email: 'testuser1@app.com',
    password: 'testPass1234!',
    tokens: [{
        token: jwt.sign({ _id }, process.env.SECRET_KEY)
    }]
}

const invalidStudent = {
    _id,
    name: 'testUser2',
    email: 'usernone@app.com',
    password: 'userPass12!!'
}

beforeEach( async () => {
    await Student.deleteMany()
    await new Student(student1).save()
})

test('Should signup a new student', async () => {
    const user = {
        name: 'testUser',
        email: 'testuser@app.com',
        password: 'MyPass2019!'
    }
    await request(app)
        .post('/students')
        .send(user)
        .expect(201)
})
test('Should login a registered student', async () => {
    const { email, password } = student1
        await request(app)
        .post('/students/login')
        .send({email, password})
        .expect(200)
})

test('Should not login non-existent students', async () => {
    const { email, password } = invalidStudent
        await request(app)
        .post('/students')
        .send({email, password })
        .expect(400)
})

test('Should get student profile', async () => {
    await request(app)
        .get('/students/me')
        .set('Authorization', `Bearer ${student1.tokens[0].token}`)
        .send()
        .expect(200)
})
test('Should not get profile of an unauthorized student', async () => {
    await request(app)
        .get('/students/me')
        .send()
        .expect(401)
})

test('Should delete a registered student', async () => {
    await request(app)
        .delete('/students/me')
        .set('Authorization', `Bearer ${student1.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not delete an unauthorized student', async () => {
    await request(app)
        .delete('/students/me')
        .send()
        .expect(401)
})

test('Should edit a registered student profile', async () => {
    await request(app)
        .patch('/students/me')
        .set('Authorization', `Bearer ${student1.tokens[0].token}`)
        .send( { name: 'EditedUser' , email: 'editeduser@app.com'})
        .expect(200)
})

