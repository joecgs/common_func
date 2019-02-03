//MAX_RECOND_RECEIVE_PACKAGE_ID = 50;

var NetEngine = {
    
    com : null,

    failCount : 0,

    msgQueue : new Array(),

    curMsg : null,

    //receivedPackageIdArr : new Array(),

    init : function(com)
    {
        this.com = com;

        if (!Laya.Browser.onWeiXin) {
            com.userInfo.open_id = "1213214";
            this.getNetSaveData(null);
            client_events.event("NET_ENGINE_COMPLETE");
        } else {
            this.wxLogin();
        }
    },

    get standby() {
        return this.com && (this.com.userInfo.open_id != "")
    },

    wxLogin:function() {

        wx.login({   
            success : this.wxLoginSucc.bind(this),

            fail : this.wxLoginFail.bind(this),

            complete : function(){

            }
        });
    },

    failAndRetry : function() {

        messageTips("链接服务器中，请稍后");

        setTimeout(this.wxLogin.bind(this), 500);
    },

    wxLoginFail : function() {
        this.failAndRetry();
    },

    wxLoginSucc : function(res){

        //获取AccessToken

        var cfg = ComConfig;

        jq_log("retcode:" + res.code);

        var sendData = new Object();

        // var param = wx.getLaunchOptionsSync();

        // jq_log(param);

        this.com.userInfo.game_id = cfg.game_id;
        
        var systemInfo = wx.getSystemInfoSync();

        jq_log(systemInfo);

        if (systemInfo.platform == "ios") {
            this.com.userInfo.platform = 1;
        }
        else if (systemInfo.platform == "android") {
            this.com.userInfo.platform = 2;
        }
        else {
            this.com.userInfo.platform = 3;
        }

        sendData.cmd = "V2_Login_loginGame";

        sendData.jscode = res.code;
        sendData.game_id = this.com.userInfo.game_id;
        sendData.platform = this.com.userInfo.platform;
        sendData.ver = ComConfig.version;
        var param = wx.getLaunchOptionsSync();
        if (param.query && JSON.stringify(param.query) != "{}") {
            sendData.channel = param.query.channel;
        };

        wx.request({
            header: {'content-type': 'application/x-www-form-urlencoded'},
            url : this.requestUrlBuild("request"),
            method : "POST",
            dataType : "json",
            data : this.addVersion(sendData),
            success : this.serverLoginReceive.bind(this),

            fail : this.serverLoginFail.bind(this),

            complete : function(){

            }

        });
    },

    serverLoginFail : function() {
        this.failAndRetry();
    },

    serverLoginReceive : function(resData){
        jq_log(resData);

        if (resData.statusCode >= 400) {
            messageTips("服务器异常，请求失败");
            this.failAndRetry();
            return;
        }

        var pkgs = resData.data;

        for (var i = 0; i < pkgs.length; i++) {
            if (pkgs[i].code == 0) {
                if (pkgs[i].cmd == "V2_Login_loginGame") {
                    this.com.parseLoginData(pkgs[i].data);
                }
            } else {
                messageTips(pkgs[i].message);
                this.serverLoginFail();
                return;
            }
        }
        
        //拿到openid和sessionkey
        // var open_id = resData.openid;
        // var sesison_key = resData.session_key;
        // var sdk_user_id = resData.sdk_user_id;
        // var sdk_user_token = resData.sdk_user_token;

        wx.postMessage({
            message: 'setUserInfo',
            openId : this.com.userInfo.open_id
        });

        var sendData = new Object();

        sendData.cmd = "V2_User_loginInfo";
        var param = wx.getLaunchOptionsSync();
        if(param && param.query && JSON.stringify(param.query) != "{}"){
            if(param.query.channel){
                sendData.channel  = param.query.channel;
            }
        }

        sendData.open_id = this.com.userInfo.open_id;
        sendData.token = this.com.userInfo.token;
        sendData.game_id = this.com.userInfo.game_id;
        sendData.platform = this.com.userInfo.platform;
        sendData.ver = ComConfig.version;

        wx.request({
            header: {'content-type': 'application/x-www-form-urlencoded'},
            url : this.requestUrlBuild("request"),
            method : "POST",
            dataType : "json",
            data : this.addVersion(sendData),
            success : this.getLoginInfoReceive.bind(this),

            fail : this.getLoginInfoFail.bind(this),

            complete : function(){

            }

        });
    },

    getLoginInfoFail : function() {
        this.failAndRetry();
    },

    getLoginInfoReceive : function(resData){
        jq_log(resData);

        if (resData.statusCode >= 400) {
            messageTips("服务器异常，请求失败");
            this.failAndRetry();
            return;
        }

        var pkgs = resData.data;

        for (var i = 0; i < pkgs.length; i++) {
            if (pkgs[i].code == 0) {
                if (pkgs[i].cmd == "V2_System_switcher") {
                    this.getSwitcherReceive(pkgs[i].data);
                } else if (pkgs[i].cmd == "V2_User_getPackData2") {
                    this.getNetSaveData(pkgs[i].data);
                } else if (pkgs[i].cmd == "V2_Friends_getMyFriends") {
                    client_events.event(pkgs[i].cmd, pkgs[i].data);
                } else if (pkgs[i].cmd == "V2_Friends_getRecords") {
                    client_events.event(pkgs[i].cmd, pkgs[i].data);
                } else if (pkgs[i].cmd == "V2_User_timeSync") {
                    //服务器下发这个包的时序必须在最后
                    //cc.systemEvent.emit(pkgs[i].cmd, pkgs[i].data);
                    PlayerManager.svrTimestamp = pkgs[i].data.ts;
                }else if(pkgs[i].cmd == "V2_G1020_Mall_getGoodsList"){
                    PlayerManager.mall_list = pkgs[i].data.goods_list;
                }else {
                    client_events.event(pkgs[i].cmd, pkgs[i].data);
                }
            } else {
                messageTips(pkgs[i].message);
                this.getLoginInfoFail();
                return;
            }
        }

        client_events.event("NET_ENGINE_COMPLETE");
    },

    getNetSaveData:function(msg) {
        var sm = SaveManager;
        sm.readGameDataFromServer(msg);
        sm.readGameDataFromStorge();
        sm.readGameData();
    },

    // getSwitcherFail : function() {
    //     this.failAndRetry();
    // },

    getSwitcherReceive : function(data){
        jq_log(data);

        var cfg = ComConfig;
        cfg.share_data = data.share_data
        cfg.auditing = data.auditing
        cfg.ad = data.ad
        cfg.logical = data.logical
        cfg.logical_server = data.logical_server
        cfg.more_game_arr = data.more_game_arr;
        jq_log("get ad cfg");
        Share.cfg = cfg.share_data;

        Ad.init();
        if (Laya.Browser.onWeiXin) {
            wx.showShareMenu({withShareTicket:true});
            Share.setSystemShare();
        }
        // PlayerManager.init();
        // ItemManager.init();
        // SigninManager.init();
    },

    send : function (obj, sync) {

        jq_log("client logic send");

        if (this.com.userInfo.open_id == "") {
            return;
        }

        var uid = getUniqueHandleId();
        obj.open_id = this.com.userInfo.open_id;
        obj.token = this.com.userInfo.token;
        obj.game_id = this.com.userInfo.game_id;
        obj.platform = this.com.userInfo.platform;
        obj.package_id = uid;

        jq_log("send pkg");
        jq_log(obj);

        var pkg = obj;
        pkg.package_id = uid;

        if (sync) {
            client_events.event("NET_TIME_LOCK", true);
            pkg.net_use_sync = true;
        }

        this.msgQueue.push(pkg);
    },

    sendPackage:function() {

        if (!Laya.Browser.onWeiXin) {
            return;
        }

        if (this.curMsg || this.msgQueue.length == 0) {
            return;
        }

        try {
            this.curMsg = this.msgQueue.shift();
            if (this.curMsg.net_use_sync) {
                client_events.event("NET_TIME_LOCK", true);
            }
            this._send();

        } catch (error) {
            messageTips(error);
            this.curMsg = null;
            client_events.event("NET_TIME_LOCK", false);
        }
    },

    sendChecker:function(pid) {
        if (this.curMsg && this.curMsg.package_id == pid) {
            jq_log("custom timeout retrysend");
            this._send();
        }
    },

    startProcessSendQueue:function() {
        setInterval(this.sendPackage.bind(this), 200);
    },

    _send:function() {

        jq_log("client real send");
        wx.request({
            header: {'content-type': 'application/x-www-form-urlencoded'},
            url : this.requestUrlBuild("request"),
            method : "POST",
            dataType : "json",
            data : this.curMsg,
            success : this.receive.bind(this),
            fail : function(msg){
                jq_log("wx request fail, waiting auto retry");
            }.bind(this),
            complete : function(){
                
            }
        });

        setTimeout(this.sendChecker.bind(this, this.curMsg.package_id), 3000);
    },

    // checkReceivedPackage(id) {
    //     if (this.receivedPackageIdArr.includes(id)) {
    //         return true;
    //     } else {
    //         this.receivedPackageIdArr.push(id);

    //         if (this.receivedPackageIdArr.length > MAX_RECOND_RECEIVE_PACKAGE_ID) {
    //             this.receivedPackageIdArr.pop();
    //         }

    //         return false;
    //     }
    // },

    receive : function(resData) {

        jq_log("receive pkg");

        jq_log(resData);

        if (resData.statusCode >= 400) {
            messageTips("服务器异常，请求失败");
            return;
        }

        if (!this.curMsg || this.curMsg.package_id != resData.data.package_id) {
            jq_log("异常回包，与发送包不匹配");
            return;
        }

        try {
            var pkgs = resData.data.package;
        } catch (error) {
            jq_log(error);

            if (this.curMsg.net_use_sync) {
                client_events.event("NET_TIME_LOCK", false);
            }
            this.curMsg = null;

            return;
        }

        jq_log(pkgs);

        if (this.curMsg.net_use_sync) {
            client_events.event("NET_TIME_LOCK", false);
        }
        this.curMsg = null;

        for (var i = 0; i < pkgs.length; i++) {
            if (pkgs[i].code == 0) {
                client_events.event(pkgs[i].cmd, pkgs[i].data);
            } else {
                jq_log(pkgs[i].message);
            }
        }
    },

    requestUrlBuild : function (funcName) {
        var cfg = ComConfig;
        var url = cfg.server_url_arr[cfg.server_use] + funcName
        return url;
    },

    addVersion: function (data) {
        var cfg = ComConfig;
        data.ver = cfg.version
        return data
    }
};




