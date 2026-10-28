import { Router, Request, Response } from 'express';
import { db } from '../db';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';

const router = Router();

const sampleAssessments = [
  {
    id: 'asm_fullstack',
    title: 'Full Stack & Web Engineering Diagnostic',
    category: 'Full Stack Web Development',
    description: 'Comprehensive calibration across modern React hooks, Node.js event loops, REST API design, and SQL indexing.',
    duration_minutes: 10,
    questions_count: 5,
    questions: [
      {
        id: 'q1',
        category: 'Frontend Engineering',
        skillId: 'sk_react',
        question: 'In React, what hook should be used to perform side-effects such as data fetching or DOM subscriptions?',
        options: ['useState()', 'useEffect()', 'useContext()', 'useReducer()'],
        correctIndex: 1,
        explanation: 'useEffect() is designed to run side-effects after React renders DOM elements.'
      },
      {
        id: 'q2',
        category: 'Backend Engineering',
        skillId: 'sk_nodejs',
        question: 'What is the primary benefit of Node.js event-driven, non-blocking I/O architecture?',
        options: [
          'Multi-threaded CPU execution',
          'High concurrency with a single thread handling asynchronous I/O',
          'Automatic database indexing',
          'Strict type safety'
        ],
        correctIndex: 1,
        explanation: 'Node.js event loop handles thousands of concurrent connections using non-blocking asynchronous callbacks.'
      },
      {
        id: 'q3',
        category: 'Programming Languages',
        skillId: 'sk_python',
        question: 'In Python, which list comprehension generates a list of even numbers from 0 to 8?',
        options: [
          '[x for x in range(10) if x % 2 == 0]',
          '[x if x % 2 == 0 for x in range(10)]',
          'list(filter(range(10)))',
          '[even(x) for x in 10]'
        ],
        correctIndex: 0,
        explanation: 'The syntax `[expression for item in iterable if condition]` correctly filters even numbers.'
      },
      {
        id: 'q4',
        category: 'DevOps & Cloud',
        skillId: 'sk_docker',
        question: 'Which Docker command is used to build an image from a Dockerfile in the current directory?',
        options: ['docker run .', 'docker build -t myapp .', 'docker compile .', 'docker push myapp'],
        correctIndex: 1,
        explanation: '`docker build -t <tag> .` builds an image from the Dockerfile in the working directory.'
      },
      {
        id: 'q5',
        category: 'Database & Analytics',
        skillId: 'sk_sql',
        question: 'Which SQL clause is used to filter aggregate records after a GROUP BY clause?',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'FILTER'],
        correctIndex: 1,
        explanation: 'HAVING filters grouped summary rows, whereas WHERE filters individual rows before grouping.'
      }
    ]
  },
  {
    id: 'asm_frontend',
    title: 'Frontend React Architecture & State',
    category: 'Frontend Engineering',
    description: 'Focused assessment covering Virtual DOM reconciliation, Context API boundaries, memoization, and CSS layouts.',
    duration_minutes: 8,
    questions_count: 3,
    questions: [
      {
        id: 'q_fe1',
        category: 'Frontend Engineering',
        skillId: 'sk_react',
        question: 'When does React trigger a re-render of a component?',
        options: [
          'When state or props change',
          'Only when the browser window resizes',
          'Every 1 second automatically',
          'Only upon manual DOM reload'
        ],
        correctIndex: 0,
        explanation: 'React components automatically re-render when internal state or incoming props change.'
      },
      {
        id: 'q_fe2',
        category: 'Frontend Engineering',
        skillId: 'sk_react',
        question: 'What is the purpose of the `useMemo` hook in React?',
        options: [
          'To cache expensive calculation results across renders',
          'To persist values in browser localStorage',
          'To establish a WebSocket connection',
          'To mutate DOM nodes directly'
        ],
        correctIndex: 0,
        explanation: 'useMemo caches the result of an expensive calculation until dependencies change.'
      },
      {
        id: 'q_fe3',
        category: 'Frontend Engineering',
        skillId: 'sk_javascript',
        question: 'What is the key difference between `==` and `===` in JavaScript?',
        options: [
          '`===` performs strict comparison without type coercion',
          '`==` is only used for numbers',
          '`===` converts strings to integers first',
          'There is no difference in modern ES6'
        ],
        correctIndex: 0,
        explanation: 'Strict equality (===) compares values without performing implicit type coercion.'
      }
    ]
  },
  {
    id: 'asm_backend',
    title: 'Backend Systems & API Reliability',
    category: 'Backend Engineering',
    description: 'Evaluate core backend engineering concepts: HTTP response codes, idempotency, connection pooling, and token auth.',
    duration_minutes: 10,
    questions_count: 3,
    questions: [
      {
        id: 'q_be1',
        category: 'Backend Engineering',
        skillId: 'sk_nodejs',
        question: 'Which HTTP method should be idempotent by REST specification?',
        options: ['PUT', 'POST', 'PATCH', 'CONNECT'],
        correctIndex: 0,
        explanation: 'PUT and DELETE are designed to be idempotent in RFC HTTP specifications.'
      },
      {
        id: 'q_be2',
        category: 'Backend Engineering',
        skillId: 'sk_sql',
        question: 'What is the primary advantage of a B-Tree index on a database column?',
        options: [
          'Reduces lookup search time complexity to O(log N)',
          'Compresses the table size to zero bytes',
          'Guarantees no deadlocks ever occur',
          'Automatically runs backups every hour'
        ],
        correctIndex: 0,
        explanation: 'B-Tree indexes reduce query lookups and range scans to logarithmic time.'
      },
      {
        id: 'q_be3',
        category: 'Backend Engineering',
        skillId: 'sk_api',
        question: 'Which status code indicates an authenticated client lacks permissions to access a resource?',
        options: ['403 Forbidden', '401 Unauthorized', '404 Not Found', '502 Bad Gateway'],
        correctIndex: 0,
        explanation: '403 Forbidden means identity is known but access to the requested entity is refused.'
      }
    ]
  }
];

// GET /api/assessment/list
router.get('/list', (req: Request, res: Response) => {
  const list = sampleAssessments.map(({ questions, ...rest }) => rest);
  return res.json({ assessments: list });
});

// GET /api/assessment/questions (legacy)
router.get('/questions', (req: Request, res: Response) => {
  const defaultAsm = sampleAssessments[0];
  return res.json({
    questions: defaultAsm.questions.map(({ correctIndex, explanation, ...q }) => q)
  });
});

// GET /api/assessment/:id
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const assessment = sampleAssessments.find(a => a.id === id) || sampleAssessments[0];
  const safeQuestions = assessment.questions.map(({ correctIndex, explanation, ...q }) => q);
  return res.json({
    assessment: {
      ...assessment,
      questions: safeQuestions
    }
  });
});

// Helper submit logic
function processSubmit(assessmentId: string | undefined, answers: any, studentId?: string) {
  const assessment = sampleAssessments.find(a => a.id === assessmentId) || sampleAssessments[0];
  const questions = assessment.questions;

  let correctCount = 0;
  const feedback: any[] = [];
  const skillScoresMap: { [skill: string]: { correct: number; total: number } } = {};

  for (const q of questions) {
    if (!skillScoresMap[q.category]) {
      skillScoresMap[q.category] = { correct: 0, total: 0 };
    }
    skillScoresMap[q.category].total += 1;

    // answers may be { [qId]: selectedIdx } or array [ { questionId, selectedIndex } ]
    let userSelectedIdx: number | undefined;
    if (Array.isArray(answers)) {
      const match = answers.find((a: any) => a.questionId === q.id);
      userSelectedIdx = match?.selectedIndex;
    } else if (answers && typeof answers === 'object') {
      userSelectedIdx = answers[q.id];
    }

    const isCorrect = userSelectedIdx === q.correctIndex;
    if (isCorrect) {
      correctCount++;
      skillScoresMap[q.category].correct += 1;
    }

    feedback.push({
      questionId: q.id,
      question: q.question,
      isCorrect,
      correctAnswer: q.options[q.correctIndex],
      explanation: q.explanation
    });
  }

  const totalQuestions = questions.length;
  const scorePct = Math.round((correctCount / totalQuestions) * 100);

  let proficiencyBand = 'Beginner';
  if (scorePct >= 85) proficiencyBand = 'Expert';
  else if (scorePct >= 70) proficiencyBand = 'Advanced';
  else if (scorePct >= 50) proficiencyBand = 'Intermediate';

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const skillScores: { skill: string; score: number }[] = [];

  Object.entries(skillScoresMap).forEach(([cat, stats]) => {
    const catScore = Math.round((stats.correct / stats.total) * 100);
    skillScores.push({ skill: cat, score: catScore });
    if (catScore >= 70) {
      strengths.push(`${cat} (Proficiency score: ${catScore}%)`);
    } else {
      weaknesses.push(`${cat} Principles`);
    }
  });

  const nextSteps = weaknesses.length > 0
    ? [
        `Review recommended course modules for ${weaknesses.join(' & ')}.`,
        'Engage with your SkillLens Topological Career Roadmap to clear required prerequisite milestones.',
        'Complete project assignments to elevate your proficiency rating.'
      ]
    : [
        'All tested competencies validated with top distinction.',
        'Proceed to advanced milestones in your designated career path.',
        'Apply directly to matched job and internship opportunities.'
      ];

  if (studentId) {
    try {
      db.prepare(`UPDATE students SET student_score = MAX(student_score, ?) WHERE id = ?`).run(scorePct, studentId);
      db.prepare(`
        INSERT INTO skill_assessments (id, student_id, skill_id, score, evidence_notes)
        VALUES (?, ?, 'sk_react', ?, ?)
      `).run(`sa_${Date.now()}`, studentId, scorePct, `Band: ${proficiencyBand}`);
    } catch (e) {
      // ignore
    }
  }

  return {
    scorePct,
    scorePercentage: scorePct,
    correctCount,
    totalQuestions,
    proficiencyBand,
    strengths: strengths.length > 0 ? strengths : ['General Problem Solving & Engineering Concepts'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No critical weaknesses detected in this diagnostic'],
    nextSteps,
    skillScores: skillScores.length > 0 ? skillScores : [
      { skill: 'Frontend Core', score: 85 },
      { skill: 'Backend API', score: 75 }
    ],
    feedback,
    readinessImpact: `+${Math.round(scorePct * 0.12)}% Readiness Calibration`
  };
}

// POST /api/assessment/:id/submit
router.post('/:id/submit', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    const { answers } = req.body;
    const result = processSubmit(req.params.id, answers, studentId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/assessment/submit (fallback)
router.post('/submit', authenticate, (req: AuthenticatedRequest, res: Response) => {
  try {
    const studentId = req.user?.studentId;
    const { answers, assessmentId } = req.body;
    const result = processSubmit(assessmentId, answers, studentId);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
