const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

extensions = {
	".html" : "text/html",
	".css" : "text/css",
	".js" : "application/javascript",
	".png" : "image/png",
	".gif" : "image/gif",
	".jpg" : "image/jpeg"
};

function getData(fileName,callback){
	var dataPath = __dirname + "/datas/" + fileName + ".data";
	fs.exists(dataPath,function(exists){
		if(exists){
			fs.readFile(dataPath,function(err,contents){
				if(!err){
					return callback(contents);
				} else {
					return callback(err);
				}
			});
		}else {
			data = "Not data found....";
		}
	});
}

function getFile(filePath,reqParams,res,page404,mimeType) {
  fs.exists(filePath,function(exists){
    if(exists){
      fs.readFile(filePath,function(err,contents) {
        if(!err){
					if(mimeType === extensions[".html"] && reqParams !== undefined
					 && reqParams.data !== undefined){
						getData(reqParams.data,function(data){
								contents = contents.toString().replace("#content",data);
								res.writeHead(200,{
									"Content-type" : mimeType,
									"Content-Length" : contents.length
								});
								res.end(contents);
						});
					}else{
						res.writeHead(200,{
	            "Content-type" : mimeType,
							"Content-Length" : contents.length
	          });
						res.end(contents);
					}
        }else {
          console.dir(err);
        }
      });
    }else {
      fs.readFile(page404,function(err,contents){
        if(!err){
					//send the contents with a 404/not found header
					res.writeHead(404, {'Content-Type': 'text/html'});
					res.end(contents);
				} else {
					console.dir(err);
				};
      });
    }
  })
};

function requestHandler(req,res){
  var fileName = path.basename(req.url);
	var reqParams = undefined;
	if(fileName.includes("?")){
		reqParams = url.parse(req.url,true).query;
		fileName = fileName.substring(0,fileName.indexOf("?"));
  }
  var ext = path.extname(fileName);
  var folderView = __dirname + "/views/";
  var page404 = folderView + "/404.html";

  if(!extensions[ext]){
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end("The requested file type is not supported!");
  }

  getFile((folderView+fileName),reqParams,res,page404,extensions[ext]);

};

http.createServer(requestHandler)
.listen(3000,"localhost",function(){
  console.log("Server is running on port 3000.....");
});
