var G = {
};
G.vlanArr = [];
G.listMax = 0;
G.subObj = {};
G.initObj = {};
var vlanObj = {
	"initVal": "",
	"editable": "1",
	"seeAsTrans": true,
	"options": [{
			//"0": _("Denied"),
			"45": "45（广东）",
			"85": "85（上海）",
			".divider": ".divider",
			".hand-set": _("Manual")
	}]
};
var iptvInfo;
var pageview = R.pageView({ //页面初始化
	init: function () {
		top.loginOut();
		top.$(".main-dailog").removeClass("none");
		top.$(".save-msg").addClass("none");
		$("#submit").on("click", function () {
			if (!this.disabled)
				G.validate.checkAll();
		});
	}
});
var pageModel = R.pageModel({
	getUrl: "goform/getIptvInfo",
	setUrl: "goform/setIptvInfo",
	translateData: function (data) {
		var newData = {};
		newData.iptv = data;
		return newData;
	},
	beforeSubmit: function () {
		G.subObj = {};
		G.subObj = {
			"iptvEn": $("#iptvEn").val(),
			"vlanEn": $("#vlanEn").val(),
			"bindLan": $("#bindLan").val(),
			"vlanId": $("#vlanId")[0].val()
		};
		if (G.subObj.iptvEn == "0") {
			$.extend(G.subObj, {
				"vlanId": G.initObj.vlanId,
				"bindLan": G.initObj.bindLan,
				"vlanEn": G.initObj.vlanEn
			});
		}
		if(G.subObj.vlanEn === "0") {
			$.extend(G.subObj, {
				"vlanId": G.initObj.vlanId
			});
		}

		//是否要重启,只要stb相关数据改变了就重启
		G.reboot = false;
		if (G.initObj.iptvEn != G.subObj.iptvEn) {
			G.reboot = true;
		} else {
			if (G.initObj.bindLan != G.subObj.bindLan || G.initObj.vlanEn != G.subObj.vlanEn || G.initObj.vlanId != G.subObj.vlanId) {
				G.reboot = true;
			} else {
				G.reboot = false;
			}
		}
		if (G.reboot && !confirm(_("Please reboot the router after changing the IPTV settings. Do you want to reboot the router?"))) {
			return false;
		}

		return true;
	},
	afterSubmit: callback
});

/************************/
var view = R.moduleView({
	initEvent: initIptvEvent,
	checkData: function () {

	}
});

var moduleModel = R.moduleModel({
	initData: initValue,
	getSubmitData: function () {
		return objTostring(G.subObj);
	}
});

//模块注册
R.module("iptv", view, moduleModel);

function initIptvEvent() {

	$("#iptvEn").on("click", function () {
		// if (G.initObj.wl_mode == "ap")
		changeIptvEn();
	});
	$("#vlanEn").on("click", function () {
		// if (G.initObj.wl_mode == "ap")
		changeVlanEn();
	});

	$("#vlanId").toSelect(vlanObj);
	$("#vlanId").find("input[type=text]").inputCorrect("num").attr("maxLength", "4").css("width", "120px").on("focus", function () {
		this.value = this.value.replace(/[^\d\.]/g, "");
	}).on("blur", function() {
		if(this.value == "") {
			this.value =	$("#vlanId")[0].val();
		}
	});
	checkData();

}

function changeIptvEn() {
	var className = $("#iptvEn").attr("class");
	if (className == "btn-off") {
		$("#iptvEn").attr("class", "btn-on");
		$("#iptvEn").val(1);
		$(".iptv_set").removeClass("none");
	} else {
		$("#iptvEn").attr("class", "btn-off");
		$("#iptvEn").val(0);
		$(".iptv_set").addClass("none");
	}
	top.initIframeHeight();
}

function changeVlanEn() {
	var className = $("#vlanEn").attr("class");
	if (className == "btn-off") {
		$("#vlanEn").attr("class", "btn-on");
		$("#vlanEn").val(1);
		$("#vlan_set").removeClass("none");
	} else {
		$("#vlanEn").attr("class", "btn-off");
		$("#vlanEn").val(0);
		$("#vlan_set").addClass("none");
	}
	top.initIframeHeight();
}

function checkData() {
	G.validate = $.validate({
		custom: function () {
			var vlanEn = $("#vlanEn").val(),
				vlanId = $("#vlanId")[0].val();
			if(vlanEn == "1") {
				return $.validate.valid.num(vlanId, 4, 4094);
			}
		},
		success: function () {
			iptvInfo.submit();
		},
		error: function (msg) {
			if (msg) {
				showErrMsg("msg-err", msg);
			}
			return;
		}
	});
}

function initValue(obj) {
	G.initObj = obj;

	$("#iptvEn").attr("class", (obj.iptvEn == "1" ? "btn-off" : "btn-on"));
	changeIptvEn();
	$("#bindLan").val(obj.bindLan);
	$("#vlanEn").attr("class", (obj.vlanEn == "1" ? "btn-off" : "btn-on"));
	changeVlanEn();
	$("#vlanId")[0].val(obj.vlanId);

	top.initIframeHeight();
}

function callback(str) {
	var reboot = G.reboot;
	if (!top.isTimeout(str)) {
		return;
	}
	var num = $.parseJSON(str).errCode;

	//top.showSaveMsg(num);
	if (num == 0) {
		//getValue();
		if (reboot) {
			//window.location.href = "redirect.html?3";
			top.$.progress.showPro("reboot");
			$.get("goform/SysToolReboot?" + Math.random(), function (str) {
				//top.closeIframe(num);
				if (!top.isTimeout(str)) {
					return;
				}
			});
		} else {
			top.advInfo.initValue();
			top.showSaveMsg(num);
		}

	}
}

window.onload = function () {
	iptvInfo = R.page(pageview, pageModel);
};