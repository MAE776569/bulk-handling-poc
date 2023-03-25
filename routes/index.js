const router = require("express").Router()
const parsingRoutes = require("./parsing")
const validationRoutes = require("./validation")
const dbRoutes = require("./db")

router.use("/parsing", parsingRoutes)
router.use("/validation", validationRoutes)
router.use("/db", dbRoutes)

module.exports = router
