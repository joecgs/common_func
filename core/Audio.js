
// var Audio = {
//     init() {
//         this.clips = new Map()
//         let infos = [
//             { name: "Changjingqiehuan", file: "Changjingqiehuan", volumn: 1 },
//             { name: "Choujiang", file: "Choujiang", volumn: 1 }
//         ]
//         for (let i in infos) {
//             let info = infos[i]
//             // SoundManager.playMusic("../../res/sounds/bgm.mp3", 1, new Handler(this, onComplete));
//             // SoundManager.addChannel(SoundChannel)
//             Laya.loader.load("audio/" + info.file, cc.AudioClip, function(err, clip) {
//                 if (null == err) {
//                     this.clips.set(info.name, {clip: clip, volumn: info.volumn})
//                 }
//             }.bind(this))
//         }
//         let on = Laya.LocalStorage.getItem("audio")
//         jq_log(`getItem audio: ${on}`)
//         if (on) {
//             this.on = ("true" === on)
//         } else {
//             this.on = true
//         }
//         this.bgID = null
//         this.bgName = null
//     }, 

//     switch() {
//         this.on = !this.on
//         if(this.on)
//         {
//             cc.audioEngine.resumeMusic();
//         }else
//         {
//             cc.audioEngine.pauseMusic();
//         }
//         Laya.LocalStorage.setItem("audio", `${this.on}`)
//         this.refreshBG()
//     },

//     loadBG() {
//         let infos = [
//             {name: "BG", file: "bg", volumn: 2},
//             {name: "BGchg", file: "bgChg", volumn: 1},
//             {name: "BGspeed", file: "bgSpeed", volumn: 1},
//         ]
//         for (let i in infos) {
//             let info = infos[i]
//             cc.loader.loadRes("audio/" + info.file, cc.AudioClip, function(err, clip) {
//                 if (null == err) {
//                     this.clips.set(info.name, {clip: clip, volumn: info.volumn})
//                     this.refreshBG()
//                 }
//             }.bind(this))
//         }
//     },

//     stopBG() {
//         if (this.bgID) {
//             cc.audioEngine.stop(this.bgID)
//             this.bgID = null
//             this.bgName = null
//         }
//     },

//     refreshBG() {
//         if (!this.on) {
//             this.stopBG()
//             return
//         }

//         let speed = (PlayerManager.speedUpTime > 0)
//         let name = speed ? "BGspeed" : "BG"
//         if (this.bgName === name) {
//             return
//         }

//         this.stopBG()

//         if (speed) {
//             this.play("BGchg")
//         }

//         this.bgID = this.play(name, true)
//         if (this.bgID) {
//             this.bgName = name
//         }
//     },

//     play(name, loop, volumn) {
//         if (!this.on) {
//             return null
//         }

//         let clip = this.clips.get(name)
//         if (clip) {
//             if (!volumn) {
//                 volumn = clip.volumn
//             }

//             if (!loop) {
//                 loop = false
//             }
//             return cc.audioEngine.play(clip.clip, loop, volumn);
//         }
//         return null
//     },
// }


