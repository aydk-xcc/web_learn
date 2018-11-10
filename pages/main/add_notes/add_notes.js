// pages/main/add_notes/add_notes.js
var Bmob = require('../../../utils/bmob.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type:0,//0 从主页进入，1从分类中进入
    classInfo: {//保存的时候需要
      id:"",
      title:"",
    },
    id:"",//编辑的时候使用
    title:"",
    content:"",
    userInfo:{},
    index:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log(options)
    that.data.userInfo = Bmob.User.current();
    if(options&&options.type!=""){
      that.data.type=options.type-0;
      that.data.classInfo.id = options.id
      that.data.classInfo.title = options.title;
      wx.setNavigationBarTitle({
        title: options.title + (that.data.type==0?"(添加)":"(编辑)"),
      })
      if (that.data.type===1){
        var index = options.index-0;
        var pages = getCurrentPages();//获取页面栈
        var page = pages[pages.length-2];
        that.setData({
          id:page.data.dataList[index].objectId,
          title: page.data.dataList[index].title,
          content: page.data.dataList[index].content,
          index:index,
        })
      }
    }else{
      that.showCustomToast("数据有误！");
      setTimeout(function(){
        wx.navigateBack();
      },1000)
    }
  },
  //更新titlebar文字
  updateTitle:function(){
    let that = this;
    wx.setNavigationBarTitle({
      title: that.data.classInfo.title,
    })
  },
  //输入监听
  inputView:function(e){
    let that =this;
    var type=e.currentTarget.dataset.type-0;
    if(type==0){//标题输入
      that.data.title = e.detail.value;
    }else{
      that.data.content = e.detail.value;
    }
  },
  choseClass:function(){
    let that = this;
    wx.navigateTo({
      url: '../chose_class/chose_class',
    })
  },
  saveNotes:function(){
    let that = this;
    if(that.data.title==""||that.data.content==""){
      that.showCustomToast(["标题或内容不能为空！"]);
      return;
    }
    wx.showLoading({
      title: '保存中...',
      mask:true,
    })
    if(that.data.type===0){
      const query = Bmob.Query('notes');
      query.set("deleted", 0);
      query.set("title", that.data.title);
      query.set("content", that.data.content);
      query.set("private", 0);
      const User = Bmob.Pointer('_User')
      const poiID = User.set(that.data.userInfo.objectId)
      query.set("add_user", poiID);
      const NoteClass = Bmob.Pointer('note_class')
      const noteClass = NoteClass.set(that.data.classInfo.id)
      query.set("note_class", noteClass);
      query.save().then(res => {
        wx.hideLoading();
        if(res&&res.createdAt){
          that.showCustomToast(["保存成功！","success"]);
          //更新上个页面
          var pages = getCurrentPages();
          var page = pages[pages.length-2];
          page.data.dataList.unshift({
            objectId:res.objectId,
            title:that.data.title,
            content:that.data.content,
            updatedAt:res.createdAt,
            status:false,
          });
          page.setData({
            dataList: page.data.dataList
          })
          //刷新最上层也页面
          var indexPage= pages[pages.length-2];
          page.setData({
            dataList: page.data.dataList
          })
          //刷新最上层也页面
          var indexPage= pages[pages.length-3];
          indexPage.data.dataList[page.data.index - 0].num ? indexPage.data.dataList[page.data.index - 0].num++ : (indexPage.data.dataList[page.data.index - 0].num=1);
          console.log(indexPage.data.dataList, page.data.index)
          indexPage.setData({
            dataList: indexPage.data.dataList
          })
          setTimeout(function(){
            wx.navigateBack();
          },1050)
        }else{
          that.showCustomToast(["保存失败，请稍后重试！"]);
        }
      }).catch(err => {
        wx.hideLoading();
        that.showCustomToast(["保存失败，请稍后重试！"]);
        console.log(err)
      })
    }else{//修改
      const query = Bmob.Query('notes');
      query.set('id', that.data.id) //需要修改的objectId
      query.set('title', that.data.title)
      query.set("content", that.data.content);
      const NoteClass = Bmob.Pointer('note_class')
      const noteClass = NoteClass.set(that.data.classInfo.id)
      query.set("note_class", noteClass);
      query.save().then(res => {
        console.log(res)
        wx.hideLoading();
        if (res && res.updatedAt) {
          that.showCustomToast(["保存成功！", "success"]);
          //更新上个页面
          var pages = getCurrentPages();
          var page = pages[pages.length - 2];
          page.data.dataList[that.data.index-0] = {
            objectId: res.objectId,
            title: that.data.title,
            content: that.data.content,
            updatedAt: res.updatedAt,
            status: false,
          }
          page.setData({
            dataList: page.data.dataList
          })
          setTimeout(function () {
            wx.navigateBack();
          }, 1050)
        } else {
          that.showCustomToast(["保存失败，请稍后重试！"]);
        }
      }).catch(err => {
        console.log(err)
        wx.hideLoading();
        that.showCustomToast(["保存失败，请稍后重试！"]);
      })
    }
  },
  onShow: function () {
    var that = this;
    
  },
  showCustomToast: function ([title, type = "none"]) {//结构赋值（项目中小练习一下，对象形式的也可以，不过没有这种简便）
    wx.showToast({
      title: title,
      icon: type,
      duration: 1000,
    })
  }
})