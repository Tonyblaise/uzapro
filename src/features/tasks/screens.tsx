import type { ScreenMap } from "../types";
import { NewTaskAction } from "./Actions";
import { TasksScreen } from "./TasksScreen";

/** Tasks (feature 023): one tab with the "New task" header action. Replaces Messages. */
export const tasksScreens: ScreenMap = {
  tasks: { Body: TasksScreen, Actions: NewTaskAction },
};
