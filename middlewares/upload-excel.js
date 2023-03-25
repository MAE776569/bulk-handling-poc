const multer = require("multer")
const path = require("path")
const fs = require("fs")
const crypto = require("crypto")

function fileFilter(req, file, cb) {
  if (/(^application\/vnd\.(ms-excel|.*sheet))|csv$/.test(file.mimetype))
    return cb(null, true)
  cb(null, false)
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fileDir = "./public/sheets"
    if (!fs.existsSync(fileDir)) fs.mkdirSync(fileDir, { recursive: true })
    cb(null, fileDir)
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${file.originalname}-${crypto
        .randomBytes(8)
        .toString("hex")}${path.extname(file.originalname)}`
    )
  },
})

const uploadExcel = multer({
  storage,
  fileFilter,
})

module.exports = uploadExcel.single("file")
