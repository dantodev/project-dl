document.addEventListener("DOMContentLoaded", function() {
    var host = 'localhost',
        port = 4080,
        ctx = document.querySelector('#ctx'),
        ws = new WebSocket('ws://'+host+':'+port, ['soap', 'xmpp']),
        drawer,
        remote_drawers = {};

    var MODE_INIT = 0,
        MODE_POSITION = 1;

    ws.onopen = function () {
        var color = window.prompt('color?');
        sendWs([MODE_INIT, color]);
        drawer = new Drawer(ctx, color);
        registerEvents();
    };

    ws.onerror = function (error) {
        console.log('WebSocket Error: ' + error);
    };

    ws.onmessage = function (e) {
        var data = JSON.parse(e.data);
        if (!Array.isArray(data)) {
            return;
        }
        switch (data[0]) {
            case MODE_POSITION:
                if (!remote_drawers.hasOwnProperty(data[3])) {
                    remote_drawers[data[3]] = new Drawer(ctx, data[4]);
                }
                remote_drawers[data[3]].drawTo(data[1], data[2]);
                break;
        }
    };

    function registerEvents() {
        document.addEventListener('mousemove', function (ev) {
            if (!drawer) {
                return;
            }
            sendWs([MODE_POSITION, ev.pageX, ev.pageY]);
            drawer.drawTo(ev.pageX, ev.pageY);
        });
        document.querySelector('#clear').addEventListener('click', function () {
            ctx.innerHTML = "";
        })
    }

    function sendWs(data) {
        ws.send(JSON.stringify(data));
    }

});

var Drawer = function (ctx, color) {
    var __instance = this,
        last_pos = null;

    __instance.drawTo = function (x, y) {
        if (last_pos) {
            line(last_pos[0], last_pos[1], x, y);
        }
        last_pos = [x, y];
    };

    function line(x1, y1, x2, y2) {
        var line = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        line.setAttribute('x1', x1+'px');
        line.setAttribute('y1', y1+'px');
        line.setAttribute('x2', x2+'px');
        line.setAttribute('y2', y2+'px');
        line.style.stroke = color;
        line.style.strokeWidth = "2px";
        ctx.appendChild(line);
    }
};