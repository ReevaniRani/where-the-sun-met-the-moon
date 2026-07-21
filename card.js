/*Where the Sun Met the Moon: A Birthday Story for Peeyush File: script.js
   Part 1C: Scene switching + music start*/
/* ---------- DOM ELEMENTS ---------- */
const introScene = document.getElementById("introScene");
const envelopeScene = document.getElementById("envelopeScene");

const beginButton = document.getElementById("beginButton");

const pianoMusic = document.getElementById("pianoMusic");

/* ---------- SCENE CONTROL ---------- */

/**
 * Shows one scene and hides another.
 * We use classes instead of inline styles because CSS should control visuals.
 */
function switchScene(currentScene, nextScene) {
  currentScene.classList.remove("is-active");
  nextScene.classList.add("is-active");
}

/**
 * Starts background music.
 * Browsers usually block autoplay, so music should start after a user click.
 */
function startMusic() {
  if (!pianoMusic) return;

  pianoMusic.volume = 0.35;

  pianoMusic.play().catch(() => {
    console.log("Music could not autoplay. User interaction may be required.");
  });
}

/* ---------- EVENT LISTENERS ---------- */

beginButton.addEventListener("click", () => {
  startMusic();
  switchScene(introScene, envelopeScene);
});
/* Milestone 2
   Part 2B: Wax seal click + envelope opening
   Add below previous JavaScript */
/* ---------- ENVELOPE ELEMENTS ---------- */

const envelope = document.querySelector(".envelope");
const waxSealButton = document.getElementById("waxSealButton");
const letterScene = document.getElementById("letterScene");

const sealBreakSound = document.getElementById("sealBreakSound");

/* ---------- ENVELOPE INTERACTION ---------- */
/**
 * Plays a short sound effect safely.
 * We reset currentTime so the sound can replay properly if needed.
 */
function playSound(soundElement, volume = 0.5) {
  if (!(soundElement instanceof HTMLMediaElement)) {
    console.warn("Sound file missing or invalid.");
    return;
  }

  soundElement.volume = volume;
  soundElement.currentTime = 0;

  const playPromise = soundElement.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      console.log("Sound could not play.");
    });
  }
}

/**
 * Opens the envelope and moves to the parchment letter scene.
 */
function openEnvelope() {
  if (!envelope || !letterScene) return;

  playSound(sealBreakSound, 0.45);

  envelope.classList.add("is-open");

  /*
    We wait for the flap animation to finish before switching scenes.
    This makes the transition feel intentional and cinematic.
  */
  setTimeout(() => {
    switchScene(envelopeScene, letterScene);
  }, 1250);
}

/* ---------- EVENT LISTENER ---------- */

waxSealButton.addEventListener("click", openEnvelope);
/*Milestone 3 Part 3B: Letter to storybook transition*/
/* ---------- LETTER TO BOOK ELEMENTS ---------- */
const continueToBookButton = document.getElementById("continueToBookButton");
const bookScene = document.getElementById("bookScene");

/* ---------- LETTER INTERACTION ---------- */
function openStorybookScene() {
  if (!letterScene || !bookScene) return;

  switchScene(letterScene, bookScene);
}
/* ---------- EVENT LISTENER ---------- */
continueToBookButton.addEventListener("click", openStorybookScene);
/*Milestone 4Part 3: Storybook Engine JavaScript*/
/* ---------- STORYBOOK ENGINE ELEMENTS ---------- */
const storybook = document.getElementById("storybook");
const bookCover = document.getElementById("bookCover");
const bookSpread = document.getElementById("pageSystem");
const openBookButton = document.getElementById("openBookButton");

/* ---------- STORYBOOK OPENING ---------- */

function openStorybook() {
  if (!storybook || !bookCover || !bookSpread) return;

  playSound(pageTurnSound, 0.28);

  storybook.classList.add("is-opening");

  setTimeout(() => {
    storybook.classList.add("is-open");
    storybook.classList.remove("is-opening");
  }, 180);
}

/* ---------- EVENT LISTENER ---------- */
if (openBookButton) {
  openBookButton.addEventListener("click", openStorybook);
}  
/*Milestone 6 Part 4: Multi-Sheet Storybook Navigation Turns multiple physical sheets in sequence*/

const multiPageSystem = document.getElementById("pageSystem");

const storybookSheets = Array.from(
  document.querySelectorAll(".turning-sheet")
);

const sheetCornerButtons = Array.from(
  document.querySelectorAll(
    ".turning-sheet .page-corner-button"
  )
);
const previousPageCorner =
  document.getElementById("previousPageCorner");

  const finalRightPage =
  document.querySelector(".static-right-page");

let currentSheetIndex = 0;

/*Prevents several page-turn commands from running
  while one page is still moving*/
let isSheetAnimating = false;

/* ---------- SHEET STACK SETUP ---------- */

function initialiseSheetStack() {
  const totalSheets = storybookSheets.length;

  storybookSheets.forEach((sheet, index) => {
    sheet.style.zIndex = String(
      totalSheets - index + 4
    );

    sheet.classList.remove(
      "is-turning",
      "is-turned"
    );
  });

  updateSheetControls();
}
/* ---------- BUTTON AVAILABILITY ---------- */
/**
 * Only the corner belonging to the current top sheet
 * should be interactive.
 */
function updateSheetControls() {
  sheetCornerButtons.forEach((button, buttonIndex) => {
    const shouldBeActive =
      buttonIndex === currentSheetIndex &&
      !isSheetAnimating;

    button.disabled = !shouldBeActive;
    button.tabIndex = shouldBeActive ? 0 : -1;

    button.setAttribute(
      "aria-hidden",
      String(!shouldBeActive)
    );
  });

  if (previousPageCorner) {
    const canTurnBackward =
      currentSheetIndex > 0 &&
      !isSheetAnimating;

    previousPageCorner.disabled =
      !canTurnBackward;

    previousPageCorner.classList.toggle(
      "is-visible",
      canTurnBackward
    );

    previousPageCorner.tabIndex =
      canTurnBackward ? 0 : -1;

    previousPageCorner.setAttribute(
      "aria-hidden",
      String(!canTurnBackward)
    );
  }

  /* Keep page 33 hidden until every sheet is turned */
  if (finalRightPage) {
    const showFinalPage =
      currentSheetIndex >= storybookSheets.length;

    finalRightPage.classList.toggle(
      "is-visible-final-page",
      showFinalPage
    );
  }
}

/* ---------- FORWARD PAGE TURN ---------- */
/* Turns the current sheet from right to left.*/
function turnNextSheet() {
  if (isSheetAnimating) return;

  if (
    currentSheetIndex >=
    storybookSheets.length
  ) {
    return;
  }

  const activeSheet =
    storybookSheets[currentSheetIndex];

  if (!activeSheet) return;

  isSheetAnimating = true;
  updateSheetControls();

  playSound(pageTurnSound, 0.32);

  activeSheet.classList.add("is-turning");

  /*
    Starting the transform on the next animation frame
    lets the browser register the preparation state first.
  */
  requestAnimationFrame(() => {
    activeSheet.classList.add("is-turned");
  });

  const finishPageTurn = () => {
    activeSheet.classList.remove("is-turning");

    /*
      Turned sheets move to the left-page stack.
      Increasing this value keeps the newest turned sheet
      above earlier turned sheets.
    */
    activeSheet.style.zIndex = String(
      20 + currentSheetIndex
    );

    currentSheetIndex += 1;
    isSheetAnimating = false;

    updateSheetControls();

    activeSheet.removeEventListener(
      "transitionend",
      finishPageTurn
    );
  };

  activeSheet.addEventListener(
    "transitionend",
    finishPageTurn
  );

  /*
    Fallback in case transitionend does not fire.
  */
  window.setTimeout(() => {
    if (!isSheetAnimating) return;

    finishPageTurn();
  }, 1500);
}
/* ---------- OPTIONAL PREVIOUS PAGE ---------- */
/**Turns the most recently turned sheet back to the right.
 * This function is prepared now for keyboard navigation.
 * Later, we will add a subtle clickable left-page corner.*/
function turnPreviousSheet() {
  if (isSheetAnimating) return;
  if (currentSheetIndex <= 0) return;

  const previousIndex =
    currentSheetIndex - 1;

  const activeSheet =
    storybookSheets[previousIndex];

  if (!activeSheet) return;

  isSheetAnimating = true;
  updateSheetControls();

  playSound(pageTurnSound, 0.28);

  activeSheet.classList.add("is-turning");

  /*Restore its original position above the unturned stack.*/
  activeSheet.style.zIndex = String(
    storybookSheets.length -
      previousIndex +
      4
  );

  requestAnimationFrame(() => {
    activeSheet.classList.remove("is-turned");
  });

  const finishReverseTurn = () => {
    activeSheet.classList.remove("is-turning");

    currentSheetIndex = previousIndex;
    isSheetAnimating = false;

    updateSheetControls();

    activeSheet.removeEventListener(
      "transitionend",
      finishReverseTurn
    );
  };

  activeSheet.addEventListener(
    "transitionend",
    finishReverseTurn
  );

  window.setTimeout(() => {
    if (!isSheetAnimating) return;

    finishReverseTurn();
  }, 1500);
}

/* ---------- POINTER CONTROLS ---------- */
sheetCornerButtons.forEach((button) => {
  button.addEventListener(
    "click",
    turnNextSheet
  );
});
if (previousPageCorner) {
    previousPageCorner.addEventListener(
        "click",
        turnPreviousSheet
    );
}
/* ---------- KEYBOARD CONTROLS ---------- */

document.addEventListener(
  "keydown",
  (event) => {
    /*
      Keyboard navigation only operates while
      the book scene is visible and the book is open.
    */
    const bookIsActive =
      bookScene?.classList.contains("is-active");

    const bookIsOpen =
      storybook?.classList.contains("is-open");

    if (!bookIsActive || !bookIsOpen) return;

    if (
      event.key === "ArrowRight" ||
      event.key === "PageDown"
    ) {
      event.preventDefault();
      turnNextSheet();
    }

    if (
      event.key === "ArrowLeft" ||
      event.key === "PageUp"
    ) {
      event.preventDefault();
      turnPreviousSheet();
    }
  }
);

/* ---------- INITIAL STATE ---------- */

if (
  multiPageSystem &&
  storybookSheets.length > 0
) {
  initialiseSheetStack();
}
/* =========================================================
   FINAL POLISHING SYSTEM
   Loader, music, page sound and floating dust
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("storybookLoader");

  const backgroundMusic =
    document.getElementById("backgroundMusic");

  const pageTurnSound =
    document.getElementById("pageTurnSound");

  const musicToggle =
    document.getElementById("musicToggle");

  const musicToggleText =
    musicToggle?.querySelector(".music-toggle-text");

  const openBookButton =
    document.getElementById("openBookButton");

  const dustContainer =
    document.getElementById("storybookDust");

  let musicHasStarted = false;

  /* -------------------------------------------------------
     LOADING SCREEN
     ------------------------------------------------------- */
  const hideLoader = () => {
    if (!loader) {
      return;
    }

    loader.classList.add("is-hidden");

    window.setTimeout(() => {
      loader.remove();
    }, 1000);
  };

  if (document.readyState === "complete") {
    window.setTimeout(hideLoader, 650);
  } else {
    window.addEventListener(
      "load",
      () => {
        window.setTimeout(hideLoader, 650);
      },
      { once: true }
    );
  }

  /* Safety fallback in case an asset takes too long */

  window.setTimeout(hideLoader, 4500);

  /* -------------------------------------------------------
     AUDIO SETTINGS
     ------------------------------------------------------- */

  if (backgroundMusic) {
    backgroundMusic.volume = 0.2;
  }

  if (pageTurnSound) {
    pageTurnSound.volume = 0.34;
  }

  const updateMusicButton = () => {
    if (!musicToggle || !backgroundMusic) {
      return;
    }

    const isPlaying =
      !backgroundMusic.paused &&
      !backgroundMusic.muted;

    musicToggle.classList.toggle(
      "is-playing",
      isPlaying
    );

    musicToggle.classList.toggle(
      "is-muted",
      !isPlaying
    );

    musicToggle.setAttribute(
      "aria-pressed",
      String(isPlaying)
    );

    musicToggle.setAttribute(
      "aria-label",
      isPlaying
        ? "Turn background music off"
        : "Turn background music on"
    );

    if (musicToggleText) {
      musicToggleText.textContent =
        isPlaying ? "Music On" : "Music";
    }
  };

  const startBackgroundMusic = async () => {
    if (!backgroundMusic) {
      return;
    }

    backgroundMusic.muted = false;

    try {
      await backgroundMusic.play();

      musicHasStarted = true;

      updateMusicButton();
    } catch (error) {
      /*
       Browsers may block audio until the user
       makes another direct interaction.
      */

      musicHasStarted = false;

      updateMusicButton();
    }
  };

  const toggleBackgroundMusic = async () => {
    if (!backgroundMusic) {
      return;
    }

    if (
      backgroundMusic.paused ||
      backgroundMusic.muted
    ) {
      await startBackgroundMusic();

      return;
    }

    backgroundMusic.pause();

    updateMusicButton();
  };

  musicToggle?.addEventListener(
    "click",
    toggleBackgroundMusic
  );

  /*
   Music begins only after the user presses
   Open Storybook. This respects browser
   autoplay restrictions.
  */

  openBookButton?.addEventListener(
    "click",
    () => {
      if (!musicHasStarted) {
        window.setTimeout(
          startBackgroundMusic,
          450
        );
      }
    },
    { once: true }
  );

  updateMusicButton();

  /* -------------------------------------------------------
     PAGE-TURN SOUND
     ------------------------------------------------------- */

  const playPageTurnSound = () => {
    if (!pageTurnSound) {
      return;
    }

    pageTurnSound.currentTime = 0;

    const playPromise =
      pageTurnSound.play();

    if (
      playPromise &&
      typeof playPromise.catch === "function"
    ) {
      playPromise.catch(() => {
        /*Ignore audio-blocking errors.
         The book navigation must still work.*/
      });
    }
  };
  document.addEventListener(
    "click",
    (event) => {
      const pageControl =
        event.target.closest(
          [
            ".page-corner-button",
            ".previous-page-corner",
            "#previousPageCorner"
          ].join(",")
        );

      if (!pageControl) {
        return;
      }

      if (pageControl.disabled) {
        return;
      }

      playPageTurnSound();
    }
  );
  /*Keyboard page navigation also receives
   the page-turn sound.*/
  document.addEventListener(
    "keydown",
    (event) => {
      const validKeys = [
        "ArrowRight",
        "ArrowLeft",
        "PageDown",
        "PageUp"
      ];

      if (!validKeys.includes(event.key)) {
        return;
      }

      playPageTurnSound();
    }
  );
  /* -------------------------------------------------------
     FLOATING DUST
     ------------------------------------------------------- */
  const createDustParticles = () => {
    if (!dustContainer) {
      return;
    }

    const particleCount =
      window.innerWidth <= 760 ? 14 : 24;

    const fragment =
      document.createDocumentFragment();

    for (
      let index = 0;
      index < particleCount;
      index += 1
    ) {
      const particle =
        document.createElement("span");

      const size =
        Math.random() * 2.2 + 0.8;
      const duration =
        Math.random() * 10 + 12;

      const delay =
        Math.random() * -18;

      const drift =
        Math.random() * 110 - 55;

      const opacity =
        Math.random() * 0.35 + 0.15;

      particle.className =
        "dust-particle";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.setProperty(
        "--dust-size",
        `${size}px`
      );

      particle.style.setProperty(
        "--dust-duration",
        `${duration}s`
      );

      particle.style.setProperty(
        "--dust-delay",
        `${delay}s`
      );

      particle.style.setProperty(
        "--dust-drift",
        `${drift}px`
      );

      particle.style.setProperty(
        "--dust-opacity",
        opacity.toFixed(2)
      );

      fragment.appendChild(particle);
    }

    dustContainer.replaceChildren(fragment);
  };

  createDustParticles();

  let resizeTimer;

  window.addEventListener(
    "resize",
    () => {
      window.clearTimeout(resizeTimer);

      resizeTimer = window.setTimeout(
        createDustParticles,
        250
      );
    }
  );
});
