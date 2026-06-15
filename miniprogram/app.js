App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-d7gyra0pbafd553fa',
        traceUser: true
      })
    }

    this.globalData = {
      userInfo: null,
      bestScore: 0
    }
  },

  onShow: function () {
    console.log('App Show')
  },

  onHide: function () {
    console.log('App Hide')
  },

  globalData: {}
})
