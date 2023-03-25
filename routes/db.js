const router = require("express").Router()
const ExcelJS = require("exceljs")
const uploadExcel = require("../middlewares/upload-excel")
const { fromEvent, from, of } = require("rxjs")
const {
  filter,
  bufferCount,
  switchMap,
  map,
  catchError,
  skip,
  mergeMap,
} = require("rxjs/operators")
const {
  singleObjectSchema,
  multiObjectSchema,
} = require("../schemas/validation.schema")

const validateUser = (row) =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(row)
    }, 1000)
  })

router.post("/all", uploadExcel, async (req, res, next) => {
  try {
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(req.file.path)
    const worksheet = workbook.getWorksheet("data")
    for (const row of worksheet.getRows(2, 120280)) {
      try {
        const data = await singleObjectSchema.validate({
          x: row.values[1],
          y: row.values[2],
        })
        console.log(await validateUser(data))
      } catch (error) {
        continue
      }
    }
    res.json(200)
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
            skip(2),
            map((row) => ({
              x: row.values[1],
              y: row.values[2],
            })),
            mergeMap((row) =>
              from(singleObjectSchema.validate(row)).pipe(
                mergeMap((row) => from(validateUser(row))),
                catchError((err) => of(err.message))
              ),
            )
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
