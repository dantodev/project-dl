var server = require('http').createServer(),
    WebSocketServer = require('ws').Server,
    wss = new WebSocketServer({ server: server }),
    express = require('express'),
    app = express(),
    fs = require('fs'),
    port = 4080,
    view_path = __dirname+'/views/',
    counter = -1;

var MODE_INIT = 0,
    MODE_POSITION = 1;

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(view_path+'index.html');
});

wss.on('connection', function connection(ws) {
    var connection = this;
    ws.id = counter++;
    console.log('user with id %s connected.', ws.id);
    ws.on('message', function incoming(data) {
        data = JSON.parse(data);
        if (!Array.isArray(data)) {
            return;
        }
        switch (data[0]) {
            case MODE_INIT:
                ws.color = data[1];
                break;
            case MODE_POSITION:
                connection.clients.forEach(function (_ws) {
                    if (ws.id != _ws.id) {
                        data.push(ws.id);
                        data.push(ws.color);
                        _ws.send(JSON.stringify(data));
                    }
                });
                break;
        }
    });
});

server.on('request', app);
server.listen(port, function () {
    console.log('Listening on %s', server.address().port);
});