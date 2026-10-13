import * as df from "durable-functions";

export default df.activity(async function activity1(input: any): Promise<any> {
  // Long-running or external work
  return { processed: true, value: input.data };
});
