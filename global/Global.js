window.client_events = new Laya.EventDispatcher();

var jq_logger_on = false;
var ald_plugin_on = true;

// window.debugLog = function(str) {
//     if ()
// }

window.GameEntryInit = function (uiRoot) {
    return GameEntry.init(uiRoot);
}

window.randomInt = function (min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
}

window.messageTips = function (msg) {
    client_events.event("GAME_MESSAGE_TIPS", msg);
}

window.ledLine = function (msg) {
    client_events.event("LED_LINE", msg);
}

window.stringLimit = function (orgStr, limit) {
    if (orgStr.length > limit) {
        return orgStr.slice(0, limit) + "...";
    } else {
        return orgStr;
    }
}

window.debugMode = function () {
    if (!Laya.Browser.onWeiXin) {
        return true;
    } else {
        return false;
    }
}

window.jq_log = function(msg) {
    if (jq_logger_on) {
        console.log(msg);
    }
}

window.illegalNumber = function (num, min, max) {
    if (typeof num === 'number' && !isNaN(num) && !(num == Infinity)) {

        var illegal = false;

        if (min != undefined) {
            if (num < min) {
                illegal = true;
            }
        }

        if (max != undefined) {
            if (num > max) {
                illegal = true;
            }
        }

        if (!illegal) {
            return false;
        }

        // if ((min != undefined) && (max != undefined)) {
        //     if (num >= min && num <= max) {
        //         return false;
        //     }
        // } else {
        //     return false;
        // }
    }

    if (debugMode()) {
        console.error("illegal number");
    } else {
        //request到服务器
        console.error("illegal number");
    }

    return true;
}

window.deal2ArrTable = function(str) {
    var arr = str.split("|");

    var rtn = new Array();
    for (var idx in arr) {
        rtn.push(arr[idx].split(";"));
    }

    return rtn;
}

window.deal2Map = function(str) {
    if (!str || str == "") {
        return {};
    }
    var arr = str.split("|");

    var rtn = {};
    for (var idx in arr) {
        var tmp = arr[idx].split(";")
        rtn[tmp[0]] = parseInt(tmp[1]);
    }

    return rtn;
}

window.exitGame = function () {
    jq_log("exitMiniProgram");
    wx.exitMiniProgram();
}

window.illegalString = function (str, notNullString) {
    if (typeof (str) == "string") {
        if (notNullString) {
            if (str.length > 0) {
                return false;
            }
        } else {
            return false;
        }
    }

    return true;
}

//* title
//* message
//* ok {func, target, args}
//* cancel {func, target, args}
window.messageBox = function (param) {
    UIManager.openViewByParam({
        createType: 1, viewType: 1, pfbUrl: "prefabs/other/message_box",
        viewName: "MessageBox", customParam: param
    });
}

//大于等于
// sdkVersionUnless(2.0.0, 2.0.4) 返回 false
//==================================================
window.sdkVersionUnless = function (left, right) {
    var leftArr = left.split(".");
    var rightArr = right.split(".");

    for (var i = 0; i < leftArr.length; i++) {
        if (parseInt(leftArr[i]) < parseInt(rightArr[i])) {
            return false;
        } else if (parseInt(leftArr[i]) > parseInt(rightArr[i])) {
            return true;
        }
    }

    return true;
}

window.checkDifferentDay = function (ls, ns) {
    if (Math.floor((ls / 3600 + 8) / 24) != Math.floor((ns / 3600 + 8) / 24)) {
        return true;
    } else {
        return false;
    }
}

var getAuthing = false;

window.checkAndGetAuth = function (auth, callback) {
    if (!Laya.Browser.onWeiXin) {
        callback();
        return;
    }

    client_events.event("AUTH_TIME_LOCK", true);

    wx.getSetting({
        success: function(res) {

            if (res.authSetting[auth]) {
                client_events.event("AUTH_TIME_LOCK", false);
                callback();
            } else if (res.authSetting[auth] == false) {
                wx.openSetting({
                    success: function(osRes) {
                        if (osRes.authSetting[auth]) {
                            setTimeout(callback, 200);
                        } else {
                            messageTips("请给予对应权限");
                        }
                    },
                    fail: function() {
                        messageTips("授权面板拉取失败");
                    },
                    complete: function() {
                        //getAuthing = false;
                        client_events.event("AUTH_TIME_LOCK", false);
                    }
                })
            } else if (res.authSetting[auth] == undefined) {
                wx.authorize({
                    scope: auth,
                    success: function() {
                        callback();
                    },
                    fail: function() {
                        messageTips("未通过授权无法使用该功能");
                    },
                    complete: function() {
                        //getAuthing = false;
                        client_events.event("AUTH_TIME_LOCK", false);
                    }
                })
            }
        },
        fail: function() {
            messageTips("获取授权信息失败");
            client_events.event("AUTH_TIME_LOCK", false);
            //getAuthing = false;
        },
    })
}

window.checkAndGetAuthNew = function (auth,button,callback) {
    if (!Laya.Browser.onWeiXin) {
        callback();
        return;
    }
    var pixelRation = wx.getSystemInfoSync().pixelRatio;
    var btnLeft = 0;
    var btnTop  = 0;
    var btnWidth  =  Laya.Browser.width/pixelRation;
    var btnHeight = Laya.Browser.height/pixelRation;

    wx.getSetting({
        success: function(res) {
            if (res.authSetting[auth]) {
                callback();
            } else if (res.authSetting[auth] == false) {
                var wxbutton = wx.createUserInfoButton({
                    type: 'text',
                    text: '',
                    style: {
                        left: btnLeft,
                        top: btnTop,
                        width: btnWidth,
                        height: btnHeight,
                        //backgroundColor: '#ff0000',
                        //color: '#ffffff',
                        textAlign: 'left',
                        fontSize: 16,
                    }
                  });
                  wxbutton.show();
                  wxbutton.onTap(function(res){
                      if(res.userInfo)
                      {
                        callback();
                        wxbutton.destroy();
                      }else
                      {
                        messageTips("未通过授权无法使用该功能");
                      }
                  })
            } else if (res.authSetting[auth] == undefined) {   
                var wxbutton = wx.createUserInfoButton({
                    type: 'text',
                    text: '',
                    style: {
                        left: btnLeft,
                        top: btnTop,
                        width: btnWidth,
                        height: btnHeight,
                        //backgroundColor: '#ff0000',
                        //color: '#ffffff',
                        textAlign: 'left',
                        fontSize: 16,
                    }
                  });
                  wxbutton.show();
                  wxbutton.onTap(function(res){
                      if(res.userInfo)
                      {
                        callback();
                        wxbutton.destroy();
                      }else
                      {
                        messageTips("未通过授权无法使用该功能");
                      }
                  });
            }
        },
        fail:function(){
            messageTips("获取授权信息失败");
            //cc.systemEvent.emit("AUTH_TIME_LOCK", false);
        },
    })
}

//授权了不需要直接进入
window.checkAndGetAuthNew2 = function (auth,button,callback) {
    if (!Laya.Browser.onWeiXin) {
        callback();
        return;
    }

    //var xScaling = Laya.Browser.width/750;
    //var yScaling = Laya.Browser.height/1350;
    //var loginBtnWorldPos = button.localToGlobal(new Laya.Point(0,0),true);
    var pixelRation = wx.getSystemInfoSync().pixelRatio;

    //var btnLeft = loginBtnWorldPos.x * xScaling/pixelRation;
    //var btnTop = loginBtnWorldPos.y * yScaling/pixelRation;
    //var btnWidth = button.width * xScaling/pixelRation;
    //var btnHeight = button.height * yScaling/pixelRation;
      var btnLeft = 0;
      var btnTop  = 0;
      var btnWidth  =  Laya.Browser.width/pixelRation;
      var btnHeight = Laya.Browser.height/pixelRation;

    wx.getSetting({
        success: function(res) {
            if (res.authSetting[auth]) {
                
            } else if (res.authSetting[auth] == false) {
                var wxbutton = wx.createUserInfoButton({
                    type: 'text',
                    text: '',
                    style: {
                        left: btnLeft,
                        top: btnTop,
                        width: btnWidth,
                        height: btnHeight,
                        textAlign: 'left',
                        fontSize: 16,
                    }
                  });
                  wxbutton.show();
                  wxbutton.onTap(function(res){
                      if(res.userInfo)
                      {
                        callback();
                        wxbutton.destroy();
                      }else
                      {
                        messageTips("未通过授权无法使用该功能");
                      }
                  })
            } else if (res.authSetting[auth] == undefined) {   
                var wxbutton = wx.createUserInfoButton({
                    type: 'text',
                    text: '',
                    style: {
                        left: btnLeft,
                        top: btnTop,
                        width: btnWidth,
                        height: btnHeight,
                        //backgroundColor: '#ff0000',
                        //color: '#ffffff',
                        textAlign: 'left',
                        fontSize: 16,
                    }
                  }); 
                  wxbutton.show();
                  wxbutton.onTap(function(res){
                      if(res.userInfo)
                      {
                        callback();
                        wxbutton.destroy();
                      }else
                      {
                        messageTips("未通过授权无法使用该功能");
                      }
                  });
            }
        },
        fail:function(){
            messageTips("获取授权信息失败");
            //cc.systemEvent.emit("AUTH_TIME_LOCK", false);
        },
    })
}
 
window.recursionCocosNode = function (root, everyCall) {
    everyCall(root);
    if (root.children) {
        for (var idx in root.children) {
            recursionCocosNode(root.children[idx], everyCall);
        }
    }
}


// window.changeParentWithoutMove = function (node, target) {
//     var wp = node.convertToWorldSpaceAR(cc.v2(0, 0));
//     target.addChild(node);
//     node.position = target.convertToNodeSpaceAR(wp);
// }

// window.convertPosNodeToNode = function(dst, src, pos) {
//     var wp = src.convertToWorldSpaceAR(pos);
//     return dst.convertToNodeSpaceAR(wp);
// }

window.jumpMiniProgram = function(param, succ, fail) {
    //jq_log("jumpMinProgram is click");
    if (!Laya.Browser.onWeiXin) {
        return;
    }

    function upLoad(param,state)
    {
        var obj = {cmd:"V2_Log_event",
        card_tag:2,
        ver:ComConfig.version,
        event:"nav_to_ad",
        app_id:param.appId,
        path:param.path,
        status:state};
        NetEngine.send(obj);
    }
    upLoad(param,1);
    if (sdkVersionUnless(wx.getSystemInfoSync().SDKVersion, "2.2.0")) {
        wx.navigateToMiniProgram({
            appId: param.appId,
            path: param.path,
            extraData: param.extraData,
            envVersion: param.envVersion,
            success: function()
            {
               upLoad(param,2);
               if(succ)
                succ(); 
            },
            fail: function()
            {
                upLoad(param,3);
                if(fail)
                fail();
            }
        })
        //jq_log("jump NaviageToMiniProgram");
    } else {
        //jq_log("wxErCode is Start");
        if (param.qcode_url) {
            wx.previewImage({
                urls : [param.qcode_url],
                success:function()
                {
                  upLoad(param,2);
                  succ();
                },
                fail:function()
                {
                  upLoad(param,3);
                  fail();
                }
            });
        } else {
            messageTips("微信版本过低");
        }
    }
}

var uniqueIdCount = (new Date()).getTime() * 1000 + 1;

window.getUniqueHandleId = function () {
    return uniqueIdCount++;
}

window.getPathByTypeAndId = function(type,id)
{
  if(type == 1)
    {
       if(id>6000)
       return "gameUI/skin/"+ComMain.gameCfgs.tb_item[id].gui_icon+".png";
       else
       return "gameUI/startUI/jb5.png";
    }else if(type == 2)
    {
       return "gameUI/startUI/ren.png";
    }else if(type == 3)
    {
       if(id!=1014)
       return "gameUI/item/"+id+".png";
       else
       return "gameUI/startUI/dj.png";
    }else if(type == 4)
    {
       return "gameUI/startUI/djlb.png";
    }else if(type == 5)
    {
       return "gameUI/skin/"+ComMain.gameCfgs.tb_item[id].gui_icon+".png";
    }
}