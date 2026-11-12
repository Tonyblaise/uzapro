import type { ScreenMap } from "../types";
import { PosLaunch } from "./PosLaunch";

/** Point of sale (feature 010): the Terminals tab, with no header action. */
export const posScreens: ScreenMap = {
  terminals: { Body: PosLaunch },
};
