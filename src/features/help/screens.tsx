import { NewAction } from "@/features/generic/Actions";
import { screensFor } from "@/features/generic/screens";
import type { ScreenMap } from "../types";
import { AskUzaPro } from "./AskUzaPro";

/**
 * Help (feature 006): Ask UzaPro is the chat screen; the three list tabs reuse the generic screens.
 * Every tab gets the design's generic "New" header action (`headerActions` last fallback).
 */
export const helpScreens: ScreenMap = {
  "ask-uzapro": { Body: AskUzaPro, Actions: NewAction },
  ...screensFor("sup", ["how-to-guides", "help-requests", "response-times"]),
};
