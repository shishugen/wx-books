// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {

  var data = []
  var datayear = []
  let year = await findYear()
  console.log(year)
  for (var i = 0; i < year.length; i++){
  //  console.log("year[i]===",year[i]._id)
    let month = await findMonth(year[i]._id)
    datayear.push(month)
    //data.push([year[i]._id, month])
    data.push([year[i]._id, year[i].money, month])
  }
  console.log(data)


  return {data}

   function findYear(){
     return  new Promise((resolve, reject) => {
       const db = cloud.database();
       const $ = db.command.aggregate
       const _ = db.command
       const books_list = db.collection("books_list")
         .aggregate().group({
           _id: "$year",
           money: $.sum("$money")
         }).end().then(res => {
           resolve(res.list)
         })
     })
   }
  
  function findMonth(year){
    console.log("year----"+year)
   
  }
}