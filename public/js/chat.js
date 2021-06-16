const socket = io()

const $Form = document.querySelector("#chatbox")
const $button = document.querySelector("button")
const $input = document.querySelector("input")
const $sendLocation = document.querySelector("#sendloc")
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

const messageTemplate = document.querySelector("#message-template").innerHTML
const locationTemplate = document.querySelector("#location-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix : true})
const autoscroll = () => {
    const $newMessage = $messages.lastElementChild
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHt = $newMessage.offsetHeight + newMessageMargin
    const visibleHt = $messages.offsetHeight
    const containerHt = $messages.scrollHeight
    const scrollOffset = $messages.scrollTop + visibleHt
    if(containerHt - newMessageHt <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}
socket.on('message', (message) => {
    const html = Mustache.render(messageTemplate, {
        username : message.user,
        message : message.text,
        createdAt : moment(message.createdAt).format('h:m:s')
    })
    $messages.insertAdjacentHTML('beforeend', html) 
    autoscroll()   
})
socket.on('locationMessage', (message) => {
    const html = Mustache.render(locationTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('h:m:s')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})
socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    $sidebar.innerHTML = html
})
$Form.addEventListener('submit', (e) => {
    e.preventDefault();
    $button.setAttribute('disabled', 'disabled')
    const message = e.target.elements.textmsg.value
    socket.emit('sendMessage', message, (response) => {
        $button.removeAttribute('disabled')
        $input.value = ''
        $input.focus()
        if (response) {
            return console.log(response)
        }
        console.log('Message delivered');
    })
})
$sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }
    $sendLocation.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        }
        socket.emit('sendLocation',location, () =>{
            console.log('Location shared!')
            $sendLocation.removeAttribute('disabled')
        })
    })
})
socket.emit('join', {username, room}, (error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})