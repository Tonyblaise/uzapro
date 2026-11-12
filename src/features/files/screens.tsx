import type { ScreenMap } from "../types";
import { FileActions } from "./Actions";
import { FileManager } from "./FileManager";

/** File Manager (feature 005, US2): one tab, with the "New folder" and "Upload" header actions. */
export const filesScreens: ScreenMap = {
  "all-documents": { Body: FileManager, Actions: FileActions },
};
