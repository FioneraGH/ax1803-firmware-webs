var wrlMeshSwitch;
var G = {};
var pageDt = {};
var originDt  = {};
var pageview = R.pageView({ //页面初始化
    init: function () {
        top.loginOut();
        top.$(".main-dailog").removeClass("none");
        top.$(".save-msg").addClass("none");
    }
});
var pageModel = R.pageModel({
    getUrl: "goform/GetMeshCfg",
    setUrl: "goform/SetMeshCfg",
    translateData: function (data) {
        var newData = {};
        newData.wrlMesh = data;
        originDt = data;
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
        pageDt = {
            "meshEn": $("#meshEn").hasClass("btn-on") ? "1" : "0",
            "meshRole": $("[name=meshRole]:checked")[0].value
        };
        return objTostring(pageDt);
    }
});

//模块注册
R.module("wrlMesh", view, moduleModel);

function initEvent() {
    $("#meshEn").on("click", function () {
        if ($(this).hasClass("btn-on")) {
            $(this).attr("class", "btn-off");
            $("#roleCfg").addClass("none");
            $(this).val(0);
        } else {
            $(this).attr("class", "btn-on");
            $("#roleCfg").removeClass("none");
            $(this).val(1);
        }
    });

    $("#submit").on("click", function () {

		G.validate.checkAll();
    });

    checkData();
}

function checkData() {
	G.validate = $.validate({
        custom: function () {
            var meshEn = $("#meshEn").hasClass("btn-on") ? true : false;
            var wrlBasic = G.wrlBasicData;
            var disbMesh = false,
                disbInfo;
            var notWPA2 = false,
                notWPA2Info;
            //无线加密，且加密方式非 WPA2-PSK，提示将自动修改加密方式
            //无线未加密，提示需要先设置无线密码后才能开启MESH组网。

            if (meshEn) {
                if (wrlBasic.wrlEn === "1") {
                    if (wrlBasic.security === "none") {
                        disbMesh = true;
                    } else if (wrlBasic.security !== "wpa2psk") {
                        notWPA2 = true;
                    }
                }
                if (wrlBasic.doubleBand === "0" && wrlBasic.wrlEn_5g === "1") {
                    if (wrlBasic.security_5g === "none") {
                        disbMesh = true;
                    } else if (wrlBasic.security_5g !== "wpa2psk") {
                        notWPA2 = true;
                    }
                }
            }
            disbMesh && (disbInfo = _("您的无线网络未加密，需要先设置无线密码后才能开启MESH组网。"));
            notWPA2 && (notWPA2Info = _("开启MESH组网后，无线加密方式将被修改为WPA2-PSK，确定要继续吗?"));
            if (disbMesh) {
                alert(disbInfo);
                return true;
            }
            if (notWPA2 && !confirm(notWPA2Info)) {
                return true;
            }
            //验证OK，保存
            return false;
        },

		success: function () {
			wrlMeshSwitch.submit();
		},

		error: function (msg) {}
	});

}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;

    if (num == 0) {
        top.wrlInfo.initValue();
        if (pageDt.meshEn !== originDt.meshEn || pageDt.meshRole !== originDt.meshRole) {
            top.$.progress.showPro("wifi", _("无线正在重启，请稍候..."), 500);
            return;
        } else {
            top.showSaveMsg(num);
        }
        setTimeout(function () {
            pageModel.update();
        }, 2000);
    }
}


function initValue(obj) {
    if(window.CONFIG_TENDA_IMAGE_HEAD == "AX1806_V2" || window.CONFIG_TENDA_IMAGE_HEAD == "AX1803_V2"){
        $("#autoRoleShow").show()
    }
    $("#meshEn").attr("class", (obj.meshEn === "1") ? "btn-on" : "btn-off");
    obj.meshEn === "1" ? $("#roleCfg").removeClass("none") : $("#roleCfg").addClass("none");
    $("[name=meshRole][value=" +obj.meshRole+ "]")[0].checked = true;
    //保留无线基本数据用于判断
    $.getJSON("goform/WifiBasicGet?" + Math.random, function (data) {
        G.wrlBasicData = data;
    });
}

window.onload = function () {
    wrlMeshSwitch = R.page(pageview, pageModel);
};
