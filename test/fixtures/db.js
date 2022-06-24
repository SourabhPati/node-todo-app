const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const testUserOneId = new mongoose.Types.ObjectId()
const testUserOne = {
    "_id": testUserOneId,
    "name": "testUser1",
    "email": "testuser1@mongo.com",
    "password": "testPass123",
    "tokens": [{
        "token": jwt.sign({ _id: testUserOneId }, process.env.JWT_SECRET)
    }]
}

const testUserTwoId = new mongoose.Types.ObjectId()
const testUserTwo = {
    "_id": testUserTwoId,
    "name": "testUser2",
    "email": "testuser2@mongo.com",
    "password": "testPass123",
    "tokens": [{
        "token": jwt.sign({ _id: testUserTwoId }, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task One',
    completed: false,
    owner: testUserOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task Two',
    completed: true,
    owner: testUserOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId,
    description: 'Task Three',
    completed: true,
    owner: testUserTwoId
}

const setupDatabase = async () => {
    await User.deleteMany({})
    await Task.deleteMany({})
    await new User(testUserOne).save()
    await new User(testUserTwo).save()
    await new Task(taskOne).save()
    await new Task(taskTwo).save()
    await new Task(taskThree).save()
}

module.exports = {
    testUserOneId,
    testUserOne,
    testUserTwo,
    testUserTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}