(function(u){var s=!!u._APPSPRESSO_DEBUG;var m={};var d=0;var r=1;var c=r;function v(){return c}function e(g){c=g}function f(){}function b(w,g){if(!w){throw new Error("assertion failed:"+g)}}function i(){if(d===c){var g=m.util.format.apply(null,arguments);console.log(g)}}function q(){if(s){var g=m.util.format.apply(null,arguments);console.log("[internal] "+g)}}function k(g){return(g!==undefined)&&(typeof g==="object")}function a(g){return Object.prototype.toString.call(g)==="[object Function]"}function n(g){return(typeof g==="string")||(g instanceof String)}function p(g){return(g!==undefined)&&(typeof g==="number")&&(!isNaN(g))}function j(g){return(g!==undefined)&&(typeof g==="boolean")}function l(g){return(g!==undefined)&&(g instanceof Array)}function h(g){return(g!==undefined)&&!n(g)&&!a(g)&&((g instanceof Array)||isFinite(g.length))}function t(g){this.target=g||{}}t.prototype.constant=function(g,w){if(!n(g)){throw new Error("invalid parameter: name")}this.target.__defineGetter__(g,function(){return w});return this};t.prototype.property=function(w,g,x){if(!n(w)){throw new Error("invalid parameter: name")}if(g){if(!a(g)){throw new Error("invalid parameter: getter")}this.target.__defineGetter__(w,g)}if(x){if(!a(x)){throw new Error("invalid parameter: setter")}this.target.__defineSetter__(w,x)}return this};t.prototype.method=function(g,w){if(!n(g)){throw new Error("invalid parameter: name")}if(!a(w)){throw new Error("invalid parameter: func")}this.target.__defineGetter__(g,function(){return w});return this};t.prototype.ns=function(g,y){var x,w,z=g.split(".");if(!y){y=u}for(x=0;x<z.length-1;x+=1){w=z[x];if(!y.hasOwnProperty(w)){y[w]={}}y=y[w]}w=z[x];y[w]=this.target;return this};t.prototype.mixin=function(x){if(x){var w,g;for(w in x){if(x.hasOwnProperty(w)){g=x[w];if(!this.target.hasOwnProperty(w)||(this.target[w]!==g)){this.target[w]=g}}}}return this};t.prototype.end=function(){return this.target};function o(g){return new t(g)}o(m).constant("MODE_DEBUG",d).constant("MODE_RELEASE",r).property("runMode",v,e).method("nop",f).method("assert",b).method("log",i).method("debug",q).method("isObject",k).method("isFunction",a).method("isString",n).method("isNumber",p).method("isBoolean",j).method("isArray",l).method("isArrayLike",h).method("def",o);o(u).constant("ax",m)}(window));(function(g){var _DEBUG=!!g._APPSPRESSO_DEBUG;var ax=g.ax;var util={};function evaluateJavaScript(script){var ret=eval("("+script+")");return ret}function decodeJSON(json){if(json===undefined||json===null||json===""){ax.debug("[W] decodeJSON(): json is null/undefined/empty");return{}}try{return evaluateJavaScript(json)}catch(e){ax.debug("[E] decodeJSON(): eval error {0}",e);throw ax.error(ax.INVALID_VALUES_ERR,e)}}function encodeJSON(obj){return JSON.stringify(obj)}function parseXML(xml){return new DOMParser().parseFromString(xml,"text/xml")}function foreach(obj,callback){if(!obj){return null}if(!callback){return null}var k,v;if(ax.isArrayLike(obj)){for(k=0;k<obj.length;k++){v=obj[k];if(callback(k,v)){return k}}}else{for(k in obj){if(obj.hasOwnProperty(k)){v=obj[k];if(callback(k,v)){return k}}}}return null}var DUMP_MAX_DEPTH=3;var DUMP_INDENT="\t";var DUMP_NEWLINE="\n";var DUMP_UNDEFINED="<<undefined>>";var DUMP_ARRAY="<<array>>";var DUMP_ARRAY_LIKE="<<array-like>>";var DUMP_FUNCTION="<<function>>";var DUMP_OBJECT="<<object>>";var DUMP_NULL="<<null>>";function dump(obj,depth,indent,newline,separator){if(typeof obj==="undefined"){return DUMP_UNDEFINED}if(obj===null){return DUMP_NULL}if(typeof obj==="string"){return['"',obj,'"'].join("")}if(typeof obj==="number"||typeof obj==="number"){return String(obj)}var props=[];if(!ax.isNumber(depth)){depth=DUMP_MAX_DEPTH}if(!ax.isString(indent)){indent=DUMP_INDENT}if(!ax.isString(newline)){newline=DUMP_NEWLINE}if(!ax.isString(separator)){separator=[",",newline,indent].join("")}if(ax.isArrayLike(obj)){if(depth<=0){if(ax.isArray(obj)){return DUMP_ARRAY}return DUMP_ARRAY_LIKE}foreach(obj,function(k,v){props.push(dump(v,depth-1,indent+indent))});return["[",newline,indent,props.join(separator),newline,"]"].join("")}if(typeof obj==="function"){return DUMP_FUNCTION}if(typeof obj==="object"){if(depth<=0){return DUMP_OBJECT}foreach(obj,function(k,v){props.push([k,dump(v,depth-1,indent+indent)].join(":"))});return["{",newline,indent,props.join(separator),newline,"}"].join("")}return obj.toString()}var AJAX_RETRY_DEFAULT=3;function ajax(args){var xhr=new XMLHttpRequest(),debug_time,retry=args.retry!==undefined?args.retry:(getConfig("ajaxRetry")||AJAX_RETRY_DEFAULT);xhr.onreadystatechange=function(){if(_DEBUG){}if(xhr.readyState===4){if(_DEBUG){ax.debug("ajax xhr.onreadystatechange: xhr.status={0}, elapse={1}ms",xhr.status,(new Date().getTime()-debug_time))}if(xhr.status===0){if((g.location.protocol==="file:")&&(args.url.indexOf("://")<0)){return args.onload(xhr)}if(retry){ax.debug("##### AJAX RETRY!!! ##### - "+retry);args.retry=--retry;return ajax(args)}}if(xhr.status>=200&&xhr.status<300){return args.onload(xhr)}else{return args.onerror(xhr)}}};if(_DEBUG){ax.debug("ajax: {0}",JSON.stringify(args));debug_time=new Date().getTime()}try{xhr.open(args.method||"GET",args.url,!!args.async);foreach(args.headers,function(k,v){xhr.setRequestHeader(k,v)});xhr.send(args.data)}catch(e){args.onerror(xhr,e)}return xhr}function format(text){if(arguments.length<2){return String(text)}var args=Array.prototype.slice.call(arguments,[1]);ax.util.foreach(args,function(k,v){text=text.replace(new RegExp("\\{"+k+"\\}","gi"),v)});return text}var INVALID_FUNCTION="<<invalid-function>>";var ANONYMOUS_FUNCTION="<<anonymous-function>>";var FUNCTION_REGEXP=/function\s+(\w+)/;function getFunctionName(func){if(!ax.isFunction(func)){return INVALID_FUNCTION}var match=FUNCTION_REGEXP.exec(func);return match?match[1]:ANONYMOUS_FUNCTION}function invokeLater(obj,func){var args=Array.prototype.slice.call(arguments,2);window.setTimeout(function(){try{func.apply(obj,args)}catch(e){ax.log("uncaught exception from function {1}: {0} ",e,getFunctionName(func))}},1)}function validateParam(param,mandatory,nullable,type,exception,name){var msg;if(undefined===param){if(mandatory){msg=format("{0}: mandatory parameter is omitted",name);ax.log(msg);if(exception){throw new ax.error(ax.INVALID_VALUES_ERR,msg)}return false}}else{if(null===param){if(!nullable){msg=format("{0}: parameter can not be null",name);ax.log(msg);if(exception){throw new ax.error(ax.INVALID_VALUES_ERR,msg)}return false}}else{if(typeof param!==type){if(type==="string"){return true}else{if(type==="number"){if(!isNaN(parseFloat(param))&&isFinite(param)){return true}}}msg=format("{0}: must be a {1} type",name,type);ax.log(msg);if(exception){throw new ax.error(ax.TYPE_MISMATCH_ERR,msg)}return false}}}return true}function validateInstance(value,constructor,exception,name){if(value&&!(value instanceof constructor)){if(exception){throw new ax.error(ax.TYPE_MISMATCH_ERR,name+": is not a "+getFunctionName(constructor))}return false}return true}var topics={};function subscribe(topic,callback){if(!topics[topic]){topics[topic]=[]}topics[topic].push(callback)}function unsubscribe(topic,callback){foreach(topics[topic],function(k,v){if(v===callback){topics[topic].splice(k,1);return true}})}function publish(topic,args){foreach(topics[topic],function(k,v){invokeLater(null,v,args)})}var INVALID_PATH_REGEX=/\/\/|\.\.|\.\/|^$|^\.$/;function isValidPath(){for(var i=0;i<arguments.length;i++){if(INVALID_PATH_REGEX.test(arguments[i])){return false}}return true}var configs={};function getConfig(key){return configs[key]}function setConfig(key,value){configs[key]=value}ax.def(util).method("evaluateJavaScript",evaluateJavaScript).method("encodeJSON",encodeJSON).method("decodeJSON",decodeJSON).method("parseXML",parseXML).method("foreach",foreach).method("dump",dump).method("ajax",ajax).method("format",format).method("getFunctionName",getFunctionName).method("invokeLater",invokeLater).method("validateParam",validateParam).method("validateInstance",validateInstance).method("subscribe",subscribe).method("unsubscribe",unsubscribe).method("publish",publish).method("isValidPath",isValidPath).method("getConfig",getConfig).method("setConfig",setConfig);ax.def(ax).constant("util",util)}(window));(function(d){var j=!!d._APPSPRESSO_DEBUG;var a=d.ax;var i={0:"UNKNOWN_ERR",1:"INDEX_SIZE_ERR",2:"DOMSTRING_SIZE_ERR",3:"HIERARCHY_REQUEST_ERR",4:"WRONG_DOCUMENT_ERR",5:"INVALID_CHARACTER_ERR",6:"NO_DATA_ALLOWED_ERR",7:"NO_MODIFICATION_ALLOWED_ERR",8:"NOT_FOUND_ERR",9:"NOT_SUPPORTED_ERR",10:"INUSE_ATTRIBUTE_ERR",11:"INVALID_STATE_ERR",12:"SYNTAX_ERR",13:"INVALID_MODIFICATION_ERR",14:"NAMESPACE_ERR",15:"INVALID_ACCESS_ERR",16:"VALIDATION_ERR",17:"TYPE_MISMATCH_ERR",18:"SECURITY_ERR",19:"NETWORK_ERR",20:"ABORT_ERR",21:"TIMEOUT_ERR",22:"INVALID_VALUES_ERR",24:"NOT_AVAILABLE_ERR",100:"IO_ERR",1000:"SYSTEM_ERR",1001:"UNEXPECTED_ERR"};var c=0;var b="UNKNOWN_ERR";function e(k,g,l){if(k instanceof Error){g=k.message||b;k=k.code||c}if(!a.isNumber(k)){k=c}if(!a.isString(g)){g=i[k]||b}Error.call(this,g);this.name="AxError";this.__defineGetter__("code",function(){return k});this.__defineGetter__("message",function(){return g});this.__defineGetter__("cause",function(){return l});this.toString=function(){return[this.name,": ",g,", code=[",k,": ",i[k],"], cause=[",l,"]"].join("")}}e.constructor=Error;e.prototype=new Error;e.toString=function(){return"function AxError() { [native code]  }"};function h(k,g,l){return new e(k,g,l)}function f(g){return g&&(g instanceof e)}a.util.foreach(i,function(g,l){var k=Number(g);a.def(e.prototype).constant(l,k);a.def(h).constant(l,k);a.def(a).constant(l,k)});a.def(a).method("error",h).method("isError",f).constant("AxError",e)}(window));(function(i){var o=!!i._APPSPRESSO_DEBUG;var a=i.ax;var j="/appspresso/plugin";var q="POST";var p=0;function h(t,s,g){this.id=t;this.method=s;if(o){a.debug("create AxRequest: id={0}, method={1}",t,s)}this.xhrArgs={method:i._APPSPRESSO_REQUEST_METHOD||q,async:true,url:i._APPSPRESSO_REQUEST_URL||(j+"/?id="+t),data:a.util.encodeJSON({id:t,method:s,params:g||[]})};this.xhr=null}function r(g){if(o){a.debug("{0} method did not return any value",g)}return a.error(a.UNKNOWN_ERR,"plugin did not return any value")}function c(g,s){if(o){a.debug("{0}: xhrArgs.onload() response.error.message = {1}",g,s.message)}return a.error(s.code,s.message)}function l(g){if(o){a.debug("{0}: xhrArgs.onload() response.result is undefined",g)}return a.error(a.UNKNOWN_ERR,"plug-in did not set result")}function d(g,s){if(o){a.debug("{0}: xhrArgs.onload() caught error. err = {1}",g,s)}return(a.isError(s))?s:a.error(a.UNKNOWN_ERR,"an error ocurred while unmarshaling")}function k(g,s){if(o){a.debug("{0}: xhrArgs.onerror() err = {1}",g,s)}return a.error(a.UNKNOWN_ERR,"failed to call plugin or navigate away from a page")}function b(){var g=null,s=null;if(o){a.debug("AxRequest.doSync()...url="+this.xhrArgs.url)}this.xhrArgs.async=false;this.xhrArgs.onload=function(v){try{if(o){a.debug("AxRequest.doSync() onload begin: xhr.responseText = {0}",v.responseText)}if(!v.responseText){s=r(this.method)}else{var t=a.util.decodeJSON(v.responseText);if(t.error){s=c("AxRequest.doSync()",t.error)}else{if(t.result===undefined){s=l("AxRequest.doSync()")}else{if(o){a.debug("AxRequest.doSync() onload: response.result = {0}",t.result)}g=t.result}}}}catch(u){s=d("AxRequest.doSync()",u)}if(o){a.debug("AxRequest.doSync(): onload end")}};this.xhrArgs.onerror=function(u,t){s=k("AxRequest.doSync()",t)};a.util.ajax(this.xhrArgs);if(s){throw s}return g}function e(s,t){var g=null,u=null;if(o){a.debug("AxRequest.doAsync()...")}this.xhrArgs.async=true;this.xhrArgs.onload=function(x){try{if(o){a.debug("AxRequest.doAsync() onload begin")}if(!x.responseText){u=r(this.method)}else{var v=a.util.decodeJSON(x.responseText);if(v.error){u=c("AxRequest.doAsync()",v.error)}else{if(v.result===undefined){u=l("AxRequest.doAsync()")}else{if(o){a.debug("AxRequest.doAsync(): onload response.result = {0}",v.result)}g=v.result}}}}catch(w){u=d("AxRequest.doAsync()",w)}if(u){a.util.invokeLater(null,t,u)}else{a.util.invokeLater(null,s,g)}if(o){a.debug("AxRequest.doAsync(): onload end")}};this.xhrArgs.onerror=function(w,v){u=k("AxRequest.doAsync()",v);a.util.invokeLater(null,t,u)};this.xhr=a.util.ajax(this.xhrArgs);return this.xhr}function n(){if(!this.xhr){if(o){a.debug("AxRequest.cancel(): No XHR to cancel. req id = {0}",this.id)}return false}if(this.xhr.readyState===4){if(o){a.debug("Can't cancel. Asynchronous operation alreay has been done")}return false}else{if(o){a.debug("AxRequest.cancel(): XHR opened but not yet sent. req id = {0}",this.id)}this.xhr.onreadystatechange=function(){if(o){a.debug("AxRequest.cancel(): abort() - onreadystatechange")}};try{this.xhr.abort();if(o){a.log("Asynchronous operation has been aborted")}return true}catch(g){if(o){a.debug("Error occurred while try to cancel asynchronous operation. err = {0}",g)}return false}}}a.def(h.prototype).method("doSync",b).method("doAsync",e).method("cancel",n);function f(s,g){return new h(++p,s,g)}function m(g){return g&&(g instanceof h)}a.def(a).method("request",f).method("isRequest",m)}(window));(function(r){var m=!!r._APPSPRESSO_DEBUG;var l=r.ax;var d={};var s=0;var h={};var t={};function j(g,u){if(g&&!l.isFunction(g)){throw l.error(l.TYPE_MISMATCH_ERR,"invalid success callback")}if(u&&!l.isFunction(u)){throw l.error(l.TYPE_MISMATCH_ERR,"invalid error callback")}}function b(u,g){if(!l.isString(u)){throw l.error(l.TYPE_MISMATCH_ERR,"invalid method name")}if(!l.isArray(g)){throw l.error(l.TYPE_MISMATCH_ERR,"invalid parameter")}}function q(u,g){b(u,g);return l.request(u,g).doSync()}function c(x,g,u,w){j(g,u);b(x,w);var v=l.request(x,w);v.doAsync(g,u);return v}function e(x,w,v){var g;var u=v?h:t;if(!u.hasOwnProperty(x)){if(m){l.debug("unknown watch id: {0}",x)}return}if(v){g=w.result}else{if(w.error){g=l.error(w.error.code,w.error.message)}else{if(m){l.debug("invoke error listener: error is null or undefined")}g=l.error(l.UNKNOWN_ERR,"unknown error")}}l.util.invokeLater(null,u[x],g)}function n(g,u){j(g,u);var v=++s;h[v]=g;t[v]=u;return v}function p(g){if(h.hasOwnProperty(g)){delete h[g]}if(t.hasOwnProperty(g)){delete t[g]}}function a(u,g){e(u,g,true)}function i(u,g){e(u,g,false)}function k(u,g){return n(u,g)}function f(g){p(g)}function o(u,g){a(u,g)}l.def(d).method("execSync",q).method("execAsync",c).method("addWatchListener",n).method("removeWatchListener",p).method("invokeWatchSuccessListener",a).method("invokeWatchErrorListener",i).method("addListener",k).method("removeListener",f).method("invokeListener",o);l.def(l).constant("bridge",d)}(window));(function(i){var l=!!i._APPSPRESSO_DEBUG;var a=i.ax;var e={};function c(g){this.prefix=g}function d(n,m){var g=[this.prefix,n].join(".");return a.bridge.execSync(g,m||[])}function f(p,g,n,o){var m=[this.prefix,p].join(".");return a.bridge.execAsync(m,g,n,o||[])}function j(q,g,m,p){if(p&&!a.isArray(p)){throw a.error(a.TYPE_MISMATCH_ERR,"invalid parameter. params must be an array")}var o=a.bridge.addWatchListener(g,m);var n=p?[o].concat(p):[o];a.bridge.execSync(q,n);return o}function k(m,g){a.bridge.execSync(m,[g]);a.bridge.removeWatchListener(g)}a.def(c.prototype).method("execSync",d).method("execAsync",f).method("watch",j).method("stopWatch",k);function h(g,n,m){if(!a.isString(g)){throw a.error(a.TYPE_MISMATCH_ERR,"invalid paramter: name")}if(!a.isObject(n)){throw a.error(a.TYPE_MISMATCH_ERR,"invalid parameter: obj")}if(l){a.debug("create a plugin: ",g)}var o=a.def(new c(g)).mixin(n).end();if(a.isString(m)){a.def(o).ns(m)}e[g]=o;return o}function b(g){return g&&(g instanceof c)}a.def(a).constant("AxPlugin",c).method("plugin",h).method("isPlugin",b)}(window));(function(S){var H=!!S._APPSPRESSO_DEBUG;var e=S.ax;var v=S.console;var y={};var r=0;var s=1;var D=2;var T=3;var u=4;var K=0;var Z=999;var j=K;function d(){return j}function b(g){j=g}function E(){return j<=r}function q(){return j<=s}function A(){return j<=D}function Y(){return j<=T}function k(){return j<=u}var Q=[];var P=10;var N=500;var L=null;var f="/appspresso/LOG$/";function F(){if(Q.length<=0){return}var g=[];e.util.foreach(Q,function(ac,ab){g.push([ab.level||D,ab.sequence||-1,S.encodeURIComponent(ab.file||S.location.pathname),ab.line||0,S.encodeURIComponent(ab.message||"")].join("/"))});Q.length=0;g=g.join("\n");var aa=new XMLHttpRequest();aa.onreadystatechange=function(){if(aa.readyState===0&&aa.status===404){v.log("[LOG]"+g)}};aa.open("POST",(S._APPSPRESSO_LOG_URL||f));aa.setRequestHeader("Content-Type","text/plain;charset=UTF-8");aa.send(g)}function m(g){Q.push(g);if(Q.length>P){F()}}function M(g){return e.util.dump(g,1,"",""," ")}function U(){L=setInterval(F,N)}function O(){clearInterval(L);L=null;F()}var C="/appspresso/CON$/";var t=500;var c=null;function h(ab,ac){var g;try{g=e.util.evaluateJavaScript("("+ab+")")}catch(aa){g=aa}m({level:D,sequence:ac,message:e.util.dump(g)})}var i="";function I(){var g=new XMLHttpRequest();g.onreadystatechange=function(){if(g.readyState===4&&g.status===200){if(!g.responseText){return}e.util.foreach(g.responseText.split("\n"),function(ac,ab){var ad=ab.split(" "),ae=ad.shift();if(ae==="evaluate"){e.util.invokeLater(null,h,S.decodeURIComponent(ad.join(" ")))}else{if(ae==="evaluateWithSequence"){var aa=parseInt(ad.shift());e.util.invokeLater(null,h,S.decodeURIComponent(ad.join(" ")),aa)}else{if(ae==="reissueSession"){if(V==="issuing"){return}V="revoked";p(e.util.getConfig("device"))}}}})}};g.open("POST",(S._APPSPRESSO_CONSOLE_URL||C));g.setRequestHeader("Content-Type","text/plain; charset=UTF-8");g.send("Session-Key="+i)}function o(){c=S.setInterval(I,t)}function X(){S.clearInterval(c);c=null}function W(g){m({level:D,message:e.util.dump(g)})}function l(){m({level:D,message:M(arguments)})}function w(){if(j>r){return}m({level:r,message:M(arguments)})}function x(){if(j>s){return}m({level:s,message:M(arguments)})}function R(){if(j>D){return}m({level:D,message:M(arguments)})}function n(){if(j>T){return}m({level:T,message:M(arguments)})}function B(){if(j>u){return}m({level:u,message:M(arguments)})}function J(){S.console={dir:W,log:l,trace:w,debug:x,info:R,warn:n,error:B};U();o()}function z(){S.console=v;O();X()}var a=e.def(e.plugin("ax.builtin.devicestatus",{})).method("vendor",function(){return this.execSync("getVendor")}).method("model",function(){return this.execSync("getModel")}).end();var V="absence";function p(g){V="issuing";var aa=new XMLHttpRequest();aa.onreadystatechange=function(){if(aa.readyState===4){if(aa.status===200){i=aa.responseText;V="valid"}else{V="absence"}}};aa.open("POST",S._APPSPRESSO_DEBUG_SESSION_ISSUE_URL);aa.setRequestHeader("Content-Type","text/plain; charset=UTF-8");aa.send(JSON.stringify(g))}function G(){var g={name:[a.model(),a.vendor()].join("@"),width:S.screen.availWidth,height:S.screen.availHeight,port:location.port};e.util.setConfig("device",g);p(g)}e.def(y).constant("LEVEL_NONE",Z).constant("LEVEL_TRACE",r).constant("LEVEL_DEBUG",s).constant("LEVEL_INFO",D).constant("LEVEL_WARN",T).constant("LEVEL_ERROR",u).constant("LEVEL_ALL",K).property("level",d,b).property("traceEnabled",E).property("debugEnabled",q).property("infoEnabled",A).property("warnEnabled",Y).property("errorEnabled",k).method("trace",w).method("debug",x).method("info",R).method("warn",n).method("error",B).method("startRedirect",J).method("stopRedirect",z).method("initDebugSession",G);e.def(e).constant("console",y)}(window));(function(b){var d=!!b._APPSPRESSO_DEBUG;var c=b.ax;var a={};c.def(c).constant("event",a)}(window));(function(c){var f=!!c._APPSPRESSO_DEBUG;var e=c.ax;var h="/config.xml";var d=null;function b(){var g=this;e.util.ajax({url:c._APPSPRESSO_CONFIG_XML_URL||h,method:"GET",async:false,onload:function(w){var x=w.responseXML||e.util.parseXML(w.responseText);var m=x.documentElement;var k=m.getAttribute("id");var q=m.getAttribute("version");var l=parseInt(m.getAttribute("width"),10);var v=parseInt(m.getAttribute("height"),10);var i,s;var j=m.getElementsByTagName("name");if(j&&j.length>0){i=j[0].textContent;s=j[0].getAttribute("short")}var p,u,r;var n=m.getElementsByTagName("author");if(n&&n.length>0){p=n[0].textContent;u=n[0].getAttribute("email");r=n[0].getAttribute("href")}var t;var o=m.getElementsByTagName("description");if(o&&o.length>0){t=o[0].textContent}(function(D){function C(){return this.execSync("length",[])}function B(G){return this.execSync("key",[G])}function F(H){var G=this.execSync("getItem",[H]);return G}function z(G,H){this.execSync("setItem",[G,H])}function E(H){var G=this.execSync("removeItem",[H]);return G}function y(){this.execSync("clear",[])}var A=e.def(e.plugin("ax.w3.widget.preferences",{})).property("length",C).method("key",B).method("getItem",F).method("setItem",z).method("removeItem",E).method("clear",y).end();e.def(D).constant("preferences",A)})(g);e.def(g).constant("author",p||"").constant("description",t||"").constant("name",i||"").constant("shortName",s||"").constant("version",q||"").constant("id",k||"").constant("authorEmail",u||"").constant("authorHref",r||"").constant("width",l).constant("height",v)},onerror:function(j,i){throw e.error(e.UNEXPECTED_ERR,"failed to parse widget config",i)}})}function a(){if(!d){d=new b()}return d}e.def(c).property("widget",a)}(window));