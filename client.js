var ws;
var isConnected = false
var recievedPong = "waiting"
var pingCounter = 0
var reset_timer = 10
var status = 'waiting'
const regex = /^!(\w*)\s(.*)/gm

function startWS() {
  let protocol = 'wss'
  let port = '8443'
  if (window.location.protocol == 'http:') {
    protocol = 'ws'
    port = '8080'
  }

  ws = new WebSocket(`${protocol}://${window.location.hostname}:${port}`)

  ws.onopen = function () {
      console.log('websocket is connected ...')
      ws.send("!channel " + window.location.pathname.replace("/",""))
      sendPing()
      isConnected = true
  }

  ws.onmessage = function (me) {
      console.log(me.data)
      let m = regex.exec(me.data)
      regex.lastIndex = 0
      //console.log(m)
      if (m === null) return
      switch (m[1]) {
        // !add Feed Bill Extra Noms
        case 'add':
          newElement(m[2])
          break
        case 'close':
          closeElement(m[2])
          break
        // !toggle 3
        case 'toggle':
          toggleElement(m[2])
          break
        case 'pong':
          recievedPong = "yes"
          break
        case 'ping':
          ws.send('!pong ' + m[2])
          break
      }
  }

  ws.onerror = function () {
    isConnected = false
  }

  ws.onclose = function () {
    isConnected = false
  }

}

function sendPing () {
  if (ws.readyState !== WebSocket.OPEN) return
  setTimeout(function() {
    if (recievedPong !== "yes") {
      recievedPong = "no"
    }
  }, 2000)
  pingCounter++
  recievedPong = "waiting"
  ws.send("!ping " + pingCounter)
}

// connection test
startWS()
setInterval(function() {
  if (isConnected == false || recievedPong == "no") {
    if(ws && typeof ws.close === 'function') ws.close()
    ws = null
    startWS()
    pingCounter = 0
  }
  sendPing()
}, 10000)



function toggleElement(i) {
  var list = document.getElementById("myUL");
  list.children[i].classList.toggle('checked');
}

function closeElement(i) {
  var list = document.getElementById("myUL");
  list.children[i].style.display = "none";
}

// Create a new list item when clicking on the "Add" button
function newElement(txt) {
  var li = document.createElement("li");
  var t = document.createTextNode(txt);
  li.appendChild(t);
  document.getElementById("myUL").appendChild(li);
}













