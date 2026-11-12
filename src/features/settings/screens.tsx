import type { ScreenMap } from "../types";
import { AddBranchAction, AddGroupAction, AddStorageAction, AddTerminalAction } from "./Actions";
import { BranchList } from "./BranchList";
import { BusinessProfile } from "./BusinessProfile";
import { GroupList } from "./GroupList";
import { StorageList } from "./StorageList";
import { Terminals } from "./Terminals";

/**
 * Settings › Business profile, Branches, Location groups, Storage locations, Terminals (feature 005,
 * US3). Header actions follow the design's `headerActions` for `set`: none on Business profile.
 */
export const settingsScreens: ScreenMap = {
  "business-profile": { Body: BusinessProfile },
  branches: { Body: BranchList, Actions: AddBranchAction },
  "location-groups": { Body: GroupList, Actions: AddGroupAction },
  "storage-locations": { Body: StorageList, Actions: AddStorageAction },
  terminals: { Body: Terminals, Actions: AddTerminalAction },
};
