



function CMWebSocketHandler(url, open, cmws) {
    this.closed = false;

    //考虑安全性 多加一个标志位
    this.inited = false;

    this.webSocket = new WebSocket(url);

    this.webSocket.binaryType = "arraybuffer"

    this.cmwsOpen = open;
    this.cmws = cmws

    this.webSocket.onopen       = this.onOpen.bind(this);
    this.webSocket.onclose      = this.onClose.bind(this);
    this.webSocket.onerror      = this.onError.bind(this);
    this.webSocket.onmessage    = this.onMessage.bind(this);

    //微信部分情况下open之后无反应现象
    this.timeoutHandler = setTimeout(this.onTimeOut.bind(this), 10000);
}

CMWebSocketHandler.prototype.destroy = function() {
    this.closed = true;
    this.webSocket && this.webSocket.close();
    if (this.timeoutHandler > 0) {
        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = -1;
    }
}

CMWebSocketHandler.prototype.send = function(data) {
    if (!this.closed && this.inited) {
        this.webSocket.send(data);
    } else {
        jq_log("webSocket not open");
    }
}


CMWebSocketHandler.prototype.onOpen = function(evt) {

    if (this.timeoutHandler > 0) {
        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = -1;
    }

    this.inited = true;

    if (!this.closed) {
        this.cmwsOpen(evt);
    }
}

CMWebSocketHandler.prototype.onClose = function() {
    if (this.timeoutHandler > 0) {
        clearTimeout(this.timeoutHandler);
        this.timeoutHandler = -1;
    }
    
    if (!this.closed) {
        this.closed = true;
        this.cmws.onClose();
    }
}

CMWebSocketHandler.prototype.onError = function(evt) {
    if (!this.closed) {
        this.cmws.onError(evt);
    }
}

CMWebSocketHandler.prototype.onMessage = function(evt) {
    if (!this.closed) {
        this.cmws.onMessage(evt);
    }
}

CMWebSocketHandler.prototype.onTimeOut = function() {
    if (!this.closed) {
        this.closed = true;
        this.webSocket && this.webSocket.close();
        this.cmws.onClose();
    }
}
