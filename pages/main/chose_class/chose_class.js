//index.js
//获取应用实例
const app = getApp()
var Bmob = require('../../../utils/bmob.js')
Page({
  data: {
    userInfo: {},//用户数据
    dataList: [],//笔记数据
    touchStart:0,
  },
  onLoad: function () {
    var that = this;
    that.data.userInfo = Bmob.User.current();
    wx.showLoading({
      title: '数据加载中...',
      mask: 'true',
    })
    that.loadData();//加载数据
  },
  /**
   * 第一步先查询所有笔记类型
   * 第二部获取每个类型的数量，这也是比目查询的接口限制，不能一次完成
   */
  loadData: function () {
    var that = this;
    const query = Bmob.Query("note_class");
    query.equalTo("deleted", "==", 0);
    query.equalTo("add_user", "==", that.data.userInfo.objectId);
    query.find().then(res => {
      console.log(res)
      wx.hideLoading();
      if (res && res.length > 0) {
        //有数据，接着查询每个分类的条数
        that.setData({
          dataList: res,
        })
      }
    });
  },
  choseClass:function(e){
    var that = this;
    let index = e.currentTarget.dataset.index-0;
    var pages = getCurrentPages();
    var page = pages[pages.length-2];
    page.data.classInfo.id=that.data.dataList[index].objectId;
    page.data.classInfo.title = that.data.dataList[index].title;
    setTimeout(function(){
      wx.navigateBack();
    },500);
    setTimeout(function () {
      page.updateTitle();
    }, 700);
  },
  showCustomToast: function ([title, type = "none"]) {//结构赋值（项目中小练习一下，对象形式的也可以，不过没有这种简便）
    wx.showToast({
      title: title,
      icon: type,
      duration: 1000,
    })
  }
})
