# 玉珏念北Gulp前端自动化

## Gulp代码检测 (jsHint版)

## Gulp bower下载插件

## Gulp 自动监测文件变化 (watch)

## Gulp 代码压缩 (压缩JS、Css、Html)

## Gulp 单元测试（基于mocha的单元测试）

## Gulp 自动添加版本号（对文件自动添加版本）

## Gulp git链接（暂无）

> 基于[gulp-rev](https://github.com/sindresorhus/gulp-rev) + [gulp-rev-collector](https://github.com/shonny-ua/gulp-rev-collector)根据文件MD5值自动添加版本号，提供修改插件改变`xxx-md5.xx`为`xxx.xx?v=md5`方法    
   
> [Autoprefixer](https://github.com/sindresorhus/gulp-autoprefixer)自动添加浏览器厂商兼容前缀

## 安装

	npm install / cnpm install
> 建议使用淘宝镜像

	npm bower / bower update
> 安装bower插件

##  使用

	gulp / npm test  //测试环境
	gulp build / npm run build  //正式发布
	gulp clean  //清除缓存

##  配置
###  代码压缩	
	生产/测试环境下  condition = false; 不对js css html压缩
	正式发布环境下  condition = true; 对js css html压缩
<p>
	<a title="CII Best Practices">注意：先运行测试环境才能正式发布</a>
</p>

###  文件版本管理

####  默认结果(`xxx-md5.xx`)：
	
	"/css/style.css" => "/dist/css/style-1d87bebe.css"    
	"/js/script1.js" => "/dist/script1-61e0be79.js"    
	"cdn/image.gif"  => "//cdn8.example.dot/img/image-35c3af8134.gif"

#### 高级配置(`xxx.xx?v=md5`):

1. 打开`node_modules\gulp-rev\index.js`

	>第133行 `manifest[originalFile] = revisionedFile;`    
	更新为: `manifest[originalFile] = originalFile + '?v=' + file.revHash;`

2. 打开`nodemodules\gulp-rev\nodemodules\rev-path\index.js`

	>10行 `return filename + '-' + hash + ext;`     
    更新为: `return filename + ext;`

3. 打开`node_modules\gulp-rev-collector\index.js`

	>31行 `if ( path.basename(json[key]).replace(new RegExp( opts.revSuffix ), '' ) !== path.basename(key) ) {`    
     更新为: `if ( path.basename(json[key]).split('?')[0] !== path.basename(key) ) {`
	
#### 输出：

	background: url('../img/one.jpg?v=28bd4f6d18');
	
	href="css/main.css?v=885e0e1815"

	src: url('/fonts/icomoon.eot?v=921bbb6f59');
	src="js/main.js?v=10ba7be289"
	src="img/one.jpg?v=28bd4f6d18"

	

	
