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

## 3.1) Quick DB Scripts (Node)

```bash
npm run db:init
npm run db:seed:base
npm run db:seed:all
```

## 4) Seed Account

- Email: admin@lms.local
- Password: Password@123

## 5) Current API Endpoints

- GET / -> basic API info
- GET /api/health -> API + DB health check
- POST /api/auth/login -> seeded user login
- GET /api/auth/me -> current profile (Bearer token)
- GET /api/courses -> list published courses (supports query: courseMode, keyword)
- GET /api/courses/:slug -> course detail with chapters and lessons
- POST /api/enrollments -> enroll to course (student only, Bearer token)
- GET /api/enrollments/me -> list my enrollments (student only, Bearer token)
- POST /api/progress/lessons/:lessonId/heartbeat -> update reading/video progress
- POST /api/progress/lessons/:lessonId/complete -> mark lesson complete with validation
- GET /api/assessments/:assessmentId -> get quiz/final payload for student
- POST /api/assessments/:assessmentId/submit -> submit answers and receive score/pass result
- POST /api/assessments -> create assessment with questions/options (instructor/admin)
- GET /api/certificates/me -> list my issued certificates (student)
- GET /api/certificates/verify/:code -> public certificate verification endpoint
- GET /api/instructor/courses -> list owned courses (instructor/admin)
- POST /api/instructor/courses -> create draft course
- PATCH /api/instructor/courses/:courseId -> update course metadata
- POST /api/instructor/courses/:courseId/chapters -> create chapter for course
- POST /api/instructor/chapters/:chapterId/lessons -> create lesson with URL-based assets
- POST /api/instructor/courses/:courseId/publish -> publish with structure validation
- GET /api/admin/users -> list users (admin)
- PATCH /api/admin/users/:userId/active -> activate/deactivate user (admin)
- GET /api/admin/courses -> list courses with filters (admin)
- PATCH /api/admin/courses/:courseId/status -> update course status (admin)
- GET /api/admin/categories -> list categories (admin)
- POST /api/admin/categories -> create category (admin)

## 6) Run Tests

```bash
npm test
```

## 7) Notes

- Lesson media assets (video/image/pdf/doc) are persisted as URLs in DB fields.
- DB is seeded using multiple scenario packs with meaningful linked data.
