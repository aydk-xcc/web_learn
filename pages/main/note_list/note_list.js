//index.js
//获取应用实例
const app = getApp()
var Bmob = require('../../../utils/bmob.js')
Page({
  data: {
    userInfo: {},//用户数据
    dataList: [],//笔记数据
    touchStart: 0,
    noteClass:{},
    index:0,
  },
  onLoad: function (options) {
    var that = this;
    that.data.userInfo = Bmob.User.current();
    that.data.index = options.index-0;
    wx.showLoading({
      title: '数据加载中...',
      mask: 'true',
    })
    that.data.noteClass=options;
    wx.setNavigationBarTitle({
      title: options.title,
    })
    that.loadData();//加载数据
  },
  /**
   * 第一步先查询所有笔记类型
   * 第二部获取每个类型的数量，这也是比目查询的接口限制，不能一次完成
   */
  loadData: function () {
    var that = this;
    const query = Bmob.Query("notes");
    query.equalTo("deleted", "==", 0);
    query.equalTo("note_class", "==", that.data.noteClass.id);
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
  touchView: function (e) {
    var that = this;
    console.log(e);
    if (e.type == "touchstart") {//开始触摸，保存当前时间戳
      that.data.touchstart = e.timeStamp
    } else if (e.type == "touchend") {
      if (e.timeStamp - that.data.touchstart <= 300) {//触摸段誉0.3秒认为是点击，否则为长按
        that.choseClass(e.currentTarget.dataset.index - 0);
      } else {
        that.deletedClass(e.currentTarget.dataset.index - 0);
      }
    }
  },
  //单击选择，关闭当前页面
  choseClass: function (index) {
    var that = this;
    that.data.dataList[index].status = that.data.dataList[index].status?false:true;
    that.setData({
      dataList: that.data.dataList
    })

  },
  deletedClass: function (index) {
    var that = this;
    console.log(index);
    wx.showModal({
      title: '提示',
      content: '是否删除该条笔记，不能恢复？',
      confirmColor: "#DEA681",
      cancelColor: "#8a8a8a",
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '操作中...',
            mask: true,
          })
          const query = Bmob.Query('notes');
          query.set('id', that.data.dataList[index].objectId) //需要修改的objectId
          query.set('deleted', 1)
          query.save().then(res => {
            wx.hideLoading();
            if (res && res.updatedAt) {
              that.showCustomToast(["删除成功！", "success"]);
              that.data.dataList.splice(index, 1);
              //刷新界面
              that.setData({
                dataList: that.data.dataList,
              })
              var pages = getCurrentPages();
              var indexPage = pages[pages.length - 2];
              indexPage.data.dataList[that.data.index - 0].num--;
              indexPage.setData({
                dataList: indexPage.data.dataList
              })
            } else {
              that.showCustomToast(["删除失败，请稍后重试！"])
            }
          }).catch(err => {
            wx.hideLoading();
            that.showCustomToast(["删除失败，请稍后重试！"])
          })
        } else if (res.cancel) {//取消
        }
      }
    })
  },
  //添加
  addNotes:function(){
    let that = this;
    wx.navigateTo({
      url: '../add_notes/add_notes?type=0&title=' + that.data.noteClass.title + '&id=' + that.data.noteClass.id,
    })
  },
  editNotes:function(e){
    let that = this;
    let index = e.currentTarget.dataset.index-0;
    wx.navigateTo({
      url: '../add_notes/add_notes?type=1&title=' + that.data.noteClass.title + '&id=' + that.data.noteClass.id + '&index=' + index,
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
