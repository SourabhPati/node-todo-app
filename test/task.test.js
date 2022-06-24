const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const { 
    testUserOneId,
    testUserOne, 
    setupDatabase, 
    testUserTwo, 
    taskOne } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Create Task for User', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send({
            "description": 'Test task to Check task creation'
        }).expect(201)
    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toBe(false)
})

test('List Tasks for User', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${testUserOne.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toBe(2)
})

test('Prevent Task deletion by non-owner', async () => {
    const response = await request(app)
        .delete(`/task/${taskOne._id}`)
        .set('Authorization', `Bearer ${testUserTwo.tokens[0].token}`)
        .send()
        .expect(404)
    const task = await Task.findById(taskOne._id)
    expect(task).not.toBeNull()
})