var request = require('request'); //引入request
var cheerio = require('cheerio'); //引入cheerio
var path = require('path');
var fs = require('fs');

var options = {
	url: 'http://www.acfun.tv/',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
	},
	gzip: true
};
request(options, function(error, res, body) {
	if (!error && res.statusCode == 200) {
		// console.log(body); 
		acquireData(body) //返回请求页面的HTML
	} else {
		console.log('出错啦！出错代码：' + res.statusCode)
	}
})

function acquireData(data) {
	var $ = cheerio.load(data); //cheerio解析data

	var meizi = $('.text img').toArray(); //将所有的img放到一个数组中
	var len = meizi.length;
	for (var i = 0; i < len; i++) {
		var imgSrc = meizi[i].attribs.src; //用循环读出数组中每个src地址
		var fileName = parseUrlForFileName(imgSrc);
		downloadImg(imgSrc, fileName)
	}
}


function parseUrlForFileName(address) {
	var fileName = path.basename(address);
	return fileName;
}

var downloadImg = function(uri, filename) {
	request.head(uri, function(err, res, body) {
		console.log('content-type:', res.headers['content-type']);  //这里返回图片的类型
   		console.log('content-length:', res.headers['content-length']);  //图片大小
   		if (err) {
   			console.log('err:' + err);
   			return false;
   		}
   		request(uri).pipe(fs.createWriteStream('girls/' + filename)).on('close', function(){
			console.log(filename + ' done!')
		})
	})
}








