Page({
  /**
    * 页面的初始数据
    */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isUser:false,
    avatarUrl : '',
  },
  /**
 * 生命周期函数--监听页面加载
 */
  onLoad: function (options) {
    console.log(wx.canIUse('button.open-type.getUserInfo'))
    this.getUserInfo();
  },

  getUserInfo: function (e) {
    let that = this;
    // console.log(e)
    // 获取用户信息
    wx.getSetting({
      success(res) {
        // console.log("res", res)
        if (res.authSetting['scope.userInfo']) {
          console.log("已授权=====")
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.cloud.callFunction({
            name: 'login',
            complete: re => {
              const openid = re.result.openid
             // console.log("成功1", re)

          wx.getUserInfo({
            success(res) {
             // console.log("获取用户信息成功", res)
              that.setData({
                name: res.userInfo.nickName,
                avatarUrl: res.userInfo.avatarUrl,
                
              })
              const db = wx.cloud.database();
              const wx_user = db.collection("wx_user");
              wx_user.where({
                _openid: openid
              }).get().then(res => {
                if (res.data.length > 0) {
                  wx.reLaunch({
                    url: "/pages/index/index",
                  });
                 // console.log("成功", res)
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '请联系管理员',
                    confirmText: '注册',
                    success(res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: "/pages/register/register",
                        });
                        console.log('用户点击确定')
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
                }

              }).catch(err => {
                console.log("失败", err)
              })
            },
            fail(res) {
              console.log("获取用户信息失败", res)
            }
          })
            }
          })
        } else {
          that.setData({
            isUser : true
          })
          console.log("未授权=====")
         // that.showSettingToast("请授权")
        }
      }
    })
  },

  // 打开权限设置页提示框
  showSettingToast: function (e) {
    wx.showModal({
      title: '提示！',
      confirmText: '去设置',
      showCancel: false,
      content: e,
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '../setting/setting',
          })
        }
      }
    })
  },
})

