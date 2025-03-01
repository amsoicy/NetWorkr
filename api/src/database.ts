import mysql from "mysql2/promise";
import keys from "./keys"
import { drizzle } from "drizzle-orm/mysql2";
import { mysqlTable, varchar, primaryKey, text, int } from "drizzle-orm/mysql-core";

export async function connection() {
  const client = await mysql.createConnection({
    host: keys.MYSQL_HOST,
    user: keys.MYSQL_USER,
    password: keys.MYSQL_PASS,
    database: keys.MYSQL_DB,
  });

  return drizzle({ client });
}

export const users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  // FIX: can it not reference itself??
  invitedBy: varchar("invitedBy", { length: 36 }).notNull() // FIX: cant reference self
})

export const invites = mysqlTable("invites", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 36 }).notNull().unique(),
  createdBy: varchar("createdBy", { length: 36 }).notNull().references(() => users.id)
})

export const identities = mysqlTable("identities", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  note: text("note"),
})

export const relationships = mysqlTable("relationships", {
  id: int("id").primaryKey().autoincrement(),
  userOne: varchar("identity_one", { length: 36 }).notNull().references(() => identities.id),
  userTwo: varchar("identity_two", { length: 36 }).notNull().references(() => identities.id),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 255})
})