import mitt from "mitt";
import { Topic, Word } from "../types";
import { EventEmit } from "../constants";
import { AppNotification } from "../types/notification";

export type Events = {
  [EventEmit.UpdateVocab]: Word;
  [EventEmit.PushAppNotification]: AppNotification;
  [EventEmit.DeleteAppNotification]: string;
  [EventEmit.ActionTopic]: { topic: Topic; action: string; topics?: Topic[] };
};

const emitter = mitt<Events>();

export default emitter;
