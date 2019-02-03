var Vibrate = {
    on: true,

    init:function() {
        var on = Laya.LocalStorage.getItem("vibrate")
        //jq_log(`getItem vibrate: ${on}`)
        if (on) {
            this.on = ("true" === on)
        } else {
            this.on = true
        }
    },

    short:function() {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        if (this.on) {
            wx.vibrateShort({success: this.onSuccess, fail: this.onFail})
        }
    },

    long:function() {
        if (!Laya.Browser.onWeiXin) {
            return;
        }

        if (this.on) {
            wx.vibrateLong({success: this.onSuccess, fail: this.onFail})
        }
    },

    onSuccess:function() {
    },

    onFail:function() {
        jq_log("Vibrate fail")
    },

    switch:function() {
        this.on = !this.on
        Laya.LocalStorage.setItem("vibrate", '' + this.on)
    },
}

