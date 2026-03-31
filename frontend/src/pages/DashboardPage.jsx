import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, unwrapApiData } from '../lib/api';

function CourseCard({ course, index }) {
  return (
    <article className="course-card" style={{ animationDelay: `${120 + index * 70}ms` }}>
      <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200'} alt={course.title} />
      <div className="course-card-body">
        <span className={`tag ${course.course_mode === 'certificate' ? 'tag-cert' : 'tag-live'}`}>
          {course.course_mode === 'certificate' ? 'Certificate' : 'Instructor-led'}
        </span>
        <h3>{course.title}</h3>
        <p>{course.description || 'No description yet.'}</p>
        <div className="course-meta">
          <span>{course.lesson_count} lessons</span>
          <span>{course.chapter_count} chapters</span>
        </div>
        <Link to={`/courses/${course.slug}`} className="btn-primary">Explore Course</Link>
      </div>
    </article>
  );
}

export default function DashboardPage() {
  const [courses, setCourses] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const response = await api.get('/courses');
        const data = unwrapApiData(response) || [];
        if (mounted) {
          setCourses(data);
          setErrorMessage('');
        }
      } catch (error) {
        if (mounted) {
          setCourses([]);
          setErrorMessage(error?.response?.data?.message || 'Cannot load courses right now.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const key = keyword.trim().toLowerCase();
    if (!key) {
      return courses;
    }
    return courses.filter((course) =>
      `${course.title} ${course.description || ''}`.toLowerCase().includes(key)
    );
  }, [courses, keyword]);

  const certCourses = filtered.filter((course) => course.course_mode === 'certificate');
  const liveCourses = filtered.filter((course) => course.course_mode === 'instructor_led');

  return (
    <div className="page-shell">
      <section className="hero">
        <div className="hero-content">
          <p className="hero-kicker">Node.js • React.js • MySQL</p>
          <h1>Build Skills. Pass Assessments. Earn Credentials.</h1>
          <p>
            A bold LMS experience with certificate tracks, instructor-led cohorts,
            chapter quizzes, and final exams in one unified learning flow.
          </p>
          <input
            type="text"
            placeholder="Search courses..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <div className="hero-spotlight">
          <div className="hero-stat">
            <strong>{courses.length}</strong>
            <span>Total courses</span>
          </div>
          <div className="hero-stat">
            <strong>{certCourses.length}</strong>
            <span>Certificate paths</span>
          </div>
          <div className="hero-stat">
            <strong>{liveCourses.length}</strong>
            <span>Instructor-led</span>
          </div>
        </div>
      </section>

      {loading && <div className="loader">Loading courses...</div>}
      {errorMessage ? <p className="error-text">{errorMessage}</p> : null}

      {!loading && (
        <>
          <section className="section-block">
            <h2>Certificate Courses</h2>
            <div className="course-grid">
              {certCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          </section>

          <section className="section-block">
            <h2>Instructor-led Courses</h2>
            <div className="course-grid">
              {liveCourses.map((course, index) => (
                <CourseCard key={course.id} course={course} index={index} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
