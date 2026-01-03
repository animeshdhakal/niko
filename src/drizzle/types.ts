import { InferSelectModel } from "drizzle-orm";
import { hospitals } from "@/drizzle/schema";

export type Hospital = InferSelectModel<typeof hospitals>;
