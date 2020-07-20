const express=require('express');
const path=require('path');
const chalk=require('chalk')
// const hbs=require('hbs');
const http=require('http');
const socketio=require('socket.io')
const port=process.env.PORT || 3000;
const words=require('bad-words');
const app=express();

const publicdir=path.join(__dirname,'../public');
// const viewdir=path.join(__dirname,'../templates/views');
// app.set('view engine','');
// app.set('views',viewdir);
// hbs.registerPartials(path.join(__dirname,'../templates/partials'))
app.use(express.static(publicdir));
app.use(express.json());

const server=http.createServer(app)
const io=socketio(server);

app.get('',(req,res)=>{
    res.render('index')
})

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'A new user has joined!')

    socket.on('sendMessage', (message, callback) => {
        const filter = new words()

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.emit('message', message)
        callback()
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!')
    })
})

server.listen(port,()=>{
    console.log(`${chalk.red(`listening ${chalk.yellow(port)}`)}`)
})
