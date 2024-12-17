import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { isAdminOrEditor } from "../config-helpers";
import type { ApiConfig } from "../routes";
export const icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
  <path stroke-linecap="round" stroke-linejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M6 6h.008v.008H6V6Z" />
</svg>
`;
export const tableName = "cacheRequests";
export const name = "Cache Requests";

export const route = "cache-requests";

export const definition = {
  url: text("url").primaryKey(),
  createdOn: integer('createdOn').notNull().default(Date.now()),
};

export const table = sqliteTable(tableName, {
  ...definition,
});


export const access: ApiConfig["access"] = {
  operation: {
    read: true,
    create: true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
};

export const fields: ApiConfig["fields"] = {
  // body:{ 
  //   type:'textArea'
  // }
};