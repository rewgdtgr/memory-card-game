const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const result = await db.collection('scores').add({
      data: {
        score: event.score,
        moves: event.moves,
        time: event.time,
        difficulty: event.difficulty,
        createTime: db.serverDate()
      }
    })
    return {
      success: true,
      data: result
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}
