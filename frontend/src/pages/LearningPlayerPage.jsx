import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, unwrapApiData } from '../lib/api';

function LessonContent({ lesson, elapsedSeconds }) {
  if (!lesson) {
    return <div className="loader">Select a lesson to start learning.</div>;
  }

  if (lesson.lesson_type === 'video') {
    return (
      <div className="player-card">
        <h2>{lesson.title}</h2>
        <div className="video-wrap">
          <iframe
            src={lesson.video_url?.replace('watch?v=', 'embed/')}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p>Video in progress. Elapsed study timer: {elapsedSeconds}s</p>
      </div>
    );
  }

  if (lesson.lesson_type === 'document' || lesson.lesson_type === 'image') {
    return (
      <div className="player-card">
        <h2>{lesson.title}</h2>
        <p>
          Resource link:{' '}
          <a href={lesson.file_url} target="_blank" rel="noreferrer">
            Open learning file
          </a>
        </p>
        <p>Required minimum reading: {lesson.min_read_seconds || 0}s</p>
        <p>Elapsed study timer: {elapsedSeconds}s</p>
      </div>
    );
  }

  return (
    <div className="player-card">
      <h2>{lesson.title}</h2>
      <p>{lesson.content_text || 'Text lesson content will be displayed here.'}</p>
      <p>Required minimum reading: {lesson.min_read_seconds || 0}s</p>
      <p>Elapsed study timer: {elapsedSeconds}s</p>
    </div>
  );
}

export default function LearningPlayerPage() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const [course, setCourse] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [courseRes, enrollmentRes] = await Promise.all([
        api.get(`/courses/${slug}`),
        api.get('/enrollments/me')
      ]);

      if (!mounted) {
        return;
      }

      setCourse(unwrapApiData(courseRes));
      setEnrollments(unwrapApiData(enrollmentRes) || []);

      try {
        const progressRes = await api.get(`/enrollments/me/course/${slug}/progress`);
        const progressData = unwrapApiData(progressRes);
        setLessonProgress(progressData?.lessons || []);
      } catch (_error) {
        setLessonProgress([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const allLessons = useMemo(() => {
    if (!course) {
      return [];
    }

    return course.chapters.flatMap((chapter) =>
      chapter.lessons.map((lesson) => ({
        ...lesson,
        chapterTitle: chapter.title,
        chapterId: chapter.id
      }))
    );
  }, [course]);

  const selectedLessonId = Number(params.get('lessonId') || allLessons[0]?.id || 0);
  const selectedLesson = allLessons.find((lesson) => Number(lesson.id) === Number(selectedLessonId)) || null;

  useEffect(() => {
    setElapsedSeconds(0);
    setStatusMessage('');
  }, [selectedLessonId]);

  useEffect(() => {
    if (!selectedLesson) {
      return undefined;
    }

    const interval = setInterval(async () => {
      setElapsedSeconds((prev) => prev + 15);
      try {
        await api.post(`/progress/lessons/${selectedLesson.id}/heartbeat`, {
          heartbeatSecond: 15,
          lastPosition: selectedLesson.lesson_type === 'video' ? 80 : 100
        });
      } catch (_error) {
        // keep silent to avoid noisy UI while user is studying
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [selectedLesson]);

  const selectLesson = (lessonId) => {
    const next = new URLSearchParams(params);
    next.set('lessonId', lessonId);
    setParams(next);
  };

  const completedLessonIds = useMemo(() => {
    return new Set(
      lessonProgress
        .filter((item) => item.progress_status === 'completed')
        .map((item) => Number(item.lesson_id))
    );
  }, [lessonProgress]);

  const moveToNextLesson = () => {
    if (!selectedLesson) {
      return;
    }
    const currentIndex = allLessons.findIndex((item) => Number(item.id) === Number(selectedLesson.id));
    if (currentIndex < 0 || currentIndex === allLessons.length - 1) {
      return;
    }
    selectLesson(allLessons[currentIndex + 1].id);
  };

  const reloadProgress = async () => {
    try {
      const [enrollmentRes, progressRes] = await Promise.all([
        api.get('/enrollments/me'),
        api.get(`/enrollments/me/course/${slug}/progress`)
      ]);
      setEnrollments(unwrapApiData(enrollmentRes) || []);
      const progressData = unwrapApiData(progressRes);
      setLessonProgress(progressData?.lessons || []);
    } catch (_error) {
      // keep current state when fetch fails
    }
  };

  const completeLesson = async () => {
    if (!selectedLesson) {
      return;
    }

    try {
      await api.post(`/progress/lessons/${selectedLesson.id}/complete`, { lastPosition: 100 });
      setStatusMessage('Lesson marked as completed successfully.');
      await reloadProgress();
      moveToNextLesson();
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || 'Could not complete lesson yet.');
    }
  };

  const currentEnrollment = enrollments.find((item) => item.course_slug === slug);

  if (!course) {
    return <div className="page-shell"><div className="loader">Loading learning player...</div></div>;
  }

  return (
    <div className="page-shell learning-layout">
      <aside className="learning-sidebar">
        <h2>{course.title}</h2>
        <p>Progress: {currentEnrollment?.progress_percent || 0}%</p>

        {course.chapters.map((chapter) => (
          <div key={chapter.id} className="sidebar-chapter">
            <h3>{chapter.position}. {chapter.title}</h3>
            <ul>
              {chapter.lessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className={Number(lesson.id) === Number(selectedLessonId) ? 'lesson-active' : ''}
                    onClick={() => selectLesson(lesson.id)}
                  >
                    {lesson.position}. {lesson.title}
                    {completedLessonIds.has(Number(lesson.id)) ? ' (done)' : ''}
                  </button>
                </li>
              ))}
            </ul>
            {chapter.chapterQuiz && (
              <Link className="btn-ghost btn-inline" to={`/student/assessments/${chapter.chapterQuiz.id}`}>
                Take Chapter Quiz
              </Link>
            )}
          </div>
        ))}

        {course.finalExam && (
          <Link className="btn-primary" to={`/student/assessments/${course.finalExam.id}`}>
            Take Final Exam
          </Link>
        )}
      </aside>

      <section className="learning-stage">
        <LessonContent lesson={selectedLesson} elapsedSeconds={elapsedSeconds} />
        <div className="learning-actions">
          <button type="button" className="btn-primary" onClick={completeLesson}>
            Mark Lesson Complete
          </button>
          <Link to="/student/learning" className="btn-ghost">Back to My Learning</Link>
        </div>
        {statusMessage && <p className="inline-note">{statusMessage}</p>}
      </section>
    </div>
  );
}
