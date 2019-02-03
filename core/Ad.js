

var Ad = {

    init:function() {

        if (debugMode()) {
            return;
        }

        var mobile;
        wx.getSystemInfo({
            success : function(res){
                jq_log("res",res);
                mobile = (res.model + "").toLowerCase();
                jq_log("the mobile is ",mobile);
            }
        });

        this.cfg = ComConfig.ad;
        this.closeAd = false;
        this.rewarding = false;
        this._rewardAdLoaded = false;
        this.rewardAdSucc = null;
        this.videoCD = true;
        this.videoCDTime = 10;
        // this.ownBannerContainer = param.banner_container;
        // this.ownBanner = param.banner;

        // this.ownBannerContainer.active = false;
        // this.ownBanner.initCtrl({gamelist:this.cfg.ad_game_arr, width:this.ownBanner.node.parent.width * this.cfg.banner_ad.width_percent / 100});
        // this.ownBanner.node.getComponent(cc.Widget).bottom = this.cfg.banner_ad.bottom;

        this.banner = null;
        this.isShow = true;
        this.wxSystem = wx.getSystemInfoSync();
        
        if (this.cfg) {
            if (1 == this.cfg.open || 3 == this.cfg.open) {
                this.showBanner();
                this.tmpBanner=setInterval(this.showBanner.bind(this), this.cfg.banner_ad.refresh_time * 1000);
            } else if (2 == this.cfg.open) {
                this.ownBannerContainer.active = true;
            }
        }

        if (this.cfg.reward_ad && this.cfg.reward_ad.wx_ad_id) {
            this.createRewardAd(this.cfg.reward_ad.wx_ad_id);
        }

        jq_log("init ad")
    },

    set rewardAdLoaded(value) {
        this._rewardAdLoaded = value;
        client_events.event("REWARD_VIDEO_STATE_CHANGE");
    },

    get rewardAdLoaded() {
        return this._rewardAdLoaded;
    },

    createRewardAd:function(id) {

        this.rewardAd = wx.createRewardedVideoAd({ adUnitId: id });

        this.rewardAd.onLoad(function () {
            this.rewardAdLoaded = true;
            jq_log("rewardAd loaded");
        }.bind(this));

        this.rewardAd.onError(function(err) {
            jq_log(err)
        });

        //this.rewardAd.load();

        this.rewardAd.onClose(function (res) {
            jq_log("rewardAd close")
            jq_log(res)
            if (res === undefined || (res && res.isEnded)) {
                // 正常播放结束，可以下发游戏奖励
                jq_log("rewardAd close complete")
                this.videoCD = false;
                this.videoCDTime = Math.floor((new Date()).getTime()/1000);
                setTimeout(function(){
                    this.videoCD = true;
                }.bind(this),10000);
                
                
                
                this.rewardAdAward();
                this.rewardAdSucc && this.rewardAdSucc();
            } else {
                // 播放中途退出，不下发游戏奖励
                messageTips("请观看完整广告，才能获取奖励");
                jq_log("rewardAd close not complete")
            }
            this.rewardAdLoaded = false;
            this.rewarding = false;
            this.rewardAdComplete();
        }.bind(this));

    },

    rewardAdAward:function()
    {
        //获得额外的Vip经验
        if(ComMain.gameCfgs.tb_vip[PlayerManager.vip])
        PlayerManager.vipExp = PlayerManager.vipExp + ComMain.gameCfgs.tb_vip[PlayerManager.vip].pri_four;
    },

    rewardAdComplete:function() {

    },

    rewardAdStart:function(succ) {
        /*if(!this.videoCD){
            var ts = Math.floor((new Date()).getTime()/1000) - this.videoCDTime;
            messageTips("视频冷却时间还有" + Math.floor(10 - ts) + "秒");
            return;
        }*/


        if (this.rewardAd) {
            // if (this.bannerAd != null) {
            //     this.bannerAd.hide();
            //     this.unschedule(this._bannerAdRefresh);
            // }

            jq_log("rewardAd start")

            this.rewardAdSucc = succ;

            this.rewarding = true;

            this.rewardAd.show().catch(
                function(err) {
                    jq_log(err);

                    // this.rewardAd.load();

                    // this.rewardAdSucc && this.rewardAdSucc();

                    this.rewardAd.load().then(
                        function() { 
                            this.rewardAd.show().catch (
                                function(twerr) {
                                    jq_log(twerr);
                                    this.rewardAdSucc && this.rewardAdSucc();
                                }
                            )
                        }
                    );
                }
            );
        }
    },


    closeBanner:function()
    {
        if (debugMode()) {
            return;
        }

        if(this.banner){
           this.banner.hide();
           this.closeAd = true;
        }
        
    },
    
    openBanner:function()
    {
        if (debugMode()) {
            return;
        }
        // if (this.banner) {
        //     jq_log("banner destroy");
        //     this.banner.destroy()
        //     this.banner = null
        //     if(this.tmpBanner){
        //         clearInterval(this.tmpBanner);
        //     }
            
        // }
        this.banner.show();
        this.closeAd = false;
    },

    

    showBanner:function() {
        if (debugMode()) {
            return;
        }
        
        if (this.rewarding) {
            return;
        }
        if(this.isShow == false) return;
     
        
        if (this.banner) {
            jq_log("banner destroy");
            this.banner.destroy()
            this.banner = null
        }

        var w = this.wxSystem.windowWidth;
        this.banner = wx.createBannerAd({
            adUnitId: this.cfg.banner_ad.wx_ad_id,
            style: {
                left: w * (1 - this.cfg.banner_ad.width_percent / 100) / 2,
                top: 0,
                width: w * this.cfg.banner_ad.width_percent / 100
            }
        })
        this.banner.onError(function(err) {
            jq_log("banner error");
            jq_log(err);

            if (this.cfg.open == 3) {
                this.ownBannerContainer.active = true;
            }
        }.bind(this))
        
        this.banner.onResize(this.onResize.bind(this));
        if(this.closeAd){
            this.banner.hide();
        }else{
            this.banner.show().then(function() {
                jq_log("banner show success");
    
                if (this.cfg.open == 3) {
                    this.ownBannerContainer.active = false;
                }
            }.bind(this))
        }
        
    },

    onResize:function() {
        if (!this.banner) {
            return;
        }

        jq_log("on ad resize")
        // this.banner.style.top = this.wxSystem.windowHeight - this.banner.style.realHeight - this.cfg.banner_ad.bottom;
        // this.banner.style.left = (this.wxSystem.windowWidth - this.banner.style.realWidth) / 2;
        var mobile;
        var system_rate;
        wx.getSystemInfo({
            success : function(res){
                jq_log("the mobile is " + res.model);
                mobile = (res.model + "").toLowerCase();
                system_rate = (res.system + "").toLowerCase();
            }
        });
        if(system_rate.includes("ios")){
            if(mobile.search(/[iI][pP]hone\s*[xX]/) != -1){
                jq_log("this is search", mobile.search(/[iI][pP]hone\s*[xX]/) )
    
                this.banner.style.top = this.wxSystem.windowHeight - this.banner.style.realHeight - this.cfg.banner_ad.bottom + 4;
                this.banner.style.left = (this.wxSystem.windowWidth - this.banner.style.realWidth) / 2;
                
            }else{
                if(this.wxSystem.windowWidth / this.wxSystem.windowHeight <=0.51){
                    this.banner.style.top = this.wxSystem.windowHeight - this.banner.style.realHeight - this.cfg.banner_ad.bottom + 4;
                    this.banner.style.left = (this.wxSystem.windowWidth - this.banner.style.realWidth) / 2;
                }else{
                    jq_log("this is second");
                    this.banner.style.realHeight = this.wxSystem.windowHeight * 0.138;
                    this.banner.style.top = this.wxSystem.windowHeight - this.cfg.banner_ad.bottom - this.banner.style.realHeight - this.wxSystem.windowHeight / 44.5;//this.banner.style.realHeight - this.cfg.banner_ad.bottom;
                    this.banner.style.left = (this.wxSystem.windowWidth - this.banner.style.realWidth) / 2;
                }
            }

        }else{
                jq_log("this is " + mobile )
                jq_log(this.wxSystem.windowHeight);
                jq_log(this.banner.style.realHeight);
                if(this.wxSystem.windowWidth / this.wxSystem.windowHeight <=0.51){
                    jq_log("this is first");
                    this.banner.style.realHeight = this.wxSystem.windowHeight * 0.138;
                    this.banner.style.top = this.wxSystem.windowHeight - this.cfg.banner_ad.bottom - this.banner.style.realHeight - this.wxSystem.windowHeight / 160;//this.banner.style.realHeight - this.cfg.banner_ad.bottom;
                    this.banner.style.left = (this.wxSystem.windowWidth - this.banner.style.realWidth) / 2;
    
                }else{
                    jq_log("this is second");
                    this.banner.style.realHeight = this.wxSystem.windowHeight * 0.138;
                    this.banner.style.top = this.wxSystem.windowHeight - this.cfg.banner_ad.bottom - this.banner.style.realHeight - this.wxSystem.windowHeight / 44.5;//this.banner.style.realHeight - this.cfg.banner_ad.bottom;
                    this.banner.style.left = (this.wxSystem.windowWidth - this.banner.style.realWidth) / 2;
                }
        }
        
    },
}

