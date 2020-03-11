// pages/register/register.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list : []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var  th = this;

 

    wx.cloud.downloadFile({
      fileID: "cloud://books-zo8ih.626f-books-zo8ih-1301465585/outputExcels/o37J85Y0m5pdbc945IAHDYBVrFns-1583679141.054.xlsx"
    }).then(res => {
      // get temp file path
      console.log(res.tempFilePath)
    }).catch(error => {
      // handle error
    })


  },

  formSubmit: function (e) {
    


    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    let { userName, pwd } = e.detail.value;

    if (!pwd) {
      wx.showToast({
        title: '请输入口令',
        image: "/images/icon/error.png"
      })
      return;
    }
    if (!userName) {
      wx.showToast({
        title: '请输入姓名！',
        image: "/images/icon/error.png"
      })
      return;
    }


    const db = wx.cloud.database();
    const wx_pwd = db.collection("wx_pwd");
    wx_pwd.where({
      pwd : pwd
    }).get().then(res=>{
       if(res.data.length > 0){

        //获取用户openid
         let th = this;
         wx.cloud.callFunction({
           name: 'login',
           complete: re => {
             //添加用户信息
             const db = wx.cloud.database();
             const wx_user = db.collection("wx_user");
             wx_user.add({
               data: {
                 name: userName,
                 stauts:0
               }

             }).then(resa => {
               wx.showToast({
                 title: '成功',
                 icon: 'success',
                 duration: 2000
               })
               wx.reLaunch({
                 url: "/pages/index/index",
               });
            }).catch(err=>{
              console.log(err)
              wx.showToast({
                title: '保存失败',
                image: "/images/icon/error.png"
              })
            })
          
           },
         })
       }else{
         //口令不正确
         wx.showToast({
           title: '口令不正确',
           image: "/images/icon/error.png"
         })
       }


    }).catch(err=>{
      console.log(err)
    })
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