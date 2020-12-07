var docClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

function uploadImage(img64,imgName) {

    //Đây chỉ là tạo file ảnh từ chuỗi mã hóa. Tùy theo cách upload từ Client mà cái này khác nhau//
    //Đây là Client up ảnh lên rồi chuyển ảnh sang dạng chuỗi base64 rồi gửi sang server để server đổi lại thành file ảnh
    //Phù hợp khi gửi bằng socket io
    //Angula có thể đơn giản bước này hơn
  var data = img64.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer.from(data, 'base64');
  fs.writeFile('./avata.jpg', buf, function (err) {
    if (err) {
      console.log(JSON.stringify(err, null, 2));
    }else{
      var fileStream = fs.createReadStream('avata.jpg');
      fileStream.on('error', function(err) {
        console.log('File Error', err);
      });

      //Đây là phần chính để upload lên
      s3.putObject({
        Bucket: BUCKET, // tên bucket
        Body: fileStream,//Đây là file ảnh để up lên
        Key: imgName, // Đây là tên ảnh mình đổi khi up lên. Nên để ID cho khỏi trùng
        ACL: 'public-read' // Đây là để Public ảnh để ai cũng có thể xem và tải
      })
        .promise()
        .then(res => {
          console.log(`Upload succeeded - `, res);
        })
        .catch(err => {
          console.log("Upload failed:", err);
        });


    }
  });
  
}