-- Scenario pack: heavy exam data for retry and scoring validation

INSERT INTO assessment_questions (id, assessment_id, question_text, question_type, position)
VALUES
  (21003, 11002, 'Which HTTP status code means Unauthorized?', 'single_choice', 2),
  (21004, 11002, 'What is middleware in Express?', 'single_choice', 3),
  (21005, 12001, 'Which SQL command modifies existing rows?', 'single_choice', 2)
ON DUPLICATE KEY UPDATE
  question_text = VALUES(question_text),
  position = VALUES(position);

INSERT INTO assessment_options (id, question_id, option_text, is_correct)
VALUES
  (31009, 21003, '401', 1),
  (31010, 21003, '403', 0),
  (31011, 21003, '404', 0),
  (31012, 21004, 'A function that can access req, res, next in pipeline', 1),
  (31013, 21004, 'A CSS preprocessor', 0),
  (31014, 21004, 'A database driver only', 0),
  (32003, 21005, 'UPDATE', 1),
  (32004, 21005, 'SELECT', 0),
  (32005, 21005, 'CREATE', 0)
ON DUPLICATE KEY UPDATE
  option_text = VALUES(option_text),
  is_correct = VALUES(is_correct);

INSERT INTO assessment_attempts (id, assessment_id, enrollment_id, score, is_passed, submitted_at)
VALUES
  (41003, 11002, 5000, 66.67, 0, '2026-03-29 10:00:00'),
  (41004, 11002, 5000, 100.00, 1, '2026-03-29 11:00:00'),
  (41005, 12001, 5003, 60.00, 0, '2026-03-30 20:15:00')
ON DUPLICATE KEY UPDATE
  score = VALUES(score),
  is_passed = VALUES(is_passed),
  submitted_at = VALUES(submitted_at);

INSERT INTO assessment_attempt_answers (id, attempt_id, question_id, option_id, is_correct)
VALUES
  (51005, 41003, 21002, 31006, 1),
  (51006, 41003, 21003, 31010, 0),
  (51007, 41003, 21004, 31012, 1),
  (51008, 41004, 21002, 31006, 1),
  (51009, 41004, 21003, 31009, 1),
  (51010, 41004, 21004, 31012, 1),
  (51011, 41005, 22000, 32001, 0),
  (51012, 41005, 21005, 32003, 1)
ON DUPLICATE KEY UPDATE
  option_id = VALUES(option_id),
  is_correct = VALUES(is_correct);
