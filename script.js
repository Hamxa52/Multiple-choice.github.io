const loadingelement = document.getElementById("loading");
const errorlement = document.getElementById("error");
const quizelement = document.getElementById("quiz-container");
const questionelement = document.getElementById("question");
const answerelement = document.getElementById("answers");
const submitelement = document.getElementById("submit-btn");
const nextelement = document.getElementById("next-btn");
const resultelement = document.getElementById("results");
const scoreelement = document.getElementById("score");
const restartelement = document.getElementById("restart-btn");

let currentquestion = 0;
let score = 0;
let questions = [];

// fetch questions from Trivia DB
const fetchquestions = async (amount = 5) => {
    try {
        const response = await fetch(
            'https://opentdb.com/api.php?amount=10&category=30&difficulty=easy&type=multiple'
        );
        const data = await response.json(); // Fixed from jason() to json()
        return data.results.map((q) => ({
            question: q.question,
            answers: [...q.incorrect_answers, q.correct_answer].sort(
                () => Math.random() - 0.5
            ),
            correctAnswer: q.correct_answer, // Corrected from 'correctAnswers'
        }));
    } catch (error) {
        console.error("Error fetching questions: ", error);
        throw error;
    }
};

// Start the quiz and hide the loading element when done
const startQuiz = async () => {
    loadingelement.classList.remove("hidden"); // Show loading element
    errorlement.classList.add("hidden"); // Hide error element if shown
    resultelement.classList.add("hidden"); // Hide result section
    quizelement.classList.add("hidden"); // Hide quiz container until data loads

    try {
        questions = await fetchquestions(); // Fetch questions
        currentquestion = 0;
        score = 0;
        loadingelement.classList.add("hidden"); // Hide loading element after loading
        quizelement.classList.remove("hidden"); // Show the quiz container
        showQuestion(); // Display the first question
    } catch (error) {
        loadingelement.classList.add("hidden"); // Hide loading element
        errorlement.textContent = "Failed to load the questions. Please try again.";
        errorlement.classList.remove("hidden"); // Show error element
    }
};

// Resume the quiz
const resumeQuiz = () => {
    if (questions.length === 0) {
        startQuiz();
    } else {
        loadingelement.classList.add("hidden");
        errorlement.classList.add("hidden");
        quizelement.classList.remove("hidden");
        resultelement.classList.add("hidden");
        showQuestion();
    }
};

const showQuestion = () => {
    const { question, answers } = questions[currentquestion];
    
    // Display the question text
    questionelement.innerHTML = decodeEntities(question);

    // Clear previous answers
    answerelement.innerHTML = '';

    // Dynamically create radio buttons and labels using map
    const answerOptionsHTML = answers
        .map((answer, index) => {
            return `
                <div class="radio-item">
                    <input class="radio-items" type="radio" id="answer${index}" name="answers" value="${decodeEntities(answer)}">
                    <label for="answer${index}">${decodeEntities(answer)}</label>
                </div>
            `;
        })
        .join(""); // Join all answer options into a single string

    // Add the generated HTML to the answers container
    answerelement.innerHTML = answerOptionsHTML;

    // Show the submit button, hide the next button
    submitelement.classList.remove("hidden");
    nextelement.classList.add("hidden");
};
// Submit answers
const submitAnswers = () => {
    const selectedAnswer = document.querySelector('input[name="answers"]:checked');
    if (!selectedAnswer) return;
    const userAnswer = selectedAnswer.value;
    const { correctAnswer } = questions[currentquestion];
    
    if (userAnswer === correctAnswer) {
        score++;
    }
    saveProgress();
    showFeedback(userAnswer === correctAnswer);
    submitelement.classList.add("hidden");
    nextelement.classList.remove("hidden");
};

// Show feedback
const showFeedback = (isCorrect) => {
    const feedbackClass = isCorrect ? "correct" : "incorrect";
    const feedback = isCorrect
        ? "Correct!"
        : `Incorrect. The correct answer was: ${decodeEntities(questions[currentquestion].correctAnswer)}`;
    answerelement.innerHTML += `<p class="feedback ${feedbackClass}">${feedback}</p>`;
};

const nextQuestion = () => {
    currentquestion++;
    if (currentquestion < questions.length) {
        saveProgress(); // Save progress before showing the next question
        showQuestion(); // Show the next question
        submitelement.classList.remove("hidden"); // Show the submit button
        nextelement.classList.add("hidden"); // Hide the next button
        resultelement.classList.add("hidden");
        showResults();
    } else {
        showResults(); // End of quiz, show results
        submitelement.classList.add("hidden");
        nextelement.classList.add("hidden");
        restartelement.classList.remove("hidden");
        const message = "You have finished the quiz successfully";
        alert(message);
    }
};

//showing score
const showResults = () => {
    quizelement.classList.add("hidden");
    resultelement.classList.remove("hidden");

    console.log("Score:", score); // Debugging
    console.log("Total Questions:", questions.length); // Debugging

    // Ensure the score is correctly displayed
    scoreelement.textContent = `${score} out of ${questions.length}`;
    
    // Clear quiz progress from local storage after finishing
    localStorage.removeItem("quizProgress");
};


// Save progress in local storage
const saveProgress = () => {
    localStorage.setItem(
        "quizProgress",
        JSON.stringify({
            currentquestion,
            score,
            totalQuestions: questions.length,
            questions,
        })
    );
};

// Load progress from local storage
const loadProgress = () => {
    const progress = JSON.parse(localStorage.getItem("quizProgress"));
    if (progress) {
        currentquestion = progress.currentquestion;
        score = progress.score;
        questions = progress.questions;
        return true;
    }
    return false;
};

// Decode HTML entities
const decodeEntities = (text) => {
    const textArea = document.createElement("textarea");
    textArea.innerHTML = text;
    return textArea.value;
};

// Event listeners
submitelement.addEventListener("click", submitAnswers);
nextelement.addEventListener("click", nextQuestion);
restartelement.addEventListener("click", startQuiz);

// Initialize quiz when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    if (loadProgress()) {
        if (confirm("Do you want to continue where you left off?")) {
            resumeQuiz();
        } else {
            localStorage.removeItem("quizProgress");
            startQuiz();
        }
    } else {
        startQuiz(); // Start the quiz immediately if no progress is found
    }
    
    createParticles(50); // Add particle effect after DOM is loaded
});
// Create floating particles for background animation
function createParticles(numParticles) {
    const background = document.getElementById('background');
    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random size for each particle
        const size = Math.random() * 10 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.animationDuration = `${Math.random() * 5 + 3}s`;
        particle.style.animationDelay = `${Math.random() * 3}s`;

        background.appendChild(particle);
    }
}
