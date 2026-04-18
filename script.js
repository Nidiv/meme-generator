// ─── State ────────────────────────────────────────────────
const state = {
  count: 0,
  autoInterval: null,
  isLoading: false,
  currentUrl: "#",
};

// ─── DOM refs ─────────────────────────────────────────────
const memeImg = document.getElementById("memeImg");
const loader = document.getElementById("loader");
const memeCard = document.getElementById("memeCard");
const subredditLabel = document.getElementById("subredditLabel");
const upvoteCount = document.getElementById("upvoteCount");
const upvoteBadge = document.getElementById("upvoteBadge");
const nextBtn = document.getElementById("nextBtn");
const autoBtn = document.getElementById("autoBtn");
const openBtn = document.getElementById("openBtn");
const countDisplay = document.getElementById("countDisplay");

// ─── Core: fetch meme ────────────────────────────────────
async function fetchMeme() {
  if (state.isLoading) return;
  state.isLoading = true;

  // Show loader, hide image
  loader.classList.remove("hidden");
  memeImg.classList.remove("visible");
  memeCard.classList.add("loading");
  nextBtn.disabled = true;

  try {
    const res = await fetch("https://meme-api.com/gimme");
    if (!res.ok) throw new Error("API error");

    const data = await res.json();
    const { url, subreddit, ups, postLink } = data;

    // Preload image before showing
    await preloadImage(url);

    // Update UI
    memeImg.src = url;
    memeImg.alt = `Meme from r/${subreddit}`;
    memeImg.classList.add("visible");

    subredditLabel.textContent = `r/${subreddit}`;
    subredditLabel.classList.add("active");

    upvoteCount.textContent = formatUpvotes(ups);
    upvoteBadge.classList.toggle("hot", ups > 10000);

    openBtn.href = postLink || url;

    state.currentUrl = postLink || url;
    state.count++;
    countDisplay.textContent = state.count;

    // Pop animation
    memeCard.classList.remove("pop");
    void memeCard.offsetWidth; // reflow
    memeCard.classList.add("pop");
  } catch (err) {
    console.error("Failed to load meme:", err);
    loader.querySelector("p").textContent = "Failed to load. Retrying...";
    setTimeout(fetchMeme, 2000);
    return;
  } finally {
    loader.classList.add("hidden");
    memeCard.classList.remove("loading");
    state.isLoading = false;
    nextBtn.disabled = false;
    loader.querySelector("p").textContent = "Summoning meme...";
  }
}

// ─── Helpers ─────────────────────────────────────────────
function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = resolve;
    img.onerror = reject;
    img.src = src;
  });
}

function formatUpvotes(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

// ─── Auto mode ────────────────────────────────────────────
function toggleAuto() {
  if (state.autoInterval) {
    clearInterval(state.autoInterval);
    state.autoInterval = null;
    autoBtn.querySelector(".btn-text").textContent = "Auto: OFF";
    autoBtn.classList.remove("active");
  } else {
    fetchMeme();
    state.autoInterval = setInterval(fetchMeme, 4000);
    autoBtn.querySelector(".btn-text").textContent = "Auto: ON";
    autoBtn.classList.add("active");
  }
}

// ─── Keyboard shortcuts ───────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    fetchMeme();
  }
  if (e.key === "a" || e.key === "A") toggleAuto();
});

// ─── Event listeners ─────────────────────────────────────
nextBtn.addEventListener("click", fetchMeme);
autoBtn.addEventListener("click", toggleAuto);

// ─── Init ─────────────────────────────────────────────────
fetchMeme();
