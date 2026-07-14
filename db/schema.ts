import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial().primaryKey(),
  title: text().notNull(),
  location: text().notNull(),
  category: text().notNull(),
  size: text().notNull(),
  imageUrl: text().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial().primaryKey(),
  username: text().notNull().unique(),
  password: text().notNull(), // for simplicity, simple secret password configured or entered
  createdAt: timestamp("created_at").defaultNow(),
});
