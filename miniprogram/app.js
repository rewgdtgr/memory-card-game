App({
  onLaunch: function () {
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