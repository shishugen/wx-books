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
    create_by_total: { "_openid": "", "name": "全部" },
    page : 8 ,

  }
,
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    const th = this

    const db = wx.cloud.database();
    //查询类型
    const wx_user = db.collection("wx_user");
    wx_user.where({
    }).get().then(res => {
      console.log(res);
      const data = res.data.concat(th.data.create_by_total)
      let temp = data[0];
      data[0] = data[data.length - 1];
      data[data.length - 1] = temp;
      th.setData({
        create_by: data
      })
      th.get_total_money("全部")
      console.log("查询565", data)
    }).catch(err => {
      console.log("查询人错误", err);
    })
   

    this.getDate();


    console.log(th.data.date)
        const books_list = db.collection("books_list");
        books_list.where({
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }
        }).limit(th.data.page).get().then(res => {
          this.setData({
            list: res.data
          })

          console.log("查询成功", res);
        }).catch(ree => {
          console.log("查询错误", ree);
        })
   

   
  },

 //获取总金额
  get_total_money: function (name){
    
    const db = wx.cloud.database();
    const th = this;
    th.setData({
      total : 0
    })
      const $ = db.command.aggregate
    db.collection("books_list").aggregate()
      .match({
        
        date: {								//columnName表示欲模糊查询数据所在列的名
          $regex: th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
          // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
        }
      }).group({
        _id: "$create_by",
        money: $.sum("$money"),
      }).end().then(res => {
        const list = res.list;
        var money_total = 0;
        for (var i = 0; i < list.length ; i ++){
          money_total += list[i].money
          console.log(name, list[i]._id)
          if (name == list[i]._id ){
            th.setData({
              total: list[i].money.toFixed(2)
            }) 
            return;
          }
        }
        if (name == "全部") {
          th.setData({
            total: money_total.toFixed(2)
          }) 
        }

           
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
   this.setData({
      openid: th.data.create_by[e.detail.value]._openid
    })

    
    const name = th.data.create_by[e.detail.value].name

    const openid = th.data.create_by[e.detail.value]._openid


   
    const db = wx.cloud.database();
    const books_list = db.collection("books_list");

    var objdata = {}
    var objopenid = {}
    var objdate = {}
    if (name != "全部") {
      objdata.objopenid._openid = { $regex: '.*' + openid + '.*' }
    }
    objopenid.objdate.date = { $regex: '.*' + th.data.date + '.*' }


    console.log("th", objdata);
    books_list.where({
      objdata
      // _openid: {								//columnName表示欲模糊查询数据所在列的名
      //   $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
      //   // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      // },

      // date: {								//columnName表示欲模糊查询数据所在列的名
      //   $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
      //   $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      // }
    }).limit(th.data.page).get().then(res => {
      this.setData({
        list: res.data
      })
      th.get_total_money(name)
      console.log("查询成功", res);
    }).catch(ree => {
      console.log("查询错误", ree);
    })





    // const datetest = e.currentTarget.dataset["datetest"]


    // this.setData({
    //   openid: th.data.create_by[e.detail.value]._openid
    // })
    // const db = wx.cloud.database();
    // const books_list = db.collection("books_list");
    
    // console.log("th", th.data.date, openid);
    // books_list.where({
    //   _openid: {								//columnName表示欲模糊查询数据所在列的名
    //     $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
    //    // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
    //   },
      
    //   date : {								//columnName表示欲模糊查询数据所在列的名
    //     $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
    //     $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
    //   }
    // }).limit(th.data.page).get().then(res=>{
    //   this.setData({
    //     list: res.data
    //   })
    //   th.get_total_money(name)
    //   console.log("查询成功", res);
    //   }).catch(ree => {
    //     console.log("查询错误", ree);
    //   })
    
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
       const name = th.data.create_by[th.data.create_index].name
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

        }).orderBy("_id", "asc").limit(th.data.page).get().then(res => {
          th.setData({
            list: res.data
          })


          th.get_total_money(name)
          // for (var i = 0; i < res.data.length; i++) {
          //   th.data.total += parseFloat(res.data[i].money)
          // }
          // th.setData({
          //   total: th.data.total.toFixed(2)
          // }) 

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
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("eee")
    const p = this.data.page + 8;
    this.setData({
      page: p
    })
    this.onLoad()


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
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})