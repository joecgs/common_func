
var Share = {
    cfg: null,

    simShareObj : null,

    curShareTimes : 0,
    

    init:function() {
        this.dataMap = new Map()
        this.actMap = new Map()
        client_events.on("COM_SHARE_GAME",this, this.shareGame );

        // this.registerAct("add_atk_time",this.AddAtkTime,this);
    },
    
    AddAtkTime:function(query){

        if(query.common_openid == ComMain.userInfo.open_id){
            // if(ComMain.userInfo.open_id == "oSBQZ4x-Brp03p6A9a12cdmN4nFE")
            // {
            //     InBreakManager.AddAtkTime();
            // }
            var arr = ShareCardManager.readArray(query.ts);
            if(arr){
                InBreakManager.AddAtkTime();
            }
            
        }
    },


    registerData:function(name, fun, obj) {
        this.dataMap.set(name, {fun: fun, obj: obj})
    },

    unregisterData:function(name) {
        this.dataMap.delete(name)
    },

    registerAct:function(name, fun, obj) {
        this.actMap.set(name, {fun: fun, obj: obj})
    },

    unregisterAct:function(name) {
        this.actMap.delete(name)
    },

    shareGame:function(evt) {
        if (!Laya.Browser.onWeiXin) {

            var handle = evt.callback;
            if (handle) {
                handle.func.apply(handle.target, handle.args);
            } 
            return;
        }

        /*
        if (sdkVersionUnless(wx.getSystemInfoSync().SDKVersion, "2.0.8")) {
            var handle = evt.callback;
            if (handle) {
                handle.func.apply(handle.target, handle.args);
            } 
        }
        */

        var fn = evt.name;
            
        var func = this.cfg.func[fn];
        if (!func) {
            func = this.cfg.func['default']
        }

        if (func) {
            var rd = Math.floor(Math.random() * func.context.length);
            var tq = "invalid_fe=0";

            for (var key in func.query) {
                tq += ('&' + key + '=' + func.query[key]);
            }

            if (evt.query) {
                tq += ('&' + evt.query);
            }

            var timeStamp =  Date.parse(new Date())/1000;
            if (true) {
                //统计接口
                tq += ('&count_tag=' + func.context[rd].tag + '&count_timestamp=' + timeStamp);
            }
            if(evt.ts){
                tq += ('&ts=' + evt.ts);
            }

            //通用数据
            tq += ('&common_openid=' + ComMain.userInfo.open_id);

            var title_str = this.replaceShareData(func.context[rd].title);
            var tqnew = this.replaceShareData(tq)

            this.shareCallBack = evt.callback;
            this.failCallBack = evt.failCallBack

            if (this.cfg.checkRepeatShare && func.checkRepeatShare) {
                this.simShareObj = {
                    time : (new Date()).getTime(),
                    func : func,
                    cfg : this.cfg,
                    succ : evt.callback,
                    fail : evt.failCallBack,
                }
            }
            var com = ComMain;
            var pkg = {
                game_id:com.userInfo.game_id,
                platform:com.userInfo.platform,
                open_id:com.userInfo.open_id,
                token:com.userInfo.token,
                event:"create_share_card",
                card_tag:func.context[rd].tag,
                card_created_at:timeStamp,
                share_open_id:ComMain.userInfo.open_id,
                ver:ComConfig.version,
                cmd:"V2_Log_event"
            };
            NetEngine.send(pkg);
            AldPlugin.shareAppMessage({
                title:title_str, 
                imageUrl:func.context[rd].img,
                query:tqnew,
            });
            return {title:title_str, imageUrl:func.context[rd].img};
        }
        
        return this.defaultShare();
        
    },
    
    defaultShare:function() {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        wx.shareAppMessage({
            title:"来一战吧", 
            imageUrl:"",
        });
        return {title:"来一战吧", imageUrl:""};
    },

    replaceShareData:function(txt) {
        var ret = txt.replace(/\[.*?\]/g, function(match) {
            var name = match.substring( 1, match.length-1 )
            if (this.dataMap.has(name)) {
                var info = this.dataMap.get(name)
                var type = typeof(info.fun)
                if (type == "string") {
                    return info.fun
                } else if (type == "function") {
                    return info.fun.call(info.obj)
                } else {
                    return '' + info.fun;
                }
            }
            return match
        }.bind(this));
        return ret
    },

    setSystemShare:function() {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        var share_funcs = this.cfg.func;

        if (share_funcs && share_funcs.system_share) {
            wx.onShareAppMessage(function () {
                // 用户点击了“转发”按钮
                return this.shareGame({ name: "system_share" });
            }.bind(this));
        }
    },

    onNewQuery:function(query) {

        //所有分享卡片自带加好友功能
        if (query.common_openid && query.common_openid != ComMain.userInfo.open_id) {
            NetEngine.send({
                cmd : "V2_Friends_makeFriend",
                share_open_id : query.common_openid
            });
        }


        if (query.action) {
            if (this.actMap.has(query.action)) {
                var info = this.actMap.get(query.action)
                info.fun.call(info.obj, query)
            }
        }
    },
    

}

