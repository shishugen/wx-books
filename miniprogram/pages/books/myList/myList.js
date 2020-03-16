// miniprogram/pages/books/list/list.js
var base64 = require("../../example/images/base64");
//获取应用实例
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    total:0,
    is_update:'',
    date_date : '',
    page : 10 ,
    openid : '',
    moneysrotflag :true,
    datesrotflag: true,
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
        th.setData({
          openid : id
        })
        const db = wx.cloud.database();

        db.collection('books_list').where({
          _openid: id,
          date: {								//columnName表示欲模糊查询数据所在列的名
            $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
            // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
          }
        }).count().then(res => {
        var  books_list_total = res.total
          console.log(books_list_total)
        var x = 0
        var arraypro = []          // 定义空数据 用来存储之后的数据
          th.get_money_total()
        const batchTimes = Math.ceil(books_list_total / 20)
        for (let i = 0; i < batchTimes; i++) {
          console.log(i)
          x++
          db.collection("books_list").where({
            _openid: id,
            date: {								//columnName表示欲模糊查询数据所在列的名
              $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
              // $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
            }
          }).skip(i * 20).get().then(res => {
            const list = res.data
           // console.log("查询成功", i * (20), res);
            for (let j = 0; j < list.length; j++) {
              arraypro.push(list[j])
            }
            if (batchTimes == x) {
              arraypro.sort(function (a, b) {
                return b.date.substring(8, 13) - a.date.substring(8, 13);
              })
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
        //   _openid: id,
        //   date: {								//columnName表示欲模糊查询数据所在列的名
        //     $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
        //     $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
        //   }
        // }).orderBy("_id","asc").limit(th.data.page).get({
        //   success: function (res) {
        //     // res.data 是包含以上定义的两条记录的数组
        //     th.setData({
        //       list: res.data
        //     })
        //   //  console.log(th.data.page)
        //     if (th.data.page == 10){
        //       th.get_money_total(id);
        //     }
        //   }
        // })
      
      }
    })
  
   
   //动画
    this.setData({
      icon: base64.icon20,
      slideButtons: [{
        text: '查看',
        src: '/page/weui/cell/icon_love.svg', // icon的路径
      }, {
        text: '修改',
        extClass: 'test',
          src: '../icon_del.svg', // icon的路径
      }, {
        type: 'warn',
        text: '删除',
        extClass: 'test12',
          src: '../../example/images/icon/del1.svg', // icon的路径
      }],

      slideButtons_1: [{
        text: '查看',
        src: '/page/weui/cell/icon_love.svg', // icon的路径
      }],
    });
    


  },

  //计算总金额
  get_money_total: function () {
    const db = wx.cloud.database();
    const th = this;
    th.setData({
      total: 0
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

        for (var i = 0; i < list.length; i++) {
          money_total += list[i].money
          console.log(list[i]._id, th.data.openid)
          if (th.data.openid == list[i]._id) {
            th.setData({
              total: list[i].money.toFixed(2)
            })
            return;
          }
        }
      })


    // const books_list = db.collection("books_list");
    // books_list.where({
    //   _openid: id,
    //   date: {								//columnName表示欲模糊查询数据所在列的名
    //     $regex: '.*' + th.data.date + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
    //     $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
    //   }
    // }).get({
    //   success: function (res) {

    //     for (var i = 0; i < res.data.length; i++) {
    //       th.data.total += parseFloat(res.data[i].money)
    //     }
    //     th.setData({
    //       total: th.data.total.toFixed(2)
    //     })
    //   }
    // })

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom : function () {
  //   console.log("eee")
  //   const p = this.data.page + 8 ; 
  //   this.setData({
  //     page: p
  //   })
  //   this.onLoad()
   

  // },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      duration: 1000
    })
    setTimeout(() => {
      wx.stopPullDownRefresh()
    }, 1000);

    this.setData({
      page: 10
    })
    this.onLoad()
     wx.hideNavigationBarLoading() //完成停止加载
     wx.stopPullDownRefresh() //停止下拉刷新

  },

  slideButtonTap(e) {
    console.log('slide button tap', e)

    const index = e.detail.index;
    if (index == 0) { //查看
      this.toDetails(e)

    } else if (index == 1) { //修改
      this.update(e)
    } else if (index == 2) { //删除
      const db = wx.cloud.database();
      const books_list = db.collection("books_list");
      books_list.doc(e.currentTarget.dataset.book._id)
      .remove().then(res=>{
        wx.showToast({
          title: '成功',
          icon: 'success',
          duration: 2000
        })
        this.onLoad();
      }).catch(err=>{
        wx.showToast({
          title: '删除失败',
          image: "/images/icon/error.png"
        })
      })

    }

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
      url: "/pages/books/details/details?id=" + e.currentTarget.dataset.book._id
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
   * 
   */
  moneysrot: function () {
    var list = this.data.list;
    console.log(this.data.moneysrotflag)
    if (this.data.moneysrotflag) {
      this.setData({
        moneysrotflag: false,
      })
      list.sort(function (a, b) {
        return a.money - b.money;
      })
    } else {
      this.setData({
        moneysrotflag: true,
      })
      list.sort(function (a, b) {
        return b.money - a.money;
      })
    }

    this.setData({
      list: list,
    })
    console.log(this.data.moneysrotflag)
    console.log(list)
  },

  datesrot: function () {
    var list = this.data.list;
    const da = list[0].date.substring(8, 13)
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
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }




})