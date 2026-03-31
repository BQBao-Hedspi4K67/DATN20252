import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, unwrapApiData } from '../lib/api';

export default function CourseDetailPage() {
  const { slug } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const response = await api.get(`/courses/${slug}`);
      if (mounted) {
        setCourse(unwrapApiData(response));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const onEnroll = async () => {
    setMessage('');
    setEnrollLoading(true);
    try {
      await api.post('/enrollments', { courseId: course.id });
      setMessage('Enrollment success. Open My Learning to continue.');
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrollLoading(false);
    }
  };

  if (!course) {
    return <div className="page-shell"><div className="loader">Loading course...</div></div>;
  }

  return (
    <div className="page-shell">
      <section className="detail-banner">
        <img src={course.thumbnail_url || 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=1200'} alt={course.title} />
        <div>
          <span className={`tag ${course.course_mode === 'certificate' ? 'tag-cert' : 'tag-live'}`}>
            {course.course_mode}
          </span>
          <h1>{course.title}</h1>
          <p>{course.description}</p>
          <div className="detail-actions">
            <button type="button" className="btn-primary" onClick={onEnroll} disabled={enrollLoading}>
              {enrollLoading ? 'Enrolling...' : 'Enroll Now'}
            </button>
            <Link to="/student/learning" className="btn-ghost">Go to My Learning</Link>
          </div>
          {message && <p className="inline-note">{message}</p>}
        </div>
      </section>

      <section className="section-block">
        <h2>Chapters & Lessons</h2>
        <div className="chapter-list">
          {course.chapters.map((chapter) => (
            <article key={chapter.id} className="chapter-card">
              <h3>{chapter.position}. {chapter.title}</h3>
              <ul>
                {chapter.lessons.map((lesson) => (
                  <li key={lesson.id}>
                    <span>{lesson.position}. {lesson.title}</span>
                    <em>{lesson.lesson_type}</em>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
