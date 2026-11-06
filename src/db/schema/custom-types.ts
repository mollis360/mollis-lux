import { customType } from "drizzle-orm/pg-core";

export const dateRange = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return "daterange";
  },
});
