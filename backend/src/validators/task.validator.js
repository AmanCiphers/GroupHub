const { z } = require("zod")

const createTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200),
    description: z.string().trim().max(5000).optional(),
    assigneeId: z.string().optional(),
    assignmentType: z.enum(["assigned", "open"]).optional(),
    status: z.enum(["todo", "in_progress", "needs_review", "done", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    dueDate: z.string().optional(),
  }),
  params: z.object({ projectId: z.string().min(1) }),
  query: z.object({}).optional(),
})

const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    assigneeId: z.string().nullable().optional(),
    assignmentType: z.enum(["assigned", "open"]).optional(),
    status: z.enum(["todo", "in_progress", "needs_review", "done", "cancelled"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    dueDate: z.string().nullable().optional(),
    reviewNote: z.string().trim().max(2000).optional(),
  }),
  params: z.object({ taskId: z.string().min(1) }),
  query: z.object({}).optional(),
})

const taskIdParamSchema = z.object({
  body: z.object({}).optional(),
  params: z.object({ taskId: z.string().min(1) }),
  query: z.object({}).optional(),
})

const feedbackSchema = z.object({
  body: z.object({
    feedback: z.string().trim().min(1).max(2000),
  }),
  params: z.object({ taskId: z.string().min(1) }),
  query: z.object({}).optional(),
})

module.exports = { createTaskSchema, updateTaskSchema, taskIdParamSchema, feedbackSchema }
