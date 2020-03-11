// miniprogram/pages/books/details/details.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type : "",
    money: "",
    goods: "",
    date: "",
    images_list: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  const th = this;
    const db = wx.cloud.database();
    const books_list = db.collection("books_list");
    books_list.where({
      _id: options.id
    }).get().then(res=>{
      th.setData({
        money: res.data[0].money,
        goods: res.data[0].goods,
        date: res.data[0].date,
        type: res.data[0].type,
        images_list: res.data[0].images,
      })

      console.log(res)
      }).catch(err => {
        console.log(err)
        wx.showToast({
          title: '获取失败',
          image: "/images/icon/error.png"
        })
      })
  },

  
  backList: function () {
    wx.navigateBack({
      url: "/pages/books/list/list"
    });

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
  },



})