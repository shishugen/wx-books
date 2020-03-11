// 云函数入口文件
const cloud = require('wx-server-sdk')
const nodeExcel = require('excel-export')
const path = require('path');
cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  
  const data_list = event.excelbody;
  // 云函数入口函数 exports.main = async (event, context) => {
  var tableHead = event.excelhead;
  var tableMap = {
    styleXmlFile: path.join(__dirname, "styles.xml"),
    name: Date.now() + "-export",
    cols: [],
    rows: [],
  }
  //添加表头
  tableMap.cols[0]={caption: tableHead[0], type: 'string'}
  tableMap.cols[1] = { caption: tableHead[1], type: 'string' }
  tableMap.cols[2] = { caption: tableHead[2], type: 'string' }
  tableMap.cols[3] = { caption: tableHead[3], type: 'number' }
  tableMap.cols[4] = { caption: tableHead[4], type: 'string' }
  // for (var i = 0; i < tableHead.length; i++) {

  //   tableMap.cols[tableMap.cols.length] = {

  //     caption: tableHead[i], type: 'string'
           
  //   }
  // }
  //伪数据
  const Output = [
    { 发票编号: 0, 发票代码: '001', 开票时间: '2019-5-1', 金额: 100 },
    { 发票编号: 1, 发票代码: '002', 开票时间: '2019-5-1', 金额: 200 }
  ]
  //添加每一行数据
  for (var i = 0; i < data_list.length; i++) {
    tableMap.rows[tableMap.rows.length] = [
      data_list[i].goods,
      data_list[i].type, 
      data_list[i].date, 
      data_list[i].money,
      data_list[i].create_by
    ]
  }
  //保存excelResult到相应位置
  var excelResult = nodeExcel.execute(tableMap);
  var filePath = "outputExcels";
  var fileName = cloud.getWXContext().OPENID + "-" + Date.now() / 1000 + '.xlsx';
  console.log(excelResult);
  //上传文件到云端
  return await cloud.uploadFile({
    cloudPath: path.join(filePath, fileName),
    fileContent: new Buffer(excelResult, 'binary')
  });
 
}
