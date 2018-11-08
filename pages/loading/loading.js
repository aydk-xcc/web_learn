// pages/loading/loading.js
var Bmob = require('../../utils/bmob.js') 
Page({
  data: {

  },
  onLoad: function (options) {
  },
  onShow: function () {
  },
  bindGetUserInfo: function (e) {
    let that = this;
    wx.showLoading({
      title: '请稍后...',
      mask: "true",
    })
    console.log(e)
    //1.调用比目官方更新云端数据用户数据
    //2.由于本地用户数据是由比目维护的，所以还需要在第一步成功之后，调用接口同步本地数据
    Bmob.User.upInfo(e.detail.userInfo).then(result => {
      wx.hideLoading();
      if(result&&result.updatedAt){//更新成功
        //刷新本地数据
        Bmob.User.updateStorage(Bmob.User.current().objectId).then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        });
        that.showCustomToast(["登录成功！", "success"]);
        //这里写之后的登录跳转逻辑

      }else{//更新失败
        that.showCustomToast(["登录失败，请稍后重试！"]);
      }
    }).catch(err => {
      wx.hideLoading();
      that.showCustomToast(["登录失败，请稍后重试！"]);
    })
  },
  showCustomToast:function([title,type="none"]){//结构赋值（项目中小练习一下，对象形式的也可以，不过没有这种简便）
    wx.showToast({
      title: title,
      icon:type,
      duration:1000,
    })
  }
})