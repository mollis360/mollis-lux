import type { InferSelectModel } from "drizzle-orm";

import { hotel } from "@/src/db/schema/hotel";

export type Hotel = InferSelectModel<typeof hotel>;
