// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  return new Promise((resolve, reject) => {
    const db = cloud.database();
    const $ = db.command.aggregate
    db.collection("books_list").aggregate()
      .match({
        year: Number(event.year)
      }).group({
        _id: "$month",
        money: $.sum("$money"),
      }).end().then(res => {
        resolve(res.list)
      })
  })

}