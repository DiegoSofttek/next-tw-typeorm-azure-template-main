import * as df from "durable-functions";

export default df.orchestrator(function* orchestrator(context) {
  // Example: call multiple activities
  const result1 = yield context.df.callActivity("activity1", { data: "test" });
  const result2 = yield context.df.callActivity("activity2", result1);

  return { success: true, data: result2 };
});
