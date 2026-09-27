import { createGroup, deleteGroup, type GroupRecord } from "./db/groups";
import { DEMO_ANSWERS, DEMO_NAMES } from "./demo";

export const DEMO_GROUP_ID = "demo";
export const DEMO_TOKENS = ["demo-riya", "demo-meera", "demo-kavita"];

/** Creates (or resets) the Riya / Meera / Kavita demo group with everyone submitted. */
export async function resetDemoGroup(): Promise<GroupRecord> {
  await deleteGroup(DEMO_GROUP_ID);
  return createGroup({
    id: DEMO_GROUP_ID,
    groupName: "Riya, Meera & Kavita's flat hunt",
    names: [...DEMO_NAMES],
    tokens: DEMO_TOKENS,
    answers: DEMO_NAMES.map((n) => DEMO_ANSWERS[n]),
    submitted: true,
    isDemo: true,
  });
}
