-- Migration: Add countdown_target column to users table
-- Run: npx wrangler d1 execute intimome-db --remote --file=./migrations/add_countdown_target.sql

ALTER TABLE users ADD COLUMN countdown_target TEXT;
