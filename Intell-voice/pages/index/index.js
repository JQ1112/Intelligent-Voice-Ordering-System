//index.js
var app = getApp();
var that;
var chatListData = [];
var speakerInterval;
Page({
  data: {
    askWord: '',
    sendButtDisable: true,
    userInfo: {},
    chatList: [],
    scrolltop: '',
    userLogoUrl: '/image/user_default.png',
    keyboard: true,
    isSpeaking: false,
    speakerUrl: '/image/speaker0.png',
    speakerUrlPrefix: '/image/speaker',
    speakerUrlSuffix: '.png',
    filePath: null,
    contactFlag: true,
  },
  onLoad: function () {
    console.log("[Console log]:Loading...");
    that = this;
  },

  onReady: function () {

  },
  // 切换语音输入和文字输入
  switchInputType: function () {
    this.setData({
      keyboard: !(this.data.keyboard),
    })
  },
  // 监控输入框输入
  Typing: function (e) {
    var inputVal = e.detail.value;
    var buttDis = true;
    if (inputVal.length != 0) {
      var buttDis = false;
    }
    that.setData({
      sendButtDisable: buttDis,
    })
  },
  // 按钮按下
  touchdown: function () {
    this.setData({
      isSpeaking: true,
    })
    that.speaking.call();
    console.log("[Console log]:Touch down!Start recording!");
    wx.startRecord({
      'success': function (res) {
        var tempFilePath = res.tempFilePath;
        that.data.filePath = tempFilePath;
        console.log("[Console log]:Record success!File path:" + tempFilePath);
        that.voiceToChar();
      },
      'fail': function () {
        console.log("[Console log]:Record failed!");
        wx.showModal({
          title: '录音失败',
          content: '换根手指再试一次！',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#09BB07',
        })
      },
    });
  },
  // 按钮松开
  touchup: function () {
    wx.stopRecord();
    console.log("[Console log]:Touch up!Stop recording!");
    this.setData({
      isSpeaking: false,
      speakerUrl: '/image/speaker0.png',
    })
    clearInterval(that.speakerInterval);
  },
  // 语音转文字
  voiceToChar: function () {
    var urls = app.globalData.slikToCharUrl;
    var voiceFilePath = that.data.filePath;
    if (voiceFilePath == null) {
      console.log("[Console log]:File path do not exist!");
      wx.showModal({
        title: '录音文件不存在',
        content: '我也不知道哪错了，反正你就再试一次吧！',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#09BB07',
      })
      return;
    }
    var appkey = app.globalData.NLPAppkey;
    var appsecret = app.globalData.NLPAppSecret;
    var NLPCusid = app.globalData.NLPCusid;
    wx.showLoading({
      title: '语音识别中...',
    })
    wx.hideLoading();
    /*wx.uploadFile({
      url: urls,
      filePath: voiceFilePath,
      name: 'file',
      formData: { "appKey": appkey, "appSecret": appsecret, "userId": NLPCusid },
      header: { 'content-type': 'multipart/form-data' },
      success: function (res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        var seg = JSON.parse(data.result).seg;
        console.log("[Console log]:Voice to char:" + seg);
        if (seg == null || seg.length == 0) {
          wx.showModal({
            title: '录音识别失败',
            content: "我什么都没听到，你再说一遍！",
            showCancel: false,
            success: function (res) {
            }
          });
          return;
        }
        that.addChat(seg, 'r');
        console.log("[Console log]:Add user voice input to chat list");
        //that.sendRequest(seg);
        return;
      },
      fail: function (res) {
        console.log("[Console log]:Voice upload failed:" + res.errMsg);
        wx.hideLoading();
        wx.showModal({
          title: '录音识别失败',
          content: "请你离WIFI近一点再试一次！",
          showCancel: false,
          success: function (res) {
          }
        });
      }
    });*/
  },
  // 发送语料到语义平台
  sendChat: function (e) {
    let word = e.detail.value.ask_word ? e.detail.value.ask_word : e.detail.value;
    console.log("[Console log]:User input:" + word);
    that.addChat(word, 'r');
    console.log("[Console log]:Add user input to chat list");
    that.setData({
      askWord: '',
      sendButtDisable: true,
    });
    //that.sendRequest(word);
  },
  // 增加对话到显示界面（scrolltopFlag为True）
  addChat: function (word, orientation) {
    that.addChatWithFlag(word, orientation, true);
  },
  // 增加对话到显示界面（scrolltopFlag为是否滚动标志）
  addChatWithFlag: function (word, orientation, scrolltopFlag) {
    let ch = { 'text': word, 'time': new Date().getTime(), 'orientation': orientation };
    chatListData.push(ch);
    var charlenght = chatListData.length;
    console.log("[Console log]:Add message to chat list...");
    if (scrolltopFlag) {
      console.log("[Console log]:Rolling to the top...");
      that.setData({
        chatList: chatListData,
        scrolltop: "roll" + charlenght,
      });
    } else {
      console.log("[Console log]:Not rolling...");
      that.setData({
        chatList: chatListData,
      });
    }
  },
  // 麦克风帧动画 
  speaking: function () {
    //话筒帧动画 
    var i = 0;
    that.speakerInterval = setInterval(function () {
      i++;
      i = i % 7;
      that.setData({
        speakerUrl: that.data.speakerUrlPrefix + i + that.data.speakerUrlSuffix,
      });
      console.log("[Console log]:Speaker image changing...");
    }, 300);
  }
})
