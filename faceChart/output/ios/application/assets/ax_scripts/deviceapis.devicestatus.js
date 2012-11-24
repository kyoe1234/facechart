(function(v){var r=!!v._APPSPRESSO_DEBUG;var m=v.ax;var s=v.deviceapis;var x=0;var k={};var A=50;var B=30000;function p(g){return(g===null||g===undefined)?g:g+""}function f(g){return{aspect:p(g.aspect),property:p(g.property),component:p(g.component?g.component:"_default")}}function c(g){m.util.validateRequiredObjectParam(g);m.util.validateRequiredStringParam(g.aspect);m.util.validateRequiredStringParam(g.property);m.util.validateOptionalStringParam(g.component)}function w(C){var g=0,D=0,E=0;m.util.validateOptionalObjectParam(C);if(C){m.util.validateOptionalNumberParam(C.minNotificationInterval);m.util.validateOptionalNumberParam(C.maxNotificationInterval);m.util.validateOptionalNumberParam(C.minChangePercent);if(C.maxNotificationInterval&&C.maxNotificationInterval<C.minNotificationInterval){throw new DeviceAPIError(m.INVALID_VALUES_ERR,"maxNotificationInterval must be greater than minNotificationInterval")}g=C.minNotificationInterval?C.minNotificationInterval-0:0;D=C.maxNotificationInterval?C.maxNotificationInterval-0:0;E=C.minChangePercent?C.minChangePercent-0:0}return{minNotificationInterval:g,maxNotificationInterval:D,minChangePercent:E}}function b(g){m.util.validateRequiredStringParam(g);return p(g)}function l(g){m.util.validateOptionalStringParam(g);return p(g)}function q(){}var i="getComponents";function u(C){C=b(C);var g=this.execSyncWAC(i,[C]);return(g===undefined||g===null)?null:g}var a="isSupported";function z(g,C){g=b(g);C=l(C);return this.execSyncWAC(a,[g,C])}var n="getPropertyValue";function t(g,C,D){c(D);D=f(D);return this.execAsyncWAC("getPropertyValue",function(E){g(E,D)},C,[D])}var o="watchPropertyChange";function j(g){var C={minNotificationInterval:A,maxNotificationInterval:Number.MAX_VALUE,minChangePercent:0};if(g.minNotificationInterval&&g.minNotificationInterval>A){C.minNotificationInterval=g.minNotificationInterval}if(g.maxNotificationInterval){if(g.maxNotificationInterval>C.minNotificationInterval){C.maxNotificationInterval=g.maxNotificationInterval}else{C.maxNotificationInterval=C.minNotificationInterval+20}}if(g.minChangePercent){C.minChangePercent=g.minChangePercent}return C}function h(D,g,C,F,G,E){(function(){var H,O;var M=g,L=C,J=F,P=G;var Q=j(E);var K=Q.minChangePercent;var I=true;function N(R,S){H=R;O=S;m.util.invokeLater(null,L,R,G)}k[M]=window.setInterval(function(){var V,T,S,R=D;try{V=R.execSyncWAC(n,[P,M,I]);I=false}catch(U){window.clearInterval(M);m.util.invokeLater(null,J,U);return}T=Date.now();S=T-O;if(H===undefined||Q.maxNotificationInterval<S){N(V,T)}else{if(K&&typeof V=="number"){var W=K?H*(K/100):0;if((H+W)<V||V<(H-W)){N(V,T)}}else{if(H!=V){N(V,T)}}}},Q.minNotificationInterval)})()}function y(g,C,F,D){m.util.validateRequiredFunctionParam(g);m.util.validateOptionalFunctionParam(C);var E;c(F);F=f(F);D=w(D);E=x++;if(C==null||C==undefined){C=function(G){m.console.warn("error callback was ignored: error="+G)}}h(this,E,g,C,F,D||{});return E}var e="clearPropertyChange";function d(g){m.util.validateRequiredNumberParam(g);if(!(g in k)){throw new DeviceAPIError(m.INVALID_VALUES_ERR,"invalid watchHandler")}window.clearInterval(k[g]);delete k[g];this.execSyncWAC(e,[g-0])}window.addEventListener("unload",function(){for(var C in k){try{devicestatus.stopWatchWAC(e,[C-0])}catch(g){}}},false);q.prototype=m.plugin("deviceapis.devicestatus",{getComponents:u,isSupported:z,getPropertyValue:t,watchPropertyChange:y,clearPropertyChange:d});m.def(v).constant("DeviceStatusManager",q);m.def(s).constant("devicestatus",new q())}(window));