const router = require("express").Router()
const ExcelJS = require("exceljs")
const uploadExcel = require("../middlewares/upload-excel")
const { fromEvent } = require("rxjs")
const { filter, bufferCount, switchMap, map } = require("rxjs/operators")

router.post("/all", uploadExcel, async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(req.file.path)
    const worksheet = workbook.getWorksheet("data")
    worksheet.eachRow((row) => console.log(row.values))
    res.json(200)
  } catch (error) {
    next(error)
  }
})

router.post("/stream", uploadExcel, async (req, res, next) => {
  try {
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(req.file.path)
    workbookReader.read()

    workbookReader.on("worksheet", (worksheet) => {
      if (worksheet.name === "data") {
        worksheet.on("row", (row) => {
          console.log(row.values)
        })
      }
    })

    workbookReader.on("error", (error) => {
      next(error)
    })

    workbookReader.on("end", () => {
      res.json(200)
    })
  } catch (error) {
    next(error)
  }
})

router.post("/reactive", uploadExcel, async (req, res, next) => {
  try {
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(req.file.path)
    workbookReader.read()

    let count = 0
    fromEvent(workbookReader, "worksheet")
      .pipe(
        filter((worksheet) => worksheet.name === "data"),
        switchMap((worksheet) =>
          fromEvent(worksheet, "row").pipe(
            map((row) => row.values),
            bufferCount(1000)
          )
        )
      )
      .subscribe({
        next: (data) => {
          count += 1
          console.log(data, count)
        },
        error: (error) => console.error(error),
        complete: () => console.log("Completed"),
      })

    workbookReader.on("error", (error) => {
      next(error)
    })

    workbookReader.on("end", () => {
      res.json(200)
    })
  } catch (error) {
    next(error)
  }
})

module.exports = router
