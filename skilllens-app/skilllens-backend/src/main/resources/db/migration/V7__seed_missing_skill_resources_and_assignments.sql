-- Ensure every currently cataloged skill has a free learning resource and a
-- pass-required assessment that can be used as its final roadmap assignment.

INSERT INTO learning_resources
    (title, description, url, provider, resource_type, cost_type, difficulty_level,
     estimated_duration_hours, rating, rating_count, skill_id, is_verified, created_at)
SELECT seed.title, seed.description, seed.url, seed.provider, 'DOCUMENTATION', 'FREE', 'BEGINNER',
       seed.duration_hours, 4.7, 0, skill.id, TRUE, NOW()
FROM (
    SELECT 7 AS skill_id, 'Kubernetes Tutorials' AS title,
           'Official hands-on tutorials for deploying and managing workloads on Kubernetes.' AS description,
           'https://kubernetes.io/docs/tutorials/' AS url, 'Kubernetes' AS provider, 12 AS duration_hours
    UNION ALL SELECT 8, 'MySQL Getting Started', 'Official MySQL guide covering installation, queries, and relational database fundamentals.',
           'https://dev.mysql.com/doc/mysql-getting-started/en/', 'Oracle MySQL', 10
    UNION ALL SELECT 16, 'Express.js Getting Started', 'Official Express.js guide for creating web servers, routes, and middleware.',
           'https://expressjs.com/en/starter/hello-world.html', 'Express.js', 8
    UNION ALL SELECT 17, 'MDN HTTP Methods', 'Learn the HTTP methods and semantics used to design and consume REST APIs.',
           'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods', 'Mozilla MDN', 6
    UNION ALL SELECT 18, 'MongoDB University Learning Paths', 'Free guided courses covering MongoDB fundamentals, data modeling, and aggregation.',
           'https://learn.mongodb.com/', 'MongoDB', 12
    UNION ALL SELECT 19, 'Redis Developer Documentation', 'Official guides for Redis data structures, commands, and application development.',
           'https://redis.io/docs/latest/develop/', 'Redis', 8
    UNION ALL SELECT 21, 'GitHub Actions Documentation', 'Official guides for automating build, test, and deployment workflows with GitHub Actions.',
           'https://docs.github.com/en/actions', 'GitHub', 8
    UNION ALL SELECT 23, 'Learn C++', 'Free structured C++ tutorials covering language fundamentals, memory, and the standard library.',
           'https://www.learncpp.com/', 'LearnCpp.com', 20
) seed
JOIN skills skill ON skill.id = seed.skill_id AND skill.is_active = TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM learning_resources existing WHERE existing.skill_id = seed.skill_id
);

INSERT INTO assessments
    (title, description, skill_id, difficulty, time_limit_minutes, passing_score, is_active, created_at)
SELECT seed.title, seed.description, skill.id, seed.difficulty, seed.time_limit_minutes, 70, TRUE, NOW()
FROM (
    SELECT 2 AS skill_id, 'Python Programming & Data Skills Assignment' AS title,
           'Final skill assignment covering Python collections, functions, and data-processing fundamentals.' AS description,
           'BEGINNER' AS difficulty, 20 AS time_limit_minutes
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment',
           'Final skill assignment covering container images, Dockerfiles, and container networking.',
           'BEGINNER', 20
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment',
           'Final skill assignment covering SQL joins, filtering, grouping, and relational constraints.',
           'INTERMEDIATE', 20
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment',
           'Final skill assignment covering supervised learning, model evaluation, and overfitting.',
           'INTERMEDIATE', 25
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment',
           'Final skill assignment covering commits, branches, merging, and collaborative workflows.',
           'BEGINNER', 15
) seed
JOIN skills skill ON skill.id = seed.skill_id AND skill.is_active = TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM assessments existing
    WHERE existing.skill_id = seed.skill_id AND existing.is_active = TRUE
);

INSERT INTO assessment_questions
    (assessment_id, question_text, question_type, points, order_index)
SELECT assessment.id, seed.question_text, 'SINGLE_CHOICE', 1, seed.order_index
FROM (
    SELECT 2 AS skill_id, 'Python Programming & Data Skills Assignment' AS assessment_title,
           'Which Python collection preserves insertion order and allows duplicate values?' AS question_text, 0 AS order_index
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment',
           'What does a Python function return when it reaches the end without a return statement?', 1
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment',
           'Which expression creates a new list containing the squares of values in numbers?', 2
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment',
           'Which file defines the instructions Docker uses to build an image?', 0
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment',
           'What is the main purpose of a Docker volume?', 1
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment',
           'Which command starts a container from an existing image?', 2
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment',
           'Which SQL clause filters rows before grouping?', 0
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment',
           'Which join returns matching rows from both tables only?', 1
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment',
           'Which clause filters grouped results after aggregate calculations?', 2
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment',
           'Which task is an example of supervised learning?', 0
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment',
           'What does a model learn from a labeled training dataset?', 1
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment',
           'What is a common sign that a model is overfitting?', 2
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment',
           'Which Git command records staged changes in a new commit?', 0
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment',
           'What does creating a Git branch allow you to do?', 1
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment',
           'Which command downloads remote changes and integrates them into the current branch?', 2
) seed
JOIN assessments assessment
  ON assessment.skill_id = seed.skill_id AND assessment.title = seed.assessment_title AND assessment.is_active = TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM assessment_questions existing
    WHERE existing.assessment_id = assessment.id AND existing.question_text = seed.question_text
);

INSERT INTO assessment_options (question_id, option_text, is_correct, order_index)
SELECT question.id, seed.option_text, seed.is_correct, seed.order_index
FROM (
    SELECT 2 AS skill_id, 'Python Programming & Data Skills Assignment' AS assessment_title,
           'Which Python collection preserves insertion order and allows duplicate values?' AS question_text,
           'A list' AS option_text, TRUE AS is_correct, 0 AS order_index
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'Which Python collection preserves insertion order and allows duplicate values?', 'A set', FALSE, 1
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'Which Python collection preserves insertion order and allows duplicate values?', 'A dictionary key view', FALSE, 2
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'Which Python collection preserves insertion order and allows duplicate values?', 'A frozenset', FALSE, 3
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'What does a Python function return when it reaches the end without a return statement?', 'None', TRUE, 0
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'What does a Python function return when it reaches the end without a return statement?', 'False', FALSE, 1
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'What does a Python function return when it reaches the end without a return statement?', 'An empty string', FALSE, 2
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'What does a Python function return when it reaches the end without a return statement?', 'It raises StopIteration', FALSE, 3
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'Which expression creates a new list containing the squares of values in numbers?', '[n * n for n in numbers]', TRUE, 0
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'Which expression creates a new list containing the squares of values in numbers?', '[numbers * numbers]', FALSE, 1
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'Which expression creates a new list containing the squares of values in numbers?', 'square(numbers)', FALSE, 2
    UNION ALL SELECT 2, 'Python Programming & Data Skills Assignment', 'Which expression creates a new list containing the squares of values in numbers?', '{n * n for n in numbers}', FALSE, 3

    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which file defines the instructions Docker uses to build an image?', 'Dockerfile', TRUE, 0
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which file defines the instructions Docker uses to build an image?', 'docker-compose.lock', FALSE, 1
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which file defines the instructions Docker uses to build an image?', 'container.yaml', FALSE, 2
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which file defines the instructions Docker uses to build an image?', 'Makefile', FALSE, 3
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'What is the main purpose of a Docker volume?', 'Persist or share data outside a container''s writable layer', TRUE, 0
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'What is the main purpose of a Docker volume?', 'Compile source code into an image', FALSE, 1
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'What is the main purpose of a Docker volume?', 'Expose a container port publicly', FALSE, 2
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'What is the main purpose of a Docker volume?', 'Limit CPU usage for a container', FALSE, 3
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which command starts a container from an existing image?', 'docker run', TRUE, 0
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which command starts a container from an existing image?', 'docker build', FALSE, 1
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which command starts a container from an existing image?', 'docker commit', FALSE, 2
    UNION ALL SELECT 6, 'Docker Containers & Images Assignment', 'Which command starts a container from an existing image?', 'docker pull --start', FALSE, 3

    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which SQL clause filters rows before grouping?', 'WHERE', TRUE, 0
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which SQL clause filters rows before grouping?', 'HAVING', FALSE, 1
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which SQL clause filters rows before grouping?', 'ORDER BY', FALSE, 2
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which SQL clause filters rows before grouping?', 'LIMIT', FALSE, 3
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which join returns matching rows from both tables only?', 'INNER JOIN', TRUE, 0
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which join returns matching rows from both tables only?', 'LEFT JOIN', FALSE, 1
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which join returns matching rows from both tables only?', 'CROSS JOIN', FALSE, 2
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which join returns matching rows from both tables only?', 'FULL OUTER JOIN', FALSE, 3
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which clause filters grouped results after aggregate calculations?', 'HAVING', TRUE, 0
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which clause filters grouped results after aggregate calculations?', 'WHERE', FALSE, 1
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which clause filters grouped results after aggregate calculations?', 'FROM', FALSE, 2
    UNION ALL SELECT 8, 'MySQL Queries & Relational Data Assignment', 'Which clause filters grouped results after aggregate calculations?', 'DISTINCT', FALSE, 3

    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'Which task is an example of supervised learning?', 'Predicting house prices from labeled historical examples', TRUE, 0
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'Which task is an example of supervised learning?', 'Grouping customers without known categories', FALSE, 1
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'Which task is an example of supervised learning?', 'Reducing file sizes with compression', FALSE, 2
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'Which task is an example of supervised learning?', 'Sorting a list of numbers', FALSE, 3
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What does a model learn from a labeled training dataset?', 'A mapping from input features to target labels', TRUE, 0
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What does a model learn from a labeled training dataset?', 'The order in which files were loaded', FALSE, 1
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What does a model learn from a labeled training dataset?', 'A guaranteed causal relationship for every feature', FALSE, 2
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What does a model learn from a labeled training dataset?', 'Only the names of the dataset columns', FALSE, 3
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What is a common sign that a model is overfitting?', 'Strong training performance but weak performance on unseen data', TRUE, 0
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What is a common sign that a model is overfitting?', 'Similar performance on training and validation data', FALSE, 1
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What is a common sign that a model is overfitting?', 'The model has fewer input features than examples', FALSE, 2
    UNION ALL SELECT 10, 'Machine Learning Foundations Assignment', 'What is a common sign that a model is overfitting?', 'The model runs on a GPU', FALSE, 3

    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which Git command records staged changes in a new commit?', 'git commit', TRUE, 0
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which Git command records staged changes in a new commit?', 'git status', FALSE, 1
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which Git command records staged changes in a new commit?', 'git fetch', FALSE, 2
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which Git command records staged changes in a new commit?', 'git init', FALSE, 3
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'What does creating a Git branch allow you to do?', 'Develop changes independently from another branch', TRUE, 0
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'What does creating a Git branch allow you to do?', 'Delete the remote repository', FALSE, 1
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'What does creating a Git branch allow you to do?', 'Rewrite every tracked file automatically', FALSE, 2
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'What does creating a Git branch allow you to do?', 'Skip committing changes', FALSE, 3
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which command downloads remote changes and integrates them into the current branch?', 'git pull', TRUE, 0
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which command downloads remote changes and integrates them into the current branch?', 'git log', FALSE, 1
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which command downloads remote changes and integrates them into the current branch?', 'git stash', FALSE, 2
    UNION ALL SELECT 12, 'Git Version Control & Collaboration Assignment', 'Which command downloads remote changes and integrates them into the current branch?', 'git tag', FALSE, 3
) seed
JOIN assessments assessment
  ON assessment.skill_id = seed.skill_id AND assessment.title = seed.assessment_title AND assessment.is_active = TRUE
JOIN assessment_questions question
  ON question.assessment_id = assessment.id AND question.question_text = seed.question_text
WHERE NOT EXISTS (
    SELECT 1 FROM assessment_options existing
    WHERE existing.question_id = question.id AND existing.option_text = seed.option_text
);
