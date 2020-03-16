//index.js
const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: '',
    headImages:[],
    headImagesStatus:0,
    add_books_image : '',
    total_books_image : '',
    my_books_image : '',
    user_list:[],
    money_total:0,
  },


  addBooks: function () {
    wx.navigateTo({
      url: "/pages/books/add/add",
    });
  },
  booksList: function () {
    wx.navigateTo({
      url: "/pages/books/list/list",
    });
  },
  myList: function() {
    wx.reLaunch({
      url: "/pages/books/myList/myList",
    });
  },
  reports: function () {
    wx.reLaunch({
      url: "/pages/books/reports/reports",
    });
  },
  add_images: function () {
    wx.reLaunch({
      url: "/pages/books/images/images",
    });
  },
  


  onLoad: function (options) {
    const db = wx.cloud.database();
    const head_images_status = db.collection("head_images_status");
    head_images_status.get().then(res => {
      console.log("res.status", res.data[0].status)
      this.setData({
        headImagesStatus: res.data[0].status
      })

      /**加载头部图片 */
      
      const head_images = db.collection("head_images");
      head_images.where({
        status: 0
      }).orderBy("order","asc").get().then(res => {
        this.setData({
          headImages: res.data
        })
      }).catch(err => {
        console.log(ree)
      })


    }).catch(err => {
      console.log(err)
    });




    const th = this;
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              th.setData({
                my_books_image: res.userInfo.avatarUrl
              })
              console.log("userInfo",res.userInfo)
            }
          })
        }
      }
    })




    const Home_images = db.collection("Home_images");

    Home_images.orderBy("order", "asc").get().then(res => {
      
      console.log(res)
     this.setData({
       add_books_image: res.data[0].url ,
       total_books_image: res.data[1].url,
       my_books_image: res.data[2].url
     })

    }).catch(err => {
      console.log(ree)
    })

    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    const ym = Y+'-'+M;
    var usertotal = 0
    console.log(ym)
   //查询用户数据
    const $ = db.command.aggregate

  
    db.collection('wx_user').where({
      stauts: 0
    }).count().then(res => {
      usertotal = res.total
    


    db.collection("books_list").aggregate()
      .match({
        date: {								//columnName表示欲模糊查询数据所在列的名
          $regex: ym + '.*',		//表示欲查询的内容，‘.*’等同于SQL中的‘%’
          }
      }).group({
        _id: "$create_by",
        money: $.sum("$money"),
      }).end().then(res => {
        const data = res.list
        var money_total = 0
        var new_list = []
        var a = []
        for (var i = 0; i < data.length; i++) {
          money_total += parseFloat(parseFloat(data[i].money).toFixed(2))
        }

        for (var i = 0; i < data.length; i++){
          const m1 = parseFloat(parseFloat(data[i].money).toFixed(2))
          const m = m1 - (money_total / usertotal) 
          const m2 = parseFloat(m).toFixed(2)
          a.push(data[i]._id)
          new_list.push({ "username": data[i]._id, "money": m1, "money_total":m2})
        }
        
        console.log(new_list)

       //查询用户
        db.collection("wx_user").where({
          stauts : 0
        }).get().then(res=>{
         let ta = res.data;
          console.log(ta)
         var b = []
         for(var i = 0 ; i < ta.length; i ++){
           b.push(ta[i].name)
         }
          let diff = b.filter(function (val) { return a.indexOf(val) === -1 })
         
          console.log(b, a, diff)
          for(var j = 0 ; j < diff.length ; j++){
            new_list.push({ "username": diff[j], "money": 0, "money_total": -parseFloat(money_total / usertotal).toFixed(2)})
          }
          console.log(new_list)
          th.setData({
            user_list: new_list,
            money_total: money_total
          })
        }).catch(err=>{
          console.error(err)
        })

      })
      

      })


   },

    bindGetUserInfo: function (e) {
      console.log(e.detail.userInfo)
  },
  onPullDownRefresh() {

    this.onLoad()
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新


  },





  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
