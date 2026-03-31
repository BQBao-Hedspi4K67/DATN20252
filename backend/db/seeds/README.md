# Seed Packs

This backend uses multiple seed packs so data remains maintainable and scenario-driven.

## Order
1. Run migration: db/migrations/001_init_schema.sql
2. Run base seed: db/seeds/00_base_seed.sql
3. Optional scenario packs (any combination):
- db/seeds/01_certificate_track_seed.sql
- db/seeds/02_instructor_led_seed.sql
- db/seeds/03_assessment_heavy_seed.sql

## Design Rules
- Each seed file has meaningful linked data across users, courses, chapters, lessons, enrollments, and assessments.
- Lesson assets are stored as URLs in DB fields: video_url, thumbnail_url, file_url.
- Seed scripts use deterministic IDs and ON DUPLICATE KEY UPDATE to support repeated imports.

## Seed Credentials
- Email examples: admin@lms.local, an.student@lms.local
- Password for seeded users: Password@123
