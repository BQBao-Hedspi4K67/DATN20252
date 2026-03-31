# LMS Backend

Node.js + Express + MySQL backend scaffold for LMS graduation project.

## 1) Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update DB values in .env.

## 2) Run API

```bash
npm run dev
```

Or:

```bash
npm start
```

## 3) Apply Migration and Seeds (MySQL CLI)

Run migration first:

```sql
SOURCE db/migrations/001_init_schema.sql;
```

Run base seed:

```sql
SOURCE db/seeds/00_base_seed.sql;
```

Optional scenario packs:

```sql
SOURCE db/seeds/01_certificate_track_seed.sql;
SOURCE db/seeds/02_instructor_led_seed.sql;
SOURCE db/seeds/03_assessment_heavy_seed.sql;
```

## 4) Seed Account

- Email: admin@lms.local
- Password: Password@123

## 5) Current API Endpoints

- GET / -> basic API info
- GET /api/health -> API + DB health check
- POST /api/auth/login -> seeded user login

## 6) Notes

- Lesson media assets (video/image/pdf/doc) are persisted as URLs in DB fields.
- DB is seeded using multiple scenario packs with meaningful linked data.
