const configuredApiBase = document.querySelector('meta[name="arhc-api-base"]')?.content.trim().replace(/\/$/, "");
const runtimeApi = configuredApiBase || (location.protocol.startsWith("http") ? "/api" : null);
const runtimeOrigin = runtimeApi ? new URL(runtimeApi, location.href).origin : "";
let artistProfile = {
  artistSlug: "robbie-rolla",
  artistName: "Robbie Rolla"
};

let promoLinks = [
  {
    label: "Audiomack",
    title: "BECKY (GOLD EDITION)",
    detail: "Robbie Rolla, feat. soul girl?, produced by Jason Reeves, AWOBE INC MEDIA",
    url: "https://audiomack.com/robbie-rolla/song/becky-gold-edition",
    tone: "green"
  },
  {
    label: "Amazon Music",
    title: "Robbie Rolla Artist Page",
    detail: "Artist page with Tears of Joy and related Robbie Rolla releases",
    url: "https://music.amazon.com/artists/B0GNS9HWBD/robbie-rolla",
    tone: "blue"
  },
  {
    label: "Amazon Music",
    title: "Tears of Joy",
    detail: "Single, 5:24, released Feb. 10, 2026",
    url: "https://music.amazon.com/albums/B0GPNQGSTW",
    tone: "gold"
  },
  {
    label: "Amazon Music",
    title: "GOT IT",
    detail: "Single, Robbie Rolla feat. Robbe Rolla, 4:07, released Feb. 24, 2026",
    url: "https://music.amazon.com/albums/B0GPFNR7BC",
    tone: "coral"
  },
  {
    label: "Amazon Music",
    title: "road runner",
    detail: "Single, 4:32, Awobe inc media, released Feb. 28, 2026",
    url: "https://music.amazon.com/albums/B0GNSGLYGH",
    tone: "green"
  }
];

let artistImages = [
  {
    title: "Robbie Rolla GY Cover",
    detail: "Featured public artist image",
    src: "./artist-media/robbie-rolla/robbie-rolla-gy-cover.png"
  },
  {
    title: "Robbie Rolla Live Room",
    detail: "ARHC live-studio page hero image",
    src: "./assets/robbie-rolla-live.png",
    fallback: "linear-gradient(135deg, #36c58f, #101718 50%, #e0ad4f)"
  },
  {
    title: "We Belong Volume Visual",
    detail: "Add additional We Belong cover art here when ready",
    src: "./assets/robbie-rolla-we-belong-cover.jpg",
    fallback: "linear-gradient(160deg, #e66f5c, #141819 46%, #5ca8d8)"
  }
];

let artistVideos = [
  {
    id: "robbie-rolla-feature-video",
    title: "Robbie Rolla Featured Video",
    detail: "Public artist video",
    src: "./artist-media/robbie-rolla/robbie-rolla-feature-video.mp4",
    type: "video/mp4"
  },
  {
    id: "robbie-rolla-richie-case",
    title: "Richie & Case",
    detail: "Public artist video",
    src: "./artist-media/robbie-rolla/robbie-rolla-richie-case.mov",
    type: "video/quicktime"
  }
];

let tracks = [
  {
    id: "we-belong-part-1",
    title: "We Belong",
    mood: "We Belong volume, part 1",
    price: 1.99,
    paid: true,
    isrc: "QT7J52600020",
    streamUrl: "./artist-audio/robbie-rolla/we-belong-part-1.mp3",
    downloadUrl: "./artist-audio/robbie-rolla/we-belong-part-1.mp3",
    fileName: "Robbie Rolla - We Belong Part 1.mp3",
    listenUrl: "",
    art: "linear-gradient(135deg, #36c58f, #101718 50%, #e0ad4f)"
  },
  {
    id: "we-belong-part-2-for-wishing",
    title: "for wishing",
    mood: "We Belong volume, part 2",
    price: 1.99,
    paid: true,
    isrc: "QT7J52600021",
    streamUrl: "./artist-audio/robbie-rolla/we-belong-part-2-for-wishing.mp3",
    downloadUrl: "./artist-audio/robbie-rolla/we-belong-part-2-for-wishing.mp3",
    fileName: "Robbie Rolla - We Belong Part 2 - for wishing.mp3",
    listenUrl: "",
    art: "radial-gradient(circle at 30% 22%, #f8faf7, #5ca8d8 34%, #141819 72%)"
  }
];

const chatSeed = [
  { fan: "Mia", message: "That hook sounds expensive already." },
  { fan: "Jalen", message: "Play the featured Robbie Rolla track after this one." },
  { fan: "Sky Listener", message: "The room sounds warm tonight." }
];

let mediaStream = null;
let unlockedTracks = new Set(tracks.filter((track) => !track.paid).map((track) => track.id));
let selectedVideoId = artistVideos[0]?.id || "";
let videoSnippetTimer = null;
let videoRotationLocked = false;

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

function resolveMediaUrl(url) {
  if (!url || !runtimeApi) return url || "";
  if (/^(https?:|data:|blob:)/i.test(url)) return url;

  const normalized = url.replace(/^\.\//, "").replace(/^\//, "");
  const serverMediaRoots = ["artist-audio/", "artist-media/", "assets/"];
  if (serverMediaRoots.some((root) => normalized.startsWith(root))) {
    return `${runtimeOrigin}/${normalized}`;
  }

  return url;
}

function normalizeTrack(track) {
  return {
    ...track,
    streamUrl: resolveMediaUrl(track.streamUrl),
    downloadUrl: resolveMediaUrl(track.downloadUrl)
  };
}

function normalizeImage(image) {
  return { ...image, src: resolveMediaUrl(image.src) };
}

function normalizeVideo(video) {
  return { ...video, src: resolveMediaUrl(video.src) };
}

function selectedArtistVideo() {
  return artistVideos.find((video) => video.id === selectedVideoId) || artistVideos[0];
}

function clearVideoSnippetRotation() {
  if (videoSnippetTimer) {
    clearTimeout(videoSnippetTimer);
    videoSnippetTimer = null;
  }
}

function setPaymentStatus(message) {
  $("#payment-status").textContent = message;
}

function applyFeaturedArtistConfig(config) {
  artistProfile = {
    artistSlug: config.artistSlug || artistProfile.artistSlug,
    artistName: config.artistName || artistProfile.artistName
  };
  promoLinks = Array.isArray(config.promoLinks) ? config.promoLinks : promoLinks;
  artistImages = Array.isArray(config.images) ? config.images.map(normalizeImage) : artistImages;
  artistVideos = Array.isArray(config.videos) ? config.videos.map(normalizeVideo) : artistVideos;
  tracks = Array.isArray(config.tracks) ? config.tracks.map(normalizeTrack) : tracks;
  selectedVideoId = selectedArtistVideo()?.id || "";
  unlockedTracks = new Set(tracks.filter((track) => !track.paid).map((track) => track.id));

  document.title = config.title || document.title;
  $("#artist-title").textContent = artistProfile.artistName;
  $(".artist-line").textContent = config.tagline || $(".artist-line").textContent;
  $(".artist-hero img").src = resolveMediaUrl(config.heroImage) || $(".artist-hero img").src;
  $(".artist-hero img").alt = config.heroAlt || $(".artist-hero img").alt;
  $("#camera-placeholder strong").textContent = `${artistProfile.artistName} Live`;
  $("#promo-title").textContent = `${artistProfile.artistName} Around The Web`;
  $("#support-title").textContent = "Tips, Access, And Subscriber Moments";
}

async function loadFeaturedArtistConfig() {
  if (!runtimeApi) return;

  try {
    const response = await fetch(`${runtimeApi}/featured-artists/robbie-rolla`, { cache: "no-store" });
    if (!response.ok) return;
    applyFeaturedArtistConfig(await response.json());
  } catch {
    setPaymentStatus("Public viewing is available. Server artist controls are offline.");
  }
}

function trackPublicEvent({ action, targetType, targetId, targetTitle, targetUrl }) {
  if (!runtimeApi) return;
  const trackedTrack = targetType === "track" ? tracks.find((track) => track.id === targetId) : null;

  fetch(`${runtimeApi}/public/analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      ...artistProfile,
      action,
      targetType,
      targetId,
      targetTitle,
      targetUrl,
      isrc: trackedTrack?.isrc || "",
      referrer: document.referrer,
      pagePath: location.pathname
    })
  }).catch(() => {});
}

function renderTracks() {
  $("#track-grid").innerHTML = tracks.map((track) => {
    const unlocked = unlockedTracks.has(track.id);
    return `
      <article class="track-card" data-track-id="${track.id}">
        <div class="track-art" style="--art: ${track.art}"></div>
        <header>
          <div>
            <strong>${track.title}</strong>
            <small>${track.mood}</small>
          </div>
          <span class="track-price">${track.price ? money(track.price) : "Free"}</span>
        </header>
        <p>Public stream access. ${unlocked ? `Server audio: ${track.downloadUrl}` : "PayPal order and capture verification required before download unlock."}</p>
        <audio class="track-player" controls preload="metadata" src="${track.streamUrl || track.downloadUrl}" data-stream-track="${track.id}"></audio>
        <div class="track-actions">
          ${track.listenUrl ? `<a class="listen-link" href="${track.listenUrl}" target="_blank" rel="noreferrer" data-track-link="${track.id}">Listen</a>` : ""}
          <button type="button" data-action="${unlocked ? "download" : "pay"}" data-track-id="${track.id}">
            ${unlocked ? "Download WAV" : `Buy Download ${money(track.price)}`}
          </button>
        </div>
      </article>
    `;
  }).join("");
}

function renderPromoLinks() {
  $("#promo-grid").innerHTML = promoLinks.map((link) => `
    <a class="promo-card ${link.tone}" href="${link.url}" target="_blank" rel="noreferrer" data-promo-link="${link.title}">
      <span>${link.label}</span>
      <strong>${link.title}</strong>
      <small>${link.detail}</small>
    </a>
  `).join("");
}

function renderImages() {
  $("#image-grid").innerHTML = artistImages.map((image) => `
    <figure class="image-card">
      <img src="${image.src}" alt="${image.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
      <div class="image-fallback" style="--fallback: ${image.fallback || "linear-gradient(135deg, #36c58f, #101718 50%, #e0ad4f)"}"></div>
      <figcaption>
        <strong>${image.title}</strong>
        <small>${image.detail}</small>
      </figcaption>
    </figure>
  `).join("");
}

function renderVideos() {
  const activeVideo = selectedArtistVideo();
  if (!activeVideo) {
    $("#video-grid").innerHTML = "";
    return;
  }

  const previewMode = !videoRotationLocked && artistVideos.length > 1;
  $("#video-grid").innerHTML = `
    <article class="video-player-card">
      <div class="video-stage">
        <video class="featured-video" controls preload="metadata" ${previewMode ? "autoplay muted playsinline" : ""} data-video-id="${activeVideo.id}" data-preview-mode="${previewMode}">
          <source src="${activeVideo.src}" type="${activeVideo.type}" />
        </video>
        <div class="snippet-badge" id="snippet-badge">${previewMode ? "Preview rotation" : "Full video selected"}</div>
      </div>
      <div class="video-meta">
        <div>
          <strong>${activeVideo.title}</strong>
          <small>${activeVideo.detail}</small>
        </div>
        <span>${artistVideos.length} videos</span>
      </div>
      <div class="video-menu" aria-label="Select full artist video">
        ${artistVideos.map((video) => `
          <button type="button" class="video-choice ${video.id === activeVideo.id ? "active" : ""}" data-select-video="${video.id}" aria-pressed="${video.id === activeVideo.id}">
            <span>${video.title}</span>
            <small>${video.detail}</small>
          </button>
        `).join("")}
      </div>
    </article>
  `;
  startVideoSnippetRotation();
}

function startVideoSnippetRotation() {
  clearVideoSnippetRotation();
  if (videoRotationLocked || artistVideos.length < 2) return;

  videoSnippetTimer = setTimeout(() => {
    const currentIndex = artistVideos.findIndex((video) => video.id === selectedVideoId);
    const nextVideo = artistVideos[(currentIndex + 1) % artistVideos.length] || artistVideos[0];
    selectedVideoId = nextVideo.id;
    renderVideos();
  }, 12000);
}

function renderChat() {
  $("#chat-list").innerHTML = chatSeed.map((entry) => `
    <div class="chat-message">
      <strong>${entry.fan}</strong>
      <span>${entry.message}</span>
    </div>
  `).join("");
}

async function downloadTrack(track) {
  trackPublicEvent({
    action: "download.attempted",
    targetType: "track",
    targetId: track.id,
    targetTitle: track.title,
    targetUrl: track.downloadUrl
  });

  const response = await fetch(track.downloadUrl, { method: "HEAD" });
  if (!response.ok) {
    setPaymentStatus(`Upload ${track.fileName} to ${track.downloadUrl} before fans can download it.`);
    trackPublicEvent({
      action: "download.missing_file",
      targetType: "track",
      targetId: track.id,
      targetTitle: track.title,
      targetUrl: track.downloadUrl
    });
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = track.downloadUrl;
  anchor.download = track.fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setPaymentStatus(`${track.title} download started.`);
  trackPublicEvent({
    action: "download.started",
    targetType: "track",
    targetId: track.id,
    targetTitle: track.title,
    targetUrl: track.downloadUrl
  });
}

async function createPaypalOrder({ amount, purpose, label, email = "fan@example.com" }) {
  if (!runtimeApi) {
    setPaymentStatus("Run the ARHC server runtime to create PayPal orders for paid downloads.");
    return null;
  }

  const response = await fetch(`${runtimeApi}/payments/paypal/create-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      payerType: "fan",
      payerUsername: "robbie-rolla-page-fan",
      plan: "music-download",
      billingCycle: "one-time",
      amount,
      currency: "USD",
      marketPurpose: purpose,
      walletStatus: "Not required for music download",
      contactEmail: email,
      billingConsent: true
    })
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "PayPal order failed");

  if (!result.configured) {
    setPaymentStatus(`${label} payment was recorded as pending. Add PayPal env before paid downloads can unlock.`);
    return result;
  }

  if (result.approvalUrl) {
    window.open(result.approvalUrl, "_blank", "noreferrer");
    setPaymentStatus(`${label} PayPal order created. Download unlock waits for capture verification.`);
  }

  return result;
}

function updateLiveControls() {
  const active = Boolean(mediaStream);
  $("#start-live").disabled = active;
  $("#stop-live").disabled = !active;
  $("#toggle-video").disabled = !active;
  $("#toggle-audio").disabled = !active;
  $("#camera-placeholder").classList.toggle("is-hidden", active);
  $("#live-room-status").textContent = active ? "Camera preview live" : "Waiting for artist camera";
}

async function startLive() {
  if (!navigator.mediaDevices?.getUserMedia) {
    $("#live-room-status").textContent = "Camera unavailable";
    return;
  }

  mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  $("#artist-camera").srcObject = mediaStream;
  await $("#artist-camera").play();
  updateLiveControls();
  trackPublicEvent({
    action: "stream.started",
    targetType: "live",
    targetId: "artist-camera",
    targetTitle: `${artistProfile.artistName} Live Room`,
    targetUrl: location.href
  });
}

function stopLive() {
  mediaStream?.getTracks().forEach((track) => track.stop());
  mediaStream = null;
  $("#artist-camera").srcObject = null;
  updateLiveControls();
  trackPublicEvent({
    action: "stream.stopped",
    targetType: "live",
    targetId: "artist-camera",
    targetTitle: `${artistProfile.artistName} Live Room`,
    targetUrl: location.href
  });
}

document.addEventListener("click", async (event) => {
  const promoLink = event.target.closest("[data-promo-link]");
  if (promoLink) {
    trackPublicEvent({
      action: "link.clicked",
      targetType: "promo",
      targetId: promoLink.dataset.promoLink,
      targetTitle: promoLink.dataset.promoLink,
      targetUrl: promoLink.href
    });
  }

  const trackLink = event.target.closest("[data-track-link]");
  if (trackLink) {
    const linkedTrack = tracks.find((candidate) => candidate.id === trackLink.dataset.trackLink);
    trackPublicEvent({
      action: "stream.link_clicked",
      targetType: "track",
      targetId: linkedTrack?.id || trackLink.dataset.trackLink,
      targetTitle: linkedTrack?.title || trackLink.textContent.trim(),
      targetUrl: trackLink.href
    });
  }

  const fanPath = event.target.closest("[data-fan-path]");
  if (fanPath) {
    trackPublicEvent({
      action: "fan.path_clicked",
      targetType: "fan-path",
      targetId: fanPath.dataset.fanPath,
      targetTitle: fanPath.querySelector("strong")?.textContent || fanPath.dataset.fanPath,
      targetUrl: fanPath.href
    });
  }

  const videoChoice = event.target.closest("[data-select-video]");
  if (videoChoice) {
    videoRotationLocked = true;
    selectedVideoId = videoChoice.dataset.selectVideo;
    renderVideos();
    const selectedVideo = selectedArtistVideo();
    trackPublicEvent({
      action: "video.selected",
      targetType: "video",
      targetId: selectedVideo?.id || selectedVideoId,
      targetTitle: selectedVideo?.title || "Artist video",
      targetUrl: selectedVideo?.src || ""
    });
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;

  const track = tracks.find((candidate) => candidate.id === button.dataset.trackId);
  if (!track) return;

  if (button.dataset.action === "download") {
    downloadTrack(track);
    return;
  }

  try {
    trackPublicEvent({
      action: "download.payment_started",
      targetType: "track",
      targetId: track.id,
      targetTitle: track.title,
      targetUrl: track.downloadUrl
    });
    await createPaypalOrder({
      amount: track.price,
      purpose: "music-download",
      label: track.title
    });
  } catch (error) {
    setPaymentStatus(error.message);
  }
});

document.addEventListener("play", (event) => {
  const video = event.target.closest?.("[data-video-id]");
  if (video) {
    if (video.dataset.previewMode === "true") return;
    const artistVideo = artistVideos.find((candidate) => candidate.id === video.dataset.videoId);
    trackPublicEvent({
      action: "video.played",
      targetType: "video",
      targetId: artistVideo?.id || video.dataset.videoId,
      targetTitle: artistVideo?.title || "Artist video",
      targetUrl: video.currentSrc || artistVideo?.src || ""
    });
    return;
  }

  const player = event.target.closest?.("[data-stream-track]");
  if (!player) return;
  const track = tracks.find((candidate) => candidate.id === player.dataset.streamTrack);
  trackPublicEvent({
    action: "stream.played",
    targetType: "track",
    targetId: track?.id || player.dataset.streamTrack,
    targetTitle: track?.title || "Track",
    targetUrl: player.currentSrc || player.src
  });
}, true);

document.addEventListener("ended", (event) => {
  const video = event.target.closest?.("[data-video-id]");
  if (video) {
    if (video.dataset.previewMode === "true") return;
    const artistVideo = artistVideos.find((candidate) => candidate.id === video.dataset.videoId);
    trackPublicEvent({
      action: "video.completed",
      targetType: "video",
      targetId: artistVideo?.id || video.dataset.videoId,
      targetTitle: artistVideo?.title || "Artist video",
      targetUrl: video.currentSrc || artistVideo?.src || ""
    });
    return;
  }

  const player = event.target.closest?.("[data-stream-track]");
  if (!player) return;
  const track = tracks.find((candidate) => candidate.id === player.dataset.streamTrack);
  trackPublicEvent({
    action: "stream.completed",
    targetType: "track",
    targetId: track?.id || player.dataset.streamTrack,
    targetTitle: track?.title || "Track",
    targetUrl: player.currentSrc || player.src
  });
}, true);

$("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  chatSeed.push({
    fan: form.get("fanName").trim() || "Fan",
    message: form.get("message").trim()
  });
  event.currentTarget.elements.message.value = "";
  renderChat();
});

$("#support-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  try {
    await createPaypalOrder({
      amount: Number(form.get("amount")),
      purpose: "artist-tip",
      label: "Robbie Rolla tip",
      email: form.get("email").trim()
    });
  } catch (error) {
    setPaymentStatus(error.message);
  }
});

$("#start-live").addEventListener("click", () => {
  startLive().catch((error) => {
    $("#live-room-status").textContent = error.message;
  });
});

$("#stop-live").addEventListener("click", stopLive);

$("#toggle-video").addEventListener("click", () => {
  const track = mediaStream?.getVideoTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  $("#toggle-video").textContent = track.enabled ? "Camera On" : "Camera Off";
});

$("#toggle-audio").addEventListener("click", () => {
  const track = mediaStream?.getAudioTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  $("#toggle-audio").textContent = track.enabled ? "Mic On" : "Mic Off";
});

async function initArtistPage() {
  await loadFeaturedArtistConfig();
  renderTracks();
  renderPromoLinks();
  renderImages();
  renderVideos();
  renderChat();
  updateLiveControls();
  trackPublicEvent({
    action: "page.viewed",
    targetType: "page",
    targetId: "artist-page",
    targetTitle: `${artistProfile.artistName} Artist Page`,
    targetUrl: location.href
  });
}

initArtistPage();
