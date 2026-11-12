const canvas = document.querySelector("#game-canvas");
const ctx = canvas.getContext("2d");
const dialogueBox = document.querySelector("#dialogue-box");
const choicesBox = document.querySelector("#choices");
let npcX = 0.08;
let npcDirection = 1;
let npcStep = 0;
let lastStepTime = 0;
let npcMessage = "Tap the room or press SPACE to ask me to search!";
dialogueBox.textContent = npcMessage;
let npcTargetX = null;
let pendingAnswerIsCorrect = false;
let isWalkingToAnswer = false;
let npcPausedAtClue = false;


function say(message) {
  npcMessage = message;
  dialogueBox.textContent = message;
}
let isSearching = false;
let searchStartedAt = 0;
let clueRevealed = false;
let currentClueIndex = 0;
const birthdayNote = `Dear Niel,\n\nHappy birthday! Akak harap harini ini jadi hari yang baik untuk adik ya.\n\nJangan teasing akak banyak sangat, takut betul-betul jadi partner ja karang ni.\n\nFrom your favorite HAKAK,\n[Alya]`;

const clueData = [
  {
    question: "Clue 1: Where are birthday wishes written?",
    answers: [
      ["Birthday card", true],
      ["Cake table", false],
      ["Party hat", false]
    ]
  },
  {
    question: "Clue 2: I have a face and hands but never clap. What am I?",
    answers: [
      ["Clock", true],
      ["Birthday cake", false],
      ["Balloon", false]
    ]
  }
];

function drawRoom() {
  const width = canvas.width;
  const height = canvas.height;
  const floorY = Math.floor(height * 0.72);

  ctx.imageSmoothingEnabled = false;

  // Wall and floor
  ctx.fillStyle = "#f0e8ff";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#cdbce8";
  ctx.fillRect(0, floorY, width, height - floorY);

  ctx.fillStyle = "#a98bc9";
  ctx.fillRect(0, floorY - 2, width, 2);

  drawWallDecor(width, height, floorY);

  // Party bunting
  ctx.fillStyle = "#8b6d8c";
  ctx.fillRect(12, 8, width - 24, 1);

  const flagColors = ["#ff789d", "#ffc857", "#8ecae6", "#b69bea"];

  for (let flag = 0; flag < 7; flag++) {
    const x = 20 + flag * Math.floor((width - 48) / 7);

    for (let row = 0; row < 4; row++) {
      ctx.fillStyle = flagColors[flag % flagColors.length];
      ctx.fillRect(x + row, 9 + row, 8 - row * 2, 1);
    }
  }

  // Confetti
  const confetti = [
    [0.18, 0.3, "#ffc857"],
    [0.31, 0.48, "#ff789d"],
    [0.68, 0.34, "#8ecae6"],
    [0.77, 0.52, "#b69bea"],
    [0.54, 0.24, "#ff789d"]
  ];

  confetti.forEach(([x, y, color]) => {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.floor(width * x),
      Math.floor(height * y),
      2,
      2
    );
  });

  // Balloons
  drawBalloon(Math.floor(width * 0.12), Math.floor(height * 0.28), "#ff789d");
  drawBalloon(Math.floor(width * 0.84), Math.floor(height * 0.34), "#8ecae6");

  // Birthday table and decorations
  const tableWidth = Math.min(72, Math.floor(width * 0.55));
  const tableX = Math.floor((width - tableWidth) / 2);
  const tableY = floorY - 22;

  drawTable(tableX, tableY, tableWidth);
  drawBirthdayCard(tableX + 6, tableY - 8);
  drawCake(tableX + tableWidth - 24, tableY - 15);
  drawPartyHat(tableX + 22, tableY - 10, "#ff789d", "#ffc857");
  drawPartyHat(tableX + 35, tableY - 10, "#a98bd2", "#8ecae6");
  drawClock(width - 29, floorY - 38);
  drawCupcake(
  Math.floor(width * npcX),
  floorY - 17,
  npcStep,
  npcDirection
);
}

function drawWallDecor(width, height, floorY) {
  // Soft wallpaper panels
  ctx.fillStyle = "#e6daf6";
  for (let x = 14; x < width; x += 34) {
    ctx.fillRect(x, 22, 1, floorY - 28);
  }

  // Tiny party lights draped across the wall
  const lightY = Math.floor(height * 0.43);
  ctx.fillStyle = "#8b6d8c";
  ctx.fillRect(Math.floor(width * 0.52), lightY, Math.floor(width * 0.38), 1);
  const lightColors = ["#ffc857", "#ff789d", "#a98bd2", "#8ecae6"];
  for (let light = 0; light < 6; light++) {
    const lightX = Math.floor(width * 0.54) + light * Math.floor(width * 0.065);
    const drop = light % 2 === 0 ? 2 : 4;
    ctx.fillStyle = "#8b6d8c";
    ctx.fillRect(lightX + 1, lightY, 1, drop);
    ctx.fillStyle = lightColors[light % lightColors.length];
    ctx.fillRect(lightX, lightY + drop, 3, 3);
    ctx.fillStyle = "#fff9e9";
    ctx.fillRect(lightX + 1, lightY + drop, 1, 1);
  }

  // Pixel window with curtains
  const windowX = Math.floor(width * 0.25);
  const windowY = Math.floor(height * 0.2);
  ctx.fillStyle = "#72538f";
  ctx.fillRect(windowX, windowY, 42, 32);
  ctx.fillStyle = "#cbb9ed";
  ctx.fillRect(windowX + 3, windowY + 3, 36, 25);
  ctx.fillStyle = "#fff6d8";
  ctx.fillRect(windowX + 5, windowY + 5, 11, 8);
  ctx.fillRect(windowX + 25, windowY + 16, 10, 8);
  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(windowX + 20, windowY + 3, 2, 25);
  ctx.fillRect(windowX + 3, windowY + 14, 36, 2);
  ctx.fillStyle = "#b99cda";
  ctx.fillRect(windowX - 3, windowY, 4, 31);
  ctx.fillRect(windowX + 41, windowY, 4, 31);
  ctx.fillStyle = "#72538f";
  ctx.fillRect(windowX - 2, windowY + 12, 2, 3);
  ctx.fillRect(windowX + 40, windowY + 12, 2, 3);
  ctx.fillStyle = "#8d6aad";
  ctx.fillRect(windowX - 4, windowY + 30, 50, 3);

  // Framed birthday picture
  const frameX = Math.floor(width * 0.64);
  const frameY = Math.floor(height * 0.19);
  ctx.fillStyle = "#72538f";
  ctx.fillRect(frameX, frameY, 25, 25);
  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(frameX + 3, frameY + 3, 19, 19);
  ctx.fillStyle = "#d8c8eb";
  ctx.fillRect(frameX + 4, frameY + 4, 17, 1);
  ctx.fillStyle = "#ff789d";
  ctx.fillRect(frameX + 9, frameY + 7, 3, 3);
  ctx.fillRect(frameX + 14, frameY + 7, 3, 3);
  ctx.fillRect(frameX + 10, frameY + 10, 6, 3);
  ctx.fillStyle = "#a98bd2";
  ctx.fillRect(frameX + 8, frameY + 14, 10, 4);
  ctx.fillStyle = "#fff5dd";
  ctx.fillRect(frameX + 9, frameY + 13, 8, 2);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(frameX + 12, frameY + 11, 1, 2);
  ctx.fillStyle = "#72538f";
  ctx.fillRect(frameX + 5, frameY + 19, 15, 1);

  // A tiny birthday shelf with books and a potted plant
  const shelfX = Math.floor(width * 0.08);
  const shelfY = Math.floor(height * 0.49);
  ctx.fillStyle = "#80629e";
  ctx.fillRect(shelfX, shelfY + 13, 29, 2);
  ctx.fillRect(shelfX + 3, shelfY + 15, 2, 5);
  ctx.fillRect(shelfX + 24, shelfY + 15, 2, 5);
  ctx.fillStyle = "#a98bd2";
  ctx.fillRect(shelfX + 3, shelfY + 5, 4, 8);
  ctx.fillStyle = "#d5b9ed";
  ctx.fillRect(shelfX + 8, shelfY + 3, 4, 10);
  ctx.fillStyle = "#ff789d";
  ctx.fillRect(shelfX + 13, shelfY + 6, 4, 7);
  ctx.fillStyle = "#72538f";
  ctx.fillRect(shelfX + 4, shelfY + 7, 2, 1);
  ctx.fillRect(shelfX + 9, shelfY + 5, 2, 1);
  ctx.fillRect(shelfX + 14, shelfY + 8, 2, 1);
  ctx.fillStyle = "#9a7bb8";
  ctx.fillRect(shelfX + 20, shelfY + 9, 7, 4);
  ctx.fillStyle = "#74a879";
  ctx.fillRect(shelfX + 22, shelfY + 5, 2, 4);
  ctx.fillRect(shelfX + 19, shelfY + 6, 2, 2);
  ctx.fillRect(shelfX + 25, shelfY + 4, 2, 2);
  ctx.fillStyle = "#d8c8eb";
  ctx.fillRect(shelfX + 20, shelfY + 10, 7, 1);

  // Party rug beneath the table
  const rugX = Math.floor(width * 0.27);
  const rugY = floorY + 5;
  const rugWidth = Math.floor(width * 0.48);
  const rugHeight = Math.min(18, height - rugY - 2);
  ctx.fillStyle = "#9a7bc4";
  ctx.fillRect(rugX, rugY, rugWidth, rugHeight);
  ctx.fillStyle = "#d8c8eb";
  ctx.fillRect(rugX + 3, rugY + 3, rugWidth - 6, Math.max(1, rugHeight - 6));
  ctx.fillStyle = "#72538f";
  ctx.fillRect(rugX + 6, rugY + 5, rugWidth - 12, 1);
  ctx.fillRect(rugX + 6, rugY + rugHeight - 5, rugWidth - 12, 1);
  ctx.fillStyle = "#ff9fbd";
  ctx.fillRect(rugX + 8, rugY + 7, 4, 3);
  ctx.fillRect(rugX + rugWidth - 12, rugY + 7, 4, 3);
  ctx.fillStyle = "#a98bd2";
  for (let tassel = 8; tassel < rugWidth - 8; tassel += 12) {
    ctx.fillRect(rugX + tassel, rugY + rugHeight, 2, 2);
  }
}

function drawBalloon(x, y, color) {
  // Dark pixel outline gives the balloon a rounder silhouette.
  ctx.fillStyle = "#72538f";
  ctx.fillRect(x + 3, y, 5, 1);
  ctx.fillRect(x + 1, y + 1, 9, 7);
  ctx.fillRect(x + 2, y + 8, 7, 2);
  ctx.fillRect(x + 4, y + 10, 3, 1);

  // Main color and a darker side for a little depth.
  ctx.fillStyle = color;
  ctx.fillRect(x + 3, y + 1, 5, 1);
  ctx.fillRect(x + 2, y + 2, 7, 5);
  ctx.fillRect(x + 3, y + 7, 5, 2);
  ctx.fillStyle = "#9b70b3";
  ctx.fillRect(x + 7, y + 2, 2, 5);
  ctx.fillRect(x + 6, y + 7, 2, 1);

  // Tiny shine, tied knot and dangling string.
  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(x + 3, y + 2, 2, 1);
  ctx.fillRect(x + 2, y + 3, 1, 2);
  ctx.fillStyle = "#72538f";
  ctx.fillRect(x + 4, y + 10, 3, 2);
  ctx.fillRect(x + 5, y + 12, 1, 1);
  ctx.fillRect(x + 5, y + 13, 1, 7);
}

function drawTable(x, y, width) {
  ctx.fillStyle = "#8b5946";
  ctx.fillRect(x, y, width, 3);

  ctx.fillStyle = "#b97855";
  ctx.fillRect(x + 3, y + 3, width - 6, 3);

  ctx.fillStyle = "#744b3b";
  ctx.fillRect(x + 5, y + 6, 3, 14);
  ctx.fillRect(x + width - 8, y + 6, 3, 14);
}

function drawBirthdayCard(x, y) {
  // A slightly larger folded card with a neat purple border.
  ctx.fillStyle = "#72538f";
  ctx.fillRect(x + 1, y + 1, 12, 9);
  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(x, y, 11, 8);
  ctx.fillStyle = "#d8c8eb";
  ctx.fillRect(x + 1, y + 1, 9, 1);

  // Folded lower corners and a little birthday heart.
  ctx.fillStyle = "#cbb9ed";
  ctx.fillRect(x + 1, y + 5, 2, 1);
  ctx.fillRect(x + 3, y + 6, 2, 1);
  ctx.fillRect(x + 6, y + 6, 2, 1);
  ctx.fillRect(x + 8, y + 5, 2, 1);
  ctx.fillStyle = "#ff789d";
  ctx.fillRect(x + 3, y + 2, 2, 1);
  ctx.fillRect(x + 6, y + 2, 2, 1);
  ctx.fillRect(x + 4, y + 3, 3, 2);
  ctx.fillRect(x + 5, y + 5, 1, 1);

  // Tiny gold corner stars
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(x + 1, y + 3, 1, 1);
  ctx.fillRect(x + 9, y + 3, 1, 1);
}

function drawCake(x, y) {
  ctx.fillStyle = "#fff5dd";
  ctx.fillRect(x + 2, y + 3, 16, 4);

  ctx.fillStyle = "#ff789d";
  ctx.fillRect(x, y + 7, 20, 7);
  ctx.fillRect(x + 2, y + 5, 3, 3);
  ctx.fillRect(x + 9, y + 5, 3, 3);
  ctx.fillRect(x + 15, y + 5, 3, 3);

  ctx.fillStyle = "#8b6d8c";
  ctx.fillRect(x + 9, y, 2, 5);

  ctx.fillStyle = "#ffc857";
  ctx.fillRect(x + 9, y - 2, 2, 2);
}

function drawClock(x, y) {
  // Tall standing clock with a carved crown and sturdy feet.
  ctx.fillStyle = "#59406f";
  ctx.fillRect(x + 7, y, 6, 2);
  ctx.fillRect(x + 4, y + 2, 12, 3);
  ctx.fillRect(x + 2, y + 5, 16, 29);
  ctx.fillRect(x, y + 34, 20, 3);
  ctx.fillRect(x + 2, y + 37, 5, 1);
  ctx.fillRect(x + 13, y + 37, 5, 1);

  ctx.fillStyle = "#a98bd2";
  ctx.fillRect(x + 5, y + 3, 10, 2);
  ctx.fillRect(x + 4, y + 6, 12, 26);
  ctx.fillStyle = "#d8c8eb";
  ctx.fillRect(x + 6, y + 7, 8, 2);

  // Round clock face, tiny hour marks and hands.
  ctx.fillStyle = "#72538f";
  ctx.fillRect(x + 5, y + 6, 10, 11);
  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(x + 6, y + 7, 8, 9);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(x + 9, y + 8, 2, 1);
  ctx.fillRect(x + 7, y + 10, 1, 1);
  ctx.fillRect(x + 12, y + 10, 1, 1);
  ctx.fillRect(x + 9, y + 14, 2, 1);
  ctx.fillStyle = "#59406f";
  ctx.fillRect(x + 9, y + 9, 1, 4);
  ctx.fillRect(x + 10, y + 11, 3, 1);

  // Glass pendulum window with a swinging gold pendulum.
  ctx.fillStyle = "#59406f";
  ctx.fillRect(x + 6, y + 19, 8, 11);
  ctx.fillStyle = "#cbb9ed";
  ctx.fillRect(x + 7, y + 20, 6, 9);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(x + 9, y + 21, 2, 5);
  ctx.fillRect(x + 8, y + 26, 4, 2);
  ctx.fillStyle = "#72538f";
  ctx.fillRect(x + 5, y + 32, 10, 1);
}

function resizeGame() {
  canvas.width = Math.ceil(window.innerWidth / 4);
  canvas.height = Math.ceil(window.innerHeight / 4);
  drawRoom();
}

function drawCupcake(x, y, step, direction) {
  ctx.save();

  if (direction < 0) {
    ctx.translate(x * 2 + 16, 0);
    ctx.scale(-1, 1);
  }

  // Shadow
  ctx.fillStyle = "#b9a6d3";
  ctx.fillRect(x + 2, y + 16, 12, 1);

  // Legs alternate between two walking frames
  ctx.fillStyle = "#59406f";

  if (step === 0) {
    ctx.fillRect(x + 4, y + 13, 3, 3);
    ctx.fillRect(x + 9, y + 14, 3, 3);
  } else {
    ctx.fillRect(x + 3, y + 14, 3, 3);
    ctx.fillRect(x + 10, y + 13, 3, 3);
  }

  // Frosting
  ctx.fillStyle = "#ffb3cf";
  ctx.fillRect(x + 6, y + 1, 4, 2);
  ctx.fillRect(x + 4, y + 3, 8, 3);
  ctx.fillRect(x + 3, y + 6, 10, 2);

  // Creamy highlights and colorful sprinkles
  ctx.fillStyle = "#ffe4f0";
  ctx.fillRect(x + 5, y + 3, 3, 1);
  ctx.fillRect(x + 4, y + 4, 2, 1);
  ctx.fillStyle = "#a98bd2";
  ctx.fillRect(x + 8, y + 4, 2, 1);
  ctx.fillStyle = "#ffc857";
  ctx.fillRect(x + 7, y + 6, 1, 1);
  ctx.fillStyle = "#8ecae6";
  ctx.fillRect(x + 11, y + 5, 1, 1);

  // A little cherry on top
  ctx.fillStyle = "#ff789d";
  ctx.fillRect(x + 7, y, 3, 2);
  ctx.fillStyle = "#74a879";
  ctx.fillRect(x + 9, y - 1, 2, 1);

  // Wrapper
  ctx.fillStyle = "#a98bd2";
  ctx.fillRect(x + 4, y + 8, 8, 3);
  ctx.fillRect(x + 5, y + 11, 6, 2);

  ctx.fillStyle = "#7357a5";
  ctx.fillRect(x + 5, y + 8, 1, 4);
  ctx.fillRect(x + 8, y + 8, 1, 5);
  ctx.fillRect(x + 11, y + 8, 1, 4);

  // Eyes
  ctx.fillStyle = "#302942";
  ctx.fillRect(x + 6, y + 5, 1, 1);
  ctx.fillRect(x + 10, y + 5, 1, 1);

  ctx.fillStyle = "#ff8eae";
  ctx.fillRect(x + 4, y + 6, 2, 1);
  ctx.fillRect(x + 11, y + 6, 2, 1);
  ctx.fillStyle = "#b35683";
  ctx.fillRect(x + 8, y + 7, 2, 1);

  ctx.restore();
}

function drawDialogueBox(text) {
  const width = canvas.width;
  const height = canvas.height;
  const boxX = 6;
  const boxY = height - 50;
  const boxWidth = width - 12;
  const boxHeight = 44;
  const fontSize = width < 140 ? 7 : 9;
  const lineHeight = fontSize + 3;

  ctx.fillStyle = "#7357a5";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4);

  ctx.fillStyle = "#302942";
  ctx.font = `${fontSize}px monospace`;
  ctx.textBaseline = "top";

  const maxTextWidth = boxWidth - 10;
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;

    if (ctx.measureText(testLine).width > maxTextWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);

  lines.slice(0, 3).forEach((dialogueLine, index) => {
    ctx.fillText(dialogueLine, boxX + 5, boxY + 5 + index * lineHeight);
  });
}

function animate(time = 0) {
  if (isSearching && time - searchStartedAt > 1200) {
    isSearching = false;
    clueRevealed = true;
    say(clueData[currentClueIndex].question);
    showChoices();
  }

  const stepDelay = isSearching || isWalkingToAnswer ? 100 : 150;

  if (time - lastStepTime > stepDelay) {
    if (isWalkingToAnswer && npcTargetX !== null) {
      const speed = 0.012;
      const distance = npcTargetX - npcX;

      if (Math.abs(distance) <= speed) {
        npcX = npcTargetX;
        npcTargetX = null;
        isWalkingToAnswer = false;
        npcPausedAtClue = true;
        resolveSelectedAnswer();
      } else {
        npcDirection = distance > 0 ? 1 : -1;
        npcX += npcDirection * speed;
      }
    } else if (!npcPausedAtClue) {
      const speed = isSearching ? 0.008 : 0.006;
      npcX += npcDirection * speed;

      if (npcX >= 0.18) {
        npcX = 0.18;
        npcDirection = -1;
      } else if (npcX <= 0.08) {
        npcX = 0.08;
        npcDirection = 1;
      }
    }

    npcStep = 1 - npcStep;
    lastStepTime = time;
  }

  drawRoom();
  requestAnimationFrame(animate);
}

function getAnswerTarget(answer) {
  const width = canvas.width;
  const tableWidth = Math.min(72, Math.floor(width * 0.55));
  const tableX = Math.floor((width - tableWidth) / 2);
  const balloonX = Math.floor(width * 0.84);
  const targets = {
    // Cupcake's x is its left edge; align its center with each prop.
    "Birthday card": (tableX + 4) / width,
    "Cake table": (tableX + tableWidth / 2 - 8) / width,
    "Party hat": (tableX + 21) / width,
    "Clock": (width - 29 + 2) / width,
    "Birthday cake": (tableX + tableWidth - 22) / width,
    "Balloon": (balloonX - 4) / width
  };

  const maxX = (canvas.width - 16) / canvas.width;
  return Math.max(0, Math.min(targets[answer] ?? 0.5, maxX));
}

function showChoices() {
  choicesBox.replaceChildren();

  const clue = clueData[currentClueIndex];

  clue.answers.forEach(([answer, isCorrect]) => {
    const button = document.createElement("button");
    button.textContent = answer;

    button.addEventListener("click", () => {
      choicesBox.replaceChildren();
      npcPausedAtClue = false;
      npcTargetX = getAnswerTarget(answer);
      pendingAnswerIsCorrect = isCorrect;
      isWalkingToAnswer = true;
      say(`I'll go check the ${answer}...`);
    });

    choicesBox.appendChild(button);
  });
}

function resolveSelectedAnswer() {
  if (!pendingAnswerIsCorrect) {
    say("Nope, that's not it. Choose another place!");
    showChoices();
    return;
  }

  currentClueIndex++;

  if (currentClueIndex < clueData.length) {
    clueRevealed = false;
    say("Good thinking! Tap the room or press SPACE to search again.");
  } else {
    say("There's something behind this clock...");

    window.setTimeout(() => {
      dialogueBox.classList.add("letter");
      choicesBox.classList.add("ending");
      say(birthdayNote);

      const replayButton = document.createElement("button");
      replayButton.textContent = "Play again";
      replayButton.addEventListener("click", () => window.location.reload());
      choicesBox.appendChild(replayButton);
    }, 1500);
  }
}

function startSearch() {
  if (isSearching || clueRevealed) return;

  // Keep the cupcake at the birthday card while the next clue is being shown.
  npcPausedAtClue = currentClueIndex === 1;
  isSearching = true;
  searchStartedAt = performance.now();
  say("I'll search around. Keep an eye out!");
}

canvas.addEventListener("pointerdown", startSearch);

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    startSearch();
  }
});

function drawPartyHat(x, y, color, accent) {
  // Outlined cone, pom-pom and a sturdy decorated brim.
  ctx.fillStyle = "#59406f";
  ctx.fillRect(x + 5, y + 1, 3, 1);
  ctx.fillRect(x + 4, y + 2, 5, 1);
  ctx.fillRect(x + 3, y + 3, 7, 1);
  ctx.fillRect(x + 2, y + 4, 9, 1);
  ctx.fillRect(x + 1, y + 5, 11, 1);
  ctx.fillRect(x, y + 6, 13, 2);

  ctx.fillStyle = color;
  ctx.fillRect(x + 6, y + 2, 2, 1);
  ctx.fillRect(x + 5, y + 3, 3, 1);
  ctx.fillRect(x + 4, y + 4, 5, 1);
  ctx.fillRect(x + 3, y + 5, 7, 1);
  ctx.fillRect(x + 2, y + 6, 9, 1);

  ctx.fillStyle = accent;
  ctx.fillRect(x + 6, y + 1, 2, 2);
  ctx.fillRect(x + 6, y + 4, 1, 2);
  ctx.fillRect(x + 3, y + 6, 2, 1);
  ctx.fillRect(x + 9, y + 6, 2, 1);
  ctx.fillStyle = "#fff9e9";
  ctx.fillRect(x + 6, y + 3, 1, 1);

  ctx.fillStyle = "#72538f";
  ctx.fillRect(x - 1, y + 8, 15, 2);
  ctx.fillStyle = accent;
  ctx.fillRect(x + 1, y + 8, 3, 1);
  ctx.fillRect(x + 6, y + 8, 3, 1);
  ctx.fillRect(x + 11, y + 8, 1, 1);
}

window.addEventListener("resize", resizeGame);
resizeGame();
requestAnimationFrame(animate);
