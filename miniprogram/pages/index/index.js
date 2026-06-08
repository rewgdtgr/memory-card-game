const app = getApp()

Page({
  data: {
    difficulty: 'easy',
    bestScore: 0,
    playCount: 0,
    bestTime: '--'
  },

  onLoad: function () {
    this.loadStats()
  },

  loadStats: function () {
    const stats = wx.getStorageSync('gameStats') || {
      bestScore: 0,
      playCount: 0,
      bestTime: '--'
    }
    this.setData({
      bestScore: stats.bestScore,
      playCount: stats.playCount,
      bestTime: stats.bestTime
    })
  },

  setDifficulty: function (e) {
    const level = e.currentTarget.dataset.level
    this.setData({
      difficulty: level
    })
  },

  startGame: function () {
    wx.setStorageSync('difficulty', this.data.difficulty)
    wx.switchTab({
      url: '/pages/game/game'
    })
  }
})