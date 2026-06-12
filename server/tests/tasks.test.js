process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test_secret";

const request = require("supertest");
const { app, resetMemoryStore } = require("../index");

describe("tasks API", () => {
    beforeEach(() => {
        resetMemoryStore();
    });

    test("GET /api/tasks returns an empty task list", async () => {
        const res = await request(app).get("/api/tasks");

        expect(res.status).toBe(200);
        expect(res.body).toEqual([]);
    });

    test("POST /api/tasks creates a task in guest mode", async () => {
        const res = await request(app)
            .post("/api/tasks")
            .send({
                title: "Write launch checklist",
                category: "Work",
                priority: "high",
            });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({
            title: "Write launch checklist",
            category: "Work",
            priority: "high",
            userId: "guest",
        });
        expect(res.body._id).toBeTruthy();
    });

    test("GET /api/tasks returns tasks created in guest mode", async () => {
        await request(app).post("/api/tasks").send({ title: "Plan focus block" });

        const res = await request(app).get("/api/tasks");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].title).toBe("Plan focus block");
    });
});
