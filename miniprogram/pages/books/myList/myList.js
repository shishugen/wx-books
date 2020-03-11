// miniprogram/pages/books/list/list.js
//获取应用实例
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    total:0,
    is_update:'',
    date_date : ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getDate();
    let th = this;
    wx.cloud.callFunction({
      name: 'login',
      complete: re => {
        var id = re.result.openid
        const db = wx.cloud.database();
        const books_list =  db.collection("books_list");
        books_list.where({
          _openid: id,
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }
        }).get({
          success: function (res) {
            // res.data 是包含以上定义的两条记录的数组
            th.setData({
              list: res.data
            })
        
            for(var i = 0; i < res.data.length; i++){
              th.data.total += parseFloat(res.data[i].money)
            }
            th.setData({
              total: th.data.total.toFixed(2)
            }) 

          }
        })
      
      }
    })

    

  },
  getDate: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    this.setData({
      date: Y + '-' + M,
      endDate: Y + '-' + M ,
      date_date:  Y + '-' + M + '-' + D
    })
  },
  toDetails: function (e) {
    wx.navigateTo({
      url: "/pages/books/details/details?id=" + e.currentTarget.id
    });

  },


  update: function (e) {
    const book = e.currentTarget.dataset.book
    var objectModel = {};
    var model = JSON.stringify(book);
    wx.reLaunch({
      url: "/pages/books/add/add?book=" + model,
    });
    console.log(model)
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }




})