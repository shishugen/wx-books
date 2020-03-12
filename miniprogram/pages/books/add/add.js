const app = getApp();
var arr = []
Page({
  data: {
    money: "",
    goods: "",
    date:"",
    year:0,
    month:0,
    type:"",
    booksType:[],
    type_index : 0,
    start_date:'',
    end_date:'',
    image:"/images/by.jpg ",
    flag:0,
    images_list: [],
    images_date:"",
    sourceType: ["camera"],
    isUpdate:false,
    update_id : '',
    goods_length:0,
    arr_index : 0,
    items: [
      { name: 'camera', value: '相机' ,checked: 'true' },
      { name: 'album', value: '相册', },
    ]   ,
    buttons: [{ text: '取消' }, { text: '确定' }],
    dialogShow: false,
  },
  formSubmit: function (e) {
     const th = this;
    console.log('form发生了submit事件，携带数据为：', e.detail);
    let {money,goods, date ,type } = e.detail.value;
    this.setData({
      money: parseFloat(parseFloat(money).toFixed(2))
    })
    if (!goods) {
      wx.showToast({
        title: '请输入商品！',
        image:"/images/icon/error.png"
      })
      return;
    }

    if (!money) {
      wx.showToast({
        title: '请输入金额',
        image: "/images/icon/error.png"
      })
      return;
    }
    if (arr.length == 0 ) {
      wx.showToast({
        title: '请上传图片',
        image: "/images/icon/error.png"
      })
      return;
    }

    wx.showModal({
      title: '提示',
      content: '确定要提交吗？',
      success: function (res) {
        if (res.confirm) {
          
      wx.cloud.callFunction({
        name: 'login',
        complete: re => {
        const openid = re.result.openid;
          const db = wx.cloud.database();
          const wx_user = db.collection("wx_user");
          wx_user.where({
            _openid:openid
          }).get().then(res=>{
            const db = wx.cloud.database();
            const books_list = db.collection("books_list");
            if (th.data.isUpdate){
              books_list.doc(th.data.update_id).set({
                data: {
                  goods: goods,
                  date: date,
                  money: th.data.money,
                  type: type,
                  create_by: res.data[0].name,
                  year: parseInt(date.slice(0, 4)),
                  month: parseInt(date.slice(5, 7)),
                  images: arr
                }
              }).then(resa => {
                wx.showToast({
                  title: '成功',
                  icon: 'success',
                  duration: 2000
                })
                wx.reLaunch({
                  url: "/pages/books/myList/myList",
                });

              }).catch(err => {
                console.log(err)
                wx.showToast({
                  title: '保存失败',
                  image: "/images/icon/error.png"
                })
              })

            }else{
              books_list.add({
                data: {
                  goods: goods,
                  money: th.data.money,
                  date: date,
                  type: type,
                  create_by: res.data[0].name,
                  year: parseInt(date.slice(0, 4)),
                  month: parseInt(date.slice(5, 7)),
                  images: arr
                }

              }).then(resa => {
                wx.showToast({
                  title: '成功',
                  icon: 'success',
                  duration: 2000
                })
                wx.reLaunch({
                  url: "/pages/books/myList/myList",
                });

              }).catch(err => {
                console.log(err)
                wx.showToast({
                  title: '保存失败',
                  image: "/images/icon/error.png"
                })
              })
            }

          }).catch(err=>{
            console.log(err)
            wx.showToast({
              title: '获取用户失败',
              image: "/images/icon/error.png"
            })

          })

          return re;
        }
      })

        } else if (res.cancel) {
          console.log('点击取消了');
          return false;
        }
      }
    })



  },
  bindPickerChange:function(e){
    this.setData({
      type_index : e.detail.value
    })
  },


  formReset: function () {
    var timestamp = Date.parse(new Date());
    var date = new Date(timestamp);
    //年  
    var Y = date.getFullYear();
    //月  
    var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
    //日  
    var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    console.log("当前时间：" + Y + M + D);
    this.setData({
      date: Y + '-' + M + '-' + D
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      date: e.detail.value
    })
  },


  onLoad: function (options) {
    arr = []
    const th = this;
    const db = wx.cloud.database();
    if (options.book != "undefined" && options.book != undefined ){
      var book = JSON.parse(options.book);

      this.setData({
        date: book.date,
        goods: book.goods,
        money: book.money,
        images_list: book.images,
        isUpdate : true,
        update_id: book._id,
        goods_length: book.goods.length,
      })
      arr = book.images
    }

      var timestamp = Date.parse(new Date());
      var date = new Date(timestamp);
      //年  
      var Y = date.getFullYear();
      //月  
      var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1);
      //日  
      var D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
      console.log("当前时间：" + Y + M + D);
       th.setData({
         date: Y + '-' + M + '-' + D,
         start_date: Y + '-' + M + '-' + (D - 1),
         end_date: Y + '-' + M + '-' + D,
         images_date: Y + '-' + M,
       })
     
     
    

  


    //查询类型
    
    const books_type = db.collection("books_type");
    books_type.get().then(res=>{
      console.log(res.data);
      const data = res.data;
      th.setData({
        booksType : data ,
      })
      if (options.book != "undefined" && options.book != undefined) {
        var book = JSON.parse(options.book);
        for (var i = 0; i < data.length; i++ ){
          if (book.type == data[i].name){
            th.setData({
              type_index: i
            })
            return 
          }
        }
      }
    }).catch(ree=>{
      console.log("查询类型错误");
    })
  },

  radioChange: function (e) {
   // console.log('radio发生change事件，携带value值为：', e.detail)
   const val = e.detail.value;
    var arr = [val]
    
    this.setData({
      sourceType : arr
    })
    console.log(this.data.sourceType)

    console.log(arr)
  },



  addImg: function (e) {
    if(arr.length == 3){
      wx.showToast({
        title: '只可以上传两张图片',
        image: "/images/icon/error.png"
      })
      return false
    }
   const th = this;
    console.log(e)
      wx.chooseImage({//选择图片
 
      count: 3, //规定选择图片的数量，默认9

      sizeType: ["original", "compressed"], //规定图片的尺寸， 原图/压缩图

      sourceType: th.data.sourceType, // ['camera'], //从哪里选择图片， 相册/相机camera album

      success: (chooseres) => { //接口调用成功的时候执行的函数

        console.log(chooseres);

        //选择图片后可以在这里上传
        if (chooseres.tempFilePaths.length > 1){
          arr = []
        }
        for (var i = 0; i < chooseres.tempFilePaths.length; i++){
        wx.cloud.uploadFile({
          cloudPath: "images/books_list/" + this.data.images_date+"/" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000),//云储存的路径及文件名
          filePath: chooseres.tempFilePaths[i], //要上传的图片/文件路径 这里使用的是选择图片返回的临时地址
          success: (uploadres) => { //上传图片到云储存成功
            arr.push(uploadres.fileID)
           th.setData({
             images_list: arr
           })
           // console.log(uploadres)
            wx.hideLoading({ //显示加载提示框 不会自动关闭 只能wx.hideLoading关闭
              title: '图片上传中', //提示框显示的提示信息
              mask: true, //显示透明蒙层，防止触摸。为true提示的时候不可以对屏幕进行操作，不写或为false时可以操作屏幕
              success: function () {
                wx.hideLoading() //让提示框隐藏、消失
              }
            });
          },
          fail: (err) => {
            console.log(err)
          }
        })
        }
      },
      fail: (err) => {
        console.log(err)
      }
    })

  },
  // deleteImage: function () {
  //   var th = this;
  //   const index = th.data.arr_index
  //     wx.showModal({
  //       title: '提示',
  //       content: '确定要删除此图片吗？',
  //       success: function (res) {
  //         if (res.confirm) {
  //           console.log(arr)
  //           th.deleteCloudFile(arr[index])
  //           arr.splice(index, 1);
  //           th.setData({
  //             images_list: arr
  //           })
  //           console.log(arr)
  //           console.log(th.data.images_list)
  //         } else if (res.cancel) {
  //           console.log('点击取消了');
  //           return false;
  //         }
  //       }
  //     })
    
  // },
  // 删除文件
  deleteCloudFile:function() {
    var th = this;
    console.log("ee", this.data.arr_index)
     console.log(arr)
   wx.cloud.deleteFile({
     fileList: [arr[th.data.arr_index]],
    success: (res) => {
      console.log(res)
      arr.splice(th.data.arr_index, 1);
      th.setData({
        images_list: arr
      })
    },
    fail: (err) => {
      console.log(err)
    }
   })
 
  },
  onShow: function (options) {
    // var pages = getCurrentPages();

    // if (pages.length == 0) {
    //   //your code
    // }
  },

  //图片点击事件
  imgYu: function (event) {

    var images_list = this.data.images_list
    const index = event.currentTarget.dataset.index;
    console.log(index)
    //获取data-src
   // var imgList = event.currentTarget.dataset.list;//获取data-list
    //图片预览
    wx.previewImage({
      current: images_list[index], // 当前显示图片的http链接
      urls: images_list // 需要预览的图片http链接列表
    })
  }
  ,


  openConfirm: function (e) {
    console.log(e)
    this.setData({
      dialogShow: true,
      arr_index: e.currentTarget.dataset.index
    })
  
  },
  tapDialogButton(e) {
    console.log(e)
    const index =  e.detail.index;
    this.setData({
      dialogShow: false,
      showOneButtonDialog: false,
    })
    if (index == 1){
      this.deleteCloudFile()
    }
  
  },
})
