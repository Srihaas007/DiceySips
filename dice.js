// 🎲 Grabbing All the Essentials 🎲
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const rollButton = document.getElementById('rollButton');
const message = document.getElementById('message');
const rotationTimeInput = document.getElementById('rotationTime');
const actionCard = document.getElementById('actionCard');
const cardInner = actionCard.querySelector('.card-inner');
const actionText = document.getElementById('actionText');
const closeCard = document.getElementById('closeCard');
const jokerCard = document.getElementById('jokerCard');
const jokerCardInner = jokerCard.querySelector('.card-inner');
const jokerActionText = document.getElementById('jokerActionText');
const closeJokerCard = document.getElementById('closeJokerCard');
const darkModeModal = document.getElementById('darkModeModal');
const closeDarkModeModal = document.getElementById('closeDarkModeModal');
const confirmDarkMode = document.getElementById('confirmDarkMode');
const cancelDarkMode = document.getElementById('cancelDarkMode');
const darkModeButton = document.getElementById('darkModeButton');
const addPlayersButton = document.getElementById('addPlayersButton'); // Add Players Button
const body = document.body;
const confettiCanvas = document.getElementById('confettiCanvas');

let confettiInstance;

// 📝 Player Management Variables 📝
let players = [];
let currentPlayerIndex = 0;
let guestMode = false;
let isDarkMode = false;
let isRolling = false;

// 🔮 Modal Elements
const addPlayersModal = document.getElementById('addPlayersModal');
const closeModal = document.getElementById('closeModal');
const addPlayerButton = document.getElementById('addPlayerButton');
const guestModeButton = document.getElementById('guestModeButton');
const playerNameInput = document.getElementById('playerNameInput');
const playersList = document.getElementById('playersList');
const startGameButton = document.getElementById('startGameButton');
const clearPlayersButton = document.getElementById('clearPlayersButton');
const playersDisplay = document.getElementById('playersDisplay');

/* ===========================
   Cookie Management Functions
   =========================== */

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}

/* ===========================
   Player Management Functions
   =========================== */

// Load players from cookies on page load
window.onload = function() {
    const storedPlayers = getCookie('players');
    const storedDarkMode = getCookie('darkMode');
    if(storedPlayers) {
        players = JSON.parse(storedPlayers);
        if(players.length > 10){
            players = players.slice(0,10); // Limit to 10 players
            setCookie('players', JSON.stringify(players), 7);
            alert('Maximum of 10 players allowed. Extra players have been removed.');
        }
        players.forEach(player => addPlayerToList(player));
        if(players.length > 0) {
            startGameButton.disabled = false;
        }
    }
    if(storedDarkMode === 'enabled'){
        isDarkMode = true;
        body.classList.add('dark-mode');
        darkModeButton.textContent = '🌞 Light Mode';
    }
    // Show Add Players Modal on Start if no players
    if(players.length === 0){
        openAddPlayersModal();
    }
    initializeConfetti();
};

/* ===========================
   Modal Functions
   =========================== */

// Open Add Players Modal
function openAddPlayersModal() {
    addPlayersModal.classList.add('active');
    overlay.classList.add('active');
}

// Close Add Players Modal
function closeAddPlayersModalFunc() {
    addPlayersModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Open Dark Mode Warning Modal
function openDarkModeModal() {
    darkModeModal.classList.add('active');
    overlay.classList.add('active');
}

// Close Dark Mode Warning Modal
function closeDarkModeModalFunc() {
    darkModeModal.classList.remove('active');
    overlay.classList.remove('active');
}

// Close Action Card Modal
function closeFunCard() {
    actionCard.classList.remove('active');
    overlay.classList.remove('active');
    cardInner.classList.remove('flip');
}

// Close Joker Card Modal
function closeJokerCardModal() {
    jokerCard.classList.remove('active');
    overlay.classList.remove('active');
    jokerCardInner.classList.remove('flip');
}

/* ===========================
   Player Management Functions
   =========================== */

// Add Player Event
addPlayerButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if(playerName && !players.includes(playerName)) {
        if(players.length >=10){
            alert('Maximum of 10 players reached!');
            return;
        }
        players.push(playerName);
        addPlayerToList(playerName);
        playerNameInput.value = '';
        setCookie('players', JSON.stringify(players), 7);
        startGameButton.disabled = false;
        updatePlayersListUI();
        updatePlayersDisplay();
    } else if(players.includes(playerName)) {
        alert('Player name already exists!');
    } else {
        alert('Please enter a valid player name.');
    }
});

// Clear All Players Event
clearPlayersButton.addEventListener('click', () => {
    if(confirm('Are you sure you want to clear all players?')){
        players = [];
        playersList.innerHTML = '';
        setCookie('players', JSON.stringify(players), 7);
        updatePlayersDisplay();
        startGameButton.disabled = true;
    }
});

// Add player to the players list in the UI
function addPlayerToList(name) {
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player');
    playerDiv.textContent = name;
    playersList.appendChild(playerDiv);
}

// Update Players List in Modal
function updatePlayersListUI() {
    playersList.innerHTML = '';
    players.forEach(player => {
        addPlayerToList(player);
    });
}

// Start Game Event
startGameButton.addEventListener('click', () => {
    if(players.length === 0 && !guestMode) {
        alert('Add at least one player to start the game!');
        return;
    }
    closeAddPlayersModalFunc();
    rollButton.disabled = false;
    updatePlayersDisplay();
    highlightCurrentPlayer();
});

// Guest Mode Event
guestModeButton.addEventListener('click', () => {
    if(players.length >=10){
        alert('Maximum of 10 players reached!');
        return;
    }
    guestMode = true;
    players = ['Guest'];
    updatePlayersListUI();
    setCookie('players', JSON.stringify(players), 7);
    closeAddPlayersModalFunc();
    rollButton.disabled = false;
    updatePlayersDisplay();
    highlightCurrentPlayer();
});

/* ===========================
   Dark Mode Toggle
   =========================== */

// Dark Mode Toggle Event
darkModeButton.addEventListener('click', () => {
    if (!isDarkMode) {
        // Open Dark Mode Warning Modal
        openDarkModeModal();
    } else {
        // Turn off dark mode without warning
        isDarkMode = false;
        body.classList.remove('dark-mode');
        darkModeButton.textContent = '🌚 Dark Mode';
        eraseCookie('darkMode');
    }
});

// Confirm Dark Mode Activation
confirmDarkMode.addEventListener('click', () => {
    isDarkMode = true;
    body.classList.add('dark-mode');
    darkModeButton.textContent = '🌞 Light Mode';
    setCookie('darkMode', 'enabled', 7);
    closeDarkModeModalFunc();
});

// Cancel Dark Mode Activation
cancelDarkMode.addEventListener('click', () => {
    closeDarkModeModalFunc();
});

// Close Dark Mode Modal when clicking on <span> (x)
closeDarkModeModal.addEventListener('click', () => {
    closeDarkModeModalFunc();
});

// Close Add Players Modal when clicking on <span> (x)
closeModal.addEventListener('click', () => {
    closeAddPlayersModalFunc();
});

// Close Joker Card Modal when clicking on <span> (x)
closeJokerCard.addEventListener('click', closeJokerCardModal);

// Close Action Card Modal when clicking on <span> (x)
closeCard.addEventListener('click', closeFunCard);

// Close Modals when clicking outside the modal content
window.addEventListener('click', (event) => {
    if (event.target == addPlayersModal) {
        closeAddPlayersModalFunc();
    }
    if (event.target == darkModeModal) {
        closeDarkModeModalFunc();
    }
    if (event.target == overlay) {
        closeFunCard();
        closeJokerCardModal();
        closeDarkModeModalFunc();
        closeAddPlayersModalFunc();
    }
});

/* ===========================
   Dice Rolling and Actions
   =========================== */

// 🎲 All 36 Dice Combos with Only One Cool Combo (`6-5`) Doing Nada 🎲
const lightModeCombinations = {
    '1-1': '🕺 Bust a quick dance move!',
    '1-2': '🤣 Tell a hilarious joke!',
    '1-3': '🤪 Make the weirdest face you can!',
    '1-4': '🙃 Share your most embarrassing moment!',
    '1-5': '🥳 Give a shoutout to the player on your right!',
    '1-6': '😜 Strike your best selfie pose!',
    '2-1': '🤸‍♂️ Show off a quick stretch!',
    '2-2': '😂 Share your favorite meme!',
    '2-3': '🎤 Sing a random line from a song!',
    '2-4': '📚 Recite a quirky fact!',
    '2-5': '🤹‍♂️ Do a quick juggling act (or pretend)!',
    '2-6': '🕵️‍♀️ Play detective! Describe an object without naming it.',
    '3-1': '🎨 Draw a quick doodle and show it!',
    '3-2': '🤔 Say a tongue twister three times fast!',
    '3-3': '📢 Make a funny announcement!',
    '3-4': '🦸‍♀️ Pose like your favorite superhero!',
    '3-5': '🎭 Perform a mini skit!',
    '3-6': '🤓 Share a nerdy joke!',
    '4-1': '🎲 Describe something using only emojis.',
    '4-2': '🕺 Show your best dance move!',
    '4-3': '💬 Start a funny conversation topic!',
    '4-4': '🦸‍♂️ Do your best superhero pose!',
    '4-5': '📖 Share a short, funny story!',
    '4-6': '🎲 Play rock-paper-scissors with someone!',
    '5-1': '👻 Do a spooky impression!',
    '5-2': '📸 Strike a pose and take a selfie!',
    '5-3': '🤖 Speak like a robot for the next minute!',
    '5-4': '🧗‍♀️ Pretend to climb a mountain!',
    '5-5': '🧚‍♂️ Cast a funny spell!',
    '5-6': '🎉 Celebrate like you just won the lottery!',
    '6-1': '🕺 Bust a quick dance move!',
    '6-2': '🤣 Tell a hilarious joke!',
    '6-3': '🤪 Make the weirdest face you can!',
    '6-4': '🙃 Share your most embarrassing moment!',
    '6-5': '✨ Smooth roll! Nothing to do here. ✌️', // The chill combo with no action
    '6-6': '🥳 Give a shoutout to the player on your right!'
};

const darkModeCombinations = {
    '1-1': '🕵️‍♂️ Secret Reveal! Share a deep secret.',
    '1-2': '😢 What’s something you dislike about yourself?',
    '1-3': '😱 Reveal your biggest fear!',
    '1-4': '😓 Admit something you deeply regret.',
    '1-5': '🤫 Have you ever betrayed a friend? Explain.',
    '1-6': '😔 Discuss your biggest insecurity.',
    '2-1': '😒 Share a time you were jealous of someone here.',
    '2-2': '🤥 What’s the biggest lie you’ve ever told?',
    '2-3': '😳 Talk about a moment you wish you could take back.',
    '2-4': '😖 Describe your most embarrassing moment.',
    '2-5': '❤️‍🔥 Reveal if you’ve had a crush on someone here.',
    '2-6': '😡 Share a time you lost control of your anger.',
    '3-1': '🖤 Discuss a negative thought you’ve had recently.',
    '3-2': '😞 Talk about a time you felt like a failure.',
    '3-3': '😶 Have you ever broken someone’s trust? What happened?',
    '3-4': '👤 Share a secret that would surprise your parents.',
    '3-5': '💚 Admit something you’re envious of in someone else.',
    '3-6': '😩 Tell us about something you’re ashamed of.',
    '4-1': '🚫 Confess to breaking a serious rule or law.',
    '4-2': '💔 Talk about a friendship that ended badly.',
    '4-3': '😰 Share a moment when you seriously doubted yourself.',
    '4-4': '🙍‍♂️ Discuss a time you were rejected.',
    '4-5': '😬 Reveal an unpopular opinion you hold.',
    '4-6': '😢 When was the last time you cried and why?',
    '5-1': '😖 Share a decision you regret more than anything.',
    '5-2': '😣 Talk about a painful memory that still hurts.',
    '5-3': '🙊 Confess to something minorly illegal you’ve done.',
    '5-4': '💭 Reveal a secret desire you’ve never acted on.',
    '5-5': '🤯 Have you ever felt betrayed by someone close?',
    '5-6': '🤯 Discuss an internal conflict you’re facing.',
    '6-1': '🙏 Is there someone you owe an apology to?',
    '6-2': '😱 Share your biggest fear about the future.',
    '6-3': '🙈 Reveal a guilty pleasure you keep hidden.',
    '6-4': '😕 Talk about a time you sabotaged yourself.',
    '6-5': '🃏 Joker Time! Make everyone laugh with your best joke.', // Updated to represent Joker
    '6-6': '💔 What’s a hard truth you’ve been avoiding?'
};

const christmasCombinations = {
    '1-1': '🎅 Sing a Christmas carol!',
    '1-2': '🎄 Share your favorite Christmas memory!',
    '1-3': '🎁 Describe the best gift you ever received!',
    '1-4': '⛄ Make a snowman out of paper!',
    '1-5': '🦌 Pretend to be a reindeer!',
    '1-6': '🍪 Share your favorite Christmas cookie recipe!',
    '2-1': '🎅 Dress up as Santa!',
    '2-2': '🎄 Decorate a small tree!',
    '2-3': '🎁 Wrap an imaginary gift!',
    '2-4': '⛄ Sing "Frosty the Snowman"!',
    '2-5': '🦌 Do a reindeer dance!',
    '2-6': '🍪 Bake cookies (or pretend to)!',
    '3-1': '🎅 Write a letter to Santa!',
    '3-2': '🎄 Make a Christmas ornament!',
    '3-3': '🎁 Exchange gifts with a friend!',
    '3-4': '⛄ Build a snow fort (outside or inside)!',
    '3-5': '🦌 Act out a scene from "Rudolph the Red-Nosed Reindeer"!',
    '3-6': '🍪 Decorate Christmas cookies!',
    '4-1': '🎅 Tell a Christmas joke!',
    '4-2': '🎄 Read a Christmas story!',
    '4-3': '🎁 Donate a toy to a child in need!',
    '4-4': '⛄ Have a snowball fight (with paper snowballs)!',
    '4-5': '🦌 Make reindeer antlers and a nose!',
    '4-6': '🍪 Make gingerbread houses!',
    '5-1': '🎅 Sing a Christmas duet!',
    '5-2': '🎄 Watch a Christmas movie!',
    '5-3': '🎁 Play a secret Santa game!',
    '5-4': '⛄ Make a Christmas card!',
    '5-5': '🦌 Go on a scavenger hunt for Christmas decorations!',
    '5-6': '🍪 Host a cookie exchange!',
    '6-1': '🎅 Volunteer at a local charity!',
    '6-2': '🎄 Go ice skating!',
    '6-3': '🎁 Make homemade gifts!',
    '6-4': '⛄ Have a hot cocoa and Christmas movie night!',
    '6-5': '🦌 Go caroling!',
    '6-6': '🍪 Make a Christmas feast!'
};

let isChristmasMode = false;

// Toggle Christmas Mode
const christmasModeButton = document.getElementById('christmasModeButton');
christmasModeButton.addEventListener('click', () => {
    isChristmasMode = !isChristmasMode;
    if (isChristmasMode) {
        body.classList.add('christmas-mode');
        christmasModeButton.textContent = '🎅 Normal Mode';
    } else {
        body.classList.remove('christmas-mode');
        christmasModeButton.textContent = '🎄 Christmas Mode';
    }
});

// Use the appropriate combinations based on the mode
function getCurrentCombinations() {
    if (isChristmasMode) {
        return christmasCombinations;
    } else if (isDarkMode) {
        return darkModeCombinations;
    } else {
        return lightModeCombinations;
    }
}

/* ===========================
   Utility Functions
   =========================== */

// 🔥 Function to Get a Random Number Between Min and Max 🔥
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 🌀 Function to Get Rotation Angles Based on Rolled Number 🌀
function getFaceRotation(number) {
    const rotationMap = {
        1: { x: 0, y: 0 },
        2: { x: -90, y: 0 },
        3: { x: 0, y: -90 },
        4: { x: 0, y: 90 },
        5: { x: 90, y: 0 },
        6: { x: 180, y: 0 }
    };
    return rotationMap[number];
}

/* ===========================
   Confetti Integration
   =========================== */

// 🎉 Function to Launch Confetti 🎉
function launchConfetti() {
    if(confettiInstance){
        confettiInstance({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ff4081', '#61dafb', '#ffffff']
        });
    }
}

// 🌗 Function to Initialize Confetti Canvas 🌗
function initializeConfetti() {
    confettiInstance = confetti.create(confettiCanvas, {
        resize: true,
        useWorker: true
    });
}

/* ===========================
   Dice Rolling and Actions
   =========================== */

// 🎬 Main Function to Handle Dice Rolling 🎬
function rollDice() {
    console.log("Roll Dice button clicked");

    if (isRolling) {
        console.log("Already rolling, returning");
        return; // Stop if already rolling
    }

    if (players.length === 0 && !guestMode) {
        console.log("No players found, adding Guest");
        players.push('Guest');
        guestMode = true;
        updatePlayersDisplay();
        highlightCurrentPlayer();
    }

    isRolling = true;
    rollButton.disabled = true;
    message.textContent = '';
    actionCard.classList.remove('active');
    jokerCard.classList.remove('active');
    overlay.classList.remove('active');

    let rotationDuration = parseFloat(rotationTimeInput.value);
    if (isNaN(rotationDuration) || rotationDuration < 1) rotationDuration = 3;

    dice1.style.transition = `transform ${rotationDuration}s cubic-bezier(0.25, 1, 0.5, 1)`;
    dice2.style.transition = `transform ${rotationDuration}s cubic-bezier(0.25, 1, 0.5, 1)`;

    const rolledNumber1 = getRandomInt(1, 6);
    const rolledNumber2 = getRandomInt(1, 6);
    console.log(`Rolled numbers: ${rolledNumber1}, ${rolledNumber2}`);

    const randomXRotations1 = getRandomInt(3, 6);
    const randomYRotations1 = getRandomInt(3, 6);
    const totalX1 = (randomXRotations1 * 360) + getFaceRotation(rolledNumber1).x;
    const totalY1 = (randomYRotations1 * 360) + getFaceRotation(rolledNumber1).y;
    dice1.style.transform = `rotateX(${totalX1}deg) rotateY(${totalY1}deg)`;

    const randomXRotations2 = getRandomInt(3, 6);
    const randomYRotations2 = getRandomInt(3, 6);
    const totalX2 = (randomXRotations2 * 360) + getFaceRotation(rolledNumber2).x;
    const totalY2 = (randomYRotations2 * 360) + getFaceRotation(rolledNumber2).y;
    dice2.style.transform = `rotateX(${totalX2}deg) rotateY(${totalY2}deg)`;

    setTimeout(() => {
        showDiceNumber(dice1, rolledNumber1);
        showDiceNumber(dice2, rolledNumber2);

        isRolling = false;
        rollButton.disabled = false;

        const comboKey = `${rolledNumber1}-${rolledNumber2}`;
        const combinations = getCurrentCombinations();
        let action = combinations[comboKey] || combinations[`${rolledNumber2}-${rolledNumber1}`];

        if (action) {
            if (comboKey === '6-5' || `${rolledNumber2}-${rolledNumber1}` === '6-5') {
                triggerJokerAction(action);
            } else {
                triggerFunAction(action);
                launchConfetti();
            }
        }

        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        highlightCurrentPlayer();

    }, rotationDuration * 1000);
}

// Function to show the rolled number on the dice
function showDiceNumber(diceElement, number) {
    // Clear existing active faces
    const faces = diceElement.querySelectorAll('.face');
    faces.forEach(face => {
        face.classList.remove('active');
    });

    // Activate the corresponding face based on the rolled number
    const activeFace = faces[number - 1]; // Faces are indexed from 0
    activeFace.classList.add('active');
}

/* ===========================
   Action and Joker Card Functions
   =========================== */

// 🎉 Function to Trigger Fun Actions with Card Flip Animation 🎉
function triggerFunAction(action) {
    actionText.textContent = action;
    actionCard.classList.add('active');
    overlay.classList.add('active');
    cardInner.classList.add('flip');

    // Automatically flip back after a short duration
    setTimeout(() => {
        closeFunCard();
    }, 5000); // 5 seconds
}

// 🃏 Function to Trigger Joker Action Card 🎉
function triggerJokerAction(action) {
    jokerActionText.textContent = action;
    jokerCard.classList.add('active');
    overlay.classList.add('active');
    jokerCardInner.classList.add('flip');

    // Automatically flip back after a short duration
    setTimeout(() => {
        closeJokerCardModal();
    }, 5000); // 5 seconds
}

/* ===========================
   Player Display Functions
   =========================== */

// 🍀 Initialize Players Display
function updatePlayersDisplay() {
    playersDisplay.innerHTML = '';
    players.forEach((player, index) => {
        const playerSpan = document.createElement('span');
        playerSpan.classList.add('player-name');
        playerSpan.id = `player-${index}`;
        playerSpan.textContent = player;
        playersDisplay.appendChild(playerSpan);
    });
}

/* ===========================
   Highlight Current Player
   =========================== */

// 🎯 Function to Highlight Current Player 🎯
function highlightCurrentPlayer() {
    // Clear previous highlights
    const playerElements = document.querySelectorAll('.players-display .player-name');
    playerElements.forEach(player => {
        player.classList.remove('current-player');
    });

    // Highlight current player
    const currentPlayer = players[currentPlayerIndex];
    const currentPlayerDiv = document.getElementById(`player-${currentPlayerIndex}`);
    if(currentPlayerDiv){
        currentPlayerDiv.classList.add('current-player');
    }
}

// Add event listener for the "Add Players" button
addPlayersButton.addEventListener('click', () => {
    // Show the add players modal
    addPlayersModal.classList.add('active');
    overlay.classList.add('active');
});

// Add event listener for the "Add Player" button inside the modal
addPlayerButton.addEventListener('click', () => {
    const playerName = playerNameInput.value.trim();
    if (playerName) {
        players.push(playerName);
        updatePlayersDisplay();
        playerNameInput.value = ''; // Clear the input field
    }
});

// Add event listener for the "Close" button in the modal
closeModal.addEventListener('click', () => {
    addPlayersModal.classList.remove('active');
    overlay.classList.remove('active');
});

// Ensure the roll button is enabled and has an event listener
rollButton.addEventListener('click', rollDice);
