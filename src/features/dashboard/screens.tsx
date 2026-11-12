import type { ScreenMap } from "../types";
import { DashboardScreen } from "./DashboardScreen";

/** Tab slug → screen for this module (T049). */
export const dashboardScreens: ScreenMap = {
  overview: { Body: DashboardScreen },
};
