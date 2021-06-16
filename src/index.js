const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMsg, generateLoc} = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const pubcliDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(pubcliDirectoryPath))

//let count = 0
io.on('connection', (socket) => {
    socket.on('join', ({username, room}, callback) => {
        const {error, user} = addUser({
            id : socket.id,
            username : username,
            room : room.toString()
        })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMsg('admin', 'Welcome'))
        socket.broadcast.to(user.room).emit('message', generateMsg('admin', `${user.username} has joined`));
        io.to(user.room).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })
        callback()
    })
    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        const user = getUser(socket.id)
        if(filter.isProfane(message)) {
            return callback('Profanity not allowed!')
        }
        io.to(user.room).emit('message', generateMsg(user.username, message))
        callback()
    })
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLoc(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message',generateMsg('admin', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`server is up at ${port}`)
})