const yup = require("yup")

const singleObjectSchema = yup
  .object({
    x: yup.number().integer().positive().required(),
    y: yup.number().integer().positive().required(),
  })
  .required()

const multiObjectSchema = yup.array().of(singleObjectSchema).required()

module.exports = {
  singleObjectSchema,
  multiObjectSchema,
}
