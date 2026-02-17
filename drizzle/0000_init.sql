-- FaceSort — Initial Schema Migration
-- Run via: npx drizzle-kit push  OR  psql $DATABASE_URL -f drizzle/0000_init.sql

CREATE TABLE IF NOT EXISTS "users" (
  "id"            SERIAL PRIMARY KEY,
  "google_id"     TEXT NOT NULL UNIQUE,
  "email"         TEXT NOT NULL,
  "name"          TEXT NOT NULL DEFAULT '',
  "avatar_url"    TEXT NOT NULL DEFAULT '',
  "access_token"  TEXT NOT NULL,
  "refresh_token" TEXT NOT NULL DEFAULT '',
  "token_expiry"  TIMESTAMP,
  "created_at"    TIMESTAMP DEFAULT NOW() NOT NULL,
  "updated_at"    TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "albums" (
  "id"               SERIAL PRIMARY KEY,
  "user_id"          INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "google_album_id"  TEXT NOT NULL,
  "title"            TEXT NOT NULL DEFAULT '',
  "share_url"        TEXT NOT NULL,
  "media_count"      INTEGER DEFAULT 0,
  "cover_photo_url"  TEXT DEFAULT '',
  "created_at"       TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "scans" (
  "id"              SERIAL PRIMARY KEY,
  "album_id"        INTEGER NOT NULL REFERENCES "albums"("id") ON DELETE CASCADE,
  "user_id"         INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "status"          TEXT NOT NULL DEFAULT 'pending',
  "total_photos"    INTEGER DEFAULT 0,
  "scanned_photos"  INTEGER DEFAULT 0,
  "faces_found"     INTEGER DEFAULT 0,
  "error_message"   TEXT,
  "started_at"      TIMESTAMP,
  "completed_at"    TIMESTAMP,
  "created_at"      TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "persons" (
  "id"                  SERIAL PRIMARY KEY,
  "scan_id"             INTEGER NOT NULL REFERENCES "scans"("id") ON DELETE CASCADE,
  "user_id"             INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "cluster_id"          TEXT NOT NULL,
  "label"               TEXT,
  "best_photo_id"       TEXT,
  "best_photo_url"      TEXT,
  "face_count"          INTEGER DEFAULT 1,
  "embedding_centroid"  JSONB,
  "created_at"          TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS "face_detections" (
  "id"               SERIAL PRIMARY KEY,
  "scan_id"          INTEGER NOT NULL REFERENCES "scans"("id") ON DELETE CASCADE,
  "person_id"        INTEGER REFERENCES "persons"("id") ON DELETE SET NULL,
  "google_media_id"  TEXT NOT NULL,
  "photo_url"        TEXT NOT NULL,
  "bounding_box"     JSONB,
  "confidence"       TEXT,
  "is_selected"      BOOLEAN DEFAULT false,
  "created_at"       TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS "idx_albums_user_id"     ON "albums"("user_id");
CREATE INDEX IF NOT EXISTS "idx_scans_album_id"     ON "scans"("album_id");
CREATE INDEX IF NOT EXISTS "idx_scans_status"       ON "scans"("status");
CREATE INDEX IF NOT EXISTS "idx_persons_scan_id"    ON "persons"("scan_id");
CREATE INDEX IF NOT EXISTS "idx_detections_scan_id" ON "face_detections"("scan_id");
CREATE INDEX IF NOT EXISTS "idx_detections_person"  ON "face_detections"("person_id");
