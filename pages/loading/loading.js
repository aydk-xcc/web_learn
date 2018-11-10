// pages/loading/loading.js
var Bmob = require('../../utils/bmob.js') 
Page({
  data: {
    userInfo:{},//用户信息
    isLogin:false,//是否获取过头像昵称
    alarmState:5,//倒计时
    timer:0,
  },
  onLoad: function (options) {
    let that = this;
    var userInfo = Bmob.User.current();
    if(userInfo&&userInfo.nickName){//昵称不为空即获取过昵称头像
      that.setData({
        isLogin:true,
      })
      that.alarmTimer();
    }
  },
  onShow: function () {
  },
  //3秒跳转
  alarmTimer:function(){
    let that = this;
    that.data.timer = setInterval(function(){
      if (that.data.alarmState>0){
        that.setData({
          alarmState: --that.data.alarmState,
        })
      }else{
        clearInterval(that.data.timer)
        wx.reLaunch({//打开tab页面
          url: '../main/index/index',
        })
      }
    },1000)
  },
  goindex:function(){
    let that = this;
    if(that.data.isLogin){
      clearInterval(that.data.timer);
    }
    wx.reLaunch({//打开tab页面
      url: '../main/index/index',
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
      if(result&&result.updatedAt){//更新成功
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