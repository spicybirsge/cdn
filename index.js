
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}



require('./mongo')()
const express = require('express');
const { storage } = require('./storage/storage');
const multer = require('multer');
const replaceUrlExtension = require("./functions/replaceVideoWithMPD")


const fileFilter = (req, file, cb) => {
  const requestURL = req.baseUrl
  if(requestURL === "/upload") {
    return cb(null, true);
  }
    
  const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error({success: false, message: "Unsupported file format only: jpeg, jpg, png, gifs and videos are allowed", code: 400}));
  }
};


const upload = multer({ storage: storage, fileFilter: fileFilter });
const cors = require('cors');
const images = require('./database/images')
const planelixFiles = require("./database/planelixAttachments")
const aerect = require('aerect.js');
const logger = require('morgan')
const authorizer = require('./middleware/authorizer')
const request = require("request")
const uuid = require("uuid")


const app = express();
app.use(logger('dev'))
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get("/authorize", authorizer, async(req, res) => {
  return res.status(200).json({success: true})
})
app.post('/upload', authorizer, upload.single('image'), async (req, res) => {
  const id = uuid.v4()
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

app.post("/upload/planelix", upload.single("image"), async(req, res) => {
try {
  let isVideo = false;

  if (!req.file) {
    return res.status(400).json({ success: false, message: "Please provide a valid attachment", code: 400 })
  }

  const path = req.file.path;

  if (!req.file.path) {
    return res.status(400).json({ success: false, message: "Please provide a valid attachment", code: 400 })
  }

  const fileType = req.file.mimetype;

  if(fileType.startsWith("video/")) {
 isVideo = true;
  }

  if(isVideo) {
    const id = uuid.v4();


    const mpdPath = replaceUrlExtension(path);
    await planelixFiles.create({
      _id: id,
      type: req.file.mimetype,
      url: path,
      mpd_url: mpdPath,

    })
    return res.status(200).json({success: true, message: "uploaded", mpd: mpdPath, raw_url: req.file.path, id: id, type: req.file.mimetype, code: 200})

  } else {
    const id = uuid.v4();
    await planelixFiles.create({
      _id: id,
      type: req.file.mimetype,
      url: path,
      mpd_url: null
    })

    return res.status(200).json({success: true, message: "uploaded", mpd: null,
      raw_url: req.file.path,
      id: id,
      type: req.file.mimetype, code: 200
    })
  }
} catch(e) {
  console.error(e)
  return res.status(500).json({success:false, message:"internal server error or file upload not supported", code: 500})
}
})

app.get("/planelix/:id", async(req,res) => {
  const id = req.params.id;
  const checkIfExist = await planelixFiles.findOne({_id: id})
  if(!checkIfExist) {
    return res.sendStatus(404)
  }

  return request.get(checkIfExist.url).pipe(res)

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
