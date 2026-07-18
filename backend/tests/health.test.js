const request = require("supertest")
const { app } = require("../src/app")

describe("health", () => {
  it("returns service health", async () => {
    const response = await request(app).get("/health")

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      status: "ok",
      service: "grouphub-api",
    })
  })
})
