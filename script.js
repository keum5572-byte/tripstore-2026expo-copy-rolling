const rollingCopies = [
  "솔 바이 멜리아 푸꾸옥",
  "베스트웨스턴 푸꾸옥",
  "노보텔 푸꾸옥",
  "모벤픽 푸꾸옥",
];

const root = document.querySelector(".rolling-copy");
let index = 0;
const copyChangeIntervalMs = 1610;

function setRollingCopy(nextIndex) {
  if (!root) return;

  const current = root.querySelector(".rolling-copy__item.is-active");
  const next = document.createElement("span");

  next.className = "rolling-copy__item";
  next.textContent = rollingCopies[nextIndex];
  root.append(next);

  requestAnimationFrame(() => {
    current?.classList.add("is-leaving");

    window.setTimeout(() => {
      current?.classList.remove("is-active");
      next.classList.add("is-active");
    }, 90);
  });

  window.setTimeout(() => {
    current?.remove();
  }, 720);
}

window.setInterval(() => {
  index = (index + 1) % rollingCopies.length;
  setRollingCopy(index);
}, copyChangeIntervalMs);
