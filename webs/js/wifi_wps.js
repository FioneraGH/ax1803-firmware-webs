var wrlWpsInfo;
var pageview = R.pageView({ //页面初始化
	init: function () {
		top.loginOut();
		top.$(".main-dailog").removeClass("none");
		top.$(".save-msg").addClass("none");
	}
});
var pageModel = R.pageModel({
	getUrl: "goform/WifiWpsGet",
	setUrl: "goform/WifiWpsSet",
	translateData: function (data) {
		var newData = {};
		newData.wrlWps = data;
		return newData;
	},
	afterSubmit: callback
});

/************************/
var view = R.moduleView({
	initEvent: initEvent
});
var moduleModel = R.moduleModel({
	initData: initValue,
	getSubmitData: function () {
		return "wpsEn=" + $("#wpsEn").val();
	}
});

//模块注册
R.module("wrlWps", view, moduleModel);

function initEvent() {
	$("#wpsSubmit").on("click", function () {
		if (!this.disabled)
            $.post("goform/WifiWpsStart", "action=wps", wpsCallback);
	});
	$("#wpsEn").on("click", function () {
        if (initObj.wl_mode != "ap" || initObj.wl_en == "0") {
			return;
		}
		changeWpsEn();
		$("#wpsMethod").addClass("none");
		wrlWpsInfo.submit();
		if ($("#wpsEn").val() == "1") {
			$("#waitingTip").html(_("Enabling WPS...")).removeClass("none");
		} else {
			$("#waitingTip").html(_("Disabling WPS...")).removeClass("none");
		}
	});
}

function wpsCallback(str) {
    var num = $.parseJSON(str).errCode;
    if (num == 0) {
        $('.pbc').removeClass('none');
        setTimeout(function () {
            $('.pbc').addClass('none');
        }, 2000);
    }
    callback(str);
}
function changeWpsEn() {
	if ($("#wpsEn")[0].className == "btn-off") {
		$("#wpsEn").attr("class", "btn-on");
		$("#wpsEn").val(1);
	} else {
		$("#wpsEn").attr("class", "btn-off");
		$("#wpsEn").val(0);
	}
	top.initIframeHeight();
}

function initValue(obj) {
	initObj = obj;
	$("#pinCode").html(obj.pinCode);
	$("#waitingTip").html(" ").addClass("none");
	if (obj.wl_mode != "ap" || obj.wl_en == "0") {
		if (obj.wl_mode != "ap")
			showErrMsg("msg-err", _("Please disable Wireless Repeating on the WiFi Settings page first."), true);
		if (obj.wl_en == "0")
			showErrMsg("msg-err", _("The WiFi function is disabled. Please enable it first."), true);
		$("#wpsSubmit")[0].disabled = true;
		//$("#submit")[0].disabled = true;
	}
	$("#wpsEn").attr("class", (obj.wpsEn == "1" ? "btn-off" : "btn-on"));
	changeWpsEn();
	if (obj.wpsEn == "1") {
		$("#wpsMethod").removeClass("none");
	} else {
		$("#wpsMethod").addClass("none");
    }
    top.initIframeHeight();
    //保留无线基本数据用于判断
    $.getJSON("goform/WifiBasicGet?" + Math.random, function (data) {
        var secuWPA3 = data.security === "wpapsk" || data.security === "wpa3sae",
            secuWPA3_5g = data.security_5g === "wpapsk" || data.security_5g === "wpa3sae";
        //当无线开启且加密方式为WPA3时，WPS不可用。并提示用户"WPS功能xx"
        if ((data.wrlEn === "1" && secuWPA3) || (data.doubleBand === "0" && data.wrlEn_5g === "1" && secuWPA3_5g)) {
            if (obj.wpsEn === "1") {
                $("#wpsMethod").addClass("none");
            }
            $("#wpsEn").unbind("click").css("cursor", "not-allowed");
            $("#wpsDisabledInfo").removeClass("none");
        }
    });
}

function callback(str) {
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	//top.showSaveMsg(num);
	if (num == 0) {
		top.wrlInfo.initValue();
		setTimeout(function () {
			pageModel.update();
			$("#waitingTip").html(" ").addClass("none");
		}, 2000);
	}
}


window.onload = function () {
	wrlWpsInfo = R.page(pageview, pageModel);
};
