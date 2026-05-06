const rollingCopies = [
  "솔 바이 멜리아 푸꾸옥",
  "베스트웨스턴 푸꾸옥",
  "노보텔 푸꾸옥",
  "모벤픽 푸꾸옥",
];

const slideRoots = document.querySelectorAll(".rolling-copy:not(.rolling-copy--letters):not(.rolling-copy--typing):not(.rolling-copy--numbers)");
const letterRoots = document.querySelectorAll(".rolling-copy--letters");
const typingRoots = document.querySelectorAll(".rolling-copy--typing");
const numberRoots = document.querySelectorAll(".rolling-copy--numbers");
const copyHoldMs = 1400;
const copyTransitionMs = 350;
const letterTransitionMs = 600;
const letterDelayStepMs = 15;
const typingIntervalMs = 80;
const typingEraseIntervalMs = 45;
const numberRollSpeedMs = 100;
const numberRollDelayMs = 300;
const numberRollTransitionMs = 300;
const numberRepeatIntervalMs = 3000;
const numberListItems = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const hangulBaseCode = 0xac00;
const hangulEndCode = 0xd7a3;
const hangulVowelCount = 21;
const hangulFinalCount = 28;
const hangulInitials = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const compoundVowelBaseMap = {
  9: 8,
  10: 8,
  11: 8,
  14: 13,
  15: 13,
  16: 13,
  19: 18,
};
const compoundFinalBaseMap = {
  3: 1,
  5: 4,
  6: 4,
  9: 8,
  10: 8,
  11: 8,
  12: 8,
  13: 8,
  14: 8,
  15: 8,
  18: 17,
};

function setRollingOffsets(root, rowHeight) {
  root.style.setProperty("--copy-offset-1", `${-rowHeight}px`);
  root.style.setProperty("--copy-offset-2", `${-(rowHeight * 2)}px`);
  root.style.setProperty("--copy-offset-3", `${-(rowHeight * 3)}px`);
  root.style.setProperty("--copy-offset-4", `${-(rowHeight * 4)}px`);
}

function renderRollingCopy(root) {
  const track = document.createElement("span");
  track.className = "rolling-copy__track";
  track.setAttribute("aria-hidden", "true");

  [...rollingCopies, rollingCopies[0]].forEach((copy) => {
    const item = document.createElement("span");
    item.className = "rolling-copy__item";
    item.textContent = copy;
    track.append(item);
  });

  root.replaceChildren(track);
  root.setAttribute("aria-label", rollingCopies.join(", "));
}

function startSlideRollingCopy(root) {
  if (!root || rollingCopies.length === 0) return;

  renderRollingCopy(root);

  const rowHeight = root.getBoundingClientRect().height || 32;
  const cycleMs = rollingCopies.length * (copyHoldMs + copyTransitionMs);

  root.style.setProperty("--copy-row-height", `${rowHeight}px`);
  root.style.setProperty("--copy-cycle-duration", `${cycleMs}ms`);
  setRollingOffsets(root, rowHeight);

  if (rollingCopies.length > 1) {
    root.classList.add("is-rolling");
  }
}

function createLetterBlock(copy) {
  const block = document.createElement("span");
  block.className = "rolling-copy__letter-block";

  [...copy].forEach((letter, index) => {
    const span = document.createElement("span");
    span.className = "rolling-copy__letter";
    span.style.setProperty("--letter-index", index);
    span.textContent = letter.trim() === "" ? "\u00a0" : letter;
    block.append(span);
  });

  return block;
}

function renderLetterCopy(root, currentIndex) {
  const stage = document.createElement("span");
  const nextIndex = (currentIndex + 1) % rollingCopies.length;

  stage.className = "rolling-copy__letter-stage";
  stage.setAttribute("aria-hidden", "true");
  stage.append(createLetterBlock(rollingCopies[currentIndex]));
  stage.append(createLetterBlock(rollingCopies[nextIndex]));

  root.replaceChildren(stage);
  root.setAttribute("aria-label", rollingCopies[currentIndex]);
}

function getLetterAnimationDuration(currentIndex) {
  const currentLength = rollingCopies[currentIndex].length;
  const nextLength = rollingCopies[(currentIndex + 1) % rollingCopies.length].length;
  const maxLength = Math.max(currentLength, nextLength);

  return letterTransitionMs + Math.max(0, maxLength - 1) * letterDelayStepMs;
}

function startLetterRollingCopy(root) {
  if (!root || rollingCopies.length === 0) return;

  let index = 0;
  const rowHeight = root.getBoundingClientRect().height || 32;
  root.style.setProperty("--copy-row-height", `${rowHeight}px`);
  renderLetterCopy(root, index);

  if (rollingCopies.length <= 1) return;

  function playNextCopy() {
    const animationDuration = getLetterAnimationDuration(index);

    root.classList.add("is-letter-playing");

    window.setTimeout(() => {
      index = (index + 1) % rollingCopies.length;
      root.classList.remove("is-letter-playing");
      renderLetterCopy(root, index);
      window.setTimeout(playNextCopy, copyHoldMs);
    }, animationDuration);
  }

  window.setTimeout(playNextCopy, copyHoldMs);
}

function sleep(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isHangulSyllable(character) {
  const code = character.charCodeAt(0);

  return code >= hangulBaseCode && code <= hangulEndCode;
}

function composeHangul(initialIndex, vowelIndex, finalIndex = 0) {
  return String.fromCharCode(hangulBaseCode + ((initialIndex * hangulVowelCount + vowelIndex) * hangulFinalCount + finalIndex));
}

function getHangulTypingStates(character) {
  if (!isHangulSyllable(character)) {
    return [character];
  }

  const syllableIndex = character.charCodeAt(0) - hangulBaseCode;
  const initialIndex = Math.floor(syllableIndex / (hangulVowelCount * hangulFinalCount));
  const vowelIndex = Math.floor((syllableIndex % (hangulVowelCount * hangulFinalCount)) / hangulFinalCount);
  const finalIndex = syllableIndex % hangulFinalCount;
  const states = [hangulInitials[initialIndex]];
  const baseVowelIndex = compoundVowelBaseMap[vowelIndex];

  if (baseVowelIndex !== undefined) {
    states.push(composeHangul(initialIndex, baseVowelIndex));
  }

  states.push(composeHangul(initialIndex, vowelIndex));

  if (finalIndex > 0) {
    const baseFinalIndex = compoundFinalBaseMap[finalIndex];

    if (baseFinalIndex !== undefined) {
      states.push(composeHangul(initialIndex, vowelIndex, baseFinalIndex));
    }

    states.push(character);
  }

  return states;
}

function getTypingFrames(copy) {
  const frames = [];
  let confirmedText = "";

  [...copy].forEach((character) => {
    getHangulTypingStates(character).forEach((state) => {
      frames.push(`${confirmedText}${state}`);
    });

    confirmedText += character;
  });

  if (frames[frames.length - 1] !== copy) {
    frames.push(copy);
  }

  return frames;
}

function renderTypingCopy(root) {
  const stage = document.createElement("span");
  const text = document.createElement("span");
  const cursor = document.createElement("span");

  stage.className = "typing-copy-stage";
  stage.setAttribute("aria-hidden", "true");
  text.className = "typing-copy-text";
  cursor.className = "typing-copy-cursor";

  stage.append(text, cursor);
  root.replaceChildren(stage);

  return text;
}

function getCopyList(root) {
  const customCopies = root.dataset.copies?.split("|").map((copy) => copy.trim()).filter(Boolean);

  return customCopies?.length ? customCopies : rollingCopies;
}

async function typeHangulCopy(textNode, copy) {
  const frames = getTypingFrames(copy);

  for (const frame of frames) {
    textNode.textContent = frame;
    await sleep(typingIntervalMs);
  }
}

async function eraseTypingCopy(textNode, copy) {
  const characters = [...copy];

  for (let index = characters.length - 1; index >= 0; index -= 1) {
    textNode.textContent = characters.slice(0, index).join("");
    await sleep(typingEraseIntervalMs);
  }
}

function startTypingCopy(root) {
  if (!root) return;

  const copies = getCopyList(root);
  let index = 0;
  const rowHeight = root.getBoundingClientRect().height || 32;
  const textNode = renderTypingCopy(root);

  if (copies.length === 0) return;

  root.style.setProperty("--copy-row-height", `${rowHeight}px`);

  async function playTypingLoop() {
    while (true) {
      const copy = copies[index];

      root.setAttribute("aria-label", copy);
      await typeHangulCopy(textNode, copy);
      await sleep(copyHoldMs);
      await eraseTypingCopy(textNode, copy);
      index = (index + 1) % copies.length;
    }
  }

  playTypingLoop();
}

function getFormattedNumber(root) {
  const rawNumber = root.dataset.number ?? "1000000";
  const digits = rawNumber.replace(/\D/g, "");

  return Number(digits || 0).toLocaleString("en-US");
}

function renderRollingNumber(root, startsFromZero = false) {
  const stage = document.createElement("span");
  const formattedNumber = getFormattedNumber(root);
  const suffix = root.dataset.suffix ?? "";

  stage.className = "rolling-number";
  stage.setAttribute("aria-hidden", "true");

  [...formattedNumber].forEach((character) => {
    if (!/\d/.test(character)) {
      const staticNode = document.createElement("span");
      staticNode.className = "rolling-number__static";
      staticNode.textContent = character;
      stage.append(staticNode);
      return;
    }

    const slot = document.createElement("span");
    const list = document.createElement("span");
    slot.className = "rolling-number__slot";
    slot.dataset.value = character;
    list.className = "rolling-number__list";
    list.style.marginTop = startsFromZero ? "0" : `calc(var(--copy-row-height) * -${Number(character)})`;

    numberListItems.forEach((item) => {
      const digit = document.createElement("span");
      digit.className = "rolling-number__digit";
      digit.textContent = item;
      list.append(digit);
    });

    slot.append(list);
    stage.append(slot);
  });

  if (suffix) {
    const suffixNode = document.createElement("span");
    suffixNode.className = "rolling-number__suffix";
    suffixNode.textContent = suffix;
    stage.append(suffixNode);
  }

  root.replaceChildren(stage);
  root.setAttribute("aria-label", `${formattedNumber}${suffix}`);
}

function getNumberAnimationDuration(root, startsFromZero = false) {
  const digits = getFormattedNumber(root).replace(/\D/g, "");
  const slotCount = digits.length;
  const stepCount = startsFromZero ? Math.max(10, ...[...digits].map((digit) => Number(digit) + 10)) : 10;

  return Math.max(0, slotCount - 1) * numberRollDelayMs + stepCount * numberRollSpeedMs + numberRollTransitionMs;
}

function animateRollingNumber(root, rowHeight, startsFromZero = false) {
  const slots = root.querySelectorAll(".rolling-number__slot");

  slots.forEach((slot, index) => {
    window.setTimeout(() => {
      const list = slot.querySelector(".rolling-number__list");
      const value = slot.dataset.value;
      const targetPosition = Number(value);
      const stepLimit = startsFromZero ? targetPosition + 10 : 10;
      let steps = 1;

      if (stepLimit === 0) return;

      const intervalId = window.setInterval(() => {
        const position = startsFromZero ? steps : targetPosition + steps;
        list.style.marginTop = `${-(position * rowHeight)}px`;

        if (steps >= stepLimit) {
          window.clearInterval(intervalId);
          window.setTimeout(() => {
            list.style.transition = "none";
            list.style.marginTop = `${-(targetPosition * rowHeight)}px`;
            list.offsetHeight;
            list.style.transition = "";
          }, numberRollTransitionMs);
        }

        steps += 1;
      }, numberRollSpeedMs);
    }, index * numberRollDelayMs);
  });
}

function startNumberRollingCopy(root) {
  if (!root) return;

  const rowHeight = root.getBoundingClientRect().height || 32;
  let startsFromZero = true;

  root.style.setProperty("--copy-row-height", `${rowHeight}px`);
  root.style.setProperty("--number-roll-duration", `${numberRollTransitionMs}ms`);
  renderRollingNumber(root, startsFromZero);

  function playNumberRoll() {
    if (root.classList.contains("is-number-playing")) return;

    root.classList.add("is-number-playing");
    window.requestAnimationFrame(() => {
      animateRollingNumber(root, rowHeight, startsFromZero);
    });
    window.setTimeout(() => {
      root.classList.remove("is-number-playing");
      startsFromZero = false;
    }, getNumberAnimationDuration(root, startsFromZero));
  }

  playNumberRoll();
  window.setInterval(playNumberRoll, numberRepeatIntervalMs);
}

slideRoots.forEach(startSlideRollingCopy);
letterRoots.forEach(startLetterRollingCopy);
typingRoots.forEach(startTypingCopy);
numberRoots.forEach(startNumberRollingCopy);
