/**************** Page *******************************/
var wrlBasicPage;
var storageSSID24,storageSSID24En;
var noencryption = "Wi-Fi不加密，有被人蹭网的风险，建议设置Wi-Fi加密。"
var wpa3sae = "请确认接入终端支持WPA3-SAE模式。使用中如遇到设备连接问题，建议切回WPA2-PSK。"
var wpa3saewpa2psk = "请确认接入终端支持WPA3-SAE/WPA2-PSK混合模式。使用中如遇到设备连接问题，建议切回WPA2-PSK。"
var G = {};
var pageview = R.pageView({ //页面初始化
	init: initPage
}); //page view

//page model
var pageModel = R.pageModel({
	getUrl: "goform/WifiBasicGet", //获取数据接口
	setUrl: "goform/WifiBasicSet", //提交数据接口
	translateData: function (data) { //数据转换
		var newData = {};
		newData.wrlBasic = data;
		return newData;
	},
	afterSubmit: function (str) { //提交数据回调
		callback(str);
	}
});

//页面逻辑初始化
function initPage() {
	$.validate.valid.ssid = {
		all: function (str) {
			var ret = this.specific(str);
			//ssid 前后不能有空格，可以输入任何字符包括中文，仅32个字节的长度
			if (ret) {
				return ret;
			}

			/*if (str.charAt(0) == " " || str.charAt(str.length - 1) == " ") {
				return _("The first and last characters of WiFi Name cannot be spaces.");
			}*/

			if (getStrByteNum(str) > 32) {
				return _("The WiFi name can contain only a maximum of %s bytes.", [32]);
			}
		},
		specific: function (str) {
			var ret = str;
			if ((null == str.match(/[^ -~]/g) ? str.length : str.length + str.match(/[^ -~]/g).length * 2) > 32) {
				return _("The WiFi name can contain only a maximum of %s bytes.", [32]);
			}
		}
	};
	$.validate.valid.ssidPwd = {
		all: function (str) {
			var ret = this.specific(str);

			if (ret) {
				return ret;
			}
			if ((/^[0-9a-fA-F]{1,}$/).test(str) && str.length == 64) { //全是16进制 且长度是64

			} else {
				if (str.length < 8 || str.length > 63) {
					return _("The password must consist of %s-%s characters.", [8, 63]);
				}
			}
			//密码不允许输入空格
			//if (str.indexOf(" ") >= 0) {
			//	return _("The WiFi password cannot contain spaces.");
			//}
			//密码前后不能有空格
			/*if (str.charAt(0) == " " || str.charAt(str.length - 1) == " ") {
				return _("The first and last characters of WiFi Password cannot be spaces.");
			}*/
		},
		specific: function (str) {
			var ret = str;
			if (/[^\x00-\x80]/.test(str)) {
				return _("Invalid characters are not allowed.");
			}
		}
	};

	$("#save").on("click", function () {
		G.validate.checkAll();
	});
}

//提交回调
function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;
	top.showSaveMsg(num);
	if (num == 0) {
		$("#wrl_submit").blur();
		top.wrlInfo.initValue();
		top.staInfo.initValue();
	}
}

/****************** Page end ********************/

/****************** Module wireless setting *****/

var view = R.moduleView({
	initHtml: initHtml,
	initEvent: initEvent
});

var moduleModel = R.moduleModel({
	initData: initValue,
	getSubmitData: function () { //获取模块提交数据

		getCheckbox(["hideSsid", "hideSsid_5g"]);

		var dataObj = {
				"doubleBand":$("#doubleBandEn").attr("class").indexOf("btn-off") == -1 ? "1":"0",
				"wrlEn": $('[name="wrlEn"]').val(),
				"wrlEn_5g": $('[name="wrlEn_5g"]').val(),
				"security": $("#security").val(),
				"security_5g": $("#security_5g").val(),
				"ssid": $("#ssid").val(),
				"ssid_5g": $("#ssid_5g").val(),
				"hideSsid": $("#hideSsid").val(),
				"hideSsid_5g": $("#hideSsid_5g").val(),
				"wrlPwd": $("#wrlPwd").val(),
				"wrlPwd_5g": $("#wrlPwd_5g").val()
			},
			dataStr;
		if(dataObj.doubleBand == "1"){  //双频优选开启时  5g信息保持和24g一样
			for(prop in dataObj){
				if(prop.indexOf("_5g")){
					dataObj[prop] = dataObj[prop.replace(/_5g/,"")];
				}
			}
		}
		//如果当前省份为陕西时可以更改ssidList
		if(G.provinceCode == 'SHA'){
			dataObj.ssidEn_1 = $("#ssidEn_1").val();
			dataObj.ssidEn_5 = $("#ssidEn_5").val()
			for(var i = 1;i<=8;i++){
				if(i==1 || i==5){
					continue
				}
				dataObj['ssidEn_'+i] = $("#ssidEn_"+i).val();
				dataObj['ssid_'+i] = $("#ssid_"+i).val();
				dataObj['security_'+i] = $("#security_"+i).val();
				dataObj['wrlPwd_'+i] = $("#wrlPwd_"+i).val();
				// dataObj.ssidList.push({
				// 	['ssid_'+i]:$("#ssid_"+i).val(),
				// 	['security_'+i]:$("#security_"+i).val(),
				// 	['wrlPwd_'+i]:$("#wrlPwd_"+i).val(),
				// })
			}
		}

		dataStr = objTostring(dataObj);
		return dataStr;
	}
});
//模块注册
R.module("wrlBasic", view, moduleModel);

//初始化页面
function initHtml() {
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
}

//事件初始化
function initEvent() {
	$('[name^="wrlEn"]').on("click", function () {
		var setVal = $(this).hasClass("btn-off") ? 1: 0;
		var _name = $(this).attr("name");
		changeWireEn(_name, setVal);
	});
	$('[name^="ssidEn"]').on("click", function () {
		var setVal = $(this).hasClass("btn-off") ? 1: 0;
		var _name = $(this).attr("name");
		if(_name =="ssidEn_1"){
			setVal == "1" ? $("#ssid1_content").show() : $("#ssid1_content").hide()
		}else if(_name == "ssidEn_5"){
			setVal == "1" ? $("#ssid5_content").show() : $("#ssid5_content").hide()
		}
		changeSsidListEn(_name, setVal);
	});

	$("#doubleBandEn").on("click",changeDoubleBand);

	$("select").on("change", function () {
		if ($(this).val() === "none") {
			$(this).parent().parent().next().find("input").val("").attr("disabled", true);
			$(this).parent().parent().next().find("input").removeValidateTip(true).removeClass("validatebox-invalid");
			$(this).siblings("span").html(noencryption)
		} else {
			$(this).parent().parent().next().find("input").attr("disabled", false);
			// switch ($(this).val()) {
			// 	case "wpa3sae":
			// 		$(this).siblings("span").html(wpa3sae)
			// 		break;
			// 	case "wpa3saewpa2psk":
			// 		$(this).siblings("span").html(wpa3saewpa2psk)
			// 		break;
			// 	default:
			// 		$(this).siblings("span").html("");
			// }
		}
		isTkip();
	});
	$("#wrlEn,#wrlEn_5g,#doubleBandEn").on("click", isTkip);
	top.loginOut();
	checkData();
}


// 当无线加密类型都为TKIP时，提醒用户会关闭WPS功能
function isTkip() {
	var wrlEn = $("#wrlEn").val(),
		wrlEn_5g = $("#wrlEn_5g").val(),
		doubleBandEn = $("#doubleBandEn").val(),
		// crypto = $("#crypto").val(),
		// crypto_5g = $("#crypto_5g").val(),
		security = $("#security").val(),
		security_5g = $("#security_5g").val(),
		// msg = _("After setting TKIP encryption, you will not be able to use the WPS function");
		msg = "";
	$("#wrl_save_msg").html("");

	//启用的无线中选择TKIP，则显示msg
	//2.4G选择TKIP
	if (wrlEn === "1" && security != "none") {
		$("#wrl_save_msg").html(msg);
	} else if (doubleBandEn !== "1") { //双频关闭时，5G开启且选择TKIP
		if (wrlEn_5g === "1" && security_5g != "none") {
			$("#wrl_save_msg").html(msg);
		}
	}
}

// function init_security() {
//     var wrlEn_5g = $('[name="wrlEn_5g"]');
//     var wrlEn = $('[name="wrlEn"]');
//     if ($("#security").val() == "none" || wrlEn.hasClass("btn-off")) {
//         $("#crypto").parent().parent().addClass("none");
//     } else {
//         $("#crypto").parent().parent().removeClass("none");
//     }
//     if ($("#security_5g").val() == "none" || wrlEn_5g.hasClass("btn-off")) {
//         $("#crypto_5g").parent().parent().addClass("none");
//     } else {
//         $("#crypto_5g").parent().parent().removeClass("none");
//     }
// }


// function changeSecurity
//模块数据验证
function checkData() {
	G.validate = $.validate({
		custom: function () {
			//if ($("#wrlEn").hasClass("btn-on")) {
			if (($("#security").val() !== "none") && ($("#wrlPwd").val() === "")) {
				return _("Please specify your 2.4 GHz WiFi password.");
			}
			//}

			//if ($("#wrlEn_5g").hasClass("btn-on")) {
			if (($("#security_5g").val() !== "none") && ($("#wrlPwd_5g").val() === "")) {
				return _("Please specify your 5 GHz WiFi password.");
			}
			//}
		},

		success: function () {
			wrlBasicPage.submit();
		},

		error: function (msg) {
			if (msg) {
				$("#wrl_save_msg").html(msg);
				setTimeout(function () {
					$("#wrl_save_msg").html("&nbsp;");
				}, 3000);
			}
			return;
		}
	});
}
function initDoubleBand(en){
	var $ssid2Elem = $('[name="wrlEn"]');
	if(en == "0"){//双频合一关闭时   正常显示配置
		$("#doubleBandEn").removeClass("btn-on").addClass("btn-off");
		$("#5g_fieldset").removeClass("none");

		//显示ssidList
		if($('#wrlEn').val() != "0"){
			$("#domainSSIDWrap").show();
		}
		if($('#wrlEn_5g').val() != "0"){
			$("#domainSSIDWrap_5G").show();
		}
	}else{//双频优选合一时，只显示2.4G
		$("#doubleBandEn").removeClass("btn-off").addClass("btn-on");
		$("#5g_fieldset > .control-group").addClass("none");
		$("#ssidText").html(_("Enable WiFi Network")); //TODO

		//	$("#ssid_5g").val(storageSSID24 + "_5G");

		//2.4G开关
		if (storageSSID24En === "0") {
			$ssid2Elem.attr("class", "btn-off").val(0);
			$ssid2Elem.parent().parent().nextAll().addClass("none").val(1);
		} else {
			$ssid2Elem.attr("class", "btn-on");
			$ssid2Elem.parent().parent().nextAll().removeClass("none");
		}

		//隐藏ssidList
		//显示ssidList
		$("#domainSSIDWrap").hide();
		$("#5g_fieldset").hide();
	}
}

function changeDoubleBand(){
	var enabled = $("#doubleBandEn").attr("class").indexOf("btn-off");
	var ssidVal = $("#ssid").val();
	if(enabled == -1){//开启 => 关闭
		$("#doubleBandEn").removeClass("btn-on").addClass("btn-off");
		$("#doubleBandEn").val(0);
		$("#5g_fieldset > .control-group").removeClass("none");
		$("#ssidText").html(_("2.4 GHz Network"));
		$("#ssid").val(ssidVal);

		//ssid中有2.4G时，替换为5G
		if(/(2\.4G)/ig.test(ssidVal)) {
			$("#ssid_5g").val(ssidVal.replace(/(2\.4[G|g])/g, "5G"));
		} else {
			//否则后面直接加-5G
			$("#ssid_5g").val(ssidVal.slice(0,29) + "-5G");
		}

		//切换时默认开启无线开关
		changeWireEn("wrlEn", 1);
		changeWireEn("wrlEn_5g", 1);

		//显示ssidList与
		$("#domainSSIDWrap").show();
		$("#5g_fieldset").show();
		if(G.provinceCode == 'SHA'){
			$("#ssid_1_btn").show();
			$("#ssid_5_btn").show();
		}

	}else{//关闭 =》开启
		//2.4G一定开启
		$("#doubleBandEn").removeClass("btn-off").addClass("btn-on");
		$("#doubleBandEn").val(1);
		$("#5g_fieldset > .control-group").addClass("none");
		$("#ssidText").html(_("Enable WiFi Network"));

		//storageSSID24 = $("#ssid").val();
		//$("#ssid").val(storageSSID24.slice(0,storageSSID24.length).replace(/-2.4[g|G]/g,"").replace(/_2.4[g|G]/g,""));
		//切换时默认开启无线开关
		changeWireEn("wrlEn", 1);
		//隐藏ssidList
		$("#domainSSIDWrap").hide();
		$("#5g_fieldset").hide();
		$("#ssid_1_btn").hide();
	}
}

//设置
function changeWireEn(_name, setVal) {
	var enabled = $("#doubleBandEn").attr("class").indexOf("btn-off");
	var $elem = $("[name=" +_name+ "]");
	$elem.attr("class", setVal === 1 ? "btn-on": "btn-off").val(setVal);
	if (setVal === 1) {
		$elem.parent().parent().nextAll().removeClass("none");
		if(_name == 'wrlEn' && enabled!="-1"){
			$("#domainSSIDWrap").show()
			if(G.provinceCode == 'SHA'){
				$('#ssid_1_btn').show()
			}
		}else if(_name == 'wrlEn_5g' && enabled!="-1"){
			$("#domainSSIDWrap_5G").show()
			if(G.provinceCode != 'SHA'){
				$("#ssid5_content").show()
			}
		}
	} else {
		$elem.parent().parent().nextAll().addClass("none");
		if(_name == 'wrlEn'){
			$("#domainSSIDWrap").hide()
			$('#ssid_1_btn').hide()
		}else if (_name =='wrlEn_5g'){
			$("#domainSSIDWrap_5G").hide()
			$("#ssid5_content").hide()
		}
	}
	top.initIframeHeight();
}

//设置各ssidList开关控制
function changeSsidListEn(_name, setVal){
	var bodyName = _name + '_content'
	var $elem = $("[name=" +_name+ "]");
	var $bodyElem = $("#"+bodyName)
	$elem.attr("class", setVal === 1 ? "btn-on": "btn-off").val(setVal);
	setVal === 1 ? $bodyElem.show(): $bodyElem.hide()
}

function initEn(ele, en) {
	if (en === "on") {
		ele.attr("class", "btn-on");
		ele.val(1);
		ele.parent().parent().nextAll().removeClass("none");
	} else {
		ele.attr("class", "btn-off");
		ele.val(0);
		ele.parent().parent().nextAll().addClass("none");
	}
}

function initValue(obj) {
	inputValue(obj);
	initDomainSSID(obj);
	G.provinceCode = obj.province_code
	if(obj.province_code == 'SHA' && obj.doubleBand != "1"){
		$('#ssidEn_1').attr("class", obj.ssidEn_1 == "1" ? "btn-on": "btn-off").val(obj.ssidEn_1);
		$('#ssidEn_5').attr("class", obj.ssidEn_5 == "1" ? "btn-on": "btn-off").val(obj.ssidEn_5);
		if(obj.ssidEn_1 != "1"){
			$("#ssid1_content").hide();
		}
		if(obj.ssidEn_5 != "1"){
			$("#ssid5_content").hide();
		}

		$('#ssid_1_btn').show()
		$('#ssid_5_btn').show()

	}
	if(obj.wrlEn == "0"){
		$("#domainSSIDWrap").hide()
	}
	if(obj.wrlEn_5g == "0"){
		$("#domainSSIDWrap_5G").hide()
	}
	if (obj.wrlEn === "1") {
		initEn($('[name="wrlEn"]'), "on");
	} else {
		initEn($('[name="wrlEn"]'), "off");
	}

	if (obj.wrlEn_5g === "1") {
		initEn($('[name="wrlEn_5g"]'), "on");
	} else {
		initEn($('[name="wrlEn_5g"]'), "off");
	}



	storageSSID24 = obj.ssid;
	storageSSID24En = obj.wrlEn;
	initDoubleBand(obj.doubleBand);

	$("#wrlPwd").initPassword("", false, false);
	$("#wrlPwd_5g").initPassword("", false, false);

	//mainPageLogic.validate.checkAll("wrl-form");
	if (obj.security === "none") {
		$("#wrlPwd").val("").attr("disabled", true);
		$("#securityTip").html(noencryption)
		if ($("#wrlPwd_").length > 0) {
			$("#wrlPwd_").val("").attr("disabled", true);
		}
	} else {
		$("#wrlPwd").attr("disabled", false);
		switch (obj.security) {
			case "wpa3sae":
				$("#securityTip").html(wpa3sae)
				break;
			case "wpa3saewpa2psk":
				$("#securityTip").html(wpa3saewpa2psk)
				break;
			default:
				$("#securityTip").html("");
		}
		if ($("#wrlPwd_").length > 0) {
			$("#wrlPwd_").attr("disabled", false);
		}
	}
	if (obj.security_5g === "none") {
		$("#wrlPwd_5g").val("").attr("disabled", true);
		$("#securityTip_5g").html(noencryption);
		if ($("#wrlPwd_5g_").length > 0) {
			$("#wrlPwd_5g_").val("").attr("disabled", true);
		}
	} else {
		$("#wrlPwd_5g").attr("disabled", false);
		switch (obj.security_5g) {
			case "wpa3sae":
				$("#securityTip_5g").html(wpa3sae)
				break;
			case "wpa3saewpa2psk":
				$("#securityTip_5g").html(wpa3saewpa2psk)
				break;
			default:
				$("#securityTip_5g").html("");
		}

		if ($("#wrlPwd_5g_").length > 0) {
			$("#wrlPwd_5g_").attr("disabled", false);
		}
	}

	//mesh模式下固定为WPA2，且不可修改
	if (top.wrlInfo.data.meshEn === "1") {
		$("#security, #security_5g").val("wpa2psk").prop("disabled", "disabled");
		$("#wrlPwd, #wrlPwd_5g").attr("disabled", false);
	}

	if (obj.hideSsid == 1) {
		$("#hideSsid")[0].checked = true;
	} else {
		$("#hideSsid")[0].checked = false;
	}
	if (obj.hideSsid_5g == 1) {
		$("#hideSsid_5g")[0].checked = true;
	} else {
		$("#hideSsid_5g")[0].checked = false;
	}
	isTkip();
}
/**
 * [initDomainSSID 处理多SSID]
 *
 * @param {[Object]} obj [从CGI获取到的多SSID数据]
 *
 */
function initDomainSSID(obj) {
	if(obj.province_code == "SHA"){
		$('.SHA').show();
		initSHASsid(obj.ssidList,"domainSSIDWrap");
		initSHASsid(obj.ssidList_5g,"domainSSIDWrap_5g")
	}else{
		//2.4G多SSID显示
		initSSID(obj.ssidList, "domainSSIDWrap");
		//5G多SSID显示
		initSSID(obj.ssidList_5g, "domainSSIDWrap_5G");
	}
}

/**
 * [initSSID 初始化]
 *
 * @param {Array} arr [多SSID列表]
 * arr = [{
		"enable":"1", //开关
		"ssid_5g":"ssid2", //ssid名称
		"security_5g":"none", //加密方式
		"wrlPwd_5g":"12345678", //密码
		"crypto_5g":"" //加密类型
   }]
 * @param {String} elemID [外层div id]
 *
 */
function 		initSSID(arr, elemID) {
	//值类型与字段描述对应关系
	var map = {
			"enable": "SSID",
			"ssid": "无线名称",
			"security": "加密方式",
			"wrlPwd": "无线密码",
			// "crypto": "加密类型"
		},
		//加密方式的传值与显示内容的对应关系
		secuMap = {
			"none": _("None"),
			"wpapsk": _("WPA-PSK"),
			"wpa2psk": _("WPA2-PSK"),
			"wpawpa2psk": _("WPA/WPA2-PSK (recommended)")
		}, str;

	arr.forEach(function (obj, index) {
		var band = ("ssid" in obj) ? "2g" : "5g", //判断是2.4G还是5G
			//建立映射关系【字段 -> 名称显示及对应的值】
			obj1 = {
				"enable": {
					"name": map["enable"] + (index + (band==="2g"?2:6)),
					"value": obj.enable === "1" ? _("开启") : _("关闭")
				},
				"ssid": {
					"name": map["ssid"],
					"value": band === "2g" ? obj.ssid : obj.ssid_5g
				},
				"secu": {
					"name": map["security"],
					"value": secuMap[band === "2g" ? obj.security : obj.security_5g]
				},
				"pwd": {
					"name": map["wrlPwd"],
					"value": band === "2g" ? obj.wrlPwd : obj.wrlPwd_5g
				}
				// "crypto": {
				//     "name": map["crypto"],
				//     "value": band === "2g" ? obj.crypto.toUpperCase() : obj.crypto_5g.toUpperCase()
				// }
			},
			secuName = band === "2g" ? "security" : "security_5g";

		str = "";
		for (var prop in obj1) {
			//下发的密码为none时，不显示密码及加密方式
			if (obj[secuName] === "none" && (prop === "pwd")) {
				continue;
			}
			str += '<div class="control-group">';
			str += '<label class="control-label">' + obj1[prop]["name"] + '</label>';
			str += '<div class="controls" style="margin-top:5px;">';
			str += obj1[prop]["value"];
			str += '</div></div>';
		}
		//开启时才显示该信号相关值
		obj.enable === "1" && $("#" + elemID).append(str);
	});
}

//陕西省份特殊处理ssidList显示
function initSHASsid(arr,elemID){
	var addNum = (elemID == "domainSSIDWrap"? 2:6);
	arr.forEach(function(item,index){
		var ssidEnName = 'ssidEn_' + (index+addNum)
		var ssidNum = addNum + index;
		$('#' + ssidEnName).attr("class", item.enable == "1" ? "btn-on": "btn-off").val(item.enable);
		if(item.enable == "1"){
			$("#" + ssidEnName + "_content").show()
		}else{
			$("#" + ssidEnName + "_content").hide()
		}
		if(addNum ==2){
			$("#ssid_"+ ssidNum).val(item.ssid)
			$("#security_"+ ssidNum).val(item.security)
			if(item.wrlPwd){
				$("#wrlPwd_"+ ssidNum).val(item.wrlPwd)
			}else{
				$("#security_"+ ssidNum).siblings("span").html(noencryption)
				$("#wrlPwd_"+ ssidNum).attr("disabled","disabled")
			}
		}else{
			$("#ssid_"+ ssidNum).val(item.ssid_5g)
			$("#security_"+ ssidNum).val(item.security_5g)
			if(item.wrlPwd_5g){
				$("#wrlPwd_"+ ssidNum).val(item.wrlPwd_5g)
			}else{
				$("#security_"+ ssidNum).siblings("span").html(noencryption)
				$("#wrlPwd_"+ ssidNum).attr("disabled","disabled")
			}
		}
	})

}
/******************* Module wireless setting end ************/

window.onload = function () {
	$(function () {
		if (!Array.prototype.forEach) {
			Array.prototype.forEach = function forEach(callback1, thisArg) {
				var T, k;
				if (this === null) {
					throw new TypeError("this is null or not defined");
				}
				var O = Object(this);
				var len = O.length >>> 0;
				if (typeof callback1 !== "function") {
					throw new TypeError(callback1 + " is not a function");
				}
				if (arguments.length > 1) {
					T = thisArg;
				}
				k = 0;
				while (k < len) {

					var kValue;
					if (k in O) {
						kValue = O[k];
						callback1.call(T, kValue, k, O);
					}
					k++;
				}
			};
		}
	});
	wrlBasicPage = R.page(pageview, pageModel);
};
