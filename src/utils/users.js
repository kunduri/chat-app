const users = []

const addUser = ({id, username, room}) => {
    username = username.trim().toLowerCase()
    room = room.toString().trim().toLowerCase()
    if(!username || !room ) {
        return {
            error : 'Username, Room are required'
        }
    }
    const checkUser = users.find((user) => {
        return user.room == room && user.username === username
    })
    if(checkUser) {
        return {
            error : 'Username is already in use!'
        }
    }
    const user = { id, username, room}
    users.push(user)
    return {
        user
    }
}
const removeUser = (id) => {
    const userIndex = users.findIndex((user) => user.id === id)
    if (userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
}
const getUser = (id) => {
    return users.find((user) => user.id === id)
}
const getUsersInRoom = (room) => {
    const usersInRoom = users.filter((user) => user.room === room)
    return usersInRoom
}
module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}