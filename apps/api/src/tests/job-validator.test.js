import test from "node:test";
import assert from "node:assert/strict";
import { ZodError } from "zod";
import { createJobSchema, updateJobSchema } from "../validators/job.js";

const validJobPayload = {
  title: "Build payment dashboard",
  description: "Create an admin-ready payment dashboard.",
  budgetMin: 100,
  budgetMax: 500,
  categoryId: "development",
  skills: ["node", "react"]
};

test("createJobSchema rejects inverted budget ranges", () => {
  assert.throws(
    () =>
      createJobSchema.parse({
        ...validJobPayload,
        budgetMin: 500,
        budgetMax: 100
      }),
    (error) =>
      error instanceof ZodError &&
      error.issues.some(
        (issue) =>
          issue.path.join(".") === "budgetMax" &&
          issue.message === "budgetMax must be greater than or equal to budgetMin"
      )
  );
});

test("createJobSchema accepts ordered budget ranges", () => {
  assert.equal(createJobSchema.parse(validJobPayload).budgetMax, 500);
});

test("updateJobSchema rejects inverted budget ranges when both fields are present", () => {
  assert.throws(
    () =>
      updateJobSchema.parse({
        budgetMin: 800,
        budgetMax: 200
      }),
    ZodError
  );
});

test("updateJobSchema accepts partial budget updates", () => {
  assert.deepEqual(updateJobSchema.parse({ budgetMin: 800 }), { budgetMin: 800 });
  assert.deepEqual(updateJobSchema.parse({ budgetMax: 1200 }), { budgetMax: 1200 });
});
