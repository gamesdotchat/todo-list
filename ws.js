import Todo from './src/todo.js'
import WebSocket from 'ws'

const wss = new WebSocket.Server({ port: 8080 });

let todos = []

const regex = /^!(\w*)\s(.*)/gm;

wss.on('connection', function (ws) {
  let _ws = ws
  _ws.isAlive = true
  _ws.todo = false
  _ws.pings = 0
  _ws.on('message', function (message) {
    // debug output
    if (_ws.todo !== false) {
      console.log(`${_ws.todo.channel} received: ${message}`)
    } else {
      console.log('received: %s', message)
    }

    // message from client
    // ![cmd] [msg]
    let m = regex.exec(message)
    regex.lastIndex = 0
    if (m === null) return
    switch (m[1]) {
      case 'channel':
        let wsTodo = false
        let channel = m[2].toLowerCase()
        // find any open todo lists
        todos.forEach(todo => {if (todo.channel == channel) wsTodo = todo})
        // create new game when needed
        if (wsTodo === false) {
          wsTodo = new Todo(m[2].toLowerCase(), process.env.TMI_USER, process.env.TMI_PASS)
          todos.push(wsTodo)
        }
        // attach ws to game
        _ws.todo = wsTodo
        _ws.todo.addWS(_ws)
        break
      case 'ping':
        _ws.isAlive = true
        ws.send('!pong ' + m[2])
        break
      case 'pong':
        _ws.isAlive = true
        break
    }
  })
  _ws.on('close', function () {
    // clean up twitch connection
    _ws.isAlive = false
    if (_ws.game !== false) {
      //console.log("closing " + _ws.game.channel)
    }
  })
  _ws.on('error', function (err) {
    console.log(err)
    // clean up twitch connection
    if (_ws.game !== false) {
      console.log("error: " + _ws.game.channel)
    }
  })
})

wss.on('close', function close() {
  clearInterval(interval);
});
