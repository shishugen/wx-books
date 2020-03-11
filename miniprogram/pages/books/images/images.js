// miniprogram/pages/books/images/images.js
Page({

  /**
   * 页面的初始数据
   */
data:{
        img_l:'',
        loadingHidden : true
        },
  load: function () {
    this.setData({
      loadingHidden: false
    })
    let _that = this;
    wx.downloadFile({
      url: 'https://626f-books-zo8ih-1301465585.tcb.qcloud.la/outputExcels/o37J85Y0m5pdbc945IAHDYBVrFns-1583679141.054.xlsx?sign=e6404a48b38a7ae0cc1c26a4bfa3862c&t=1583680018',
      success: function (res) {

        var filePath = res.tempFilePath;

        console.log(res)

        //页面显示加载动画

        wx.openDocument({

          filePath: filePath,

          success: function (res) {

            _that.setData({

              loadingHidden: true

            })

            console.log('打开文档成功')

          }

        })

      }

    })

  },

  addImg: function () {

    wx.chooseImage({//选择图片

      count: 1, //规定选择图片的数量，默认9

      sizeType: ["original", "compressed"], //规定图片的尺寸， 原图/压缩图

      sourceType: ['album', 'camera'], //从哪里选择图片， 相册/相机

      success: (chooseres) => { //接口调用成功的时候执行的函数

        console.log(chooseres);

        //选择图片后可以在这里上传

        wx.cloud.uploadFile({

          cloudPath: "images/" + new Date().getTime() + "-" + Math.floor(Math.random() * 1000),//云储存的路径及文件名

          filePath: chooseres.tempFilePaths[0], //要上传的图片/文件路径 这里使用的是选择图片返回的临时地址

          success: (uploadres) => { //上传图片到云储存成功

            console.log(uploadres)

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

      },

      fail: (err) => {

        console.log(err)

      }

    })

  }
 


})