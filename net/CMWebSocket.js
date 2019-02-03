/**
 * 发送二进制数据
 * @param ip    服务器地址
 * @param port  服务器端口
 * @param handlers {open{func,target,args},message,reconnect}
 * @param ar    是否自动重连 对应重连函数
 */
function CMWebSocket(ip, port, proto, handlers, ar) {

    this.ip = "";
    this.port = 0;
    this.proto = ""
    this.autoReconnect = false
    this.handlers = null;

    this._connect = false;
    this._wsHandler = null;

    this.init(ip, port, proto, handlers, ar);
}

CMWebSocket.prototype = { 

},

CMWebSocket.prototype.init = function(ip, port, proto, handlers, ar) {
    this.ip = ip;
    this.port = port;
    this.handlers = handlers;
    this.autoReconnect = ar;
    this.proto = proto;
}

/**
 * 连接远程服务器
 */
CMWebSocket.prototype.connect = function () {
    if (!this._connect) {
        this._connect = true;
        var cmwshCls = CMWebSocketHandler;
        this._wsHandler = new cmwshCls('' + this.proto + this.ip + ':' + this.port, this.onOpen.bind(this), this);
    }
}

/**
 * 断开连接
 */
CMWebSocket.prototype.disconnect = function() {
    if (this._connect) {
        this._connect = false;
        this._wsHandler && this._wsHandler.destroy();
        this._wsHandler = null;
    }
}

/**
 * 发送二进制数据
 * @param data
 */
CMWebSocket.prototype.send = function(data) {
    if (!this._connect) {
        jq_log("cm web socket not open");
        return;
    }

    this._wsHandler && this._wsHandler.send(data);
}

/**
 * 销毁连接/清理
 */
CMWebSocket.prototype.destroy = function() {
    this.ip = "";
    this.port = "";
    this.handlers = null;
    this.autoReconnect = false;

    this.disconnect();
}


CMWebSocket.prototype.onOpen = function(evt) {
    if (!this._connect) {
        jq_log("cm web socket not open");
        return;
    }

    jq_log('connect ' + this.ip + ' Succeed');

    if (this.handlers && this.handlers.open) {
        this.executeHandler(this.handlers.open, evt);
    }
}

CMWebSocket.prototype.onReconnect = function(evt) {
    if (!this._connect) {
        jq_log("cm web socket not open");
        return;
    }

    if (this.handlers && this.handlers.reconnect) {
        this.executeHandler(this.handlers.reconnect, evt);
    }
}

CMWebSocket.prototype.onError = function(evt) {
    jq_log(evt);
}

CMWebSocket.prototype.onClose = function() {
    if (!this._connect) {
        jq_log("cm web socket not open");
        return;
    }

    jq_log('disconnect ' + this.ip);

    if (this._wshandler) {
        this._wshandler.destroy();
        this._wshandler = null;
    }

    if (this.autoReconnect) {
        setTimeout(function() {
            var cmwshCls = CMWebSocketHandler;
            this._wsHandler = new cmwshCls('' + this.proto + this.ip + ':' + this.port, this.onReconnect.bind(this), this);
        }.bind(this), 3000);
    }
}

CMWebSocket.prototype.onMessage = function(evt) {
    if (!this._connect) {
        jq_log("cm web socket not open");
        return;
    }

    if (this.handlers && this.handlers.message) {
        this.executeHandler(this.handlers.message, evt);
    }
}

CMWebSocket.prototype.executeHandler = function(handler, ext) {
    if (handler.args) {
        if (Array.isArray(handler.args)) {
            var arr = handler.args.slice();
            arr.push(ext);
            handler.func.apply(handler.target, arr)
        } else {
            handler.func.apply(handler.target, [handler.args, ext])
        }
    } else {
        handler.func.apply(handler.target, [ext])
    }
}
