
// KaTeX rendering function
function renderLatex(str) {
  if (!str) return str;
  
  // Render LaTeX between $...$
  return str.replace(/\$(.*?)\$/g, (match, latex) => {
    try {
      return katex.renderToString(latex, {
        throwOnError: false,
        displayMode: false
      });
    } catch (e) {
      console.error("KaTeX error:", e);
      return match;
    }
  });
}

// Your full JS code with fixes:
// UI Elements
const questionNav = document.getElementById('question-nav');
const startScreen = document.getElementById('start-screen');
const startQuizBtn = document.getElementById('start-quiz-btn');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');
const app = document.getElementById('app');
const timerEl = document.getElementById('timer');
const questionNumberEl = document.getElementById('question-number');
const questionTextEl = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const scoreEl = document.getElementById('score');
const resultsList = document.getElementById('results-list');
const retryBtn = document.getElementById('retry-btn');
const customConfirm = document.getElementById('customConfirm');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Quiz variables
const TOTAL_QUESTIONS = 45;
const TIME_LIMIT = 45 * 60; // in seconds
let selectedQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let timer;
let timeRemaining = TIME_LIMIT;

// Initialize quiz
startQuizBtn.addEventListener('click', () => {
  startScreen.style.display = 'none';
  app.style.display = 'flex';
  initQuiz();
});

function initQuiz() {
  // Shuffle and pick questions
  const shuffled = shuffleArray([...questions]);
  selectedQuestions = shuffled.slice(0, Math.min(TOTAL_QUESTIONS, questions.length));

  currentQuestionIndex = 0;
  userAnswers = new Array(selectedQuestions.length).fill(null);

  timeRemaining = TIME_LIMIT;
  updateTimerDisplay();

  showQuestion();

  prevBtn.disabled = true;
  nextBtn.disabled = false;
  submitBtn.disabled = true;

  quizContainer.style.display = 'flex';
  resultContainer.style.display = 'none';

  startTimer();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    timeRemaining--;
    updateTimerDisplay();
    if (timeRemaining <= 0) {
      clearInterval(timer);
      finishQuiz();
    }
  }, 1000);
}

function updateTimerDisplay() {
  let min = Math.floor(timeRemaining / 60);
  let sec = timeRemaining % 60;
  timerEl.textContent = `Time Left: ${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function renderQuestionNav() {
  questionNav.innerHTML = '';
  selectedQuestions.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    if (userAnswers[i] !== null) btn.classList.add('answered');
    if (i === currentQuestionIndex) btn.classList.add('current');
    btn.addEventListener('click', () => {
      currentQuestionIndex = i;
      showQuestion();
      renderQuestionNav();
    });
    questionNav.appendChild(btn);
  });
}

function showQuestion() {
  const q = selectedQuestions[currentQuestionIndex];
  questionNumberEl.textContent = `Question ${currentQuestionIndex + 1} of ${selectedQuestions.length}`;
  
  // Render LaTeX in question
  questionTextEl.innerHTML = renderLatex(q.question);

  optionsContainer.innerHTML = '';

  q.options.forEach((optionText, i) => {
    const optionDiv = document.createElement('div');
    optionDiv.className = 'option';
    
    // Create span for option text and render LaTeX
    const textSpan = document.createElement('span');
    textSpan.innerHTML = renderLatex(String.fromCharCode(65 + i) + ". " + optionText);
    optionDiv.appendChild(textSpan);
    
    // Add keyboard shortcut badge
    const keyBadge = document.createElement('div');
    keyBadge.className = 'key-badge';
    keyBadge.textContent = String.fromCharCode(65 + i);
    optionDiv.appendChild(keyBadge);

    if(userAnswers[currentQuestionIndex] === i) {
      optionDiv.classList.add('selected');
    }

    optionDiv.addEventListener('click', () => {
      selectOption(i);
    });

    optionsContainer.appendChild(optionDiv);
  });

  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.disabled = currentQuestionIndex === selectedQuestions.length - 1;
  submitBtn.disabled = userAnswers[currentQuestionIndex] === null;

  renderQuestionNav();
}

function selectOption(optionIndex) {
  userAnswers[currentQuestionIndex] = optionIndex;
  
  Array.from(optionsContainer.children).forEach((optEl, idx) => {
    optEl.classList.toggle('selected', idx === optionIndex);
  });

  submitBtn.disabled = false;
  renderQuestionNav();
}

// Navigation buttons
prevBtn.addEventListener('click', () => {
  if(currentQuestionIndex > 0) {
    currentQuestionIndex--;
    showQuestion();
  }
});

nextBtn.addEventListener('click', () => {
  if(currentQuestionIndex < selectedQuestions.length - 1) {
    currentQuestionIndex++;
    showQuestion();
  }
});

// Submit button shows custom confirmation dialog
submitBtn.addEventListener('click', () => {
  customConfirm.style.display = 'flex';
});

// Confirm dialog buttons
confirmYes.addEventListener('click', () => {
  customConfirm.style.display = 'none';
  finishQuiz();
});

confirmNo.addEventListener('click', () => {
  customConfirm.style.display = 'none';
});

function finishQuiz() {
  clearInterval(timer);
  quizContainer.style.display = 'none';
  resultContainer.style.display = 'flex';

  let correctCount = 0;
  resultsList.innerHTML = '';

  selectedQuestions.forEach((q, idx) => {
    const userAnsIndex = userAnswers[idx];
    const isCorrect = userAnsIndex === q.answer;
    if (isCorrect) correctCount++;

    const userAnswerText = userAnsIndex !== null ? q.options[userAnsIndex] : 'No Answer';
    const correctAnswerText = q.options[q.answer];

    const div = document.createElement('div');
    div.className = 'result-question';
    div.innerHTML = `
      <div><strong>Q${idx + 1}:</strong> ${renderLatex(q.question)}</div>
      <div>Your answer: <span class="${isCorrect ? 'correct' : 'wrong'}">${renderLatex(userAnswerText)}</span></div>
      ${isCorrect ? '' : `<div>Correct answer: <span class="correct">${renderLatex(correctAnswerText)}</span></div>`}
    `;
    resultsList.appendChild(div);
  });

  scoreEl.textContent = `You answered ${correctCount} out of ${selectedQuestions.length} questions correctly.`;
  
  // Add performance comment
  let comment = "";
  const percentage = Math.round((correctCount / selectedQuestions.length) * 100);
  
  if (percentage >= 80) comment = "Excellent work! You have a strong grasp of this material.";
  else if (percentage >= 60) comment = "Good effort! Review the incorrect answers to improve.";
  else comment = "Keep studying! Focus on the topics you missed.";
  
  scoreEl.innerHTML += `<div style="margin-top:10px;font-weight:normal">${comment}</div>`;
}

retryBtn.addEventListener('click', () => {
  initQuiz();
});

// Dark Mode Toggle
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  darkModeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️ Light Mode' : '🌙 Dark Mode';
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
  // Ignore if focus is on input elements
  if (['INPUT', 'TEXTAREA', 'BUTTON'].includes(document.activeElement.tagName)) {
    return;
  }
  
  const key = e.key.toUpperCase();
  
  // Option selection
  if (key >= 'A' && key <= 'E') {
    const optionIndex = key.charCodeAt(0) - 65;
    const currentOptions = selectedQuestions[currentQuestionIndex]?.options || [];
    
    if (optionIndex < currentOptions.length) {
      selectOption(optionIndex);
    }
  }
  
  // Navigation
  switch(key) {
    case 'P':
      if (!prevBtn.disabled) prevBtn.click();
      break;
    case 'N':
      if (!nextBtn.disabled) nextBtn.click();
      break;
  }
});

// Questions array remains the same as before

const questions = [
  // Mechanics Questions (1-45)
  {
    "question": "Rectilinear motion of a particle is given by $x=t^3-3t^2$. Acceleration at $t=2$ sec is:",
    "options": [
      "$0 \\text{m/s}^2$",
      "$6 \\text{m/s}^2$",
      "$12 \\text{m/s}^2$",
      "$-6 \\text{m/s}^2$"
    ],
    "answer": 1
  },
  {
    "question": "For constant acceleration $a_0$, the equation for displacement $s$ is:",
    "options": [
      "$s=v_0t+\\frac{1}{2}a_0t^2$",
      "$v=v_0+a_0s$",
      "$s=\\frac{v^2-v_0^2}{2a_0}$",
      "$v^2=v_0^2+2a_0t$"
    ],
    "answer": 0
  },
  {
    "question": "A particle's velocity is $v=15t^2-4t$ m/s. Displacement from $t=0$ to $t=10$ sec is:",
    "options": [
      "4800 m",
      "2500 m",
      "3600 m",
      "1500 m"
    ],
    "answer": 0
  },
  {
    "question": "Normal acceleration $a_n$ in curvilinear motion is:",
    "options": [
      "$\\frac{dv}{dt}$",
      "$\\frac{v^2}{\\rho}$",
      "$\\frac{v}{\\rho}$",
      "$\\rho\\frac{d\\theta}{dt}$"
    ],
    "answer": 1
  },
  {
    "question": "A particle moves with $v_x=20t+5$ and $v_y=t^2-20$. Acceleration at $t=2$ sec is:",
    "options": [
      "$(20,4) \\text{m/s}^2$",
      "$(40,2) \\text{m/s}^2$",
      "$(25,-16) \\text{m/s}^2$",
      "$(0,4) \\text{m/s}^2$"
    ],
    "answer": 0
  },
  {
    "question": "Newton's second law for a particle is:",
    "options": [
      "$F=ma$",
      "$F=\\frac{dp}{dt}$",
      "Both A and B",
      "$F=mv$"
    ],
    "answer": 2
  },
  {
    "question": "Work done by a spring force $F=-kx$ from $x_1$ to $x_2$ is:",
    "options": [
      "$\\frac{1}{2}k(x_2^2-x_1^2)$",
      "$-\\frac{1}{2}k(x_2^2-x_1^2)$",
      "$\\frac{1}{2}k(x_1-x_2)$",
      "$kx_1x_2$"
    ],
    "answer": 1
  },
  {
    "question": "Kinetic energy of a mass $m$ at height $h$ (using conservation of energy) is:",
    "options": [
      "$mg(h_{max}-h)$",
      "$\\frac{1}{2}mv_0^2$",
      "$mg(h-h_0)$",
      "$\\frac{1}{2}mv^2$"
    ],
    "answer": 0
  },
  {
    "question": "Impulse-momentum principle states:",
    "options": [
      "$\\int Fdt = m\\Delta v$",
      "$F=m\\frac{dv}{dt}$",
      "$\\frac{1}{2}mv^2=Fs$",
      "$\\tau=I\\alpha$"
    ],
    "answer": 0
  },
  {
    "question": "For a particle under gravity, the work-energy principle is:",
    "options": [
      "$T_1+V_1=T_2+V_2$",
      "$F=ma$",
      "$\\int vdt=s$",
      "$v^2=u^2+2as$"
    ],
    "answer": 0
  },
  {
    "question": "In pure translation, a rigid body has:",
    "options": [
      "Same velocity for all points",
      "Angular acceleration",
      "Curved paths",
      "Variable angular velocity"
    ],
    "answer": 0
  },
  {
    "question": "Tangential acceleration $a_t$ for a rotating rigid body is:",
    "options": [
      "$r\\alpha$",
      "$r\\omega$",
      "$\\omega^2r$",
      "$\\frac{v^2}{r}$"
    ],
    "answer": 0
  },
  {
    "question": "A wheel of radius $r=0.5$ m has $\\omega=4t^2$ rad/s. Angular acceleration at $t=3$ sec is:",
    "options": [
      "$24 \\text{rad/s}^2$",
      "$12 \\text{rad/s}^2$",
      "$36 \\text{rad/s}^2$",
      "$8 \\text{rad/s}^2$"
    ],
    "answer": 0
  },
  {
    "question": "Relative velocity of point B w.r.t. point A on a rigid body is:",
    "options": [
      "$v_B=v_A+\\omega \\times r_{B/A}$",
      "$v_B=v_A+r_{B/A}$",
      "$v_B=\\omega \\times r_{B/A}$",
      "$v_B=v_A$"
    ],
    "answer": 0
  },
  {
    "question": "For fixed-axis rotation, normal acceleration is:",
    "options": [
      "$\\omega^2r$",
      "$\\alpha r$",
      "$\\frac{d\\omega}{dt}$",
      "$\\omega r$"
    ],
    "answer": 0
  },
  {
    "question": "Mass moment of inertia of a disk about its central axis is:",
    "options": [
      "$\\frac{1}{2}mr^2$",
      "$mr^2$",
      "$\\frac{1}{3}mr^2$",
      "$\\frac{2}{5}mr^2$"
    ],
    "answer": 0
  },
  {
    "question": "Newton's second law for rotation is:",
    "options": [
      "$\\sum\\tau=I\\alpha$",
      "$\\sum F=ma$",
      "$\\sum\\tau=I\\omega$",
      "$\\sum F=\\frac{dp}{dt}$"
    ],
    "answer": 0
  },
  {
    "question": "Work-energy principle for a rigid body is:",
    "options": [
      "$T_1+U_{1-2}=T_2$",
      "$\\frac{1}{2}I\\omega_1^2+\\int\\tau d\\theta=\\frac{1}{2}I\\omega_2^2$",
      "$\\sum\\tau=I\\alpha$",
      "$\\Delta H=\\int\\tau dt$"
    ],
    "answer": 0
  },
  {
    "question": "Angular momentum about a fixed axis is:",
    "options": [
      "$I\\omega$",
      "$mvr$",
      "$\\frac{1}{2}I\\omega^2$",
      "$\\tau\\Delta t$"
    ],
    "answer": 0
  },
  {
    "question": "D'Alembert's principle for rotation states:",
    "options": [
      "$\\sum\\tau-I\\alpha=0$",
      "$\\sum F-ma=0$",
      "$\\sum\\tau=0$",
      "$I\\omega=\\text{constant}$"
    ],
    "answer": 0
  },
  {
    "question": "Relative velocity of car A w.r.t. car B is:",
    "options": [
      "$v_{A/B}=v_A-v_B$",
      "$v_{A/B}=v_B-v_A$",
      "$v_{A/B}=v_A+v_B$",
      "$v_{A/B}=\\frac{v_A}{v_B}$"
    ],
    "answer": 0
  },
  {
    "question": "Car A moves east at 200 km/h, car B west at 250 km/h. Velocity of B relative to A is:",
    "options": [
      "50 km/h west",
      "450 km/h west",
      "50 km/h east",
      "450 km/h east"
    ],
    "answer": 1
  },
  {
    "question": "If two jets A and B have velocities $v_A=800 \\text{km/h}$ east and $v_{B/A}$ at 60°, the true velocity of B is found using:",
    "options": [
      "$v_B=v_A+v_{B/A}$",
      "$v_B=v_A-v_{B/A}$",
      "$v_B=v_{B/A}-v_A$",
      "$v_B=v_A \\times v_{B/A}$"
    ],
    "answer": 0
  },
  {
    "question": "For translating axes, relative acceleration $a_{A/B}$ is:",
    "options": [
      "$a_A-a_B$",
      "$a_B-a_A$",
      "$a_A+a_B$",
      "$\\frac{a_A}{a_B}$"
    ],
    "answer": 0
  },
  {
    "question": "A train (600 km/h) passes a car (45 km/h). Velocity of train relative to car depends on:",
    "options": [
      "Angle between their paths",
      "Mass of the train",
      "Acceleration of the car",
      "Time of observation"
    ],
    "answer": 0
  },
  {
    "question": "Range R of a projectile on a horizontal surface is:",
    "options": [
      "$\\frac{v_0^2\\sin2\\theta}{g}$",
      "$\\frac{v_0^2\\sin\\theta}{2g}$",
      "$\\frac{2v_0^2\\sin\\theta}{g}$",
      "$\\frac{v_0^2}{g}$"
    ],
    "answer": 0
  },
  {
    "question": "Time of flight T for symmetric trajectory is:",
    "options": [
      "$\\frac{2v_0\\sin\\theta}{g}$",
      "$\\frac{v_0\\sin\\theta}{g}$",
      "$\\frac{v_0\\cos\\theta}{g}$",
      "$\\frac{2v_0}{g}$"
    ],
    "answer": 0
  },
  {
    "question": "Maximum height H is given by:",
    "options": [
      "$\\frac{v_0^2\\sin^2\\theta}{2g}$",
      "$\\frac{v_0^2\\sin2\\theta}{g}$",
      "$\\frac{2v_0^2\\sin\\theta}{g}$",
      "$\\frac{v_0\\sin\\theta}{g}$"
    ],
    "answer": 0
  },
  {
    "question": "A projectile fired at 80 m/s at 40° has a range of:",
    "options": [
      "643 m",
      "320 m",
      "135 m",
      "256 m"
    ],
    "answer": 0
  },
  {
    "question": "In projectile motion, horizontal acceleration is:",
    "options": [
      "Zero",
      "$g$",
      "$g\\cos\\theta$",
      "$g\\sin\\theta$"
    ],
    "answer": 0
  },
  {
    "question": "In a velocity-time graph, displacement is:",
    "options": [
      "Slope",
      "Area under the curve",
      "Maximum value",
      "Intercept"
    ],
    "answer": 1
  },
  {
    "question": "In an acceleration-time graph, change in velocity is:",
    "options": [
      "Slope",
      "Area under the curve",
      "Second derivative",
      "Average value"
    ],
    "answer": 1
  },
  {
    "question": "For a bus with velocity-time curve, total distance is:",
    "options": [
      "Sum of areas under segments",
      "Maximum velocity $\\times$ time",
      "Integral of acceleration",
      "Average velocity $\\times$ time"
    ],
    "answer": 0
  },
  {
    "question": "The slope of a velocity-time graph gives:",
    "options": [
      "Displacement",
      "Acceleration",
      "Jerk",
      "Distance"
    ],
    "answer": 1
  },
  {
    "question": "In a displacement-time graph, velocity is:",
    "options": [
      "Area under the curve",
      "Slope",
      "Curvature",
      "Intercept"
    ],
    "answer": 1
  },
  {
    "question": "Kinetic energy for a rigid body in plane motion is:",
    "options": [
      "$\\frac{1}{2}mv_G^2+\\frac{1}{2}I_G\\omega^2$",
      "$\\frac{1}{2}I_O\\omega^2$",
      "$mgh$",
      "$\\frac{1}{2}kx^2$"
    ],
    "answer": 0
  },
  {
    "question": "Work done by gravity depends on:",
    "options": [
      "Vertical displacement",
      "Horizontal displacement",
      "Path length",
      "Speed"
    ],
    "answer": 0
  },
  {
    "question": "Potential energy of a spring is:",
    "options": [
      "$\\frac{1}{2}kx^2$",
      "$kx$",
      "$-\\frac{1}{2}kx^2$",
      "$\\frac{1}{2}k(x_2^2-x_1^2)$"
    ],
    "answer": 0
  },
  {
    "question": "Conservation of energy applies when:",
    "options": [
      "Only conservative forces act",
      "Non-conservative forces act",
      "External forces are present",
      "Friction is present"
    ],
    "answer": 0
  },
  {
    "question": "Work done by a constant force F over displacement s is:",
    "options": [
      "$F \\cdot s$",
      "$F \\times s$",
      "$\\frac{1}{2}Fs$",
      "$F/s$"
    ],
    "answer": 0
  },
  {
    "question": "A particle in mechanics is:",
    "options": [
      "Body with negligible size",
      "Body with rotational motion",
      "Rigid body",
      "Body with variable mass"
    ],
    "answer": 0
  },
  {
    "question": "Kinematics differs from kinetics in that kinematics:",
    "options": [
      "Describes motion without forces",
      "Analyzes forces causing motion",
      "Applies Newton's laws",
      "Studies equilibrium"
    ],
    "answer": 0
  },
  {
    "question": "Rectilinear motion involves:",
    "options": [
      "Straight-line paths",
      "Curved paths",
      "Rotational motion",
      "Relative motion"
    ],
    "answer": 0
  },
  {
    "question": "A rigid body is defined as:",
    "options": [
      "Body with no deformation",
      "Body with negligible mass",
      "Body in equilibrium",
      "Body with constant velocity"
    ],
    "answer": 0
  },
  {
    "question": "Dynamics is divided into:",
    "options": [
      "Kinematics and kinetics",
      "Statics and dynamics",
      "Linear and rotational motion",
      "Force and energy"
    ],
    "answer": 0
  },
  {
    "question": "The radius of curvature $\\rho$ for a path $y(x)$ is:",
    "options": [
      "$\\frac{[1+(dy/dx)^2]^{3/2}}{|d^2y/dx^2|}$",
      "$\\frac{dy/dx}{d^2y/dx^2}$",
      "$\\frac{|d^2y/dx^2|}{[1+(dy/dx)^2]^{3/2}}$",
      "$\\frac{d^2y/dx^2}{dy/dx}$"
    ],
    "answer": 0
  },
  {
    "question": "Coriolis acceleration appears in:",
    "options": [
      "Rotating reference frames",
      "Inertial frames",
      "Pure translation",
      "Projectile motion"
    ],
    "answer": 0
  },
  {
    "question": "Relative motion analysis simplifies problems when:",
    "options": [
      "Moving observers are involved",
      "Absolute acceleration is zero",
      "Forces are balanced",
      "Motion is rectilinear"
    ],
    "answer": 0
  },
  {
    "question": "For a particle constrained to a path, normal force affects:",
    "options": [
      "Direction but not speed",
      "Speed but not direction",
      "Both speed and direction",
      "Neither speed nor direction"
    ],
    "answer": 0
  },
  {
    "question": "Angular acceleration $\\alpha$ is zero in:",
    "options": [
      "Uniform rotational motion",
      "Linear motion",
      "Accelerated rotation",
      "General plane motion"
    ],
    "answer": 0
  },
  {
    "question": "The formula for average velocity is:",
    "options": [
      "$\\frac{\\Delta s}{\\Delta t}$",
      "$\\frac{v+u}{2}$",
      "$\\frac{ds}{dt}$",
      "$\\int adt$"
    ],
    "answer": 0
  },
  {
    "question": "If acceleration $a=f(v)$, displacement is found using:",
    "options": [
      "$\\int vdt$",
      "$\\int\\frac{v}{a}dv$",
      "$\\int\\frac{v}{a}dv$",
      "$\\int adv$"
    ],
    "answer": 2
  },
  {
    "question": "For curvilinear motion, the magnitude of acceleration is:",
    "options": [
      "$\\sqrt{a_t^2+a_n^2}$",
      "$\\frac{dv}{dt}$",
      "$\\frac{v^2}{\\rho}$",
      "$\\sqrt{v_x^2+v_y^2}$"
    ],
    "answer": 0
  },
  {
    "question": "In polar coordinates, radial acceleration is:",
    "options": [
      "$\\ddot{r}-r\\dot{\\theta}^2$",
      "$r\\ddot{\\theta}+2\\dot{r}\\dot{\\theta}$",
      "$\\dot{r}\\dot{\\theta}$",
      "$r\\dot{\\theta}$"
    ],
    "answer": 0
  },
  {
    "question": "The work-energy principle for a system of particles is:",
    "options": [
      "$\\sum F=\\frac{d}{dt}(mv)$",
      "$T_1+\\sum U_{1-2}=T_2$",
      "$\\int F\\cdot dr=0$",
      "$\\Delta V=mg\\Delta h$"
    ],
    "answer": 1
  },
  {
    "question": "Impulse is defined as:",
    "options": [
      "$\\int Fdt$",
      "$F \\cdot s$",
      "$\\frac{1}{2}mv^2$",
      "$mv$"
    ],
    "answer": 0
  },
  {
    "question": "For conservative forces, work done is:",
    "options": [
      "Path-dependent",
      "Always positive",
      "Independent of path",
      "Zero"
    ],
    "answer": 2
  },
  {
    "question": "The angular velocity of a rigid body in fixed-axis rotation is:",
    "options": [
      "$\\frac{d\\theta}{dt}$",
      "$\\frac{d\\omega}{dt}$",
      "$\\frac{v}{r}$",
      "$\\frac{a_t}{r}$"
    ],
    "answer": 0
  },
  {
    "question": "General plane motion of a rigid body involves:",
    "options": [
      "Translation only",
      "Rotation only",
      "Both translation and rotation",
      "No motion"
    ],
    "answer": 2
  },
  {
    "question": "The parallel-axis theorem for moment of inertia is:",
    "options": [
      "$I=I_G+md^2$",
      "$I=I_G-md^2$",
      "$I=\\frac{1}{2}mr^2$",
      "$I=mk^2$"
    ],
    "answer": 0
  },
  {
    "question": "Centroidal rotation implies rotation about an axis:",
    "options": [
      "Parallel to centroidal axis",
      "At a distance $d$ from centroid",
      "Passing through the centroid",
      "Fixed in space"
    ],
    "answer": 2
  },
  {
    "question": "The formula for kinetic energy of rotation is:",
    "options": [
      "$\\frac{1}{2}I\\omega^2$",
      "$\\frac{1}{2}mv^2$",
      "$I\\alpha$",
      "$\\tau\\theta$"
    ],
    "answer": 0
  },
  {
    "question": "Power in rotational motion is:",
    "options": [
      "$\\tau\\omega$",
      "$\\tau\\theta$",
      "$I\\alpha$",
      "$Fv$"
    ],
    "answer": 0
  },
  {
    "question": "For relative motion with translating axes, acceleration is:",
    "options": [
      "$a_A=a_B+a_{A/B}$",
      "$a_A=a_B \\times r_{A/B}$",
      "$a_{A/B}=a_A+a_B$",
      "$a_{A/B}=\\alpha \\times r$"
    ],
    "answer": 0
  },
  {
    "question": "In projectile motion, the vertical velocity at maximum height is:",
    "options": [
      "Zero",
      "$v_0\\sin\\theta$",
      "$v_0\\cos\\theta$",
      "$gt$"
    ],
    "answer": 0
  },
  {
    "question": "The trajectory equation of a projectile is:",
    "options": [
      "$y=x\\tan\\theta-\\frac{gx^2}{2v_0^2\\cos^2\\theta}$",
      "$y=x\\tan\\theta$",
      "$y=\\frac{gx^2}{2v_0^2}$",
      "$y=v_0t\\sin\\theta-\\frac{1}{2}gt^2$"
    ],
    "answer": 0
  },
  {
    "question": "For graphical analysis, the area under an acceleration-time graph gives:",
    "options": [
      "Change in velocity",
      "Displacement",
      "Jerk",
      "Distance"
    ],
    "answer": 0
  },
  {
    "question": "The slope of a displacement-time graph gives:",
    "options": [
      "Acceleration",
      "Velocity",
      "Force",
      "Energy"
    ],
    "answer": 1
  },
  {
    "question": "D'Alembert's principle translates dynamics problems into:",
    "options": [
      "Static equilibrium problems",
      "Energy conservation",
      "Impulse-momentum",
      "Relative motion"
    ],
    "answer": 0
  },
  {
    "question": "A particle is idealized as a point when:",
    "options": [
      "Size is negligible for analysis",
      "It has rotational motion",
      "It is under constant acceleration",
      "Forces are conservative"
    ],
    "answer": 0
  },

  // Heat Transfer/Thermodynamics Questions (46-90)
  {
    "question": "On which of the following does convective heat transfer coefficient depend?",
    "options": [
      "Time",
      "Surface area",
      "Space",
      "Orientation of solid surface"
    ],
    "answer": 3
  },
  {
    "question": "An aluminum plate has a circular hole. If the temperature of the plate increases, what happens to the size of the hole?",
    "options": [
      "Decreases",
      "Stays the same",
      "Increases the top half of the hole",
      "Increases"
    ],
    "answer": 3
  },
  {
    "question": "Choose the false statement regarding thermal conductivity:",
    "options": [
      "For pure metal thermal conductivity is more",
      "Thermal conductivity decreases with increase in the density of the substance",
      "Thermal conductivity of dry material is lower than that of damp material",
      "Heat treatment causes variation in thermal conductivity"
    ],
    "answer": 1
  },
  {
    "question": "Mark the material with the least value of thermal conductivity:",
    "options": [
      "Water",
      "Ash",
      "Window glass",
      "Air"
    ],
    "answer": 3
  },
  {
    "question": "Heat rate is given by (in kJ/kWh):",
    "options": [
      "cycle efficiency",
      "3600 / cycle efficiency",
      "cycle efficiency / 3600",
      "cycle efficiency * 3600"
    ],
    "answer": 1
  },
  {
    "question": "The work ratio is defined as the ratio of:",
    "options": [
      "positive network output to network output",
      "network output to positive work output",
      "heat input to work output",
      "none of the mentioned"
    ],
    "answer": 1
  },
  {
    "question": "For a vapour power cycle,",
    "options": [
      "net heat input is converted into network output",
      "Q1-Q2 = Wt-Wp",
      "efficiency = 1 - (Q2/Q1)",
      "all of the mentioned"
    ],
    "answer": 3
  },
  {
    "question": "The path followed in a vapour power cycle is:",
    "options": [
      "boiler-condenser-turbine-pump",
      "boiler-turbine-condenser-pump",
      "boiler-turbine-pump-condenser",
      "boiler-pump-turbine-condenser"
    ],
    "answer": 1
  },
  {
    "question": "For a Rankine cycle, which of the following is true?",
    "options": [
      "a reversible constant pressure heating process happens in steam boiler",
      "reversible adiabatic expansion of steam in turbine",
      "reversible constant pressure heat rejection in condenser",
      "all of the mentioned"
    ],
    "answer": 3
  },
  {
    "question": "Which of the following statement is incorrect according to heat transfer?",
    "options": [
      "Heat flow doesn't depend on temperature",
      "A material medium is not necessary for heat transmission",
      "The process of heat transfer is an irreversible process",
      "For heat exchange, a temperature gradient must exist"
    ],
    "answer": 3
  },
  {
    "question": "The liquid water handled by pump is:",
    "options": [
      "incompressible",
      "with increase in pressure, there is a little change in density or specific volume",
      "both of the mentioned",
      "none of the mentioned"
    ],
    "answer": 2
  },
  {
    "question": "Work output of turbine is __ the work input to the pump.",
    "options": [
      "much larger",
      "much smaller",
      "equal to",
      "none of the mentioned"
    ],
    "answer": 0
  },
  {
    "question": "Inflammable liquids in sealed containers are kept away from:",
    "options": [
      "Air",
      "Water",
      "Cold",
      "Dust"
    ],
    "answer": 3
  },
  {
    "question": "Identify the very good insulator:",
    "options": [
      "Saw dust",
      "Cork",
      "Asbestos sheet",
      "Glass wool"
    ],
    "answer": 3
  },
  {
    "question": "Thermal conductivity is defined as the heat flow per unit time:",
    "options": [
      "When the temperature gradient is unity",
      "Across unit area where the temperature gradient is unity",
      "Through a unit thickness of the wall",
      "Across unit area with no temperature"
    ],
    "answer": 1
  },
  {
    "question": "Cork is a good insulator because:",
    "options": [
      "It is flexible",
      "It can be powdered",
      "Low density",
      "It is porous"
    ],
    "answer": 3
  },
  {
    "question": "Which one of the following forms of water have the highest value of thermal conductivity?",
    "options": [
      "Boiling water",
      "Steam",
      "Solid ice",
      "Melting ice"
    ],
    "answer": 2
  },
  {
    "question": "A bimetal plate consists of two materials of different coefficients of thermal expansion. The coefficient of thermal expansion of the top part of the plate is less than the bottom part. If the temperature of the entire plate increases, what happens to the plate?",
    "options": [
      "Expands",
      "Contracts",
      "Stays the same",
      "Bends up"
    ],
    "answer": 3
  },
  {
    "question": "Which one of the following thermodynamic quantities is not a state function?",
    "options": [
      "enthalpy",
      "entropy",
      "internal energy",
      "work"
    ],
    "answer": 3
  },
  {
    "question": "What is heat transfer?",
    "options": [
      "Flow of thermal energy from low-temperature reservoir to high-temperature reservoir",
      "Flow of energy in the form of heat from high-temperature reservoir to low-temperature reservoir",
      "Flow of thermal energy irrespective of reservoir temperature",
      "None of the above"
    ],
    "answer": 1
  },
  {
    "question": "What is heat transfer rate?",
    "options": [
      "Flow of thermal energy from low-temperature reservoir to high-temperature reservoir",
      "Flow of energy in the form of heat from high-temperature reservoir to low-temperature reservoir",
      "Flow of thermal energy irrespective of reservoir temperature",
      "None of the above"
    ],
    "answer": 1
  },
  {
    "question": "Heat transfer takes place according to which of the following law?",
    "options": [
      "Newton's second law of motion",
      "First law of thermodynamics",
      "Newton's law of cooling",
      "Second law of thermodynamics"
    ],
    "answer": 3
  },
  {
    "question": "Which way is heat transfer believed to take place in a long, hollow cylinder that is kept at constant but varied temperatures on its inner and outer surfaces?",
    "options": [
      "Unpredictable",
      "Radial only",
      "No heat transfer takes place",
      "Axial only"
    ],
    "answer": 1
  },
  {
    "question": "A person prefers to sit by a fire during the cold winter months. Which of the following heat transfer types gives him the most heat?",
    "options": [
      "Convection and radiation together",
      "Radiation will provide quick warmth",
      "Conduction from the fire",
      "Conduction and convection"
    ],
    "answer": 1
  },
  {
    "question": "On which of the following does convective heat transfer coefficient doesn't depend?",
    "options": [
      "Orientation of solid surface",
      "Time",
      "Surface area",
      "Space"
    ],
    "answer": 3
  },
  {
    "question": "In liquids and gases, heat transmission is primarily caused by:",
    "options": [
      "Convection",
      "Radiation",
      "Conduction",
      "Conduction as well as convection"
    ],
    "answer": 3
  },
  {
    "question": "In which of the following cases provision of fins on a given heat transfer surface will be more effective?",
    "options": [
      "Fewer but thin fins",
      "Large number of thin fins",
      "Large number of thick fins",
      "Fewer but thick fins"
    ],
    "answer": 1
  },
  {
    "question": "Rankine cycle operating on low pressure limit of p1 and high-pressure limit of p2:",
    "options": [
      "has higher thermal efficiency than the Carnot cycle operating between same pressure limits",
      "has lower thermal efficiency than Carnot cycle operating between same pressure limits",
      "has same thermal efficiency as Carnot cycle operating between same pressure limits",
      "may be more or less depending upon the magnitudes of p1 and p2"
    ],
    "answer": 1
  },
  {
    "question": "Rankine efficiency of a steam power plant:",
    "options": [
      "improves in Summer as compared to that in Winter",
      "improves in Winter as compared to that in Summer",
      "is unaffected by climatic conditions",
      "none of the mentioned"
    ],
    "answer": 1
  },
  {
    "question": "Rankine cycle comprises of:",
    "options": [
      "two isentropic processes and two constant volume processes",
      "two isentropic processes and two constant pressure processes",
      "two isothermal processes and two constant pressure processes",
      "none of the mentioned"
    ],
    "answer": 1
  },
  {
    "question": "For a fluid undergoing cycle process,",
    "options": [
      "there is no net change in its internal energy",
      "energy transfer as heat is equal to the energy transfer as work",
      "both of the mentioned",
      "none of the mentioned"
    ],
    "answer": 2
  },
  {
    "question": "For a Rankine cycle, which of the following is true?",
    "options": [
      "reversible adiabatic expansion of steam in turbine",
      "reversible constant pressure heating process happens in steam boiler",
      "reversible constant pressure heat rejection in condenser",
      "all of the mentioned"
    ],
    "answer": 3
  },
  {
    "question": "What is thermodynamic working fluid classified?",
    "options": [
      "Single phase fluid",
      "Two phase fluid",
      "Ideal gas",
      "Based on its state and phase changes during the cycle"
    ],
    "answer": 3
  },
  {
    "question": "What is the function of latent heat of vaporization?",
    "options": [
      "To increase the temperature of the liquid.",
      "To change the phase from liquid to vapor at constant temperature.",
      "To increase the kinetic energy of molecules.",
      "To increase the pressure of the fluid."
    ],
    "answer": 1
  },
  {
    "question": "How does an increase in pressure affect the boiling point of water?",
    "options": [
      "Decreases it",
      "Increases it",
      "Has no effect",
      "First increases then decreases"
    ],
    "answer": 1
  },
  {
    "question": "What is the process of evaporation of water from a free surface called?",
    "options": [
      "Evaporation",
      "Boiling",
      "Condensation",
      "Sublimation"
    ],
    "answer": 0
  },
  {
    "question": "What is the primary function of a condenser in a steam power plant?",
    "options": [
      "To increase the pressure of steam",
      "To condense exhaust steam from the turbine into liquid water",
      "To provide heat to the boiler",
      "To superheat the steam"
    ],
    "answer": 1
  },
  {
    "question": "What is the purpose of reheating in a Rankine cycle?",
    "options": [
      "To increase the pump work",
      "To increase the turbine work output and reduce moisture content",
      "To decrease the boiler pressure",
      "To reduce the condenser heat rejection"
    ],
    "answer": 1
  },
  {
    "question": "What is the undesirable effect of excessive moisture in steam for steam turbines?",
    "options": [
      "It reduces the turbine power output.",
      "It causes erosion of turbine blades.",
      "It increases the specific steam consumption.",
      "All of the above."
    ],
    "answer": 3
  },
  {
    "question": "How is excessive moisture in steam overcome in modern power plants?",
    "options": [
      "By using higher boiler pressure",
      "By reheating the steam",
      "By increasing condenser temperature",
      "By using lower turbine inlet temperatures"
    ],
    "answer": 1
  },
  {
    "question": "What is specific steam consumption in a power plant?",
    "options": [
      "Mass flow rate of steam per unit power output",
      "Heat input per unit power output",
      "Power output per unit mass flow rate of steam",
      "Mass flow rate of fuel per unit power output"
    ],
    "answer": 0
  },
  {
    "question": "What is the advantage of a gas turbine plant over a vapor power plant?",
    "options": [
      "Higher thermal efficiency",
      "Lower fuel consumption",
      "Simpler plant and lower capital costs",
      "Can use only gaseous fuels"
    ],
    "answer": 2
  },
  {
    "question": "What is Combined Heat and Power (CHP)?",
    "options": [
      "A plant that generates only electricity",
      "A plant that generates only heat",
      "A plant that produces both electricity and useful heat simultaneously",
      "A plant that uses only renewable energy sources"
    ],
    "answer": 2
  },
  {
    "question": "What are the major components of a Rankine cycle power plant?",
    "options": [
      "Compressor, combustion chamber, turbine, nozzle",
      "Reactor, heat exchanger, pump, generator",
      "Boiler, turbine, compressor, condenser",
      "Boiler, turbine, condenser, pump"
    ],
    "answer": 3
  },
  {
    "question": "What is the function of a re-heater in a steam power plant?",
    "options": [
      "To increase the temperature of steam after partial expansion in the turbine",
      "To preheat the feedwater before entering the boiler",
      "To condense exhaust steam from the turbine",
      "To remove impurities from steam"
    ],
    "answer": 0
  },
  {
    "question": "What is a Heat Recovery Steam Generator (HRSG)?",
    "options": [
      "A device that condenses steam from the turbine exhaust",
      "A heat exchanger that recovers heat from hot exhaust gases to generate steam",
      "A component used to superheat steam to very high temperatures",
      "A pump used to increase the pressure of feedwater"
    ],
    "answer": 1
  },
  {
    "question": "What is the main reason for lagging pipes in a thermal system?",
    "options": [
      "To reduce heat loss to the surroundings",
      "To increase the temperature of the fluid",
      "To prevent corrosion of the pipes",
      "To reduce friction in the pipes"
    ],
    "answer": 0
  },
  {
    "question": "Which factors affect water tanks, pipes, and radiators, typically influencing heat transfer?",
    "options": [
      "Material of construction",
      "Surface area exposed to surroundings",
      "Temperature difference between fluid and surroundings",
      "All of the above"
    ],
    "answer": 3
  },
  {
    "question": "Distinction between forced and natural convection relates to:",
    "options": [
      "The mechanism causing fluid motion",
      "The type of fluid involved",
      "The temperature difference",
      "The surface area"
    ],
    "answer": 0
  },
  {
    "question": "For a 10-cm diameter copper ball heated from 150°C to 250°C in one hour and 30 minutes, with density ρ = 8950 kg/m³ and specific heat Cp = 0.615 kJ/kg°C, what is the total amount of heat transfer to the copper ball?",
    "options": [
      "288.35 kJ",
      "144.17 kJ",
      "576.7 kJ",
      "72.09 kJ"
    ],
    "answer": 0
  },
  {
    "question": "What is the average rate of heat transfer to the copper ball in the previous question?",
    "options": [
      "0.032 kW",
      "0.064 kW",
      "0.128 kW",
      "0.0534 kW"
    ],
    "answer": 3
  },
  {
    "question": "What are the factors that determine the rate of conduction heat transfer?",
    "options": [
      "Temperature difference, material density, specific heat",
      "Area perpendicular to heat flow, temperature gradient, thermal conductivity, thickness of material",
      "Convective heat transfer coefficient, fluid velocity",
      "Surface roughness, emissivity"
    ],
    "answer": 1
  },
  {
    "question": "What is the Stefan-Boltzmann law used for?",
    "options": [
      "Conduction heat transfer",
      "Convection heat transfer",
      "Radiation heat transfer",
      "Mass transfer"
    ],
    "answer": 2
  },
  {
    "question": "What does a T-s diagram describe?",
    "options": [
      "Pressure-volume changes in a cycle",
      "Temperature-entropy changes during a thermodynamic process or cycle",
      "Enthalpy-entropy changes during a process",
      "Internal energy-volume changes"
    ],
    "answer": 1
  },
  {
    "question": "What does wet steam mean in the context of power plants?",
    "options": [
      "A mixture of saturated liquid and saturated vapor",
      "Superheated steam",
      "Saturated liquid only",
      "Steam below its saturation temperature"
    ],
    "answer": 0
  },
  {
    "question": "What is the process of boiling water at a constant pressure?",
    "options": [
      "Isothermal process",
      "Isobaric process",
      "Both isothermal and isobaric",
      "Isentropic process"
    ],
    "answer": 2
  },
  {
    "question": "What is the term for the process of converting vapor back to liquid?",
    "options": [
      "Evaporation",
      "Boiling",
      "Condensation",
      "Sublimation"
    ],
    "answer": 2
  },
  {
    "question": "What are the advantages of the Rankine cycle?",
    "options": [
      "Can utilize high-temperature heat sources",
      "Efficient conversion of heat to work",
      "Uses water as a working fluid, which is abundant and cheap",
      "All of the above"
    ],
    "answer": 3
  },
  {
    "question": "What are the limitations of the Carnot cycle?",
    "options": [
      "It requires isothermal heat transfer, which is difficult to achieve in practice.",
      "It requires reversible adiabatic processes, which are idealizations.",
      "Its efficiency is very high and difficult to achieve in real engines.",
      "All of the above."
    ],
    "answer": 3
  },
  {
    "question": "What is the purpose of specific steam consumption (SSC)?",
    "options": [
      "To measure the boiler efficiency.",
      "To calculate the heat input to the turbine.",
      "To determine the amount of steam required per unit of power output.",
      "To evaluate the pump work."
    ],
    "answer": 2
  },
  {
    "question": "What is the significance of the heat rejection in a power cycle?",
    "options": [
      "It provides useful work output.",
      "It is used to generate more steam.",
      "It is necessary to complete the thermodynamic cycle and maintain continuous operation.",
      "It increases the overall plant efficiency."
    ],
    "answer": 2
  },
  {
    "question": "What happens to the pressure of a fluid during an isobaric process?",
    "options": [
      "It increases",
      "It decreases",
      "It remains constant",
      "It fluctuates"
    ],
    "answer": 2
  },
  {
    "question": "What is subcooled liquid?",
    "options": [
      "Liquid at a temperature below its saturation temperature for the given pressure.",
      "Liquid at its saturation temperature but not yet boiling.",
      "Liquid that contains some vapor bubbles.",
      "Liquid at very high pressure."
    ],
    "answer": 0
  },
  {
    "question": "What is superheated vapor?",
    "options": [
      "Vapor at a temperature higher than its saturation temperature for the given pressure.",
      "Vapor containing liquid droplets.",
      "Vapor at its saturation temperature.",
      "Vapor that has condensed to liquid."
    ],
    "answer": 0
  },
  {
    "question": "What is the role of a pump in a Rankine cycle?",
    "options": [
      "To increase the pressure of the condensed liquid before it enters the boiler.",
      "To convert steam into water.",
      "To extract work from the fluid.",
      "To add heat to the fluid."
    ],
    "answer": 0
  },
  {
    "question": "What is the purpose of regenerative Rankine cycle?",
    "options": [
      "To increase the average temperature of heat addition and improve efficiency.",
      "To reduce the boiler pressure.",
      "To increase the turbine work.",
      "To simplify the plant design."
    ],
    "answer": 0
  },
  {
    "question": "What is the difference between thermal conductivity of dry and damp material?",
    "options": [
      "Damp material typically has higher thermal conductivity due to water.",
      "Dry material typically has higher thermal conductivity.",
      "There is no significant difference.",
      "Damp material has lower thermal conductivity due to evaporation."
    ],
    "answer": 0
  },
  {
    "question": "What is a 'heat sink' in heat transfer?",
    "options": [
      "A region or body to which heat is transferred from another body.",
      "A device that generates heat.",
      "A material that conducts heat very poorly.",
      "A device that stores heat."
    ],
    "answer": 0
  },
  {
    "question": "What is the formula for heat transfer by conduction through a plane wall?",
    "options": [
      "Q = hAΔT",
      "Q = εσA(T₁⁴ - T₂⁴)",
      "Q = kAΔT/Δx",
      "Q = mcΔT"
    ],
    "answer": 2
  },
  {
    "question": "What is the term for energy transfer due to temperature difference?",
    "options": [
      "Work",
      "Heat",
      "Power",
      "Force"
    ],
    "answer": 1
  },
  {
    "question": "Which of the following is a unit of heat transfer rate?",
    "options": [
      "Joule (J)",
      "Calorie (cal)",
      "Watt (W)",
      "Kelvin (K)"
    ],
    "answer": 2
  },
  {
    "question": "What causes heat transfer by radiation?",
    "options": [
      "Electromagnetic waves",
      "Molecular collisions",
      "Fluid movement",
      "Electron flow"
    ],
    "answer": 0
  },
  {
    "question": "What is the primary advantage of increasing the superheat temperature in a Rankine cycle?",
    "options": [
      "It reduces the boiler pressure.",
      "It increases the turbine work output and reduces moisture content at the turbine exit.",
      "It decreases the condenser temperature.",
      "It simplifies the plant design."
    ],
    "answer": 1
  },
  {
    "question": "What is the general trend of thermal conductivity for pure metals as temperature increases?",
    "options": [
      "Increases",
      "Decreases",
      "Remains constant",
      "First increases then decreases"
    ],
    "answer": 1
  },
  {
    "question": "What is the significance of the critical point on a P-T diagram?",
    "options": [
      "The point at which the saturated liquid and saturated vapor lines meet, and distinct liquid and vapor phases cease to exist.",
      "The triple point where solid, liquid, and gas phases coexist.",
      "The point where boiling occurs.",
      "The point of maximum pressure."
    ],
    "answer": 0
  },
  {
    "question": "What is the primary purpose of a deaerator in a steam power plant?",
    "options": [
      "To heat feedwater.",
      "To separate steam from water.",
      "To remove non-condensable gases (like oxygen and carbon dioxide) from feedwater.",
      "To condense steam."
    ],
    "answer": 2
  },
  {
    "question": "What is the energy associated with the random motion of molecules called?",
    "options": [
      "Internal energy",
      "Kinetic energy",
      "Potential energy",
      "Flow energy"
    ],
    "answer": 0
  },
  {
    "question": "In an ideal Rankine cycle, what type of process occurs in the pump?",
    "options": [
      "Isothermal compression",
      "Isentropic compression",
      "Isobaric compression",
      "Constant volume compression"
    ],
    "answer": 1
  },
  {
    "question": "What is the primary purpose of a cooling tower in a steam power plant?",
    "options": [
      "To reject waste heat to the atmosphere by cooling the condenser water",
      "To cool the steam before it enters the turbine",
      "To increase the pressure of the feedwater",
      "To remove impurities from the steam"
    ],
    "answer": 0
  },
  {
    "question": "Which of the following best describes the pinch point in a heat exchanger?",
    "options": [
      "The point where heat transfer is maximum",
      "The minimum temperature difference between hot and cold streams",
      "The point where pressure drop is highest",
      "The location where phase change begins"
    ],
    "answer": 1
  },
  {
    "question": "What is the primary advantage of using supercritical boilers in power plants?",
    "options": [
      "Lower capital costs",
      "Reduced maintenance requirements",
      "Higher thermal efficiency due to higher operating temperatures and pressures",
      "Ability to use lower quality fuel"
    ],
    "answer": 2
  },
  {
    "question": "What is the term for the ratio of actual work output to the maximum possible reversible work output for the same end states?",
    "options": [
      "Thermal efficiency",
      "Work ratio",
      "Isentropic efficiency",
      "Capacity factor"
    ],
    "answer": 2
  },
  {
    "question": "In a Rankine cycle, what is the effect of lowering the condenser pressure (assuming turbine inlet conditions remain constant)?",
    "options": [
      "Decreases thermal efficiency",
      "Increases thermal efficiency",
      "No effect on efficiency",
      "Increases pump work requirement"
    ],
    "answer": 1
  },
  {
    "question": "What is the primary purpose of an economizer in a boiler system?",
    "options": [
      "To preheat the feedwater using waste heat from flue gases",
      "To reduce the moisture content of steam",
      "To increase the pressure of the feedwater",
      "To superheat the steam"
    ],
    "answer": 0
  },
  {
    "question": "Which of the following statements about the Carnot cycle is true?",
    "options": [
      "It is the most practical cycle for steam power plants",
      "It gives the maximum possible efficiency for given temperature limits",
      "It can be easily implemented in real power plants",
      "It doesn't involve any isothermal processes"
    ],
    "answer": 1
  },
  {
    "question": "What is the primary reason for using feedwater heaters in a Rankine cycle?",
    "options": [
      "To increase the average temperature of heat addition",
      "To reduce the boiler pressure",
      "To decrease the turbine work output",
      "To reduce the condenser size"
    ],
    "answer": 0
  },
  {
    "question": "What happens to the quality of steam as it expands through an ideal turbine?",
    "options": [
      "It remains constant",
      "It increases",
      "It decreases",
      "It first increases then decreases"
    ],
    "answer": 2
  },
  {
    "question": "Which of the following is NOT a method of improving Rankine cycle efficiency?",
    "options": [
      "Increasing boiler pressure",
      "Superheating the steam",
      "Reducing condenser pressure",
      "Increasing the mass flow rate"
    ],
    "answer": 3
  },
  {
    "question": "What is the primary purpose of a steam trap in a steam system?",
    "options": [
      "To increase steam pressure",
      "To remove condensate while preventing steam loss",
      "To superheat the steam",
      "To mix steam and water"
    ],
    "answer": 1
  },
  {
    "question": "In a T-s diagram for water, what does the saturated liquid line represent?",
    "options": [
      "The state of liquid at its boiling point for various pressures",
      "The state of vapor at its condensation point",
      "The state of superheated vapor",
      "The state of subcooled liquid"
    ],
    "answer": 0
  },
  {
    "question": "What is the primary advantage of a binary vapor cycle?",
    "options": [
      "Lower capital costs",
      "Better matching of working fluid properties to temperature ranges",
      "Simpler plant design",
      "Reduced maintenance requirements"
    ],
    "answer": 1
  },
  {
    "question": "What is the term for the ratio of the actual heat absorbed by a fluid to the maximum possible heat absorption?",
    "options": [
      "Thermal efficiency",
      "Effectiveness",
      "Work ratio",
      "Capacity factor"
    ],
    "answer": 1
  },
  {
    "question": "Which of the following is NOT a type of heat exchanger?",
    "options": [
      "Shell and tube",
      "Plate",
      "Regenerative",
      "Isentropic"
    ],
    "answer": 3
  },
  {
    "question": "What is the primary reason for using mercury in binary vapor cycles?",
    "options": [
      "Its high boiling point allows for high-temperature heat addition",
      "It is inexpensive and readily available",
      "It is non-toxic and environmentally friendly",
      "It has very low thermal conductivity"
    ],
    "answer": 0
  },
  {
    "question": "What is the term for the maximum moisture content allowed at the turbine exhaust?",
    "options": [
      "Dryness fraction",
      "Wetness limit",
      "Quality factor",
      "Saturation index"
    ],
    "answer": 1
  },
  {
    "question": "In a regenerative Rankine cycle, where is the steam extracted for feedwater heating typically taken from?",
    "options": [
      "Before the boiler",
      "Between turbine stages",
      "From the condenser",
      "From the cooling tower"
    ],
    "answer": 1
  },
  {
    "question": "What is the primary purpose of a superheater in a boiler?",
    "options": [
      "To increase the pressure of the steam",
      "To increase the temperature of the steam above its saturation temperature",
      "To remove moisture from the steam",
      "To preheat the feedwater"
    ],
    "answer": 1
  },
  {
    "question": "Which of the following is NOT a component of a basic Rankine cycle?",
    "options": [
      "Boiler",
      "Turbine",
      "Condenser",
      "Compressor"
    ],
    "answer": 3
  },
  {
    "question": "What is the term for the ratio of the change in temperature of a fluid to the maximum possible temperature change in a heat exchanger?",
    "options": [
      "Efficiency",
      "Effectiveness",
      "Capacity ratio",
      "Temperature gradient"
    ],
    "answer": 1
  },
  {
    "question": "What is the primary reason for using multiple pressure boilers in modern power plants?",
    "options": [
      "To reduce the size of the turbine",
      "To better match the temperature profiles of the flue gas and working fluid",
      "To simplify the plant design",
      "To reduce the need for feedwater heaters"
    ],
    "answer": 1
  }
];
