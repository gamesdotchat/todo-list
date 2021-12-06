import tmi from 'tmi.js'
import autoBind from 'auto-bind'

const regex = /^!(\w*)\s(.*)/gm

export default class Todo {

  constructor (channel, user, pass) {
    autoBind(this)
    this.channel = channel
    this.ws = []

    // twitch chat options
    let opts = {
      identity: {
        username: user,
        password: pass
      },
      connection: {
        reconnect: true
      },
      channels: [
        channel
      ]
    }
    this.chat = new tmi.client(opts)

    this.chat.on('chat', this.onChatHandler)
    this.chat.on('connected', this.onConnectedHandler)
    this.chat.on('disconnected', this.onDisconnectedHandler)

    // Connect to Twitch:
    this.chat.connect()

  }

  addWS (ws) {
    this.ws.push(ws)
  }

  sendAllWS (msg) {
    // send message to all alive ws, remove any dead ones
    this.ws = this.ws.filter( ws => {
      if (ws.isAlive === false) return false
      ws.send(msg)
      return true
    })
  }

  close () {
    this.isConnected = false
  }

  // Called every time the bot connects to Twitch chat:
  onConnectedHandler (addr, port) {
    console.log(`${this.channel}: connected to ${addr}:${port}`)
    this.isConnected = true
  }

  // Called every time the bot disconnects from Twitch:
  onDisconnectedHandler (reason) {
    console.log(`Disconnected: ${reason}`)
    //process.exit(1)
    this.isConnected = false
  }

  onChatHandler (target, context, msg) {
    if (!this.isConnected) return
    if (context.username == 'gamesdotchat') return
    if (context.username == 'connect4bot') return
    if (context.username == 'nightbot') return
    if (context.username == 'streamlabs') return
    if (context.username == 'streamelements') return

    // is a mod
    if (context.username == this.channel) context.mod = true;
    if (context.mod === false) return

    console.log(this.channel + ": " + msg)

    let m = regex.exec(msg)
    regex.lastIndex = 0
    if (m === null) return
    switch (m[1]) {
      case 'ta':
        this.sendAllWS("!add " + m[2])
        break
      case 'td':
        this.sendAllWS("!close " + m[2])
        break
      case 'tt':
        this.sendAllWS("!toggle " + m[2])
        break
    }
  }

}
