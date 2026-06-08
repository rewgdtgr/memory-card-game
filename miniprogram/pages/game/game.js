const app = getApp()

Page({
  data: {
    cards: [],
    cols: 4,
    rows: 3,
    flippedCards: [],
    moves: 0,
    score: 0,
    timer: 0,
    finalTime: 0,
    gameOver: false,
    isChecking: false,
    matchedPairs: 0,
    totalPairs: 6,
    hintsRemaining: 3
  },

  timerInterval: null,

  onLoad: function () {
    this.initGame()
  },

  onShow: function () {
    if (this.data.cards.length === 0) {
      this.initGame()
    }
  },

  onHide: function () {
    this.stopTimer()
  },

  onUnload: function () {
    this.stopTimer()
  },

  initGame: function () {
    const difficulty = wx.getStorageSync('difficulty') || 'easy'
    const config = this.getDifficultyConfig(difficulty)
    
    this.setData({
      cols: config.cols,
      rows: config.rows,
      totalPairs: config.pairs,
      moves: 0,
      score: 0,
      timer: 0,
      finalTime: 0,
      gameOver: false,
      flippedCards: [],
      matchedPairs: 0,
      hintsRemaining: 3,
      isChecking: false
    })

    this.createCards(config.pairs)
    this.startTimer()
  },

  getDifficultyConfig: function (level) {
    const configs = {
      easy: { cols: 4, rows: 3, pairs: 6 },
      medium: { cols: 4, rows: 4, pairs: 8 },
      hard: { cols: 6, rows: 4, pairs: 12 }
    }
    return configs[level] || configs.easy
  },

  createCards: function (pairCount) {
    const emojis = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎸', '🎹', '🎺', '🎻']
    const selectedEmojis = emojis.slice(0, pairCount)
    const cards = []

    selectedEmojis.forEach((emoji, index) => {
      cards.push({
        id: index * 2,
        emoji: emoji,
        flipped: false,
        matched: false
      })
      cards.push({
        id: index * 2 + 1,
        emoji: emoji,
        flipped: false,
        matched: false
      })
    })

    this.shuffleCards(cards)
    this.setData({ cards })
  },

  shuffleCards: function (cards) {
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]]
    }
    return cards
  },

  flipCard: function (e) {
    const index = e.currentTarget.dataset.index
    const card = this.data.cards[index]

    if (this.data.isChecking) return
    if (card.flipped || card.matched) return
    if (this.data.flippedCards.length >= 2) return

    const newCards = [...this.data.cards]
    newCards[index].flipped = true
    this.setData({ cards: newCards })

    const newFlippedCards = [...this.data.flippedCards, { index, emoji: card.emoji }]
    this.setData({ flippedCards: newFlippedCards })

    if (newFlippedCards.length === 2) {
      this.setData({ 
        moves: this.data.moves + 1,
        isChecking: true 
      })
      this.checkMatch()
    }
  },

  checkMatch: function () {
    const [first, second] = this.data.flippedCards

    if (first.emoji === second.emoji) {
      setTimeout(() => {
        const newCards = [...this.data.cards]
        newCards[first.index].matched = true
        newCards[second.index].matched = true
        
        const newMatchedPairs = this.data.matchedPairs + 1
        const baseScore = 100
        const timeBonus = Math.max(0, 50 - this.data.timer)
        const moveBonus = Math.max(0, 30 - this.data.moves)
        const newScore = this.data.score + baseScore + timeBonus + moveBonus

        this.setData({
          cards: newCards,
          matchedPairs: newMatchedPairs,
          score: newScore,
          flippedCards: [],
          isChecking: false
        })

        if (newMatchedPairs === this.data.totalPairs) {
          this.gameWon()
        }
      }, 500)
    } else {
      setTimeout(() => {
        const newCards = [...this.data.cards]
        newCards[first.index].flipped = false
        newCards[second.index].flipped = false
        this.setData({
          cards: newCards,
          flippedCards: [],
          isChecking: false
        })
      }, 1000)
    }
  },

  gameWon: function () {
    this.stopTimer()
    this.setData({
      finalTime: this.data.timer,
      gameOver: true
    })

    const stats = wx.getStorageSync('gameStats') || {
      bestScore: 0,
      playCount: 0,
      bestTime: '--'
    }

    if (this.data.score > stats.bestScore) {
      stats.bestScore = this.data.score
    }
    stats.playCount++

    const finalTimeStr = this.formatTime(this.data.timer)
    if (stats.bestTime === '--' || this.data.timer < this.parseTime(stats.bestTime)) {
      stats.bestTime = finalTimeStr
    }

    wx.setStorageSync('gameStats', stats)
  },

  startTimer: function () {
    this.stopTimer()
    this.timerInterval = setInterval(() => {
      this.setData({
        timer: this.data.timer + 1
      })
    }, 1000)
  },

  stopTimer: function () {
    if (this.timerInterval) {
      clearInterval(this.timerInterval)
      this.timerInterval = null
    }
  },

  formatTime: function (seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  },

  parseTime: function (timeStr) {
    const [mins, secs] = timeStr.split(':').map(Number)
    return mins * 60 + secs
  },

  showHint: function () {
    if (this.data.hintsRemaining <= 0) {
      wx.showToast({
        title: '没有提示了',
        icon: 'none'
      })
      return
    }

    const unmatchedCards = this.data.cards
      .map((card, index) => ({ ...card, index }))
      .filter(card => !card.matched && !card.flipped)

    if (unmatchedCards.length < 2) return

    const pairs = {}
    unmatchedCards.forEach(card => {
      if (!pairs[card.emoji]) {
        pairs[card.emoji] = []
      }
      pairs[card.emoji].push(card)
    })

    for (const emoji in pairs) {
      if (pairs[emoji].length >= 2) {
        const [first, second] = pairs[emoji]
        
        const newCards = [...this.data.cards]
        newCards[first.index].flipped = true
        newCards[second.index].flipped = true

        this.setData({
          cards: newCards,
          hintsRemaining: this.data.hintsRemaining - 1,
          flippedCards: [
            { index: first.index, emoji: emoji },
            { index: second.index, emoji: emoji }
          ],
          isChecking: true
        })

        setTimeout(() => {
          const updatedCards = [...this.data.cards]
          updatedCards[first.index].matched = true
          updatedCards[second.index].matched = true

          const newMatchedPairs = this.data.matchedPairs + 1
          const baseScore = 100
          const timeBonus = Math.max(0, 50 - this.data.timer)
          const moveBonus = Math.max(0, 30 - this.data.moves)
          const hintPenalty = 20
          const newScore = this.data.score + baseScore + timeBonus + moveBonus - hintPenalty

          this.setData({
            cards: updatedCards,
            matchedPairs: newMatchedPairs,
            score: newScore,
            flippedCards: [],
            isChecking: false
          })

          if (newMatchedPairs === this.data.totalPairs) {
            this.gameWon()
          }
        }, 1000)

        break
      }
    }
  },

  restartGame: function () {
    this.setData({ gameOver: false })
    this.initGame()
  },

  saveScore: function () {
    wx.showToast({
      title: '成绩已保存',
      icon: 'success'
    })
    this.setData({ gameOver: false })
    this.initGame()
  }
})