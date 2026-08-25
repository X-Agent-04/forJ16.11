/* =========================================
   16.11 — FINAL EXPERIENCE + FIREBASE
========================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================
   FIREBASE
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDL__MkHiDUr8XariEF6u7Hsmt4buZR0uU",
    authDomain: "for1611-janvi.firebaseapp.com",
    projectId: "for1611-janvi",
    storageBucket: "for1611-janvi.firebasestorage.app",
    messagingSenderId: "648851494751",
    appId: "1:648851494751:web:f9fb45b031454afeb8c8ea",
    measurementId: "G-RNH6ELBCM5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================================
   ELEMENTS
========================================= */

const scenes = document.querySelectorAll(".scene");

const progressBar =
    document.getElementById("progress-bar");

const introOverlay =
    document.getElementById("introOverlay");

const openExperience =
    document.getElementById("openExperience");

const answerButtons =
    document.querySelectorAll(".answer-btn");

const answerMessage =
    document.getElementById("answer-message");

const cursorLight =
    document.querySelector(".cursor-light");


/* =========================================
   STATE
========================================= */

let currentScene = 0;
let timer = null;
let experienceStarted = false;


/* =========================================
   SHOW SCENE
========================================= */

function showScene(index) {

    clearTimeout(timer);

    if (index < 0) {
        index = 0;
    }

    if (index >= scenes.length) {
        index = scenes.length - 1;
    }

    scenes.forEach(scene => {
        scene.classList.remove("active");
    });

    currentScene = index;

    const scene = scenes[currentScene];

    scene.classList.add("active");

    updateProgress();

    setupScene(scene);
}


/* =========================================
   PROGRESS
========================================= */

function updateProgress() {

    if (!progressBar) return;

    const progress =
        ((currentScene + 1) / scenes.length) * 100;

    progressBar.style.width =
        progress + "%";
}


/* =========================================
   AUTO SCENES
========================================= */

function setupScene(scene) {

    clearTimeout(timer);

    if (scene.dataset.type !== "auto") {
        return;
    }

    const time =
        Number(scene.dataset.time) || 20000;

    timer = setTimeout(() => {

        if (!experienceStarted) {
            return;
        }

        showScene(currentScene + 1);

    }, time);
}


/* =========================================
   OPEN EXPERIENCE
========================================= */

if (openExperience && introOverlay) {

    openExperience.addEventListener("click", () => {

        if (experienceStarted) {
            return;
        }

        experienceStarted = true;

        clearTimeout(timer);

        openExperience.disabled = true;

        introOverlay.classList.add("hide");

        setTimeout(() => {

            showScene(0);

        }, 950);

    });

}


/* =========================================
   NEXT BUTTONS
========================================= */

document
    .querySelectorAll(".next-button")
    .forEach(button => {

        button.addEventListener("click", () => {

            if (!experienceStarted) {
                return;
            }

            showScene(currentScene + 1);

        });

    });


/* =========================================
   SAVE ANSWER TO FIREBASE
========================================= */

async function saveAnswer(answer) {

    try {

        await addDoc(
            collection(db, "responses"),
            {
                answer: answer,
                page: "proposal",
                createdAt: serverTimestamp()
            }
        );

        console.log("Response saved:", answer);

        return true;

    } catch (error) {

        console.error(
            "Firebase error:",
            error
        );

        return false;
    }
}


/* =========================================
   PROPOSAL ANSWERS
========================================= */

answerButtons.forEach(button => {

    button.addEventListener("click", async () => {

        const answer =
            button.dataset.answer;


        /* Prevent multiple clicks */

        answerButtons.forEach(btn => {
            btn.disabled = true;
        });


        /* LIKE */

        if (answer === "like") {

            answerMessage.textContent =
                "That honestly made me smile. 🤍";

        }


        /* TIME */

        if (answer === "time") {

            answerMessage.textContent =
                "Of course. Take all the time you need. 🤍";

        }


        /* TALK */

        if (answer === "talk") {

            answerMessage.textContent =
                "I'm listening. Take your time. ✨";

        }


        /* Save to Firebase */

        const saved =
            await saveAnswer(answer);


        if (!saved) {

            answerMessage.textContent +=
                " (Your response couldn't be saved.)";

        }

    });

});


/* =========================================
   CURSOR LIGHT
========================================= */

if (cursorLight) {

    document.addEventListener("mousemove", event => {

        cursorLight.style.left =
            event.clientX + "px";

        cursorLight.style.top =
            event.clientY + "px";

    });

}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener("keydown", event => {

    if (!experienceStarted) {
        return;
    }

    const scene =
        scenes[currentScene];

    if (scene.dataset.type !== "manual") {
        return;
    }

    if (
        scene.classList.contains("proposal-scene")
    ) {
        return;
    }

    if (
        event.key === "ArrowRight" ||
        event.key === "Enter"
    ) {

        showScene(currentScene + 1);

    }

});


/* =========================================
   MOBILE SWIPE
========================================= */

let startX = 0;

document.addEventListener("touchstart", event => {

    if (!experienceStarted) {
        return;
    }

    startX =
        event.touches[0].clientX;

});


document.addEventListener("touchend", event => {

    if (!experienceStarted) {
        return;
    }

    const endX =
        event.changedTouches[0].clientX;

    const difference =
        startX - endX;

    const scene =
        scenes[currentScene];

    if (
        difference > 70 &&
        scene.dataset.type === "manual" &&
        !scene.classList.contains("proposal-scene")
    ) {

        showScene(currentScene + 1);

    }

});