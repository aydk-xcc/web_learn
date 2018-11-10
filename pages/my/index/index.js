// pages/my/index/index.js
var Bmob = require('../../../utils/bmob.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:Bmob.User.current()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  suggest:function(){
    wx.navigateTo({
      url: '../suggest/suggest',
    })
  },
  about:function(){
    wx.navigateTo({
      url: '../about/about',
    })
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
      if (result && result.updatedAt) {//更新成功
        //刷新本地数据
        Bmob.User.updateStorage(Bmob.User.current().objectId).then(res => {
          console.log(res)
        }).catch(err => {
          console.log(err)
        });
        that.showCustomToast(["登录成功！", "success"]);
        //这里写之后的登录跳转逻辑
        wx.reLaunch({//打开tab页面
          url: '../main/index/index',
        })
      } else {//更新失败
        that.showCustomToast(["登录失败，请稍后重试！"]);
      }
    }).catch(err => {
      wx.hideLoading();
      that.showCustomToast(["登录失败，请稍后重试！"]);
    })
  },
})