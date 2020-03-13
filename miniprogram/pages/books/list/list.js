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
    moneysrotflag : true ,
    datesrotflag : true,
  }
,
  

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    this.getDate();
    var books_list_total =0
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
      console.log("查询565", data)
    }).catch(err => {
      console.log("查询人错误", err);
    })
   
    db.collection('books_list').where({
      date: {								//columnName表示欲模糊查询数据所在列的名
        $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      }
    }).count().then(res => {
      books_list_total = res.total
      console.log(books_list_total)

   
     var x = 0
     var arraypro = []          // 定义空数据 用来存储之后的数据

    const batchTimes = Math.ceil(books_list_total / 20)
    for (let i = 0; i < batchTimes; i++) {
      console.log(i)
      x++
      db.collection("books_list").where({
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }
      }).skip(i*20).get().then(res => {
         const list = res.data
        console.log("查询成功", i * (20), res);
        for (let j = 0; j < list.length; j++) {
           arraypro.push(list[j])
        }
        if (batchTimes == x) {
          this.setData({
            list: arraypro
          })
        }
        console.log("查询arraypro", arraypro);
        }).catch(ree => {
          console.log("查询错误", ree);
        })
    }
    })
    th.get_total_money("全部")
    wx.setBackgroundColor({
      backgroundColorTop: '#00FA9A', // 顶部窗口的背景色为红
      backgroundColorBottom: '#00FA9A', // 底部窗口的背景色为绿
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
        _id: "$_openid",
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
    var books_list_total = 0
    console.log(e,"1234")
    var index  = e.detail.value
      this.setData({
        create_index: index,
      })
    const th = this;
  
   this.setData({
     openid: th.data.create_by[index]._openid
    })
    const name = th.data.create_by[index].name
    const openid = th.data.create_by[index]._openid

    this.setData({
      openid: th.data.create_by[index]._openid
    })
    const db = wx.cloud.database();
    
    console.log("th", th.data.date, openid);

   
    db.collection('books_list').where({
      _openid: {								//columnName表示欲模糊查询数据所在列的名
        $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      },
      date: {								//columnName表示欲模糊查询数据所在列的名
        $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      }
    }).count().then(res => {
      books_list_total = res.total

      console.log(books_list_total)

      var x = 0
      var arraypro = []          // 定义空数据 用来存储之后的数据
      th.get_total_money(name)
      const batchTimes = Math.ceil(books_list_total / 20)
      for (let i = 0; i < batchTimes; i++) {
        console.log(i)
        x++
        db.collection("books_list").where({
          _openid: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          },
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
           // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }
        }).skip(i * 20).get().then(res => {
          const list = res.data
          console.log("查询成功", i * (20), res);
          for (let j = 0; j < list.length; j++) {
            arraypro.push(list[j])
          }
          if (batchTimes == x) {
            this.setData({
              list: arraypro
            })
          }
          console.log("查询arraypro", arraypro);
        }).catch(ree => {
          console.log("查询错误", ree);
        })
      }
    })












    // books_list.where({
    //   _openid: {								//columnName表示欲模糊查询数据所在列的名
    //     $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
    //    // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
    //   },
      
    //   date : {								//columnName表示欲模糊查询数据所在列的名
    //     $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
    //     $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
    //   }
    // }).limit(20).get().then(res=>{
    //   this.setData({
    //     list: res.data
    //   })
    //   if (e != "onReachBottom") {
 

    //     th.get_total_money(name)
    //   }
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
    var books_list_total =0
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      total: 0,
    }) 
    this.setData({
      date: e.detail.value
    })

        let th = this;

       const name = th.data.create_by[th.data.create_index].name
        const openid = this.data.openid
        console.log("th--date", this.data.openid, e.detail.value, "++--");
        const db = wx.cloud.database();

    db.collection('books_list').where({
      _openid: {								//columnName表示欲模糊查询数据所在列的名
        $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      },
      date: {								//columnName表示欲模糊查询数据所在列的名
        $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      }
    }).count().then(res => {
      books_list_total = res.total

      console.log(books_list_total)

      var x = 0
      var arraypro = []          // 定义空数据 用来存储之后的数据
      th.get_total_money(name)
      const batchTimes = Math.ceil(books_list_total / 20)
      for (let i = 0; i < batchTimes; i++) {
        console.log(i)
        x++
        db.collection("books_list").where({
          _openid: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          },
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }
        }).skip(i * 20).get().then(res => {
          const list = res.data
          console.log("查询成功", i * (20), res);
          for (let j = 0; j < list.length; j++) {
            arraypro.push(list[j])
          }
          if (batchTimes == x) {
            this.setData({
              list: arraypro
            })
          }
          console.log("查询arraypro", arraypro);
        }).catch(ree => {
          console.log("查询错误", ree);
        })
      }
    })
       

        // const books_list = db.collection("books_list");
        // books_list.where({
        //   _openid: {								//columnName表示欲模糊查询数据所在列的名
        //     $regex: '.*' + th.data.openid + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        //     $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
        //   },
        //   date: {								//columnName表示欲模糊查询数据所在列的名
        //     $regex: '.*' + e.detail.value + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        //     $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
        //   }

        // }).orderBy("_id", "asc").limit(th.data.page).get().then(res => {
        //   th.setData({
        //     list: res.data
        //   })


        //   th.get_total_money(name)
   

        //   console.log("查询成功",  res);
        // }).catch(ree => {
        //   console.log("查询错误", ree);
        // })
   
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
   * 
   */
  moneysrot: function () {
    var list = this.data.list;
    console.log(this.data.moneysrotflag)
    if (this.data.moneysrotflag){
        this.setData({
          moneysrotflag: false,
        })
      list.sort(function (a, b) {
        return a.money - b.money;
      })
      }else{
        this.setData({
          moneysrotflag: true,
        })
      list.sort(function (a, b) {
        return b.money - a.money;
      })
      }

    this.setData({
      list: list , 
    })
    console.log(this.data.moneysrotflag)
    console.log(list)
   },

  datesrot:function(){
    var list = this.data.list;
     const da =list[0].date.substring(8,13)
    if (this.data.datesrotflag) {
      this.setData({
        datesrotflag: false,
      })
      list.sort(function (a, b) {
        return a.date.substring(8, 13) - b.date.substring(8, 13);
      })
    } else {
      this.setData({
        datesrotflag: true,
      })
      list.sort(function (a, b) {
        return b.date.substring(8, 13) - a.date.substring(8, 13);
      })
    }

    this.setData({
      list: list,
    })
    console.log(this.data.datesrotflag)
    console.log(list)
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