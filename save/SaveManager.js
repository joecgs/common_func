var SaveManager = {

    saveDic: new Object(),

    saveData: null,

    readNetData : null,
    readStorageData : null,

    saveTime: null,

    syncCount: 0,

    server_force_change : false,

    init:function() {
        client_events.on("CLIENT_GAME_START",this, this.autoSaveStart );
        client_events.on("CLIENT_GAME_HIDE",this, this.onGameHide );
        client_events.on("V2_User_releaseForceEmpty",this, exitGame);
        client_events.on("V2_User_getPackData2",this, this.getPackData );
    },

    register:function(name, wirte, read) {
        this.saveDic[name] = { name: name, wirte: wirte, read: read };
    },

    //写到内存  sync为true时发送到服务器
    save:function(sync) {
        if (this.server_force_change) {
            return;
        }

        //写所有的数据到内存
        this.writeGameData();
        //写所有的数据到strage
        this.writeGameDataToStrage();
        if (sync) {
            this.writeGameDataToServer();
        }
    },

    autoSaveStart:function() {
        this.asIrl = setInterval(this.autoSave.bind(this), 5000);
    },

    onGameHide:function() {
        this.save();
    },

    autoSave:function() {
        if (ComMain.runInBack) {return};

        this.syncCount++;
        if (this.syncCount >= 12) {
            this.syncCount = 0;
            this.save(true);
            return;
        }

        this.save();
    },

    //写obj数据到内存
    writeObjectInfo:function(org, tar) {
        for (var key in org) {
            tar[key] = org[key];
        }
    },

    writeTimestamp:function(obj) {
        obj.timestamp = PlayerManager.getTimestamp();
    },

    writeVersion:function(obj) {
        obj.version = ComConfig.version;
    },

    //写所有的数据到内存
    writeGameData:function() {
        this.saveData = {};
        this.writeTimestamp(this.saveData);
        this.writeVersion(this.saveData);

        for (var val in this.saveDic) {
            this.saveData[val] = new Object();
            this.saveDic[val].wirte(this.saveData[val]);
        }
    },

    //读取所有的数据从内存
    readGameData:function() {

        var useData = null;

        var netTs = (this.readNetData && this.readNetData.timestamp) ? this.readNetData.timestamp : -1;
        var storageTs = (this.readStorageData && this.readStorageData.timestamp) ? this.readStorageData.timestamp : -1;

        if (storageTs > netTs) {
            jq_log("using read storage data");
            useData = this.readStorageData;
        } else {
            jq_log("using read net data");
            useData = this.readNetData;
        }

        if (!useData) {
            useData = {timestamp:-1, version:"0.0.1"}
        }

        jq_log(useData);

        for (var val in this.saveDic) {
            this.saveDic[val].read(useData[val], useData.version);
        }
        
    },

    //写入所有的数据到Storge
    writeGameDataToStrage: function () {
        if (debugMode()) {
            return;
        }

        var storgeObj = {};
        storgeObj.key = "local_save_data";
        storgeObj.data = JSON.stringify(this.saveData);
        storgeObj.fail = function (err) {
            jq_log(err);
            jq_log("警告，游戏写入数据异常");
        }
        wx.setStorage(storgeObj);
    },

    //向服务器发送全部的数据 写数据到服务器
    writeGameDataToServer: function () {
        var ne = NetEngine;
        ne.send({ cmd: "V2_User_setPackData", data: JSON.stringify(this.saveData) });
    },

    //读取所有数据从Storge
    readGameDataFromStorge: function () {
        if (debugMode()) {
            return;
        }

        //改为同步读取
        try {
            var data = wx.getStorageSync("local_save_data");
            this.readStorageData = JSON.parse(data);
            if (!this.checkGameDataUsable(this.readStorageData)) {
                jq_log("read storage data fatal error=data error");
                this.readStorageData = null;
            }
        } catch (error) {
            jq_log("read storage data fatal error=json parse failed");
            this.readStorageData = null;
        }
        

    },

    getPackData:function(evt) {
        this.readGameDataFromServer(evt);
    },

    //读取数据从服务器
    readGameDataFromServer: function (msg) {
        if (!msg) return;

        if (msg.force_empty) {
            this.server_force_change = true;

            var storgeObj = {};
            storgeObj.key = "local_save_data";
            storgeObj.data = msg.packed_data;
            storgeObj.fail = function (err) {
                jq_log(err);
                jq_log("警告，游戏写入数据异常");
            }
            wx.setStorage(storgeObj);

            var ne = NetEngine;
            ne.send({ cmd: "V2_User_releaseForceEmpty" });
        }

        try {
            this.readNetData = JSON.parse(msg.packed_data);
            if (!this.checkGameDataUsable(this.readNetData)) {
                jq_log("read server data fatal error=data error");
                this.readNetData = null;
            }
        } catch (error) {
            jq_log("read server data fatal error=json parse failed");
            this.readNetData = null;
        }
    },

    checkGameDataUsable:function(data) {
        if (data.timestamp != undefined && data.version != undefined) {
            return true;
        } else {
            return false;
        }
    }

}
