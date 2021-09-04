var greenInfo;
var pageview = R.pageView({ //页面初始化
  init: function () {
    top.loginOut();
    top.$(".main-dailog").removeClass("none");
    top.$(".save-msg").addClass("none");
  }
});
var pageModel = R.pageModel({
  getUrl: "goform/GetGreenNet",
  setUrl: "goform/SetGreenNet",
  translateData: function (data) {
    var newData = {};
    newData.green = data;
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
    return "greenNetEn=" + $("#greenNetEn").val();
  }
});

//模块注册
R.module("green", view, moduleModel);

function initEvent() {
  $("#greenNetEn").on("click", function () {
    if ($(this).hasClass("btn-on")) {
      $(this).attr("class", "btn-off");
      $(this).val('0');
    } else {
      $(this).attr("class", "btn-on");
      $(this).val('1');
    }
  });
  $("#green-save").on("click", function () {
    greenInfo.submit();
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
  $("#greenNetEn").attr("class", (obj.greenNetEn === "1") ? "btn-on" : "btn-off");
  obj.greenNetEn === "1" ? $('#greenNetEn').val('1') : $('#greenNetEn').val('0');
}

window.onload = function () {
  greenInfo = R.page(pageview, pageModel);
};
