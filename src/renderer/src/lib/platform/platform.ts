import { deepFreeze } from "@shared/utils";

export const platform = {
  hello() {
    return "world";
  }
};

deepFreeze(platform);
