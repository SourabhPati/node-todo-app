const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { testUserOneId, testUserOne, setupDatabase } = require('./fixtures/db')

beforeEach(setupDatabase)

test('User Signup', async () => {
    const response = await request(app).post('/users').send({
        "name": "signUptestUser",
        "email": "signUptestuser@mongo.com",
        "password": "testPass123"
    }).expect(201)

    //Assert that database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Assertions about response
    expect(response.body).toMatchObject({
        user: {
            "name": "signUptestUser",
            "email": "signuptestuser@mongo.com"         //model is configured to coverts email to lowercase.
        },
        token: user.tokens[0].token
    })

    expect(user.password).not.toBe('testPass123')
})

test('Login Existing User', async () => {
    const response = await request(app).post('/users/login').send({
        "email": testUserOne.email,
        "password": testUserOne.password
    }).expect(200)

    const user = await User.findById(testUserOneId)
    expect(user).not.toBeNull()

    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Reject Login for Non-Existing User', async () => {
    await request(app).post('/users/login').send({
        "email": testUserOne.email,
        "password": 'LoremIpsum'
    }).expect(400)
})

test('Get User Profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Reject unauthenticated User Profile', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

test('Delete Authenticated User', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send()
        .expect(200)

    const user = await User.findById(testUserOneId)
    expect(user).toBeNull()
})

test('Reject deleting unauthenticated User', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

test('Upload User Avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .attach('upload', 'test/fixtures/profile-pic.jpg')
        .expect(200)
    const user = await User.findById(testUserOneId)
    expect(user).not.toBeNull()
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update valid User Field', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send({
            "name": "updated_testUserOne",
            "age": 101
        }).expect(200)

    const user = await User.findById(response.body._id)
    expect(user).not.toBeNull()
    expect({
        name: user.name,
        age: user.age
    }).toEqual({
        "name": "updated_testUserOne",
        "age": 101
    })
})

test('Reject Updating invalid User Field', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send({
            "address": "updated_testUserOne",
            "height": 101
        }).expect(400)
})
