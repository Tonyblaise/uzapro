import type { ScreenMap } from "../types";
import { HelpCenter } from "./HelpCenter";

/** Help (feature 007): a single Help Center tab with no header action (Clarification Q3). */
export const helpScreens: ScreenMap = {
  "help-center": { Body: HelpCenter },
};
