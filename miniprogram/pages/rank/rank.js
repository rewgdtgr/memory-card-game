Page({
  data: {
    bestScore: 0,
    playCount: 0,
    history: []
  },

  onLoad: function () {
    this.loadStats()
    this.loadHistory()
  },

  onShow: function () {
    this.loadStats()
    this.loadHistory()
  },

  loadStats: function () {
    const stats = wx.getStorageSync('gameStats') || {
      bestScore: 0,
      playCount: 0
    }
    this.setData({
      bestScore: stats.bestScore,
      playCount: stats.playCount
    })
  },

  loadHistory: function () {
    const history = wx.getStorageSync('gameHistory') || []
    history.sort((a, b) => b.score - a.score)
    this.setData({
      history: history.slice(0, 10)
    })
  },

  getRankClass: function (index) {
    if (index === 0) return 'gold'
    if (index === 1) return 'silver'
    if (index === 2) return 'bronze'
    return ''
  }
})