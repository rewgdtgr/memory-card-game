const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  try {
    const result = await db.collection('scores')
      .orderBy('score', 'desc')
      .limit(10)
      .get()
    return {
      success: true,
      data: result.data
    }
  } catch (err) {
    console.error(err)
    return {
      success: false,
      error: err.message
    }
  }
}
