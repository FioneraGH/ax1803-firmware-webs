var firewallInfo;
var pageview = R.pageView({ //页面初始化
    init: function () {
        top.loginOut();
        top.$(".main-dailog").removeClass("none");
        top.$(".save-msg").addClass("none");
        $("#submit").on("click", function () {
            firewallInfo.submit();
        });
    }
});
var pageModel = R.pageModel({
    getUrl: "goform/GetFirewallCfg",
    setUrl: "goform/SetFirewallCfg",
    translateData: function (data) {
        var newData = {};
        newData.firewall = data;
        return newData;
    },
    afterSubmit: callback
});

/************************/
var view = R.moduleView({
    //initEvent: initFirewallEvent
});
var moduleModel = R.moduleModel({
    initData: initValue,
    getSubmitData: function () {
        var data = "firewallType=" + $("#firewall").val();
        return data;
    }
});

//模块注册
R.module("firewall", view, moduleModel);

// function initFirewallEvent() {
//     $("#firewall").on('click', function () {
//         if ($(this).hasClass("btn-on")) {
//             $(this).attr("class", "btn-off");
//             $(this).val(0);
//         } else {
//             $(this).attr("class", "btn-on");
//             $(this).val(1);
//         }
//     });
// }

function initValue(obj) {
    top.$(".main-dailog").removeClass("none");
    top.$("iframe").removeClass("none");
    top.$(".loadding-page").addClass("none");

    $("#firewall").val(obj.firewallType);
    top.initIframeHeight();
}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;
    top.showSaveMsg(num);
    if (num == 0) {
        //getValue();
        top.advInfo.initValue();
    }
}

window.onload = function () {
    firewallInfo = R.page(pageview, pageModel);
};