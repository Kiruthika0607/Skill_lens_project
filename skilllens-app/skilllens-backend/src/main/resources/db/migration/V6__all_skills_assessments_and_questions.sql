-- V6: Seed assessments, questions, and options for all remaining catalog skills
-- Skills covered: TypeScript, Kubernetes, PostgreSQL, System Design, JavaScript, HTML & CSS, 
-- Node.js, Express.js, REST APIs, MongoDB, Redis, AWS, CI/CD, Linux, C++, DSA

-- 1. Assessments
INSERT INTO assessments (id, title, description, skill_id, difficulty, time_limit_minutes, passing_score, is_active, created_at) VALUES
(9, 'TypeScript Type Systems & Advanced Generics', 'Evaluate static typing, generics, mapped types, utility types, and structural type compatibility in TypeScript.', 3, 'INTERMEDIATE', 20, 70, TRUE, NOW()),
(10, 'Kubernetes Container Orchestration & Pod Architecture', 'Assess knowledge of Pod lifecycle, Deployments, Services, ConfigMaps, Ingress, and horizontal pod autoscaling.', 7, 'INTERMEDIATE', 25, 70, TRUE, NOW()),
(11, 'PostgreSQL Relational Modeling & Query Optimization', 'Assess table partitioning, JSONB querying, EXPLAIN ANALYZE execution plans, and transaction isolation levels.', 9, 'INTERMEDIATE', 20, 70, TRUE, NOW()),
(12, 'Distributed System Design & Scalability Patterns', 'Evaluate high-availability architectures, CAP theorem, load balancing, caching tiers, and eventual consistency.', 11, 'ADVANCED', 30, 70, TRUE, NOW()),
(13, 'Modern JavaScript (ES6+), Event Loop & Async Architecture', 'Assess closures, prototypal inheritance, Promises, async/await, microtasks vs macrotasks, and DOM events.', 13, 'INTERMEDIATE', 20, 70, TRUE, NOW()),
(14, 'Responsive Web Standards: HTML5 Semantics & Modern CSS', 'Assess semantic document structure, CSS Flexbox, CSS Grid layouts, accessibility standards (ARIA), and responsive media queries.', 14, 'BEGINNER', 15, 70, TRUE, NOW()),
(15, 'Node.js Runtime Architecture, Event Loop & Streams', 'Evaluate asynchronous non-blocking I/O, Buffer operations, Stream pipelines, and event emitter patterns.', 15, 'INTERMEDIATE', 20, 70, TRUE, NOW()),
(16, 'Express.js REST Routing & Middleware Pipelines', 'Assess request/response lifecycle, custom error handling middleware, authentication wrappers, and route parameter extraction.', 16, 'BEGINNER', 15, 70, TRUE, NOW()),
(17, 'RESTful API Architecture & HTTP Protocol Standards', 'Evaluate HTTP status codes, idempotency, resource-oriented URI design, rate limiting, and content negotiation.', 17, 'INTERMEDIATE', 20, 70, TRUE, NOW()),
(18, 'MongoDB Document Modeling & Aggregation Framework', 'Assess schema design patterns, embedded vs referenced collections, indexing strategies, and aggregation pipeline operators.', 18, 'INTERMEDIATE', 20, 70, TRUE, NOW()),
(19, 'Redis In-Memory Caching & Distributed Data Structures', 'Evaluate caching strategies (cache-aside, write-through), TTL expiration policies, Pub/Sub, and atomic operations.', 19, 'INTERMEDIATE', 15, 70, TRUE, NOW()),
(20, 'AWS Cloud Architecture & Core Services Mastery', 'Assess Amazon EC2, S3 bucket security, RDS multi-AZ deployments, IAM policies, and VPC subnet architectures.', 20, 'INTERMEDIATE', 25, 70, TRUE, NOW()),
(21, 'CI/CD Pipeline Automation & Continuous Delivery', 'Evaluate automated test execution, GitHub Actions workflows, artifact promotion, and blue-green deployment strategies.', 21, 'BEGINNER', 15, 70, TRUE, NOW()),
(22, 'Linux Operating System & Production Shell Scripting', 'Assess process management, file permissions (chmod/chown), SSH configuration, systemd services, and bash piping.', 22, 'BEGINNER', 20, 70, TRUE, NOW()),
(23, 'C++ Memory Management, Pointers & STL Algorithms', 'Evaluate manual heap management, smart pointers (unique_ptr, shared_ptr), RAII idioms, and Standard Template Library algorithms.', 23, 'INTERMEDIATE', 25, 70, TRUE, NOW()),
(24, 'Data Structures & Algorithmic Problem Solving', 'Assess time and space complexity (Big-O), binary search trees, graph traversal (BFS/DFS), and dynamic programming paradigms.', 24, 'INTERMEDIATE', 30, 70, TRUE, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 2. Assessment Questions (IDs 20 - 51)
INSERT INTO assessment_questions (id, assessment_id, question_text, question_type, points, order_index) VALUES
-- TypeScript (Assessment 9)
(20, 9, 'What is the purpose of the "unknown" type in TypeScript compared to "any"?', 'SINGLE_CHOICE', 1, 0),
(21, 9, 'Which TypeScript utility type constructs a type with all properties of T set to optional?', 'SINGLE_CHOICE', 1, 1),
-- Kubernetes (Assessment 10)
(22, 10, 'What is the smallest deployable computing unit that can be created and managed in Kubernetes?', 'SINGLE_CHOICE', 1, 0),
(23, 10, 'Which Kubernetes Service type provisions an external cloud load balancer to route traffic into the cluster?', 'SINGLE_CHOICE', 1, 1),
-- PostgreSQL (Assessment 11)
(24, 11, 'Which data type in PostgreSQL is specifically optimized for storing and querying semi-structured JSON data with indexing support?', 'SINGLE_CHOICE', 1, 0),
(25, 11, 'What is the purpose of the EXPLAIN ANALYZE command in PostgreSQL?', 'SINGLE_CHOICE', 1, 1),
-- System Design (Assessment 12)
(26, 12, 'According to the CAP theorem, which property must a distributed data store sacrifice during a network partition if it guarantees consistency?', 'SINGLE_CHOICE', 1, 0),
(27, 12, 'What architectural pattern stores a state change as a sequential series of immutable events rather than overwriting current state?', 'SINGLE_CHOICE', 1, 1),
-- JavaScript (Assessment 13)
(28, 13, 'Where are resolved Promise callbacks queued in the JavaScript event loop?', 'SINGLE_CHOICE', 1, 0),
(29, 13, 'What does lexical scoping mean in JavaScript functions?', 'SINGLE_CHOICE', 1, 1),
-- HTML & CSS (Assessment 14)
(30, 14, 'Which CSS Grid property specifies the number and widths of columns in a grid container?', 'SINGLE_CHOICE', 1, 0),
(31, 14, 'Which semantic HTML5 tag represents independent, self-contained content such as a blog post or news story?', 'SINGLE_CHOICE', 1, 1),
-- Node.js (Assessment 15)
(32, 15, 'What mechanism does Node.js use to achieve high throughput on single-threaded I/O operations without blocking execution?', 'SINGLE_CHOICE', 1, 0),
(33, 15, 'Which built-in Node.js module is used to handle streaming binary data without loading the entire payload into RAM?', 'SINGLE_CHOICE', 1, 1),
-- Express.js (Assessment 16)
(34, 16, 'What must a custom Express middleware function call to pass control to the subsequent middleware in the request stack?', 'SINGLE_CHOICE', 1, 0),
(35, 16, 'In Express routing, how do you access a route parameter defined as /users/:userId?', 'SINGLE_CHOICE', 1, 1),
-- REST APIs (Assessment 17)
(36, 17, 'Which HTTP method should be used to make idempotent full updates to an existing resource?', 'SINGLE_CHOICE', 1, 0),
(37, 17, 'What is the standard HTTP response status code for a request that succeeded and resulted in a newly created resource?', 'SINGLE_CHOICE', 1, 1),
-- MongoDB (Assessment 18)
(38, 18, 'Which aggregation pipeline stage in MongoDB filters documents to pass only those that match specified conditions to the next stage?', 'SINGLE_CHOICE', 1, 0),
(39, 18, 'In MongoDB schema design, when is embedding child documents preferred over referencing them by ObjectID?', 'SINGLE_CHOICE', 1, 1),
-- Redis (Assessment 19)
(40, 19, 'What is the primary operational mode of Redis that enables sub-millisecond read and write latency?', 'SINGLE_CHOICE', 1, 0),
(41, 19, 'Which Redis data structure is optimal for tracking a real-time leaderboard sorted by user scores?', 'SINGLE_CHOICE', 1, 1),
-- AWS (Assessment 20)
(42, 20, 'Which AWS compute service executes backend code automatically in response to events without requiring server provisioning or management?', 'SINGLE_CHOICE', 1, 0),
(43, 20, 'What AWS security component acts as a virtual firewall for your EC2 instances to control incoming and outgoing traffic?', 'SINGLE_CHOICE', 1, 1),
-- CI/CD (Assessment 21)
(44, 21, 'What is the primary distinction between Continuous Delivery (CD) and Continuous Deployment?', 'SINGLE_CHOICE', 1, 0),
(45, 21, 'Which deployment strategy runs two identical production environments to enable zero-downtime releases and rapid rollback?', 'SINGLE_CHOICE', 1, 1),
-- Linux (Assessment 22)
(46, 22, 'Which Linux command displays active processes and real-time CPU and memory utilization dynamically?', 'SINGLE_CHOICE', 1, 0),
(47, 22, 'What numeric permission value in chmod grants read, write, and execute to owner, and read and execute to group and others?', 'SINGLE_CHOICE', 1, 1),
-- C++ (Assessment 23)
(48, 23, 'Which C++ smart pointer guarantees single ownership and automatically deallocates memory when it goes out of scope?', 'SINGLE_CHOICE', 1, 0),
(49, 23, 'What C++ programming paradigm ties resource acquisition and release directly to object lifetime (constructor/destructor)?', 'SINGLE_CHOICE', 1, 1),
-- DSA (Assessment 24)
(50, 24, 'What is the worst-case time complexity of searching for an element in an unsorted array of size N?', 'SINGLE_CHOICE', 1, 0),
(51, 24, 'Which data structure follows a First-In-First-Out (FIFO) ordering for insertion and deletion?', 'SINGLE_CHOICE', 1, 1)
ON DUPLICATE KEY UPDATE question_text=VALUES(question_text);

-- 3. Assessment Options (IDs 77 - 204)
INSERT INTO assessment_options (id, question_id, option_text, is_correct, order_index) VALUES
-- Q20: TypeScript unknown vs any
(77, 20, 'unknown requires type checking or narrowing before operations can be performed, whereas any disables type checking', TRUE, 0),
(78, 20, 'unknown can only hold null or undefined while any holds all types', FALSE, 1),
(79, 20, 'unknown is converted to string at compile time', FALSE, 2),
(80, 20, 'There is no difference; unknown is an alias for any', FALSE, 3),

-- Q21: TypeScript Partial
(81, 21, 'Partial<T>', TRUE, 0),
(82, 21, 'Required<T>', FALSE, 1),
(83, 21, 'Omit<T, K>', FALSE, 2),
(84, 21, 'Pick<T, K>', FALSE, 3),

-- Q22: K8s Pod
(85, 22, 'Pod', TRUE, 0),
(86, 22, 'Container', FALSE, 1),
(87, 22, 'Node', FALSE, 2),
(88, 22, 'Cluster', FALSE, 3),

-- Q23: K8s Service LoadBalancer
(89, 23, 'LoadBalancer', TRUE, 0),
(90, 23, 'ClusterIP', FALSE, 1),
(91, 23, 'NodePort', FALSE, 2),
(92, 23, 'ExternalName', FALSE, 3),

-- Q24: Postgres JSONB
(93, 24, 'JSONB (Binary JSON)', TRUE, 0),
(94, 24, 'VARCHAR', FALSE, 1),
(95, 24, 'BLOB', FALSE, 2),
(96, 24, 'TEXT', FALSE, 3),

-- Q25: Postgres EXPLAIN ANALYZE
(97, 25, 'It executes the query and prints actual execution times, node costs, and row counts', TRUE, 0),
(98, 25, 'It validates SQL syntax without touching database indexes', FALSE, 1),
(99, 25, 'It automatically creates missing indexes on the table', FALSE, 2),
(100, 25, 'It rolls back all changes made by the query', FALSE, 3),

-- Q26: CAP theorem
(101, 26, 'Availability', TRUE, 0),
(102, 26, 'Durability', FALSE, 1),
(103, 26, 'Partition Tolerance', FALSE, 2),
(104, 26, 'Atomicity', FALSE, 3),

-- Q27: Event Sourcing
(105, 27, 'Event Sourcing', TRUE, 0),
(106, 27, 'CQRS (Command Query Responsibility Segregation)', FALSE, 1),
(107, 27, 'Microservices Architecture', FALSE, 2),
(108, 27, 'Active Record', FALSE, 3),

-- Q28: JS Microtask Queue
(109, 28, 'Microtask queue (evaluated before the next event loop rendering frame)', TRUE, 0),
(110, 28, 'Macrotask / Timer queue (along with setTimeout)', FALSE, 1),
(111, 28, 'Operating system kernel queue', FALSE, 2),
(112, 28, 'Directly executed on a background CPU thread', FALSE, 3),

-- Q29: Lexical Scope
(113, 29, 'Inner functions have access to variables declared in their outer enclosing scope where they were written', TRUE, 0),
(114, 29, 'Variables are only accessible if passed via function arguments', FALSE, 1),
(115, 29, 'Functions can modify the global object without declarations', FALSE, 2),
(116, 29, 'Scope is determined at runtime by which function calls it', FALSE, 3),

-- Q30: CSS Grid grid-template-columns
(117, 30, 'grid-template-columns', TRUE, 0),
(118, 30, 'flex-direction', FALSE, 1),
(119, 30, 'grid-column-gap', FALSE, 2),
(120, 30, 'display: inline-block', FALSE, 3),

-- Q31: HTML5 article
(121, 31, '<article>', TRUE, 0),
(122, 31, '<section>', FALSE, 1),
(123, 31, '<div>', FALSE, 2),
(124, 31, '<span>', FALSE, 3),

-- Q32: Node.js non-blocking I/O
(125, 32, 'libuv event-driven asynchronous event loop with thread pool worker delegation', TRUE, 0),
(126, 32, 'Creating a new OS operating thread for every incoming HTTP request', FALSE, 1),
(127, 32, 'Compiling JavaScript directly into machine code via JVM', FALSE, 2),
(128, 32, 'Synchronous file locking mechanisms', FALSE, 3),

-- Q33: Node.js Stream
(129, 33, 'stream module (Readable, Writable, Transform pipelines)', TRUE, 0),
(130, 33, 'fs.readFileSync()', FALSE, 1),
(131, 33, 'path.resolve()', FALSE, 2),
(132, 33, 'JSON.parse()', FALSE, 3),

-- Q34: Express next()
(133, 34, 'next()', TRUE, 0),
(134, 34, 'res.continue()', FALSE, 1),
(135, 34, 'return true', FALSE, 2),
(136, 34, 'req.forward()', FALSE, 3),

-- Q35: Express req.params
(137, 35, 'req.params.userId', TRUE, 0),
(138, 35, 'req.query.userId', FALSE, 1),
(139, 35, 'req.body.userId', FALSE, 2),
(140, 35, 'req.headers.userId', FALSE, 3),

-- Q36: REST PUT
(141, 36, 'PUT', TRUE, 0),
(142, 36, 'POST', FALSE, 1),
(143, 36, 'DELETE', FALSE, 2),
(144, 36, 'CONNECT', FALSE, 3),

-- Q37: REST 201 Created
(145, 37, '201 Created', TRUE, 0),
(146, 37, '200 OK', FALSE, 1),
(147, 37, '204 No Content', FALSE, 2),
(148, 37, '301 Moved Permanently', FALSE, 3),

-- Q38: MongoDB $match
(149, 38, '$match', TRUE, 0),
(150, 38, '$group', FALSE, 1),
(151, 38, '$project', FALSE, 2),
(152, 38, '$sort', FALSE, 3),

-- Q39: MongoDB embedded docs
(153, 39, 'When data has a 1-to-few relationship and child documents are read together frequently with the parent', TRUE, 0),
(154, 39, 'When the child document array grows unboundedly past 16MB', FALSE, 1),
(155, 39, 'When multiple independent collections need to reference the same child document', FALSE, 2),
(156, 39, 'When relational foreign key constraints are strictly required', FALSE, 3),

-- Q40: Redis In-memory
(157, 40, 'All primary dataset records reside in RAM (in-memory storage)', TRUE, 0),
(158, 40, 'Continuous spinning disk indexing', FALSE, 1),
(159, 40, 'Relational B-tree tables stored in NVMe flash', FALSE, 2),
(160, 40, 'Client-side local browser storage caching', FALSE, 3),

-- Q41: Redis Sorted Set
(161, 41, 'Sorted Set (ZSET)', TRUE, 0),
(162, 41, 'String (SET/GET)', FALSE, 1),
(163, 41, 'List (LPUSH/RPUSH)', FALSE, 2),
(164, 41, 'Bitfield', FALSE, 3),

-- Q42: AWS Lambda
(165, 42, 'AWS Lambda', TRUE, 0),
(166, 42, 'Amazon EC2', FALSE, 1),
(167, 42, 'Amazon EBS', FALSE, 2),
(168, 42, 'Amazon Route 53', FALSE, 3),

-- Q43: AWS Security Group
(169, 43, 'Security Group', TRUE, 0),
(170, 43, 'CloudWatch Alarm', FALSE, 1),
(171, 43, 'IAM Role', FALSE, 2),
(172, 43, 'S3 Access Point', FALSE, 3),

-- Q44: CI/CD Continuous Delivery vs Deployment
(173, 44, 'Continuous Delivery requires manual approval to deploy to production, while Continuous Deployment releases automatically upon passing tests', TRUE, 0),
(174, 44, 'Continuous Delivery does not include automated testing', FALSE, 1),
(175, 44, 'Continuous Deployment can only be used with containerized applications', FALSE, 2),
(176, 44, 'There is no difference; they are exact synonyms', FALSE, 3),

-- Q45: Blue-Green Deployment
(177, 45, 'Blue-Green Deployment', TRUE, 0),
(178, 45, 'Canary Deployment', FALSE, 1),
(179, 45, 'Rolling Deployment', FALSE, 2),
(180, 45, 'Recreate Deployment', FALSE, 3),

-- Q46: Linux top / htop
(181, 46, 'top (or htop)', TRUE, 0),
(182, 46, 'ls -la', FALSE, 1),
(183, 46, 'grep', FALSE, 2),
(184, 46, 'cat /etc/passwd', FALSE, 3),

-- Q47: Linux chmod 755
(185, 47, '755 (rwxr-xr-x)', TRUE, 0),
(186, 47, '644 (rw-r--r--)', FALSE, 1),
(187, 47, '777 (rwxrwxrwx)', FALSE, 2),
(188, 47, '700 (rwx------)', FALSE, 3),

-- Q48: C++ std::unique_ptr
(189, 48, 'std::unique_ptr', TRUE, 0),
(190, 48, 'std::shared_ptr', FALSE, 1),
(191, 48, 'raw pointer (T*)', FALSE, 2),
(192, 48, 'std::weak_ptr', FALSE, 3),

-- Q49: C++ RAII
(193, 49, 'RAII (Resource Acquisition Is Initialization)', TRUE, 0),
(194, 49, 'Garbage Collection', FALSE, 1),
(195, 49, 'Reference Counting', FALSE, 2),
(196, 49, 'Manual free() Invocation', FALSE, 3),

-- Q50: DSA Unsorted Search
(197, 50, 'O(N) linear time', TRUE, 0),
(198, 50, 'O(1) constant time', FALSE, 1),
(199, 50, 'O(log N) logarithmic time', FALSE, 2),
(200, 50, 'O(N^2) quadratic time', FALSE, 3),

-- Q51: DSA Queue FIFO
(201, 51, 'Queue', TRUE, 0),
(202, 51, 'Stack (LIFO)', FALSE, 1),
(203, 51, 'Binary Heap', FALSE, 2),
(204, 51, 'Hash Table', FALSE, 3)
ON DUPLICATE KEY UPDATE option_text=VALUES(option_text);
