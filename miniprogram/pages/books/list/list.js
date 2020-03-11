// miniprogram/pages/books/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    create_by:{},
    create_index:0,
    date:'',
    openid:'',
    endDate:'',
    total:0,
    create_by_total: { "_openid": "", "name": "全部" }


  }
,
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.getDate();
    const db = wx.cloud.database();
    const th = this;
      
        const books_list = db.collection("books_list");
        books_list.where({
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }

        }).get().then(res => {
          this.setData({
            list: res.data
          })
          for (var i = 0; i < res.data.length; i++) {
            th.data.total += parseFloat(res.data[i].money)
          }
          th.setData({
            total: th.data.total.toFixed(2)
          }) 
          console.log("查询成功", res);
        }).catch(ree => {
          console.log("查询错误", ree);
        })


    //查询类型
    const wx_user = db.collection("wx_user");
    wx_user.where({
    
    }).get().then(res => {
      console.log(res);
     
      const data = res.data.concat(this.data.create_by_total)
      let temp = data[0];
      data[0] = data[data.length - 1];
      data[data.length - 1] = temp;
      th.setData({
        create_by: data
      })
      
      console.log("查询565", data)
    }).catch(ree => {
      console.log("查询人错误");
    })

  },

  

  bindPickerChange: function (e) {
    const th = this;
    this.setData({
      total: 0
    }) 
    this.setData({
      create_index: e.detail.value
    })
    const openid = th.data.create_by[e.detail.value]._openid
    // const datetest = e.currentTarget.dataset["datetest"]


    this.setData({
      openid: th.data.create_by[e.detail.value]._openid
    })
    const db = wx.cloud.database();
    const books_list = db.collection("books_list");
    
    console.log("th", th.data.date, openid);
    books_list.where({
      _openid: {								//columnName表示欲模糊查询数据所在列的名
        $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      },
      
      date : {								//columnName表示欲模糊查询数据所在列的名
        $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      }
    }).get().then(res=>{
      this.setData({
        list: res.data
      })
      for (var i = 0; i < res.data.length; i++) {
        th.data.total += parseFloat(res.data[i].money)
      }
      th.setData({
        total: th.data.total.toFixed(2)
      }) 
      console.log("查询成功", res);
      }).catch(ree => {
        console.log("查询错误", ree);
      })
    
  },

  toDetails:function(e){
    wx.navigateTo({
      url: "/pages/books/details/details?id=" + e.currentTarget.id
    });
  
  },
  bindDateChange: function (e) {

    console.log('picker发送选择改变，携带值为', e.detail.value)

    this.setData({
      total: 0
    }) 
    this.setData({
      date: e.detail.value
    })

        let th = this;
        console.log("th--date", this.data.openid, e.detail.value, "++--");
        const db = wx.cloud.database();
        const books_list = db.collection("books_list");
        books_list.where({
          _openid: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          },
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + e.detail.value + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }

        }).get().then(res => {
          this.setData({
            list: res.data
          })
       
          for (var i = 0; i < res.data.length; i++) {
            th.data.total += parseFloat(res.data[i].money)
          }
          th.setData({
            total: th.data.total.toFixed(2)
          }) 

          console.log("查询成功",  res);
        }).catch(ree => {
          console.log("查询错误", ree);
        })
   
  },
  getDate: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);

    this.setData({
      date: Y + '-' + M ,
      endDate: Y + '-' + M 
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },





  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  onPullDownRefresh() {
    this.setData({
      create_index:0
    })

    this.onLoad()
        // complete
        wx.hideNavigationBarLoading() //完成停止加载
        wx.stopPullDownRefresh() //停止下拉刷新
      
 
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */

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