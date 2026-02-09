import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";

export const responders = pgTable("responders", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    category: text("category").notNull(), // MEDICAL, FIRE, POLICE, etc.
    latitude: numeric("latitude").notNull(),
    longitude: numeric("longitude").notNull(),
    contactInfo: text("contact_info").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const emergencySignals = pgTable("emergency_signals", {
    id: serial("id").primaryKey(),
    transcript: text("transcript"),
    category: text("category").notNull(),
    riskLevel: text("risk_level").notNull(),
    latitude: numeric("latitude").notNull(),
    longitude: numeric("longitude").notNull(),
    actionTaken: text("action_taken"),
    createdAt: timestamp("created_at").defaultNow(),
});
