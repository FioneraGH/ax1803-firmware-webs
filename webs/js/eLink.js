var eLinkInfo;
var pageview = R.pageView({ //页面初始化
    init: function () {
        top.loginOut();
        top.$(".main-dailog").removeClass("none");
        top.$(".save-msg").addClass("none");
        $("#submit").on("click", function () {
            eLinkInfo.submit();
        });
    }
});
var pageModel = R.pageModel({
    getUrl: "goform/getElinkCfg",
    setUrl: "goform/setElinkCfg",
    translateData: function (data) {
        var newData = {};
        newData.eLink = data;
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
        var data = "elinkEn=" + (($("#eLink").attr("class") === "btn-on") ? 1 : 0);
        return data;
    }
});

//模块注册
R.module("eLink", view, moduleModel);

function initEvent() {
    $("#eLink").on("click", function () {
        if ($(this).hasClass("btn-on")) {
            $(this).attr("class", "btn-off");
            $(this).val(0);
        } else {
            $(this).attr("class", "btn-on");
            $(this).val(1);
        }
    });
}

function callback(str) {
    if (!top.isTimeout(str)) {
        return;
    }
    var num = $.parseJSON(str).errCode;
    top.showSaveMsg(num);
    if (num == 0) {
        top.advInfo.initValue();
    }
}

function initValue(obj) {
    $("#eLink").attr("class", (obj.elinkEn === "1") ? "btn-on" : "btn-off");
}

window.onload = function () {
    eLinkInfo = R.page(pageview, pageModel);
};