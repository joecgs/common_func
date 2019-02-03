

//访问类型
window.VISIT_TYPE = {
    NORMAL : 1,
    FRIEND : 2,
    ATTACK : 3,
    REVENGE : 4,
    
}


var ComConfig = {

    //游戏盒子分配ID
    game_id: 1029,

    //wx服务器配置
    server_url_arr: ["https://xxwzwxtest.52wanh5.cc:1029/", "https://wxgame.52wanh5.cc/"],
    //游戏服务器配置
//    game_server_url_arr: ["cartest.52wanh5.cc", "car.52wanh5.cc"],
//    game_server_port_arr: [20102, 20102],

    server_use: 1,
    version: "1.0.9", 


    box_gift: {
        open: 1,
        gift_id: 1,
        gift_img_arr: [
            "https://qcdn.52wanh5.com/share_wenan_server/saiche/1011_libao.png"
        ]
    },

    logical: {
        maxShareBuyTimes:1,
        maxVideoBuyTimes:3,
        more_game_switch : false,
    },
    
    auditing : false,

    jumpOutShareParam : {
        appId:"",
        path:"paga/index/index?",
        extraData:"",
        envVersion:"",
    },

    more_game: {
        open: 1,
        more_game_img_arr: [
            "https://qcdn.52wanh5.com/share_wenan_server/hezi/hezi1.png"
        ]
    },

    more_game_arr: {
        open: 1,

        more_game_icon:"",

        table_game_arr: [
            {
                icon:"https://qcdn.52wanh5.com/share_wenan_server/hezi/hezi1.png",
                name:"abc",
                desc:"zyb222222",
                appId:"",
                path:"",
                extraData:"",
                envVersion:"",
                qcode_url:"",
                show_time:"5"
            },
            {
                icon:"https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_icon_box_2.gif",
                name:"abc",
                desc:"zyb222222",
                appId:"",
                path:"",
                extraData:"",
                envVersion:"",
                qcode_url:"",
                show_time:"5"
            },
            {
                icon:"https://qcdn.52wanh5.com/share_wenan_server/third/x30010_icon.gif",
                name:"abc",
                desc:"zyb222222",
                appId:"",
                path:"",
                extraData:"",
                envVersion:"",
                qcode_url:"",
                show_time:"5"
            },
            {
                icon:"https://qcdn.52wanh5.com/share_wenan_server/huanle_pinfangkuai/1014_icon.jpg",
                name:"abc",
                desc:"zyb222222",
                appId:"",
                path:"",
                extraData:"",
                envVersion:"",
                qcode_url:"",
                show_time:"5"
            }
        ]
    },

    share_data: {
        open: 1,
        func: {
            system_share: {
                context: [{
                        title: "[揭秘]一玩倾心,二玩钟情,三玩定终身!?",
                        img: "https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_share_1.png"
                    },
                    {
                        title: "[打赌]最有诚意的小游戏，没有之一!!!",
                        img: "https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_share_2.png"
                    },
                    {
                        title: "[图解]看图说话!?",
                        img: "https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_share_3.png"
                    },
                    {
                        title: "[求抱]小手一抖，世界你有!!!",
                        img: "https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_share_4.png"
                    },
                    {
                        title: "[猎奇]这是今年最真诚的谎言!!!",
                        img: "https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_share_5.png"

                    },
                ],
            },
            default: {
                context: [{
                    title: "[猎奇]这是今年最真诚的谎言!!!",
                    img: "https://qcdn.52wanh5.com/share_wenan_server/wenming/1020_share_5.png"
                }],
                query: {}
            }
        }
    },

    ad: {
        open: 1,
        banner_ad: {
            wx_ad_id: "adunit-446f5b68d5fa85b3",
            refresh_time: 30,
            bottom: 0,
            width_percent: 40
        },
        reward_ad: {
            wx_ad_id: "adunit-f40369380cfadfae"
        }


    },

    service: {
        open: 0
    },

    like: {
        open: 0,
        like_qr_img: "https://qcdn.52wanh5.com/share_wenan_server/game_common/like_qr_code.png"
    },

}


