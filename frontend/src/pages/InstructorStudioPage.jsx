import { useEffect, useState } from 'react';
import { api, unwrapApiData } from '../lib/api';

export default function InstructorStudioPage() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');

  const load = async () => {
    const response = await api.get('/instructor/courses');
    setCourses(unwrapApiData(response) || []);
  };

  useEffect(() => {
    load();
  }, []);

  const createCourse = async (event) => {
    event.preventDefault();
    await api.post('/instructor/courses', {
      title,
      slug,
      courseMode: 'certificate'
    });
    setTitle('');
    setSlug('');
    await load();
  };

  return (
    <div className="page-shell">
      <section className="section-block">
        <h1>Instructor Studio</h1>
        <form className="inline-form" onSubmit={createCourse}>
          <input placeholder="Course title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input placeholder="course-slug" value={slug} onChange={(e) => setSlug(e.target.value)} required />
          <button type="submit" className="btn-primary">Create Draft</button>
        </form>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Chapters</th>
                <th>Lessons</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.title}</td>
                  <td>{course.course_mode}</td>
                  <td>{course.status}</td>
                  <td>{course.chapter_count}</td>
                  <td>{course.lesson_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
