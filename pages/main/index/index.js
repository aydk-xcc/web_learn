//index.js
//获取应用实例
const app = getApp()
var Bmob = require('../../../utils/bmob.js')
Page({
  data: {
    userInfo: {},//用户数据
    dataList: [],//笔记数据
    isAdd: false,//控制添加布局是否可见，默认不可见
    title: "",
    touchStart: 0,
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
        var idList = "[";
        res.forEach(item=>{
          idList = idList+'"'+item.objectId+'",';
        })
        idList = idList.substr(0,idList.length-1)+']';
        that.setData({
          dataList: res,
        })
        that.loadDataNum(idList);
      }
    });
  },
  loadDataNum:function(idList){
    var that = this;
    console.log(idList)
    const query = Bmob.Query("notes");
    query.statTo("groupby", "note_class");
    query.statTo("groupcount", true);
    query.statTo("where", '{"deleted":0,"add_user":"' + that.data.userInfo.objectId +'","note_class":{"$in":'+idList+'}}');
    query.find().then(res => {
      console.log(res)
      if(res&&res.length>0){
        res.forEach(item=>{
          for(let i=0;i<that.data.dataList.length;i++){
            if(item.note_class.objectId==that.data.dataList[i].objectId){
              that.data.dataList[i].num = item._count;
              continue;
            }
          }
        })
        that.setData({
          dataList:that.data.dataList,
        })
      }
    });
  },
  changeShow: function () {
    var that = this;
    that.setData({
      isAdd: !that.data.isAdd,
    })
  },
  _inputTitle: function (e) {
    var that = this;
    that.data.title = e.detail.value;
    console.log(e);
  },
  saveClass: function () {
    var that = this;
    if (that.data.title) {
      that.changeShow();
      wx.showLoading({
        title: '保存中...',
        mask: true,
      })
      const query = Bmob.Query('note_class');
      query.set("title", that.data.title);
      query.set("deleted", 0)
      query.set("type", 0)
      const User = Bmob.Pointer('_User')
      const poiID = User.set(that.data.userInfo.objectId)
      query.set("add_user", poiID)
      query.save().then(res => {
        wx.hideLoading();
        if (res && res.createdAt) {
          that.showCustomToast(["保存成功！", "success"]);
          //将新添加的数据加入到末尾
          that.data.dataList.push({
            objectId: res.objectId,
            title: that.data.title,
            num:0,
          })
          //刷新界面
          that.setData({
            dataList: that.data.dataList,
            value: "",//清空输入框
          })
        } else {
          that.showCustomToast(["保存失败，请稍后重试！"])
        }
      }).catch(err => {
        console.log(err)
        wx.hideLoading();
        that.showCustomToast(["保存失败，请稍后重试！"])
      })
    } else {
      that.changeShow();
      that.showCustomToast(["分类不能为空哦！"])
    }
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
    wx.navigateTo({
      url: '../note_list/note_list?id=' + that.data.dataList[index].objectId + '&title=' + that.data.dataList[index].title+'&index='+index,
    })

  },
  deletedClass: function (index) {
    var that = this;
    console.log(index);
    wx.showModal({
      title: '提示',
      content: '是否删除该条分类，不能恢复？',
      confirmColor: "#DEA681",
      cancelColor: "#8a8a8a",
      success(res) {
        if (res.confirm) {
          if (that.data.dataList[index].num && that.data.dataList[index].num>0){
            that.showCustomToast(["只能删除不包含内容的分类哦！"]);
          }else{
            wx.showLoading({
              title: '操作中...',
              mask: true,
            })
            const query = Bmob.Query('note_class');
            query.set('id', that.data.dataList[index].objectId) //需要修改的objectId
            query.set('deleted', 1)
            query.save().then(res => {
              wx.hideLoading();
              if (res && res.updatedAt) {
                that.showCustomToast(["删除成功！", "success"]);
                //将新添加的数据加入到末尾
                that.data.dataList.splice(index, 1);
                //刷新界面
                that.setData({
                  dataList: that.data.dataList,
                })
              } else {
                that.showCustomToast(["删除失败，请稍后重试！"])
              }
            }).catch(err => {
              wx.hideLoading();
              that.showCustomToast(["删除失败，请稍后重试！"])
            })
          }
        } else if (res.cancel) {//取消
        }
      }
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
