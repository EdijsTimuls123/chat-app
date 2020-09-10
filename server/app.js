const { parse: parseQuery } = require('querystring');
const SERVER_PORT = 3030

const WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({port: SERVER_PORT}),
    CLIENTS = [];

const INACTIVITY_INTERVAL_CHECKER = 5000
const INACTIVITY_SECONDS = 30000
const DUPLICATE_USERNAME = 4000
const INACTIVITY_TIMEOUT = 4001
const SERVER_ERROR = 4004
const SERVER_SHUTDOWN = 4005
const serverOrigin = `ws://localhost:${SERVER_PORT}`;

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

function shutDown(sig) {
  if (typeof sig === "string") {
    console.log("%s: Received %s - terminating chat app ...", Date(Date.now()), sig);
    if (CLIENTS.length > 0) {
      CLIENTS.forEach(client => {
        client.close(SERVER_SHUTDOWN, "Server shutdown...");
      })
    }
    process.exit(1);
  }
  console.log('%s: Node server stopped.', Date(Date.now()));
}

wss.on('connection', function(ws, request) {
  const url = new URL(request.url, serverOrigin);
  const query = parseQuery(url.search.substr(1));
  const userName = query.userName
  ws.name = userName;
  let lastConnectionTime = null

  if (hasDuplicate(userName)) {
    ws.close(DUPLICATE_USERNAME, `Username ${userName} already taken, please try other`)
  }

  CLIENTS.push(ws)
  lastConnectionTime = new Date();
  let inactivityTimeout = setInterval(disconnectUser, INACTIVITY_INTERVAL_CHECKER, ws, lastConnectionTime)

  ws.on('message', function(message) {
    if (isJson(message)) {
      const msg = JSON.parse(message)
      console.log(`Server - received message from client ${msg.message}`)

      lastConnectionTime = new Date();
      clearInterval(inactivityTimeout)
      inactivityTimeout = setInterval(disconnectUser, INACTIVITY_INTERVAL_CHECKER, ws, lastConnectionTime)
  
      if (msg.action === 'message') {
        sendAll(message)
      } else {
        sendAllExceptSelf(message, ws)
      }
    } else {
      clearInterval(inactivityTimeout)
      ws.close(SERVER_ERROR, JSON.stringify({message: "INVALID DATA PROVIDED!"}))
      removeUser(ws)
    }
    
  });

  ws.on('close', function(message) {
    if (isJson(message)) {
      if (message === 1001 || message === 1006) {
        sendAllExceptSelf(JSON.stringify({message: `${ws.name} disconnected from the chat!`}), ws)
      } else {
        sendAllExceptSelf(message, ws)
      }
      clearInterval(inactivityTimeout)
    } else {
      clearInterval(inactivityTimeout)
      ws.close(SERVER_ERROR, JSON.stringify({message: "INVALID DATA PROVIDED!"}))
      removeUser(ws)
    }
  });

  function disconnectUser(ws, lastTime) {
    const inactivityTime = addSeconds(lastTime, INACTIVITY_SECONDS)
    const now = new Date().getTime()
    if (now > inactivityTime) {
      const message = `${ws.name} disconnected due to innactivity!`
      sendAllExceptSelf(JSON.stringify({message: message}), ws)
      ws.close(INACTIVITY_TIMEOUT, message)
      clearInterval(inactivityTimeout)
    }
  }
});

function sendAll(message) {
  CLIENTS.forEach(client => {
    client.send(message)
  });
}

function sendAllExceptSelf(message, ws) {
  CLIENTS.forEach(client => {
    if (client !== ws) {
      client.send(message)
    }
  });
}

function hasDuplicate(name) {
  let duplicate = false;
  if (CLIENTS.length > 0) {
    CLIENTS.forEach(client => {
      if (name === client.name) {
        duplicate = true
      }
    })
  }
  return duplicate
}

function addSeconds(date) {
  return date.getTime() + INACTIVITY_SECONDS;
}

function isJson(message) {
  result = true
  try {
    JSON.parse(message)
  } catch (e) {
    result = false
    console.log(`Error while parsing to JSON: ${e.message}`)
  }

  return result
}

function removeUser(ws) {
  if (CLIENTS.length > 0) {
    for (let i = 0; i < CLIENTS.length; i++) {
      if (CLIENTS[i].name === ws.name) {
        CLIENTS.splice(i, 1)
      }
    }
  }
  return;
}
