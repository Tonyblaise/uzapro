import type { ScreenMap } from "../types";
import { ProfileScreen } from "./ProfileScreen";

/** Profile (feature 005, US4). No header action (design `headerActions`). */
export const profileScreens: ScreenMap = {
  profile: { Body: ProfileScreen },
};
