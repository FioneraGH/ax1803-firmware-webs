/**************** Page *******************************/
var wrlGuestPage;
var wpa3sae = "请确认接入终端支持WPA3-SAE模式。使用中如遇到设备连接问题，建议切回WPA2-PSK。"
var wpa3saewpa2psk = "请确认接入终端支持WPA3-SAE/WPA2-PSK混合模式。使用中如遇到设备连接问题，建议切回WPA2-PSK。"
var G = {};
var pageview = R.pageView({ //页面初始化
	init: initPage
}); //page view

//page model
var pageModel = R.pageModel({
	getUrl: "goform/WifiGuestGet", //获取数据接口
	setUrl: "goform/WifiGuestSet", //提交数据接口
	translateData: function (data) { //数据转换
		var newData = {};
		newData.wrlGuest = data;
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

		var dataObj = {
				"guestEn": $('[name="guestEn"]').val(),
				"guestEn_5g": $('[name="guestEn_5g"]').val(),
				"guestSecurity": $("#guestSecurity").val(),
				"guestSecurity_5g": $("#guestSecurity_5g").val(),
				"guestSsid": $("#guestSsid").val(),
				"guestSsid_5g": $("#guestSsid_5g").val(),
				"guestWrlPwd": $("#guestWrlPwd").val(),
				"guestWrlPwd_5g": $("#guestWrlPwd_5g").val()
			},
			dataStr;
		dataStr = objTostring(dataObj);
		return dataStr;
	}
});
//模块注册
R.module("wrlGuest", view, moduleModel);

//初始化页面
function initHtml() {
	top.$(".main-dailog").removeClass("none");
	top.$(".save-msg").addClass("none");
}

//事件初始化
function initEvent() {
	$('[name^="guestEn"], [name^="guestEn_5g"]').on("click", function () {
		var setVal = $(this).hasClass("btn-off") ? 1 : 0;
		var _name = $(this).attr("name");
		changeWireEn(_name, setVal);
	});

	$("select").on("change", function () {
		if ($(this).val() === "none") {
			$(this).parent().parent().next().find("input").val("").attr("disabled", true);
			$(this).parent().parent().next().find("input").removeValidateTip(true).removeClass("validatebox-invalid");
			$(this).siblings("span").html('')
		} else {
			$(this).parent().parent().next().find("input").attr("disabled", false);
			switch ($(this).val()) {
				case "wpa3sae":
					$(this).siblings("span").html(wpa3sae)
					break;
				case "wpa3saewpa2psk":
					$(this).siblings("span").html(wpa3saewpa2psk)
					break;
				default:
					$(this).siblings("span").html("");
			}
		}
	});

	top.loginOut();
	checkData();
}
// function changeSecurity
//模块数据验证
function checkData() {
	G.validate = $.validate({
		custom: function () {
			//if ($("#wrlEn").hasClass("btn-on")) {
			if (($("#guestSecurity").val() !== "none") && ($("#guestWrlPwd").val() === "")) {
				return _("Please specify your 2.4 GHz WiFi password.");
			}
			//}

			//if ($("#wrlEn_5g").hasClass("btn-on")) {
			if (($("#guestSecurity_5g").val() !== "none") && ($("#guestWrlPwd_5g").val() === "")) {
				return _("Please specify your 5 GHz WiFi password.");
			}
			//}
		},

		success: function () {
			wrlGuestPage.submit();
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

//设置
function changeWireEn(_name, setVal) {
	var $elem = $("[name=" + _name + "]");
	$elem.attr("class", setVal === 1 ? "btn-on" : "btn-off").val(setVal);

	if (setVal === 1) {
		$elem.parent().parent().nextAll().removeClass("none");
	} else {
		$elem.parent().parent().nextAll().addClass("none");
	}
	top.initIframeHeight();
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
	if(obj.wl_en == "1") {
		$("#save").removeAttr("disabled");
		$("#wrl_save_msg").html("&nbsp;");
	} else {
		$("#save").attr("disabled", true);
		$("#wrl_save_msg").html(_("当前无线处于关闭状态，该功能不可用"));
	}

	if (obj.guestEn === "1") {
		initEn($('[name="guestEn"]'), "on");
	} else {
		initEn($('[name="guestEn"]'), "off");
	}

	if (obj.guestEn_5g === "1") {
		initEn($('[name="guestEn_5g"]'), "on");
	} else {
		initEn($('[name="guestEn_5g"]'), "off");
	}

	$("#guestWrlPwd").initPassword("", false, false);
	$("#guestWrlPwd_5g").initPassword("", false, false);

    if (obj.guestSecurity === "none") {
		$("#guestWrlPwd").val("").attr("disabled", true);
		if ($("#guestWrlPwd_").length > 0) {
			$("#guestWrlPwd_").val("").attr("disabled", true);
		}
	} else {
		$("#guestWrlPwd").attr("disabled", false);
        switch (obj.guestSecurity) {
			case "wpa3sae":
				$("#securityTip").html(wpa3sae)
				break;
			case "wpa3saewpa2psk":
				$("#securityTip").html(wpa3saewpa2psk)
				break;
			default:
				$("#securityTip").html("");
		}
		if ($("#guestWrlPwd_").length > 0) {
			$("#guestWrlPwd_").attr("disabled", false);
		}
	}
    if (obj.guestSecurity_5g === "none") {
		$("#guestWrlPwd_5g").val("").attr("disabled", true);
		if ($("#guestWrlPwd_5g_").length > 0) {
			$("#guestWrlPwd_5g_").val("").attr("disabled", true);
		}
	} else {
		$("#guestWrlPwd_5g").attr("disabled", false);
        switch (obj.guestSecurity_5g) {
			case "wpa3sae":
				$("#securityTip_5g").html(wpa3sae)
				break;
			case "wpa3saewpa2psk":
				$("#securityTip_5g").html(wpa3saewpa2psk)
				break;
			default:
				$("#securityTip_5g").html("");
		}

		if ($("#guestWrlPwd_5g_").length > 0) {
			$("#guestWrlPwd_5g_").attr("disabled", false);
		}
	}
}

/******************* Module wireless setting end ************/

window.onload = function () {
	wrlGuestPage = R.page(pageview, pageModel);
}