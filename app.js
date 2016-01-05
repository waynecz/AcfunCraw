// 这句的意思就是引入 `express` 模块，并将它赋予 `express` 这个变量等待使用。
var express = require('express');
var cheerio = require('cheerio'); //引入cheerio
var path = require('path');
var fs = require('fs');
var url = require('url');
var request = require('request');
// 调用 express 实例，它是一个函数，不带参数调用时，会返回一个 express 实例，将这个变量赋予 app 变量。
var app = express();

// app 本身有很多方法，其中包括最常用的 get、post、put/patch、delete，在这里我们调用其中的 get 方法，为我们的 `/` 路径指定一个 handler 函数。
// 这个 handler 函数会接收 req 和 res 两个对象，他们分别是请求的 request 和 response。
// request 中包含了浏览器传来的各种信息，比如 query 啊，body 啊，headers 啊之类的，都可以通过 req 对象访问到。
// res 对象，我们一般不从里面取信息，而是通过它来定制我们向浏览器输出的信息，比如 header 信息，比如想要向浏览器输出的内容。这里我们调用了它的 #send 方法，向浏览器输出一个字符串。

var options = {
	url: 'http://www.acfun.tv/v/list60/index.htm',
	headers: {
		'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'
	},
	gzip: true
};


request(options, function(error, res, body) {
	console.log(res.statusCode)
	if (!error && res.statusCode == 200) {
		// console.log(body); 
		topics = [];
		var $ = cheerio.load(body);
		$('#area-b .r .page.active .unit').each(function(i, e) {
			var $e = $(e);
			var o = {};
			var href = $e.find('.r a').attr('href');
			o.href = url.resolve(options.url, href);
			o.text = $e.find('.r>a').text();
			o.img = $e.find('.l img')[0].attribs['data-src'];
			o.author = $e.find('.l img')[0].attribs['data-src'];
			topics.push(o);
			var fileName = parseUrlForFileName(o.img);
			downloadImg(o.img, fileName)
		})

		topics = JSON.stringify(topics);
		fs.writeFile('../myNode/public/crawlerData/acfun.json', topics, function(err) {
			if (err) throw err;
			console.log('json saved!');
		});


	} else {
		console.log('出错啦！出错代码：' + res.statusCode)
	}
})


function parseUrlForFileName(address) {
	var fileName = path.basename(address);
	return fileName;
}

var downloadImg = function(uri, filename) {
		request.head(uri, function(err, res, body) {

			if (err) {
				console.log('err:' + err);
				return false;
			}
			request(uri).pipe(fs.createWriteStream('../myNode/public/images/' + filename)).on('close', function() {
				console.log(filename + ' done!')
			})


		})
	}
	// 定义好我们 app 的行为之后，让它监听本地的 3000 端口。这里的第二个函数是个回调函数，会在 listen 动作成功后执行，我们这里执行了一个命令行输出操作，告诉我们监听动作已完成。
	// app.listen(4000, function() {
	// 	console.log('app is listening at port 4000');
	// });