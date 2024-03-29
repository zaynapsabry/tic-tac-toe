// * =============> Global variables ===============>
const player1Name = document.getElementById("player1Name");
const player2Name = document.getElementById("player2Name");

let boxes = Array.from(document.getElementsByClassName("box"));
let playersNames = JSON.parse(localStorage.getItem("players"));

// Get high scores for player X and O from local storage or set to 0 if not present
let highScoreX = localStorage.getItem(`${playersNames?.player1}_highScore`) || 0;
let highScoreO = localStorage.getItem(`${playersNames?.player2}_highScore`) || 0;

const highScoreXElement = document.getElementById("highScoreX");
const highScoreOElement = document.getElementById("highScoreO");

const O_TEXT = "O";
const X_TEXT = "X";
let currentPlayer = X_TEXT;

let spaces = Array(9).fill(null);
let count_plays = 0;

let game_name = document.getElementById("game_name");
let scoreX = document.getElementById("scoreX");
let scoreO = document.getElementById("scoreO");

let X_score = 0;
let O_score = 0;

let restartBtn = document.getElementById("restartBtn");
const modalRef = document.getElementById("modal");

let exitBtn = document.getElementById("exitBtn");

// Defines the combinations of winning moves on the tic-tac-toe board
const winningCombos = [
  [0, 1, 2],  // Top row
  [3, 4, 5],  // Middle row
  [6, 7, 8],  // Bottom row
  [0, 3, 6],  // Left column
  [1, 4, 7],  // Middle column
  [2, 5, 8],  // Right column
  [0, 4, 8],  // Diagonal from top-left to bottom-right
  [2, 4, 6],  // Diagonal from top-right to bottom-left
];


// * =============> Events ===============>

// Initializes the game by setting player names, displaying initial high scores, 
// and adding a click event listener to each game box
const startGame = () => {
  player1Name.innerHTML = `${playersNames?.player1}: `;
  player2Name.innerHTML = `${playersNames?.player2}: `;
  updateHighScores();
  boxes.forEach((box) => box.addEventListener("click", boxClicked));
};

// This function warns users about potential data loss when navigating away from the page.
function beforeUnloadHandler(event) {
  var message = "Are you sure? Your data may be lost.";
  event.returnValue = message;
  return message;
}

window.addEventListener("beforeunload", beforeUnloadHandler);

// Listens for exit button clicks and removes beforeunload event, then displays a confirmation modal. If confirmed, removes player names and redirects; otherwise, hides the modal
exitBtn.addEventListener("click", () => {
  window.removeEventListener("beforeunload", beforeUnloadHandler);
  restart("Are you sure you want to exit the game?");
  modalRef.addEventListener("click", (e) => {
    if (e.target.id === "confirmRestart") {
      localStorage.removeItem("players");
      window.location.href = "index.html";
    } else if (e.target.id === "cancelRestart") {
      document.getElementById("overlay").style.display = "none";
    }
  });
});

restartBtn.addEventListener("click", () => {
  restart("Are you sure you want to start a new game?");
});


// * =============> Functions ===============>

//this function manages box clicks during the game. If a box is empty and the game is not over, it triggers handleMove(). If all boxes are filled and no winner is found, it triggers handleDraw().
function boxClicked(e) {
  const id = e.target.id;

  if (!spaces[id] && count_plays < 9) {
    handleMove(id, e);
  }

  if (count_plays === 9) {
    handleDraw();
  }
}

// This function manages player moves, checks for a win, and switches players.
function handleMove(id, e) {
  spaces[id] = currentPlayer;
  e.target.innerText = currentPlayer;

  if (playerHasWon() !== false) {
    handleWin();
  } else {
    switchPlayer();
  }
}

// This function updates UI for the winner, increments scores, and triggers visual effects.
function handleWin() {
  if (currentPlayer === X_TEXT) {
    game_name.innerHTML = `${playersNames?.player1} has won!`;
    if (scoreX) {
      X_score++;
      
      // Check if the current score for Player X is higher than the stored high score
      if (X_score > highScoreX) {
        // Update the high score with the current score for Player X
        highScoreX = X_score;     
        // Store the updated high score in local storage
        localStorage.setItem(`${playersNames?.player1}_highScore`, highScoreX);     
      }
      
      scoreX.innerText = `${X_score}`;
    }
  } else {
    game_name.innerHTML = `${playersNames?.player2} has won!`;
    if (scoreO) {
      O_score++;

      // Check if the current score for Player O is higher than the stored high score
      if (O_score > highScoreO) {
        // Update the high score with the current score for Player O
        highScoreO = O_score;
        // Store the updated high score in local storage
        localStorage.setItem(`${playersNames?.player2}_highScore`, highScoreO);
      }

      scoreO.innerText = `${O_score}`;
    }
  }

  let winning_blocks = playerHasWon();
  count_plays = 10;
  winning_blocks.forEach(
    (box) => (
      (boxes[box].style.backgroundColor = "#c9c7c7"),
      (boxes[box].style.color = "#ff7eb9")
    )
  );
  updateHighScores();
  dropBalloons(boxes[winning_blocks[0]]); //drop balloons call
}

//This function plays the winning sound either player X or O wins.
function playBalloonPopSound() {
  const audio = new Audio("assets/winning_sound.mp3"); // balloon pop sound file
  audio.play();
}

//This function drops random balloons
function dropBalloons() {
  playBalloonPopSound();

  // Array containing URLs of balloon images
  const balloonUrls = [
    "https://www.iconpacks.net/icons/1/free-icon-balloon-370.png",
    "https://www.iconpacks.net/icons/1/free-icon-balloon-438.png",
    "https://www.iconpacks.net/icons/1/free-icon-balloon-369.png",
  ];

  // Number of balloons to drop & Get the width and height of the webpage
  const balloonCount = 20;
  const pageWidth = window.innerWidth;
  const pageHeight = window.innerHeight;

  for (let i = 0; i < balloonCount; i++) {
    // Randomly select a balloon image URL
    const randomIndex = Math.floor(Math.random() * balloonUrls.length);
    const balloonUrl = balloonUrls[randomIndex];

    const balloon = document.createElement("img");
    balloon.src = balloonUrl;
    balloon.classList.add("balloon");
    document.body.appendChild(balloon);

    const balloonRect = balloon.getBoundingClientRect();

    // Calculate random offset positions within the webpage
    const offsetX = Math.random() * (pageWidth - balloonRect.width);
    const offsetY = Math.random() * (pageHeight - balloonRect.height);

    // Set the position of the balloon
    balloon.style.left = `${offsetX}px`;
    balloon.style.top = `${offsetY}px`;

    // Set a random animation delay for each balloon
    balloon.style.animationDelay = `${Math.random() * 2}s`;

    // Remove the balloon from the DOM when the animation ends
    balloon.addEventListener("animationend", function () {
      document.body.removeChild(balloon);
    });
  }
}

// Function to remove balloons from the gameboard
function removeBalloons() {
  const balloons = document.querySelectorAll(".balloon");
  balloons.forEach((balloon) => {
    balloon.remove();
  });
}

// This function switches between 'X' and 'O' players.
function switchPlayer() {
  count_plays++;
  currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;
}

// Handles the draw scenario, by displaying a message and changing box colors to pink and playing a sound
function handleDraw() {
  game_name.innerHTML = `Draw Game!`;
  boxes.forEach((box) => (box.style.backgroundColor = "#ff7eb9"));
  const audio = new Audio("assets/Directed by Robert.mp3");
  audio.play();
}

// Checks if any player has won by iterating through winning combinations
// Returns the winning combination if found, otherwise returns false
function playerHasWon() {
  for (const condition of winningCombos) {
    let [a, b, c] = condition;

    if (spaces[a] && spaces[a] === spaces[b] && spaces[a] === spaces[c]) {
      return [a, b, c];
    }
  }
  return false;
}


//Updates and displays the high scores for both players on the game interface.
function updateHighScores() {
  highScoreXElement.innerText = highScoreX;
  highScoreOElement.innerText = highScoreO;
}

// This function displays a modal for restarting the game with a message. If confirmed, resets game state; otherwise, hides the modal.
function restart(message) {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("modalMessage").innerText = message;

  modalRef.addEventListener("click", (e) => {
    if (e.target.id === "confirmRestart") {
      document.getElementById("overlay").style.display = "none";

      spaces.fill(null);

      boxes.forEach((box) => {
        box.innerText = "";
        box.style.color = "";
        box.style.backgroundColor = "";
      });

      game_name.innerHTML = "Tic Tac Toe";
      currentPlayer = X_TEXT;
      count_plays = 0;
      updateHighScores();
    } else if (e.target.id === "cancelRestart") {
      document.getElementById("overlay").style.display = "none";
    }
  });
}
updateHighScores();
startGame();
