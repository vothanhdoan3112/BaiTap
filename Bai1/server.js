

const config = require('./config/config.json');

const uuid = require("uuid");
const fs = require('fs');
const http = require('http');
const express = require('express');
const app = express();
app.use(express.json());
app.use(express.static("express"));
// default URL for website
app.use(express.static('public'));
const server = http.createServer(app);
const port = 3000;
server.listen(port);
const io = require('socket.io').listen(server);
console.debug('Server listening on port ' + port);
// connect DB
const AWS = require("aws-sdk");
const { count } = require('console');


const BUCKET = config.BUCKET;
const REGION = config.REGION;
const ACCESS_KEY = config.AWS_ACCESS_KEY;
const SECRET_KEY = config.AWS_SECRET_KEY;

AWS.config.update({
  region: REGION,
  accessKeyId: ACCESS_KEY,
  secretAccessKey: SECRET_KEY
});
// Connect S3
var docClient = new AWS.DynamoDB.DocumentClient();
var s3 = new AWS.S3();

function uploadImage(img64,imgName) {
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
      s3.putObject({
        Bucket: BUCKET,
        Body: fileStream,
        Key: imgName,
        ACL: 'public-read'
      })
        .promise()
        .then(res => {
          console.log(`Upload succeeded - `, res);
          delImg();
        })
        .catch(err => {
          console.log("Upload failed:", err);
        });
    }
  });
  
}

function delImg() {
  fs.unlink('avata.jpg', (err) => {
    if (err) {
      console.error(err);
      return;
    }

    //file removed
  });
}
/********************************************************************************/
io.sockets.on('connection', function (socket) {
  /** them sv **/
  socket.on('addStudent', function (sv) {
    //console.log(generateUUID());
    sv.id = uuid();
    /*kiem tra sinh vien ton tai*/
    var flag;
    var params = {
      TableName: "Students",
      FilterExpression: "#maSinhVien = :maSv",
      ExpressionAttributeNames: {
        "#maSinhVien": "maSinhVien"
      },
      ExpressionAttributeValues: {
        ":maSv": sv.maSinhVien
      }
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.log(JSON.stringify(err, null, 2));
        socket.emit('IsAddStudentSuccess', false);
      } else {
        flag = data.Count;
      }
      if (flag == 0) {
        //neu khong co thi them
        var params = {
          TableName: 'Students',
          Item: sv
        };
        docClient.put(params, function (err, data) {
          if (err) {
            console.log(JSON.stringify(err, null, 2));
            socket.emit('IsAddStudentSuccess', false);
          } else {
        
            uploadImage(sv.img64,sv.avata);
            socket.emit('IsAddStudentSuccess', true);

          }
        });
      }
      else {
        socket.emit('IsAddStudentSuccess', false);
      }
    });
  });
  /** Xoa sinh vien **/
  socket.on('xoaSinhVien', function (maSv) {
    var sv;
    var params = {
      TableName: "Students",
      FilterExpression: "#maSinhVien = :maSv",
      ExpressionAttributeNames: {
        "#maSinhVien": "maSinhVien"
      },
      ExpressionAttributeValues: {
        ":maSv": maSv
      }
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.log(JSON.stringify(err, null, 2));
        socket.emit('IsDelStudentSuccess', false);
      } else {
        sv = data.Items[0];
        // console.log(sv);
      }
      var params = {
        TableName: "Students",
        Key: {
          "id": sv.id,
          "maSinhVien": sv.maSinhVien
        }
      };
      docClient.delete(params, function (err, data) {
        if (err) {
          console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
          socket.emit('IsDelStudentSuccess', false);
        } else {
          console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
          socket.emit('IsDelStudentSuccess', true);

        }
      });

    });
  });
  /** Update  **/
  socket.on('suaSinhVien', function (newIn4) {
    var sv;
    var params = {
      TableName: "Students",
      FilterExpression: "#maSinhVien = :maSv",
      ExpressionAttributeNames: {
        "#maSinhVien": "maSinhVien"
      },
      ExpressionAttributeValues: {
        ":maSv": newIn4.maSinhVien
      }
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.log(JSON.stringify(err, null, 2));
        socket.emit('IsUpdStudentSuccess', false);
      } else {
        sv = data.Items[0];
        // console.log(sv);
      }
      var params = {
        TableName: "Students",
        Key: {
          "id": sv.id,
          "maSinhVien": sv.maSinhVien
        },
        UpdateExpression: "set tenSinhVien = :ten, namSinh = :ns, avata = :avt",
        ExpressionAttributeValues: {
          ":ten": newIn4.tenSinhVien,
          ":ns": newIn4.namSinh,
          ":avt": newIn4.avata
        }
      };
      docClient.update(params, function (err, data) {
        if (err) {
          console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
          socket.emit('IsUpdStudentSuccess', false);
        } else {
          //console.log(newIn4.img64);
          uploadImage(newIn4.img64,newIn4.avata);
          socket.emit('IsUpdStudentSuccess', true);

        }
      });

    });
  });
  /** GetIMG  **/

  /**  **/
  /** load ta ca sinh vien **/
  socket.on('RequestAllSinhVien', function () {
    var params = {
      TableName: "Students"
    };
    docClient.scan(params, function (err, data) {
      if (err) {
        console.log(JSON.stringify(err, null, 2));
      } else {
        socket.emit('getAllSinhVien', data.Items);
        //console.log(data.Count);
      }
    });
  });

});

