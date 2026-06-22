const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    const result = await db.collection('scores').add({
      data: {
        openId: OPENID,
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
