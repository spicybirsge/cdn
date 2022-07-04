const mongo = require("mongoose")

module.exports = async () => {
await mongo.connect(process.env.MONGODB_LINK, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  
})
return mongo
}
mongo.connection.on('connected', () => {
  console.log("Connected to mongoDB")
})