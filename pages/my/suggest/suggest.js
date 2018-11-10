var app = getApp()
var Bmob = require('../../../utils/bmob.js')
Page({
  data: {
    userInfo: Bmob.User.current(),
    info: {
      title: '',
      content: '',
    },
  },
  onLoad: function (options) {
  },
  /**
   * 标题输入
   */
  input_title: function (e) {
    var that = this;
    that.data.info.title = e.detail.value;
  },
  /**
   * 标题输入
   */
  input_content: function (e) {
    var that = this;
    that.data.info.content = e.detail.value;
  },
  formSubmit: function (e) {
    var that = this;
    if (that.data.info.content == null || that.data.info.content == "" || that.data.info.content.trim().length <= 6) {
      that.toast("描述内容过短！");
      return;
    }
    wx.showLoading({
      title: '反馈中...',
      mask:true,
    })
    const query = Bmob.Query('suggest');
    query.set("title", that.data.info.title ? that.data.info.title:"");
    query.set("content", that.data.info.content);
    query.set("status", 0);
    const User = Bmob.Pointer('_User')
    const user = User.set(that.data.userInfo.objectId)
    query.set("add_user", user);
    query.save().then(res => {
      console.log(res)
      wx.hideLoading();
      if(res&&res.createdAt){
        that.showCustomToast(["反馈成功，我们会尽快处理哒！","success"])
        that.data.info.title = '';
        that.data.info.content = '';
        that.setData({
          info: that.data.info
        })
      }else{
        that.showCustomToast(["反馈失败，请稍后重试！"])
      }
    }).catch(err => {
      wx.hideLoading();
      that.showCustomToast(["反馈失败，请稍后重试！"])
      console.log(err)
    })
  },
  showCustomToast: function ([title, type = "none"]) {//结构赋值（项目中小练习一下，对象形式的也可以，不过没有这种简便）
    wx.showToast({
      title: title,
      icon: type,
      duration: 1000,
    })
  }
})