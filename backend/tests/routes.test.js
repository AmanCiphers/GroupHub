const request = require("supertest")
const { app } = require("../src/app")

describe("routes", () => {
  it("lists available v1 route groups", async () => {
    const response = await request(app).get("/api/v1")

    expect(response.status).toBe(200)
    expect(response.body.data).toHaveProperty("auth")
    expect(response.body.data).toHaveProperty("users")
    expect(response.body.data).toHaveProperty("projects")
    expect(response.body.data).toHaveProperty("applications")
    expect(response.body.data).toHaveProperty("dashboard")
  })

  it("rejects profile access without authentication", async () => {
    const response = await request(app).get("/api/v1/users/me")

    expect(response.status).toBe(401)
    expect(response.body).toMatchObject({
      success: false,
      message: "Authentication required",
    })
  })

  it("rejects dashboard access without authentication", async () => {
    const response = await request(app).get("/api/v1/dashboard")

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Authentication required")
  })

  it("rejects project creation without authentication", async () => {
    const response = await request(app).post("/api/v1/projects").send({})

    expect(response.status).toBe(401)
    expect(response.body.message).toBe("Authentication required")
  })

  it("validates public contact submissions", async () => {
    const response = await request(app).post("/api/v1/contact").send({
      firstName: "A",
      lastName: "B",
      email: "not-an-email",
      subject: "Hi",
      message: "Too short",
    })

    expect(response.status).toBe(400)
    expect(response.body.message).toBe("Validation failed")
  })
})
