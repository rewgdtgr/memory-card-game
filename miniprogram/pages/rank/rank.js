Page({
  data: {
    bestScore: 0,
    playCount: 0,
    history: [],
    isLoading: true
  },

  onLoad: function () {
    this.loadStats()
    this.loadScoresFromCloud()
  },

  onShow: function () {
    this.loadStats()
    this.loadScoresFromCloud()
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

  loadScoresFromCloud: function () {
    this.setData({ isLoading: true })
    
    wx.cloud.callFunction({
      name: 'getScores',
      success: (res) => {
        console.log('从云数据库获取排行榜成功', res)
        if (res.result && res.result.success) {
          this.setData({
            history: res.result.data,
            isLoading: false
          })
        } else {
          this.loadLocalHistory()
        }
      },
      fail: (err) => {
        console.error('从云数据库获取排行榜失败', err)
        this.loadLocalHistory()
      }
    })
  },

  loadLocalHistory: function () {
    const history = wx.getStorageSync('gameHistory') || []
    history.sort((a, b) => b.score - a.score)
    this.setData({
      history: history.slice(0, 10),
      isLoading: false
    })
  },

  getRankClass: function (index) {
    if (index === 0) return 'gold'
    if (index === 1) return 'silver'
    if (index === 2) return 'bronze'
    return ''
  },

  formatTime: function (seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  getDifficultyText: function (difficulty) {
    const texts = {
      easy: '简单',
      medium: '中等',
      hard: '困难'
    }
    return texts[difficulty] || difficulty
  }
})
