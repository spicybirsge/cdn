require('./mongo')()
const express = require('express');
const { storage } = require('./storage/storage');
const multer = require('multer');
const upload = multer({ storage });
const cors = require('cors');
const images = require('./database/images')
const aerect = require('aerect.js');
const logger = require('morgan')
const authorizer = require('./middleware/authorizer')
const request = require("request")


const app = express();
app.use(logger('dev'))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.post('/upload', authorizer, upload.single('image'), async (req, res) => {
  const id = aerect.generateID(10);
  if (!req.file) {
    return res.json({ error: "Please provide a valid image" })
  }
  const path = req.file.path;
  if (!path) {
    return res.json({ error: "Please provide a valid image" })
  }

  await images.create({
    id: id,
    url: path

  })

  return res.json({ success: true, url: `${id}` })

})
app.get('/status', async (req, res) => {
  res.sendStatus(200)
})
app.get('/', async (req, res) => {
  res.sendStatus(403)
});
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  console.log(url);
  if (!url) {
    return res.status(404).send()
  }
    return request.get(url).pipe(res);
})
app.get('/:id', async (req, res) => {
  const id = req.params.id;
  const image = await images.findOne({ id: id })
  if (!image) {
    return res.status(404).send()

  }
  var url = image.url;
  return request.get(url).pipe(res);
})







app.get("*", async (req, res) => {
  res.status(404).send()
})

app.listen(3000, () => {
  console.log('server started');
});
