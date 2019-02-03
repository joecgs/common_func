//组件主控类

function UserInfo() {
    this.open_id = "";
    this.token = "";
}

var ComMain = {

    userInfo : new UserInfo(),

    gameCfgs : null,

    comCfg : null,

    net : null,

    standby : false,

    runInBack : false,

    channel_id : null,

    tb_merge : false,
    //antireport : true,

    get constCfg() {
        return this.gameCfgs.const_var[1];
    },

    init : function(use_tm) {

        client_events.on("NET_ENGINE_COMPLETE", this, this.checkAllReady);
        client_events.on("CLIENT_GAME_START", this, this.loginComplete);

        this.net = NetEngine,
        this.comCfg = ComConfig;
        //var share = Share
        //share.init(this.comCfg.share_data)

        SaveManager.init();
        NoticeManager.init();
        Share.init();
        //Ad.init();
        
        /*if (Laya.Browser.onWeiXin) {
            wx.showShareMenu({withShareTicket:true});
            Share.setSystemShare();
        }*/

        // var audio = Audio
        // audio.init()
        var vibrate = Vibrate
        vibrate.init()
		this.tb_merge = use_tm;
		if (use_tm) {
			this.loadConfig();
		} else {
			this.net.init(this);
		}
        
        ItemManager.init();
        SigninManager.init();
		PlayerManager.init();
    },

    constVar : {
        signin_gold : 50,
        help_gold : 150,
        escape_point : 10,
    },

    loadConfig:function() {
        // Laya.loader.load("config/tb_merge.json", Laya.Handler.create(this, function(res) {
        //     this.gameCfgs = res;
        //     this.net.init(this);
        // }), null, Laya.Loader.JSON)
  

        this.gameCfgs = JSON.parse(this.tb_merge_file);

        for (var id in this.gameCfgs.tb_item) {
            this.gameCfgs.tb_item[id].buy_price = deal2Map(this.gameCfgs.tb_item[id].buy_price);
            this.gameCfgs.tb_item[id].contain_tiems = deal2Map(this.gameCfgs.tb_item[id].contain_tiems);
        }
        
        this.net.init(this);

    },

    checkAllReady:function() {
        //net初始化完成
        var ne = NetEngine;

        //配置文件读取完成
        if(this.tb_merge){
            if (ne.standby && this.gameCfgs){

                jq_log("CLIENT_COM_STANDBY");

                this.standby = true;

                client_events.event("CLIENT_GAME_START");
            }

        }else{
            if(ne.standby){
                this.standby = true;
                client_events.event("CLIENT_GAME_START");
            }
            
        }
        
    },
    
    onUserInfoMsg:function(evt) {
        this.parseUserData(evt);
    },

    procStatistics:function(param) {
        var query = param.query;
        if (param.query && JSON.stringify(param.query) != "{}"&&query.count_tag)
        {
          //数据统计新版
            var com = ComMain;
            var pkg = {
                game_id:com.userInfo.game_id,
                platform:com.userInfo.platform,
                open_id:com.userInfo.open_id,
                token:com.userInfo.token,
                event:"enter_from_share",
                card_tag:query.count_tag,
                card_created_at:query.count_timestamp,
                share_open_id:query.common_openid,
                ver:ComConfig.version,
                cmd:"V2_Log_event"
            };
            NetEngine.send(pkg);
        }
    },

    //
    onRelaunchGame : function(param) {
        jq_log(param);
        
        this.procStatistics(param); 

        
        client_events.event("Get_Scene",{scene : param.scene});

        var share = Share;

        if (share.simShareObj) {
            var data = share.simShareObj;
            var time = (new Date()).getTime() - data.time
            if (time < data.cfg.sharegap1) {
                messageTips(data.cfg.not_group_tips);
                if (data.fail) {
                    var handle = data.fail;
                    if (handle) {
                        handle.func.apply(handle.target, handle.args);
                    }
                }
            } else if (time >= data.cfg.sharegap1 && time < data.cfg.sharegap2) {
                if (share.curShareTimes >= data.cfg.max_allow_times) {
                    messageTips(data.cfg.shared_group_tips);
                    if (data.fail) {
                        var handle = data.fail;
                        if (handle) {
                            handle.func.apply(handle.target, handle.args);
                        }
                    }
                } else {
                    share.curShareTimes++;

                    if (data.succ) {
                        var handle = data.succ;
                        if (handle) {
                            handle.func.apply(handle.target, handle.args);
                        }
                    }
                }
                

            } else if (time >= data.cfg.sharegap2) {
                share.curShareTimes = 0;

                if (data.succ) {
                    var handle = data.succ;
                    if (handle) {
                        handle.func.apply(handle.target, handle.args);
                    }
                }
            }
            
            share.simShareObj = null;
        }
        if(param &&param.query && JSON.stringify(param.query) != "{}"){
            share.onNewQuery(param.query);
        }
        NetEngine.send({
            cmd:"V2_User_getCustomAward",
            data:1,
        });
        this.runInBack = false;
        client_events.event("CLIENT_GAME_RELAUNCH");
    },

    onHideGame : function(e) {

        this.runInBack = true;

        jq_log("onHideGame");

        // if (this.antireport) {
        //     wx.exitMiniProgram();
        // }

        //jq_log(e);
        
        // if (e) {
        //     var t = e.targetPagePath
        //     if (t && ("WAProfileViewController" == t || -1 != t.indexOf("AppBrandProfileUI"))) {
        //         wx.exitMiniProgram({
        //             fail:(e)=>{
        //                 jq_log("onHideError",e);
        //             },
        //             success:(e)=>{
        //                 jq_log("onHideSucc",e);
        //             }
        //         });
        //     }
        // }

        client_events.event("CLIENT_GAME_HIDE");
    },


    loginComplete : function() {
        
        // this.heartBeatStart();
        NetEngine.startProcessSendQueue();

        if (!Laya.Browser.onWeiXin) {
            client_events.event("GAME_START");
            return;
        }
        //必须有basic模块
        wx.onShow(this.onRelaunchGame.bind(this));

        wx.onHide(this.onHideGame.bind(this));

        var param = wx.getLaunchOptionsSync();
        this.onRelaunchGame(param);

        //Ad.init();

        client_events.event("GAME_START");
    },


    parseLoginData : function(obj) {
        for (var key in obj) {
            this.userInfo[key] = obj[key];
        }
    },


    moreGame:function() {
        if (!Laya.Browser.onWeiXin || !this.comCfg.more_game_new.more_game_arr || this.comCfg.more_game_new.open != 1){
            return;
        }
        
        //this.jumpBox("pages/index/index")

        UIManager.openView("prefabs/more_game/more_game_view", "MoreGameView");
    },

    boxGift:function() {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        var cfg = ComConfig;

        // jumpMiniProgram({
        //     appId:"wxb05ba9075c323a97",
        //     path:"pages/index/index?action=get_gift&game_id=1011",
        //     extraData:"",
        //     envVersion:"trial",
        //     qcode_url:this.comCfg.box_gift.gift_img_arr[randomInt(0, this.comCfg.box_gift.gift_img_arr.length - 1)]
        // });

        jumpMiniProgram(cfg.box_gift_new);
    },

    customService:function() {
        jq_log(this.comCfg);
        if (!Laya.Browser.onWeiXin || !ComConfig.box_gift.gift_img_arr) {
            jq_log("customService");
            return;
        }
        wx.openCustomerServiceConversation();
        // wx.openCustomerServiceConversation({
        //     showMessageCard:true,
        //     sendMessageTitle:"客服礼包",
        //     sendMessagePath : "page/index/index?_proto_=service_gift",
        //     sendMessageImg : "https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_share_2.png",
        // });
    },

    rechargeDiamond:function() {
        if (!Laya.Browser.onWeiXin || !this.comCfg.box_gift.gift_img_arr) {
            jq_log("rechargeDiamond");
            return;
        }

        wx.openCustomerServiceConversation({});
    },


    tb_merge_file:'{"tb_duanwei":{"1":{"id":1,"dan_order":1,"dan_rank":1,"up_needpoints":0,"award_items":"0","initialperson_add_num":0,"initialperson_add_num_total":0,"dan_name":"一阶倔强青铜"},"2":{"id":2,"dan_order":2,"dan_rank":1,"up_needpoints":30,"award_items":"1011;1|1013;1","initialperson_add_num":0,"initialperson_add_num_total":0,"dan_name":"二阶倔强青铜"},"3":{"id":3,"dan_order":1,"dan_rank":2,"up_needpoints":70,"award_items":"1012;1|1013;1","initialperson_add_num":1,"initialperson_add_num_total":1,"dan_name":"一阶不屈白银"},"4":{"id":4,"dan_order":2,"dan_rank":2,"up_needpoints":120,"award_items":"1011;1|1013;1","initialperson_add_num":0,"initialperson_add_num_total":1,"dan_name":"二阶不屈白银"},"5":{"id":5,"dan_order":3,"dan_rank":2,"up_needpoints":180,"award_items":"1011;1|1012;1","initialperson_add_num":0,"initialperson_add_num_total":1,"dan_name":"三阶不屈白银"},"6":{"id":6,"dan_order":1,"dan_rank":3,"up_needpoints":250,"award_items":"1011;1|1012;1|1013;1","initialperson_add_num":1,"initialperson_add_num_total":2,"dan_name":"一阶荣耀黄金"},"7":{"id":7,"dan_order":2,"dan_rank":3,"up_needpoints":330,"award_items":"1011;2|1013;2","initialperson_add_num":0,"initialperson_add_num_total":2,"dan_name":"二阶荣耀黄金"},"8":{"id":8,"dan_order":3,"dan_rank":3,"up_needpoints":420,"award_items":"1012;2|1013;2","initialperson_add_num":0,"initialperson_add_num_total":2,"dan_name":"三阶荣耀黄金"},"9":{"id":9,"dan_order":4,"dan_rank":3,"up_needpoints":520,"award_items":"1011;2|1013;2","initialperson_add_num":0,"initialperson_add_num_total":2,"dan_name":"四阶荣耀黄金"},"10":{"id":10,"dan_order":1,"dan_rank":4,"up_needpoints":650,"award_items":"1011;2|1012;2|1013;2","initialperson_add_num":1,"initialperson_add_num_total":3,"dan_name":"一阶尊贵铂金"},"11":{"id":11,"dan_order":2,"dan_rank":4,"up_needpoints":750,"award_items":"1011;3|1013;3","initialperson_add_num":0,"initialperson_add_num_total":3,"dan_name":"二阶尊贵铂金"},"12":{"id":12,"dan_order":3,"dan_rank":4,"up_needpoints":860,"award_items":"1012;3|1013;3","initialperson_add_num":0,"initialperson_add_num_total":3,"dan_name":"三阶尊贵铂金"},"13":{"id":13,"dan_order":4,"dan_rank":4,"up_needpoints":980,"award_items":"1011;3|1013;3","initialperson_add_num":0,"initialperson_add_num_total":3,"dan_name":"四阶尊贵铂金"},"14":{"id":14,"dan_order":5,"dan_rank":4,"up_needpoints":1110,"award_items":"1011;3|1012;3","initialperson_add_num":0,"initialperson_add_num_total":3,"dan_name":"五阶尊贵铂金"},"15":{"id":15,"dan_order":1,"dan_rank":5,"up_needpoints":1300,"award_items":"1011;3|1012;3|1013;3","initialperson_add_num":1,"initialperson_add_num_total":4,"dan_name":"一阶璀璨钻石"},"16":{"id":16,"dan_order":2,"dan_rank":5,"up_needpoints":1440,"award_items":"1011;4|1013;4","initialperson_add_num":0,"initialperson_add_num_total":4,"dan_name":"二阶璀璨钻石"},"17":{"id":17,"dan_order":3,"dan_rank":5,"up_needpoints":1590,"award_items":"1012;4|1013;4","initialperson_add_num":0,"initialperson_add_num_total":4,"dan_name":"三阶璀璨钻石"},"18":{"id":18,"dan_order":4,"dan_rank":5,"up_needpoints":1750,"award_items":"1011;4|1013;4","initialperson_add_num":0,"initialperson_add_num_total":4,"dan_name":"四阶璀璨钻石"},"19":{"id":19,"dan_order":5,"dan_rank":5,"up_needpoints":1920,"award_items":"1011;4|1012;4","initialperson_add_num":0,"initialperson_add_num_total":4,"dan_name":"五阶璀璨钻石"},"20":{"id":20,"dan_order":1,"dan_rank":6,"up_needpoints":2150,"award_items":"1011;4|1012;4|1013;4","initialperson_add_num":1,"initialperson_add_num_total":5,"dan_name":"一阶超凡大师"},"21":{"id":21,"dan_order":2,"dan_rank":6,"up_needpoints":2330,"award_items":"1011;5|1013;5","initialperson_add_num":0,"initialperson_add_num_total":5,"dan_name":"二阶超凡大师"},"22":{"id":22,"dan_order":3,"dan_rank":6,"up_needpoints":2520,"award_items":"1012;5|1013;5","initialperson_add_num":0,"initialperson_add_num_total":5,"dan_name":"三阶超凡大师"},"23":{"id":23,"dan_order":4,"dan_rank":6,"up_needpoints":2720,"award_items":"1011;5|1013;5","initialperson_add_num":0,"initialperson_add_num_total":5,"dan_name":"四阶超凡大师"},"24":{"id":24,"dan_order":5,"dan_rank":6,"up_needpoints":2930,"award_items":"1011;5|1012;5","initialperson_add_num":0,"initialperson_add_num_total":5,"dan_name":"五阶超凡大师"},"25":{"id":25,"dan_order":1,"dan_rank":7,"up_needpoints":3200,"award_items":"1011;5|1012;5|1013;5","initialperson_add_num":1,"initialperson_add_num_total":6,"dan_name":"一阶杰出大师"},"26":{"id":26,"dan_order":2,"dan_rank":7,"up_needpoints":3420,"award_items":"1011;6|1013;6","initialperson_add_num":0,"initialperson_add_num_total":6,"dan_name":"二阶杰出大师"},"27":{"id":27,"dan_order":3,"dan_rank":7,"up_needpoints":3650,"award_items":"1012;6|1013;6","initialperson_add_num":0,"initialperson_add_num_total":6,"dan_name":"三阶杰出大师"},"28":{"id":28,"dan_order":4,"dan_rank":7,"up_needpoints":3880,"award_items":"1011;6|1013;6","initialperson_add_num":0,"initialperson_add_num_total":6,"dan_name":"四阶杰出大师"},"29":{"id":29,"dan_order":5,"dan_rank":7,"up_needpoints":4120,"award_items":"1011;6|1012;6","initialperson_add_num":0,"initialperson_add_num_total":6,"dan_name":"五阶杰出大师"},"30":{"id":30,"dan_order":1,"dan_rank":8,"up_needpoints":4450,"award_items":"1011;6|1012;6|1013;6","initialperson_add_num":1,"initialperson_add_num_total":7,"dan_name":"一阶至尊星耀"},"31":{"id":31,"dan_order":2,"dan_rank":8,"up_needpoints":4700,"award_items":"1011;7|1013;7","initialperson_add_num":0,"initialperson_add_num_total":7,"dan_name":"二阶至尊星耀"},"32":{"id":32,"dan_order":3,"dan_rank":8,"up_needpoints":4960,"award_items":"1012;7|1013;7","initialperson_add_num":0,"initialperson_add_num_total":7,"dan_name":"三阶至尊星耀"},"33":{"id":33,"dan_order":4,"dan_rank":8,"up_needpoints":5220,"award_items":"1011;7|1013;7","initialperson_add_num":0,"initialperson_add_num_total":7,"dan_name":"四阶至尊星耀"},"34":{"id":34,"dan_order":5,"dan_rank":8,"up_needpoints":5490,"award_items":"1011;7|1012;7","initialperson_add_num":0,"initialperson_add_num_total":7,"dan_name":"五阶至尊星耀"},"35":{"id":35,"dan_order":1,"dan_rank":9,"up_needpoints":5850,"award_items":"1011;7|1012;7|1013;7","initialperson_add_num":1,"initialperson_add_num_total":8,"dan_name":"一阶最强王者"},"36":{"id":36,"dan_order":2,"dan_rank":9,"up_needpoints":6130,"award_items":"1011;8|1013;8","initialperson_add_num":0,"initialperson_add_num_total":8,"dan_name":"二阶最强王者"},"37":{"id":37,"dan_order":3,"dan_rank":9,"up_needpoints":6420,"award_items":"1012;8|1013;8","initialperson_add_num":0,"initialperson_add_num_total":8,"dan_name":"三阶最强王者"},"38":{"id":38,"dan_order":4,"dan_rank":9,"up_needpoints":6720,"award_items":"1011;8|1013;8","initialperson_add_num":0,"initialperson_add_num_total":8,"dan_name":"四阶最强王者"},"39":{"id":39,"dan_order":5,"dan_rank":9,"up_needpoints":7030,"award_items":"1011;8|1012;8","initialperson_add_num":0,"initialperson_add_num_total":8,"dan_name":"五阶最强王者"}},"tb_jieshu":{"1":{"gameover_rangk":1,"points_award":10},"2":{"gameover_rangk":2,"points_award":8},"3":{"gameover_rangk":3,"points_award":6},"4":{"gameover_rangk":4,"points_award":4},"5":{"gameover_rangk":5,"points_award":2},"6":{"gameover_rangk":6,"points_award":1},"7":{"gameover_rangk":7,"points_award":0},"8":{"gameover_rangk":8,"points_award":0},"9":{"gameover_rangk":9,"points_award":0},"10":{"gameover_rangk":10,"points_award":0}},"tb_item":{"1001":{"id":1001,"name":"金币","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":0,"gui_icon":"jb1","desc":"金币可购买豪华皮肤","extstr":""},"1002":{"id":1002,"name":"初始人数","item_type":2,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":0,"gui_icon":"ren","desc":"","extstr":""},"1011":{"id":1011,"name":"急速","item_type":3,"sub_type":0,"buy_price":"1001;100","contain_tiems":"","num_limits":0,"gui_icon":"jisu","desc":"瞬间加速持续10秒","extstr":""},"1012":{"id":1012,"name":"无敌","item_type":3,"sub_type":0,"buy_price":"1001;100","contain_tiems":"","num_limits":0,"gui_icon":"wudi","desc":"无敌保护持续10秒","extstr":""},"1013":{"id":1013,"name":"磁铁","item_type":3,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":0,"gui_icon":"citie","desc":"扩大感染范围10秒","extstr":""},"1014":{"id":1014,"name":"随机道具","item_type":3,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":0,"gui_icon":"dj","desc":"","extstr":""},"1020":{"id":1020,"name":"道具礼包","item_type":4,"sub_type":0,"buy_price":"1001;180","contain_tiems":"1011;1|1012;1","num_limits":0,"gui_icon":"djlb","desc":"急速道具x1无敌道具x1","extstr":""},"5018":{"id":5018,"name":"小黄人","item_type":5,"sub_type":2,"buy_price":"6018;3","contain_tiems":"","num_limits":0,"gui_icon":"duizhang","desc":"邀请3位新玩家","extstr":""},"5015":{"id":5015,"name":"国王","item_type":5,"sub_type":3,"buy_price":"6015;5","contain_tiems":"","num_limits":0,"gui_icon":"guowang","desc":"观看5次视频","extstr":""},"5016":{"id":5016,"name":"王后","item_type":5,"sub_type":3,"buy_price":"6016;5","contain_tiems":"","num_limits":0,"gui_icon":"wangzi","desc":"观看5次视频","extstr":""},"5014":{"id":5014,"name":"小猫","item_type":5,"sub_type":1,"buy_price":"6014;100","contain_tiems":"","num_limits":0,"gui_icon":"mao","desc":"累计签到2天领取","extstr":"1001;500"},"5019":{"id":5019,"name":"机器猫","item_type":5,"sub_type":1,"buy_price":"6019;100","contain_tiems":"","num_limits":0,"gui_icon":"jiqi","desc":"碎片来源：转盘抽奖","extstr":"1001;500"},"5020":{"id":5020,"name":"红蘑菇","item_type":5,"sub_type":1,"buy_price":"6020;100","contain_tiems":"","num_limits":0,"gui_icon":"mogu2","desc":"碎片来源：转盘抽奖","extstr":"1001;500"},"5021":{"id":5021,"name":"绿蘑菇","item_type":5,"sub_type":1,"buy_price":"6021;100","contain_tiems":"","num_limits":0,"gui_icon":"mogu1","desc":"碎片来源：转盘抽奖","extstr":"1001;500"},"5022":{"id":5022,"name":"小雪人","item_type":5,"sub_type":1,"buy_price":"6022;100","contain_tiems":"","num_limits":0,"gui_icon":"xuerne","desc":"碎片来源：转盘抽奖","extstr":"1001;500"},"5023":{"id":5023,"name":"猪小屁","item_type":5,"sub_type":1,"buy_price":"6023;100","contain_tiems":"","num_limits":0,"gui_icon":"zhuxiaopi","desc":"累计签到7天领取","extstr":"1001;500"},"5024":{"id":5024,"name":"大白","item_type":5,"sub_type":1,"buy_price":"6024;100","contain_tiems":"","num_limits":0,"gui_icon":"dabai","desc":"碎片来源：转盘抽奖","extstr":"1001;500"},"5025":{"id":5025,"name":"小僵尸","item_type":5,"sub_type":1,"buy_price":"6025;100","contain_tiems":"","num_limits":0,"gui_icon":"jiangshi","desc":"碎片来源：转盘抽奖","extstr":"1001;500"},"5013":{"id":5013,"name":"军人","item_type":5,"sub_type":0,"buy_price":"1001;1000","contain_tiems":"","num_limits":0,"gui_icon":"jingcha","desc":"金币来源：金币助力","extstr":""},"5017":{"id":5017,"name":"士兵","item_type":5,"sub_type":0,"buy_price":"1001;1000","contain_tiems":"","num_limits":0,"gui_icon":"shibing","desc":"金币来源：金币助力","extstr":""},"5001":{"id":5001,"name":"青蓝","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"7","desc":"金币来源：金币助力","extstr":""},"5002":{"id":5002,"name":"翠绿","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"1","desc":"金币来源：金币助力","extstr":""},"5003":{"id":5003,"name":"青紫","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"2","desc":"金币来源：金币助力","extstr":""},"5004":{"id":5004,"name":"紫色","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"3","desc":"金币来源：金币助力","extstr":""},"5005":{"id":5005,"name":"深红","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"4","desc":"金币来源：金币助力","extstr":""},"5006":{"id":5006,"name":"橙色","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"5","desc":"金币来源：金币助力","extstr":""},"5007":{"id":5007,"name":"黄绿","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"6","desc":"金币来源：金币助力","extstr":""},"5008":{"id":5008,"name":"深绿","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"8","desc":"金币来源：金币助力","extstr":""},"5009":{"id":5009,"name":"深紫","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"9","desc":"金币来源：金币助力","extstr":""},"5010":{"id":5010,"name":"紫绀","item_type":5,"sub_type":0,"buy_price":"1001;500","contain_tiems":"","num_limits":0,"gui_icon":"10","desc":"金币来源：金币助力","extstr":""},"6001":{"id":6001,"name":"青蓝胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"7","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6002":{"id":6002,"name":"翠绿胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"1","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6003":{"id":6003,"name":"青紫胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"2","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6004":{"id":6004,"name":"紫色胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"3","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6005":{"id":6005,"name":"深红胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"4","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6006":{"id":6006,"name":"橙色胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"5","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6007":{"id":6007,"name":"黄绿胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"6","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6008":{"id":6008,"name":"深绿胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"8","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6009":{"id":6009,"name":"深紫胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"9","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6010":{"id":6010,"name":"紫绀胶囊碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"10","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6011":{"id":6011,"name":"学者碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"weijing","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6012":{"id":6012,"name":"先生碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"nan","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6013":{"id":6013,"name":"军人碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"jingcha","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6014":{"id":6014,"name":"小猫碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"mao","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6015":{"id":6015,"name":"国王碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"guowang","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6016":{"id":6016,"name":"王后碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"wangzi","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6017":{"id":6017,"name":"士兵碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"shibing","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6018":{"id":6018,"name":"小黄人碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"duizhang","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6019":{"id":6019,"name":"机器猫碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"jiqi","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6020":{"id":6020,"name":"红蘑菇碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"mogu2","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6021":{"id":6021,"name":"绿蘑菇碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"mogu1","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6022":{"id":6022,"name":"小雪人碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"xuerne","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6023":{"id":6023,"name":"猪小屁碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"zhuxiaopi","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6024":{"id":6024,"name":"大白碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"dabai","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6025":{"id":6025,"name":"小僵尸碎片","item_type":1,"sub_type":0,"buy_price":"","contain_tiems":"","num_limits":100,"gui_icon":"jiangshi","desc":"集齐100碎片可在商城兑换皮肤","extstr":""},"6030":{"id":6030,"name":"随机碎片","item_type":6,"sub_type":0,"buy_price":"","contain_tiems":"6020;5|6024;5|6025;5","num_limits":0,"gui_icon":"suipian1zt","desc":"","extstr":"1001;500"},"6031":{"id":6031,"name":"随机碎片","item_type":6,"sub_type":0,"buy_price":"","contain_tiems":"6019;5|6021;5|6022;5","num_limits":0,"gui_icon":"suipian2zt","desc":"","extstr":"1001;500"}},"tb_jieshu":{"1":{"gameover_rangk":1,"points_award":10},"2":{"gameover_rangk":2,"points_award":8},"3":{"gameover_rangk":3,"points_award":6},"4":{"gameover_rangk":4,"points_award":4},"5":{"gameover_rangk":5,"points_award":2},"6":{"gameover_rangk":6,"points_award":1},"7":{"gameover_rangk":7,"points_award":0},"8":{"gameover_rangk":8,"points_award":0},"9":{"gameover_rangk":9,"points_award":0},"10":{"gameover_rangk":10,"points_award":0}},"tb_vip":{"0":{"vip_rank":0,"up_exp":0,"pri_one":"","once_use_num":0,"pri_two":0,"pri_three":0,"pri_four":0,"des1":"在此界面观看视频，每次可获得20点经验","des2":""},"1":{"vip_rank":1,"up_exp":30,"pri_one":"1","once_use_num":1,"pri_two":1,"pri_three":0,"pri_four":0,"des1":"在此界面观看视频，每次可获得20点经验","des2":""},"2":{"vip_rank":2,"up_exp":60,"pri_one":"2","once_use_num":1,"pri_two":1,"pri_three":0,"pri_four":0,"des1":"在此界面观看视频，每次可获得20点经验","des2":""},"3":{"vip_rank":3,"up_exp":140,"pri_one":"3","once_use_num":1,"pri_two":2,"pri_three":2001,"pri_four":0,"des1":"每日可领取VIP3特权礼包","des2":"在此界面观看视频，每次可获得20点经验"},"4":{"vip_rank":4,"up_exp":240,"pri_one":"5","once_use_num":1,"pri_two":2,"pri_three":2002,"pri_four":1,"des1":"每日可领取VIP4特权礼包","des2":"在此界面观看视频，每次可获得20点经验；在其他界面观看视频每次可获得1点经验"},"5":{"vip_rank":5,"up_exp":360,"pri_one":"10","once_use_num":1,"pri_two":2,"pri_three":2003,"pri_four":1,"des1":"每日可领取VIP5特权礼包","des2":"在此界面观看视频，每次可获得20点经验；在其他界面观看视频每次可获得1点经验"},"6":{"vip_rank":6,"up_exp":500,"pri_one":"0","once_use_num":2,"pri_two":3,"pri_three":2004,"pri_four":2,"des1":"每日可领取VIP6特权礼包","des2":"在此界面观看视频，每次可获得20点经验；在其他界面观看视频每次可获得2点经验"},"7":{"vip_rank":7,"up_exp":660,"pri_one":"0","once_use_num":2,"pri_two":3,"pri_three":2005,"pri_four":3,"des1":"每日可领取VIP7特权礼包","des2":"在此界面观看视频，每次可获得20点经验；在其他界面观看视频每次可获得3点经验"},"8":{"vip_rank":8,"up_exp":840,"pri_one":"0","once_use_num":2,"pri_two":3,"pri_three":2006,"pri_four":4,"des1":"每日可领取VIP8特权礼包","des2":"在此界面观看视频，每次可获得20点经验；在其他界面观看视频每次可获得4点经验"},"9":{"vip_rank":9,"up_exp":1040,"pri_one":"0","once_use_num":3,"pri_two":3,"pri_three":2007,"pri_four":5,"des1":"每日可领取VIP9特权礼包","des2":"在此界面观看视频，每次可获得20点经验；在其他界面观看视频每次可获得5点经验"}},"tb_vip_gift_bag":{"2001":{"id":2001,"need_vip_rank":3,"item_type":1,"item_id":1001,"item_num":100},"2002":{"id":2002,"need_vip_rank":4,"item_type":1,"item_id":1001,"item_num":200},"2003":{"id":2003,"need_vip_rank":5,"item_type":1,"item_id":1001,"item_num":300},"2004":{"id":2004,"need_vip_rank":6,"item_type":1,"item_id":1001,"item_num":500},"2005":{"id":2005,"need_vip_rank":7,"item_type":1,"item_id":1001,"item_num":700},"2006":{"id":2006,"need_vip_rank":8,"item_type":1,"item_id":1001,"item_num":900},"2007":{"id":2007,"need_vip_rank":9,"item_type":1,"item_id":1001,"item_num":1100}},"tb_zhuanpan":{"1":{"Id":1,"item_type":6,"item_id":6030,"item_num":1,"Weight":10,"Des":"皮肤碎片"},"2":{"Id":2,"item_type":1,"item_id":1001,"item_num":50,"Weight":30,"Des":"金币"},"3":{"Id":3,"item_type":6,"item_id":6031,"item_num":1,"Weight":5,"Des":"皮肤碎片"},"4":{"Id":4,"item_type":1,"item_id":1001,"item_num":100,"Weight":20,"Des":"金币"},"5":{"Id":5,"item_type":4,"item_id":1020,"item_num":1,"Weight":15,"Des":"道具礼包"},"6":{"Id":6,"item_type":1,"item_id":1001,"item_num":200,"Weight":20,"Des":"金币"}},"tb_const_var":{"50":{"sign_award":50,"gold_help":150}},"tb_seven_login":{"1":{"day":1,"item_id":1001,"num":100},"2":{"day":2,"item_id":6014,"num":100},"3":{"day":3,"item_id":1001,"num":200},"4":{"day":4,"item_id":1020,"num":1},"5":{"day":5,"item_id":1001,"num":300},"6":{"day":6,"item_id":1001,"num":400},"7":{"day":7,"item_id":6023,"num":100}}}'
}