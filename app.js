//app.js
var Bmob = require('utils/bmob.js')
Bmob.initialize("", "");
App({
  onLaunch: function () {
    Bmob.User.auth().then(res => {
      console.log('一键登陆成功')
    }).catch(err => {
      console.log(err)
    });
  },
  getUserInfo: function (cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == 'function' && cb(this.globalData.userInfo)
    } else {
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == 'function' && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData: {
    userInfo: null
  }
})