const Tag = require("../models/Tag")

async function findByType(type, limit = 200) {
  return Tag.find({ type }).sort({ count: -1 }).limit(limit).lean()
}

async function findHierarchy(type) {
  return Tag.find({ type }).sort({ category: 1, subCategory: 1, count: -1 }).lean()
}

async function upsert(item) {
  const name = typeof item === "string" ? item.trim() : String(item.name || "").trim()
  if (!name || name.length < 1) return null

  const type = item.type || "skill"
  const displayName = item.displayName || name
  const category = item.category || null
  const subCategory = item.subCategory || null

  return Tag.findOneAndUpdate(
    { name: name.toLowerCase(), type },
    {
      $inc: { count: 1 },
      $setOnInsert: {
        name: name.toLowerCase(),
        displayName,
        type,
        category: category?.toLowerCase() || null,
        subCategory: subCategory?.toLowerCase() || null,
      },
    },
    { upsert: true, new: true }
  )
}

async function upsertMany(items, type) {
  if (!Array.isArray(items)) return
  const results = []
  for (const item of items) {
    const doc = await upsert(typeof item === "string" ? { name: item, type } : { ...item, type })
    if (doc) results.push(doc)
  }
  return results
}

const tagRepository = { findHierarchy, findByType, upsert, upsertMany }

module.exports = { tagRepository }
