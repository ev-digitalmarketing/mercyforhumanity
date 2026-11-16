CREATE TABLE newsletter_subscribers (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL UNIQUE,
  created TEXT NOT NULL,
  consent_version TEXT NOT NULL
);
