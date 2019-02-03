function CMHttpRequest() {
    this.maxRetryTimes = 3;
    this.retryTimes = 0;
    this.retryWait = 10000;
    this.pkg = null;
    this.recv = null;
}

CMHttpRequest.prototype.send = function(pkg, recv) {
    this.pkg = pkg;
    this.recv = recv;
    this._send();
}

CMHttpRequest.prototype.sendFail = function() {
    this.retryTimes++
    if (this.retryTimes > this.maxRetryTimes) {
        jq_log('send fail, exceed max retry times, pkg=' + JSON.stringify(this.pkg));
    } else {
        jq_log('send fail, retry=${this.retryTimes}, pkg=' + JSON.stringify(this.pkg));
        setTimeout(this._send.bind(this), this.retryWait);
    }
    
}

CMHttpRequest.prototype.sendSucc = function(res) {
    jq_log('send succ pkg=' + JSON.stringify(this.pkg));

    res.data = forsr.buildRecvObj(res.data);

    if (this.recv) {
        this.recv(res);
    }
}

CMHttpRequest.prototype._send = function() {
    if (Laya.Browser.onWeiXin) {
        wx.request({
            header: {'content-type': 'application/x-www-form-urlencoded'},
            url : NetEngine.requestUrlBuild("request"),
            method : "POST",
            dataType : "json",
            data : forsr.buildSendPkg(this.pkg),
            success : this.sendSucc.bind(this),
    
            fail : this.sendFail.bind(this),
    
            complete : function(){
    
            }
    
        });
    }
}
