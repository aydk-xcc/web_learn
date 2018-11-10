// pages/my/about/about.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    gitUrl:"https://github.com/xc1255178487/web_learn",
    csdnUrl:"https://blog.csdn.net/u012436704/article/details/83832756"
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
  copy:function(e){
    let that = this;
    let type = e.currentTarget.dataset.type-0;
    wx.setClipboardData({
      data: type==0?that.data.gitUrl:that.data.csdnUrl,
      success:function(){
        wx.showToast({
          title: '复制成功',
          icon:"success",
          duration:1000,
        })
      }
    })
  }
})