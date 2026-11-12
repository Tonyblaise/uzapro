import type { ScreenMap } from "../types";
import { NewEventAction } from "./Actions";
import { CalendarScreen } from "./CalendarScreen";

/** Calendar (feature 005, US1). Header action "New event" (design `headerActions`). */
export const calendarScreens: ScreenMap = {
  calendar: { Body: CalendarScreen, Actions: NewEventAction },
};
