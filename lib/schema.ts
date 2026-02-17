import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";

// ─── Users ─────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id:           serial("id").primaryKey(),
  googleId:     text("google_id").notNull().unique(),
  email:        text("email").notNull(),
  name:         text("name").notNull().default(""),
  avatarUrl:    text("avatar_url").notNull().default(""),
  accessToken:  text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull().default(""),
  tokenExpiry:  timestamp("token_expiry"),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
  updatedAt:    timestamp("updated_at").defaultNow().notNull(),
});

// ─── Albums (linked Google Photos albums) ──────────────────────────────────
export const albums = pgTable("albums", {
  id:             serial("id").primaryKey(),
  userId:         integer("user_id").references(() => users.id).notNull(),
  googleAlbumId:  text("google_album_id").notNull(),
  title:          text("title").notNull().default(""),
  shareUrl:       text("share_url").notNull(),
  mediaCount:     integer("media_count").default(0),
  coverPhotoUrl:  text("cover_photo_url").default(""),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

// ─── Scans (a scan job on an album) ────────────────────────────────────────
export const scans = pgTable("scans", {
  id:             serial("id").primaryKey(),
  albumId:        integer("album_id").references(() => albums.id).notNull(),
  userId:         integer("user_id").references(() => users.id).notNull(),
  status:         text("status").notNull().default("pending"),
  // pending | running | complete | error
  totalPhotos:    integer("total_photos").default(0),
  scannedPhotos:  integer("scanned_photos").default(0),
  facesFound:     integer("faces_found").default(0),
  errorMessage:   text("error_message"),
  startedAt:      timestamp("started_at"),
  completedAt:    timestamp("completed_at"),
  createdAt:      timestamp("created_at").defaultNow().notNull(),
});

// ─── Detected Persons ──────────────────────────────────────────────────────
export const persons = pgTable("persons", {
  id:               serial("id").primaryKey(),
  scanId:           integer("scan_id").references(() => scans.id).notNull(),
  userId:           integer("user_id").references(() => users.id).notNull(),
  // Cluster ID assigned during face-grouping
  clusterId:        text("cluster_id").notNull(),
  label:            text("label"),             // user-assigned name e.g. "Mom"
  bestPhotoId:      text("best_photo_id"),     // Google media item ID
  bestPhotoUrl:     text("best_photo_url"),
  faceCount:        integer("face_count").default(1),
  // Raw embedding centroid (stored as float array JSON)
  embeddingCentroid: jsonb("embedding_centroid"),
  createdAt:        timestamp("created_at").defaultNow().notNull(),
});

// ─── Face Detections (individual face hits per photo) ──────────────────────
export const faceDetections = pgTable("face_detections", {
  id:           serial("id").primaryKey(),
  scanId:       integer("scan_id").references(() => scans.id).notNull(),
  personId:     integer("person_id").references(() => persons.id),
  googleMediaId: text("google_media_id").notNull(),
  photoUrl:     text("photo_url").notNull(),
  // Bounding box as percentages
  boundingBox:  jsonb("bounding_box"),   // { x, y, w, h }
  confidence:   text("confidence"),      // "HIGH" | "MEDIUM" | "LOW"
  isSelected:   boolean("is_selected").default(false),
  createdAt:    timestamp("created_at").defaultNow().notNull(),
});

// ─── TypeScript types ──────────────────────────────────────────────────────
export type User            = typeof users.$inferSelect;
export type NewUser         = typeof users.$inferInsert;
export type Album           = typeof albums.$inferSelect;
export type Scan            = typeof scans.$inferSelect;
export type Person          = typeof persons.$inferSelect;
export type FaceDetection   = typeof faceDetections.$inferSelect;
