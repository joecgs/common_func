function ShareCount(){
    this.cur_speed_count = 0;
    this.cur_three_count = 0;
    this.cur_new_getMoney_count = 0;
    this.cur_getMoney_count = 0;
    this.cur_free_monster_count = 0;
    this.cur_seek_help_count = 0;
    this.cur_three_first_share = 0;
    this.mall_free_diam_count = 0;
    this.share_getGold_count = 0;
    this.video_getGold_count = 0;
    this.ts = 0;
}


var ShareCardManager = {
    _count : new ShareCount(),
    init:function(){
        SaveManager.register("share_count", this.writeData.bind(this), this.readData.bind(this));
    },
    Reset:function(){
        this.cur_speed_count = 0;
        this.cur_three_count = 0;
        this.cur_new_getMoney_count = 0;
        this.cur_getMoney_count = 0;
        this.cur_free_monster_count = 0;
        this.cur_seek_help_count = 0;
        this.mall_free_diam_count = 0;
        this.share_getGold_count = 0;
        this.video_getGold_count = 0;
        this.ts = PlayerManager.getTimestamp();
    },
    set ts(val){
        if(val != null){
            this._count.ts = val;
        }
    },
    get ts(){
        return this._count.ts;
    },

    set video_getGold_count(val){
        if(val != null){
            this._count.video_getGold_count = val;
        }
    },
    get video_getGold_count(){
        return this._count.video_getGold_count;
    },

    set share_getGold_count(val){
        if(val != null){
            this._count.share_getGold_count = val;
        }
    },
    get share_getGold_count(){
        return this._count.share_getGold_count;
    },
    
    set mall_free_diam_count(val){
        if(val != null){
            this._count.mall_free_diam_count = val;
        }
    },
    get mall_free_diam_count(){
        return this._count.mall_free_diam_count;
    },
    set cur_three_first_share(val){
        if(val != null){
            this._count.cur_three_first_share = val;
        }
    },
    get cur_three_first_share(){
        return this._count.cur_three_first_share;
    },
    set cur_seek_help_count(val){
        if(val != null){
            this._count.cur_seek_help_count = val;
        }
    },
    get cur_seek_help_count(){
        return this._count.cur_seek_help_count;
    },
    set cur_free_monster_count(val){
        if(val != null){
            this._count.cur_free_monster_count = val;
        }
    },
    get cur_free_monster_count(){
        return this._count.cur_free_monster_count;
    },
    set cur_getMoney_count(val){
        if(val != null){
            this._count.cur_getMoney_count = val;
        }
    },
    get cur_getMoney_count(){
        return this._count.cur_getMoney_count;
    },
    set cur_new_getMoney_count(val){
        if(val != null){
            this._count.cur_new_getMoney_count = val;
        }
    },
    get cur_new_getMoney_count(){
        return this._count.cur_new_getMoney_count;
    },
    set cur_three_count(val){
        if(val != null){
            this._count.cur_three_count = val;
        }
    },
    get cur_three_count(){
        return this._count.cur_three_count;
    },
    set cur_speed_count(val){
        if(val != null){
            this._count.cur_speed_count = val;
        }
    },
    get cur_speed_count(){
        return this._count.cur_speed_count;
    },

    writeArray:function(ts,arr){
        if(arr){
            Laya.LocalStorage.setItem("_" + ts, JSON.stringify(arr));
        }
        
    },

    readArray:function(ts){
        if(Laya.LocalStorage.getItem("_" + ts)){
            var time = new Date().getTime();
            if(time - ts > 3600000){
                Laya.LocalStorage.removeItem("_" + ts);
                return null;
            }else{
                var arr = JSON.parse(Laya.LocalStorage.getItem("_" + ts));
                Laya.LocalStorage.removeItem("_" + ts);
                return arr;
            }
        }else{
            return null;
        }
    },


    writeData: function writeData(obj) {
        var sm = SaveManager;
        sm.writeObjectInfo(this._count, obj);
    },

    readData: function readData(obj, version) {
        if (obj != null && JSON.stringify(obj) != "{}") {
            var sm = SaveManager;
            sm.writeObjectInfo(obj, this._count);
        } else {
            //新用户
            this._count = new ShareCount();
        }
    }
}

