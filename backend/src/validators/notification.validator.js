const { z } = require("zod")

const notificationIdSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: z.string().min(1) }),
  query: z.object({}).optional(),
})

module.exports = { notificationIdSchema }
