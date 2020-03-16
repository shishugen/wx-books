var wxCharts = require('../../../utils/wxcharts.js');
var app = getApp();
var columnChart = null;
var year = []; // ['2012', '2013', '2014', '2015'];
var money_total = [];
var money_month_total = [];
var data_arr = [];
var arry = [];
var money = [];
var ye=[]; 

Page({
  data: {
    chartTitle: '',
    isMainChartDisplay: true,
    chartData: [],
    my_total_money : 0,
    date:"08",
    date_list : {},
    date_index: 0, 
    loadingHidden: true,
    date_list_total: { "_id": "全部", "name": "全部" },
    month_arr: [{ id: 0, name: "全部" },{ id: 1, name: "一月" }, { id: 2, name: "二月" }, { id: 3, name: "三月" },
      { id: 4, name: "四月" }, { id: 5, name: "五月" }, { id: 6, name: "六月" }
      , { id: 7, name: "七月" }, { id: 8, name: "八月" }, { id: 9, name: "九月"}, 
      { id: 10, name: "十月" }, { id: 11, name: "十一月" }, { id: 12, name: "十二月"}],

    month_arr_index : 0,
    buttons: [{ text: '取消' }, { text: '个人' }, { text: '全部' }],
    dialogShow: false,
  },

  onLoad: function () {
    var year = []; // ['2012', '2013', '2014', '2015'];
    var money_total = [];
    var money_month_total = [];
    var data_arr = [];
   
    var money = [];
    var ye = []; 
    this.setData({
      date_list :{},
      my_total_money : 0,
      chartData: [],
    })

    const db = wx.cloud.database();
    const $ = db.command.aggregate
    const _ = db.command
    const  th = this;

    db.collection("books_list").aggregate()
    .group({
      _id: "$year"
    }).end().then(res => {
      console.log(res)
      const data = res.list.concat(this.data.date_list_total)
      console.log(data)
      let temp = data[0];
      data[0] = data[data.length - 1];
      data[data.length - 1] = temp;
      
       th.setData({
         date_list: data
       })
    })

    
    //每人消费情况
    this.findTotalDate()
    
    console.log(this.data.month_arr)

 

  },
  onPullDownRefresh() {
    var columnChart = null;
    this.onReady()
    this.onLoad()
    // complete
    wx.hideNavigationBarLoading() //完成停止加载
    wx.stopPullDownRefresh() //停止下拉刷新


  },

  bindPickerChange:function(e){
    const y = this.data.date_list[e.detail.value];
     
    this.setData({
      date_index: e.detail.value
    })
    if (e.detail.value == 0) {
      this.findTotalDate()
    }else{
      const db = wx.cloud.database();
      const $ = db.command.aggregate
      db.collection("books_list").aggregate()
        .match({
          year: Number(y._id)
        }).group({
          _id: "$create_by",
          money: $.sum("$money"),
        }).end().then(res => {
          console.log(res)
          this.setData({

            my_total_money: res.list
          })
        })
    }
  },
  monthBindPickerChange :function(e){
    if (this.data.date_index == 0) {
      wx.showToast({
        title: '请选择年份！',
        image: "/images/icon/error.png"
      })
      return;
    }
    const m = this.data.month_arr[e.detail.value].id;
    const year = this.data.date_list[this.data.date_index]._id

    let filterObj = {}
    if (year > 0) {
      filterObj.year = year
    }
    if (m > 0) {
      filterObj.month = Number(m)
    }
    console.log(filterObj)
    const db = wx.cloud.database();
    const $ = db.command.aggregate
    const th = this;
    this.setData({
      month_arr_index: e.detail.value
    })
      db.collection("books_list").aggregate()
        .match(filterObj).group({
          _id: "$create_by",
          money: $.sum("$money"),
        }).end().then(res => {
          console.log(res)
          th.setData({
            my_total_money: res.list
          })

        })


  },

 findTotalDate :function(){
   const db = wx.cloud.database();
   const $ = db.command.aggregate
   const th = this;
   db.collection("books_list").aggregate()
     .group({
       _id: "$create_by",
       money: $.sum("$money"),
     }).end().then(res => {
       console.log(res)
       th.setData({
         my_total_money: res.list
       })

     })


  },



  backToMainChart: function () {
    this.setData({
      chartTitle: this.data.chartData.main.title,
      isMainChartDisplay: true
    });
    columnChart.updateData({
      categories: this.data.chartData.main.categories,
      series: [{
        name: '成交量',
        data: this.data.chartData.main.data,
        format: function (val, name) {
          return val.toFixed(2) + '';
        }
      }]
    });
  },
  touchHandler: function (e) {
    var index = columnChart.getCurrentDataIndex(e);
    console.log(e, "---e.e=",this.data.chartData.sub);
    console.log(this.data.chartData.sub ,"---chartData.sub=");

    if (index > -1 && index < this.data.chartData.sub.length && this.data.isMainChartDisplay) {

      this.setData({
        chartTitle: this.data.chartData.sub[index].title,
        isMainChartDisplay: false
      });
      columnChart.updateData({
        categories: this.data.chartData.sub[index].categories,
        series: [{
          name: '成交量',
          data: this.data.chartData.sub[index].data,
          format: function (val, name) {
            return val.toFixed(2) + '';
          }
        }]
      });

    }

  },
  onReady: function (e) {
    var arry = [];

    var windowWidth = 340;
    try {
      var res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    var th = this;
    var q = 0;
    wx.cloud.callFunction({
      name: 'year',
      complete: re => {
        var res_data = re.result;
        var sort_yaer = th.arrSort(res_data)
      
        for (var i = 0; i < sort_yaer.length; i++) {
          arry.push(sort_yaer[i]._id)
          money.push(sort_yaer[i].money)
          ye.push(sort_yaer[i]._id)
          th.setData({
            y: sort_yaer[i]._id
          })
          console.log("yyyy1", th.data.y)
          console.log("re.result[i]._id", sort_yaer[i]._id)
          wx.cloud.callFunction({
            name: 'month',
            data:{
              year: th.data.y
            },
            complete: re1 => {
              const arr1 = re1.result
              console.log("re1", arr1)
              var min;
              var mo;
              for (var i = 0; i < arr1.length; i++) {
                for (var j = i; j < arr1.length; j++) {
                  if (arr1[i]._id > arr1[j]._id) {
                    min = arr1[j]._id;
                    mo = arr1[j].money;
                    arr1[j]._id = arr1[i]._id;
                    arr1[j].money = arr1[i].money;
                    arr1[i]._id = min;
                    arr1[i].money = mo;
                  }
                }
              }

             var categoriesMonth = []
             var arrmonth = []
              for (var j = 0; j < arr1.length; j++) {
                arrmonth.push(arr1[j].money)
                categoriesMonth.push(arr1[j]._id)
              }

              console.log("re2", arr1)
              data_arr.push({
                title: sort_yaer[q]._id +"年",
                data: arrmonth,
                categories: categoriesMonth //['1', '2', '3', '4', '5', '6', "7", "8", "9", "10", "11", "12"]
              })
              console.log("arrmonth", arrmonth)
              var arrmonth = []
              categoriesMonth = []
              q++;
              //ye=[]
            }
         })
         // console.log("data_arr",data_arr)

      

       console.log(arry)

          this.setData({
            chartData: {
              main: {
                title: '',
                data: money,
                categories: arry
              },
              sub: data_arr
            }
          })
         
        columnChart = new wxCharts({
          canvasId: 'columnCanvas',
          type: 'column',
          animation: true,
          categories: arry,
          series: [{
            name: '总消费',
            data: money, //this.data.chartData.main.data,
            format: function (val, name) {
              return val.toFixed(2) + '';
            }
          }],
          yAxis: {
            format: function (val) {
              return val + '';
            },
            title: '',//hello
            min: 0
          },
          xAxis: {
            disableGrid: false,
            type: 'calibration'
          },
          extra: {
            column: {
              width: 15
            }
          },
          width: windowWidth,
          height: 160,
        });
        }
        arry = []
        money = []
      }
    })

  },
  openConfirm: function (e) {
    console.log(e)
    this.setData({
      dialogShow: true,
   
    })

  },
  tapDialogButton(e) {
    console.log(e)
    const index = e.detail.index;
    this.setData({
      dialogShow: false,
      showOneButtonDialog: false,
    })
    if (index == 1) { //个人
      this.exportDetails(index)
    }else if(index == 2){
      this.exportDetails(index)
    }
  },
  //导出数据
  exportDetails:function(index){
  // date_index date_list_total  month_arr_index month_arr
    const th = this;
    let filterObj = {}
    if (this.data.date_index == 0){
      wx.showToast({
        title: '请选择年份！',
        image: "/images/icon/error.png"
      })
      return;
    } 
             
                wx.cloud.callFunction({
                  name: 'login',
                  complete: re => {
                    if (index == 1){
                       filterObj._openid = re.result.openid;
                    }
                    const year = th.data.date_list[th.data.date_index]._id
                    const month = th.data.month_arr[th.data.month_arr_index].id
                    if (year > 0) {
                      filterObj.year = year
                    }
                    if (month > 0) {
                      filterObj.month = month         
                    }
                    th.setData({
                      loadingHidden: false
                    })
                    console.log('filterObj', filterObj)
                    const db = wx.cloud.database();

                    const books_list = db.collection("books_list");
                    books_list.where(
                      filterObj
                    ).get().then(res => {
                      console.log(res)
                      const list = res.data;

                      var result = 0;
                      for (var i = 0; i < list.length; i++) {
                         result += list[i].money;
                      }
                      const obj_total ={}

                      obj_total.goods = ''
                      obj_total.type = ''
                      obj_total.date = '总金额'
                      obj_total.create_by = ''
                      obj_total.money = result;

                      list.push(obj_total)

                      console.log(list)
                      console.log(obj_total)
                      wx.cloud.callFunction({
                        name: 'excel',
                        data: {
                          excelhead: ["商品", "类型", "日期", "金额", "创建者"],
                          excelbody: list
                        },
                        success: function (res) {
                          console.log(res);
                          wx.cloud.getTempFileURL({
                            fileList: [res.result.fileID],
                            success: res => {
                              console.log(res)
                              wx.downloadFile({
                                url: res.fileList[0].tempFileURL,
                                success: function (res) {
                                  var filePath = res.tempFilePath;
                                  console.log(res)
                                  //页面显示加载动画
                                  wx.openDocument({
                                    filePath: filePath,
                                    success: function (res) {
                                      th.setData({
                                        loadingHidden: true
                                      })
                                      console.log('打开文档成功')
                                    }
                                  })
                                }
                              })

                            },
                            fail: err => {
                              console.error(err)
                            }
                          })
                        },
                        fail: function (res) {
                          console.log(res);
                        }
                      })

                    })

                   }
                })
              

      }
      ,
  arrSort: function (arr1){
        var min;
        for (var i = 0; i < arr1.length; i++) {
          for (var j = i; j < arr1.length; j++) {
            if (arr1[i]._id > arr1[j]._id) {
              min = arr1[j]._id;
              arr1[j]._id = arr1[i]._id;
              arr1[i]._id = min;
            }
          }
        }
        return arr1;
      }
});