import http from "node:http";
import fs from "node:fs/promises";
import { createReadStream, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));

function loadLocalEnv() {
  const envPath = path.join(ROOT, ".env");
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadLocalEnv();

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const DATA_DIR = path.join(ROOT, "data");
const STATE_FILE = path.join(DATA_DIR, "runtime-state.json");
const EVENT_FILE = path.join(DATA_DIR, "runtime-events.jsonl");
const PAYPAL_ENV = process.env.PAYPAL_ENV || "sandbox";
const PAYPAL_BASE_URL = PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || process.env.PAYAPAL_SECRET_ID || process.env.PAYPAL_SECRET_ID || "";
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";
const PAYPAL_RETURN_URL = process.env.PAYPAL_RETURN_URL || `http://127.0.0.1:${PORT}/#billing`;
const PAYPAL_CANCEL_URL = process.env.PAYPAL_CANCEL_URL || `http://127.0.0.1:${PORT}/#billing`;

const billingPlanDefaults = {
  "artist-platform": { amount: 45, cycle: "yearly" },
  "artist-protection": { amount: 90, cycle: "yearly" },
  "business-partner": { amount: 4000, cycle: "yearly" },
  "fan-artist-access": { amount: 10, cycle: "monthly" },
  "promotion-network": { amount: 5.99, cycle: "monthly" },
  "platform-bitcoin": { amount: 25, cycle: "one-time" },
  "music-download": { amount: 1.99, cycle: "one-time" },
  "artist-tip": { amount: 5, cycle: "one-time" }
};

const covers = [
  "linear-gradient(135deg, #17201b, #1d7d59 48%, #d89b27)",
  "radial-gradient(circle at 25% 25%, #f7f8f3, #285c8c 38%, #17201b 72%)",
  "linear-gradient(160deg, #be4f3d, #d89b27 46%, #1d7d59)",
  "conic-gradient(from 120deg, #285c8c, #1d7d59, #d89b27, #be4f3d, #285c8c)"
];

function addMonths(dateLike, months) {
  const date = new Date(dateLike);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function addDays(dateLike, days) {
  const date = new Date(dateLike);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function platformNowIso(state) {
  const offsetMs = Number(state?.jvmTime?.offsetMs || 0);
  return new Date(Date.now() + offsetMs).toISOString();
}

function contentLifecycle({ createdAt = new Date().toISOString(), pinned = false } = {}) {
  return {
    createdAt,
    refreshedAt: createdAt,
    pinned,
    expiresAt: addMonths(createdAt, pinned ? 24 : 6)
  };
}

function initialState() {
  const now = new Date().toISOString();

  return {
    subscriber: {
      artistName: "Demo Artist",
      email: "artist@example.com",
      genre: "R&B",
      goal: "Track royalties",
      plan: "platform",
      trackingConsent: true,
      ownershipAttestation: true,
      createdAt: now
    },
    basic: {
      accountModel: "Creator customer/partner",
      monetizationEnabled: true,
      sellMusicEnabled: true,
      liveVideoEnabled: true,
      liveAudioRadioEnabled: true,
      canUseIndexScanning: false,
      includedArtistSubscriptions: 50,
      usedArtistSubscriptions: 0,
      artistSubscriptionPrice: 4.99,
      stationName: "Demo Artist Radio",
      audience: "18+ only",
      acceptPlatformSubscribers: true,
      captchaEnabled: true,
      minorSafeTerms: true,
      adultTerms: true,
      exchanges: []
    },
    fans: {
      profiles: [
        {
          id: randomUUID(),
          displayName: "Demo Listener",
          email: "fan@example.com",
          experience: "Listen to new music",
          visibility: "Public basic profile",
          genres: ["R&B", "Live studio sessions"],
          expectationNote: "Warm live sessions, early listens, and artists who talk through the music.",
          searchConsent: true,
          createdAt: now
        }
    ],
    tips: [],
    accessTrades: []
  },
    cloud: {
      leases: []
    },
    promotion: {
      active: false,
      monthlyPrice: 5.99,
      profiles: [
        {
          id: randomUUID(),
          role: "Artist",
          name: "Demo Artist",
          city: "Atlanta",
          radius: 50,
          genre: "R&B",
          budget: 250,
          fanCount: 1250,
          averageViews: 3400,
          stageDraw: 110,
          businessReadiness: "Open to artist collaboration",
          gpsConsent: true,
          createdAt: now
        }
      ],
      gigs: [
        {
          id: randomUUID(),
          title: "Friday Night R&B Showcase",
          location: "Atlanta, GA",
          genre: "R&B",
          pay: 350,
          eventType: "Showcase",
          expectedAudience: 150,
          minFanCount: 100,
          minAverageViews: 500,
          createdAt: now
        }
      ],
      alerts: []
    },
    distribution: {
      active: false,
      billing: "yearly",
      releases: [
        {
          id: randomUUID(),
          releaseTitle: "Moment of Light",
          artistName: "Demo Artist",
          isrc: "USIA02600001",
          upc: "",
          rightsBasis: "Copyright ownership",
          targetPlatforms: "Spotify, Apple Music, YouTube Music",
          audioFile: "moment-of-light.wav",
          artworkFile: "cover-art.png",
          proofFile: "",
          splitFile: "",
          distributionAuthority: true,
          scanConsent: true,
          status: "Proof Needed",
          scanStatus: "Waiting for rights proof",
          licenseId: "",
          createdAt: now
        }
      ]
    },
    bitcoin: {
      active: false,
      trees: [
        {
          id: randomUUID(),
          artistName: "Demo Artist",
          walletLabel: "Demo Artist treasury wallet",
          walletAddress: "bc1-demo-internal-record",
          packageType: "Fan vesting tree",
          supportGoal: 1000,
          vestingMonths: 12,
          fanRewardPercent: 10,
          dropAsset: "",
          campaignDescription: "Fans support the release campaign and receive access, badges, perks, or legally approved rewards.",
          riskConsent: true,
          legalReview: true,
          status: "Planning Only",
          projection: null,
          createdAt: now
        }
      ]
    },
    partner: {
      active: false,
      annualPrice: 4000,
      seatLimit: 50,
      business: {
        businessName: "Demo Partner Group",
        email: "partner@example.com",
        businessType: "Management company",
        lobbyName: "Demo Partner Lobby",
        termsAccepted: true,
        createdAt: now
      },
      artists: [],
      deals: [],
      market: {
        rootCoin: "AWOBE",
        subCoins: [],
        lastSnapshot: null
      }
    },
    contents: [
      {
        id: randomUUID(),
          title: "Moment of Light",
          isrc: "USIA02600001",
          upc: "",
          linkRequest: "none",
          linkFee: 0,
          sampleUse: "No samples used",
          sampleExplanation: "",
          proofReviewStatus: "Pending JVM Review",
          audioFingerprintStatus: "Pending",
          visualWatermarkStatus: "Pending",
          sampleReviewStatus: "Not Required",
          linkEligibility: "Proof Needed",
          releaseType: "Single",
        splitNote: "100% owned",
        platformLinks: "Spotify, Apple Music, YouTube",
        audioFile: "moment-of-light.wav",
        visualFile: "cover-art.png",
        proofFile: "",
        status: "Proof Needed",
        cover: covers[0],
        createdAt: now
      }
    ],
    jvmTime: {
      timeZone: "America/New_York",
      offsetMs: 0,
      source: "JVM internal clock",
      calendar: [],
      updatedAt: now
    },
    billing: {
      payments: [],
      walletVerifications: [],
      closedMarketCredits: []
    },
    publicAnalytics: {
      events: [],
      totals: {}
    },
    requests: []
  };
}

async function ensureDataDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function readState() {
  await ensureDataDir();

  try {
    return normalizeState(JSON.parse(await fs.readFile(STATE_FILE, "utf8")));
  } catch {
    const state = initialState();
    await writeState(state);
    return state;
  }
}

function normalizeState(state) {
  const base = initialState();

  return {
    ...base,
    ...state,
    subscriber: { ...base.subscriber, ...(state.subscriber || {}) },
    basic: {
      ...base.basic,
      ...(state.basic || {}),
      exchanges: Array.isArray(state.basic?.exchanges) ? state.basic.exchanges : []
    },
    fans: {
      ...base.fans,
      ...(state.fans || {}),
      profiles: Array.isArray(state.fans?.profiles) ? state.fans.profiles : base.fans.profiles,
      tips: Array.isArray(state.fans?.tips) ? state.fans.tips : [],
      accessTrades: Array.isArray(state.fans?.accessTrades) ? state.fans.accessTrades : []
    },
    cloud: {
      ...base.cloud,
      ...(state.cloud || {}),
      leases: Array.isArray(state.cloud?.leases) ? state.cloud.leases : []
    },
    promotion: {
      ...base.promotion,
      ...(state.promotion || {}),
      profiles: Array.isArray(state.promotion?.profiles) ? state.promotion.profiles : base.promotion.profiles,
      gigs: Array.isArray(state.promotion?.gigs) ? state.promotion.gigs : base.promotion.gigs,
      alerts: Array.isArray(state.promotion?.alerts) ? state.promotion.alerts : []
    },
    distribution: {
      ...base.distribution,
      ...(state.distribution || {}),
      releases: Array.isArray(state.distribution?.releases) ? state.distribution.releases : base.distribution.releases
    },
    bitcoin: {
      ...base.bitcoin,
      ...(state.bitcoin || {}),
      trees: Array.isArray(state.bitcoin?.trees) ? state.bitcoin.trees : base.bitcoin.trees
    },
    partner: {
      ...base.partner,
      ...(state.partner || {}),
      business: { ...base.partner.business, ...(state.partner?.business || {}) },
      artists: Array.isArray(state.partner?.artists) ? state.partner.artists : [],
      deals: Array.isArray(state.partner?.deals) ? state.partner.deals : [],
      market: {
        ...base.partner.market,
        ...(state.partner?.market || {}),
        subCoins: Array.isArray(state.partner?.market?.subCoins) ? state.partner.market.subCoins : []
      }
    },
    jvmTime: {
      ...base.jvmTime,
      ...(state.jvmTime || {}),
      calendar: Array.isArray(state.jvmTime?.calendar) ? state.jvmTime.calendar : []
    },
    billing: {
      ...base.billing,
      ...(state.billing || {}),
      payments: Array.isArray(state.billing?.payments) ? state.billing.payments : [],
      walletVerifications: Array.isArray(state.billing?.walletVerifications) ? state.billing.walletVerifications : [],
      closedMarketCredits: Array.isArray(state.billing?.closedMarketCredits) ? state.billing.closedMarketCredits : []
    },
    publicAnalytics: {
      ...base.publicAnalytics,
      ...(state.publicAnalytics || {}),
      events: Array.isArray(state.publicAnalytics?.events) ? state.publicAnalytics.events : [],
      totals: typeof state.publicAnalytics?.totals === "object" && state.publicAnalytics.totals ? state.publicAnalytics.totals : {}
    },
    contents: Array.isArray(state.contents) ? state.contents : base.contents,
    requests: Array.isArray(state.requests) ? state.requests : []
  };
}

async function writeState(state) {
  await ensureDataDir();
  await fs.writeFile(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

async function appendEvent(event) {
  await ensureDataDir();
  await fs.appendFile(EVENT_FILE, `${JSON.stringify(event)}\n`);
}

function cleanText(value, fallback = "") {
  return String(value || fallback).trim();
}

function cleanNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function paypalConfigured() {
  return Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET);
}

function billingPayload(payload = {}) {
  const plan = cleanText(payload.plan, "artist-platform");
  const defaults = billingPlanDefaults[plan] || billingPlanDefaults["artist-platform"];

  return {
    payerType: cleanText(payload.payerType, "artist"),
    payerUsername: cleanText(payload.payerUsername),
    contactEmail: cleanText(payload.contactEmail),
    plan,
    billingCycle: cleanText(payload.billingCycle, defaults.cycle),
    amount: Math.max(0, cleanNumber(payload.amount, defaults.amount)),
    currency: cleanText(payload.currency, "USD").toUpperCase(),
    marketPurpose: cleanText(payload.marketPurpose, "platform-access"),
    walletStatus: cleanText(payload.walletStatus, "Wallet review required"),
    billingConsent: Boolean(payload.billingConsent)
  };
}

async function paypalAccessToken() {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    throw new Error(`PayPal auth failed with status ${response.status}`);
  }

  const token = await response.json();
  return token.access_token;
}

async function paypalFetch(pathname, options = {}) {
  const accessToken = await paypalAccessToken();
  const response = await fetch(`${PAYPAL_BASE_URL}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || `PayPal request failed with status ${response.status}`);
  }

  return body;
}

function getApprovalUrl(order) {
  return (order.links || []).find((link) => link.rel === "approve")?.href || "";
}

function analyticsKey({ artistSlug, action, targetType, targetId }) {
  return [artistSlug, action, targetType, targetId].map((part) => cleanText(part, "unknown")).join(":");
}

function featuredArtistPage() {
  return {
    artistSlug: "robbie-rolla",
    artistName: "Robbie Rolla",
    title: "Robbie Rolla | The ARHC Artist Page",
    heroImage: "./assets/robbie-rolla-live.png",
    heroAlt: "Robbie Rolla artist page live studio backdrop",
    tagline: "The ARHC presents Robbie Rolla: live video streaming, fan messages, PayPal donations, prototype Bitcoin access support, and $1.99 song downloads sold separately.",
    accessMode: "public-viewing",
    signInRequired: false,
    serverControlled: true,
    tracks: [
      {
        id: "we-belong-part-1",
        title: "We Belong",
        mood: "$1.99 download sold separately",
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
        mood: "$1.99 download sold separately",
        price: 1.99,
        paid: true,
        isrc: "QT7J52600021",
        streamUrl: "./artist-audio/robbie-rolla/we-belong-part-2-for-wishing.mp3",
        downloadUrl: "./artist-audio/robbie-rolla/we-belong-part-2-for-wishing.mp3",
        fileName: "Robbie Rolla - We Belong Part 2 - for wishing.mp3",
        listenUrl: "",
        art: "radial-gradient(circle at 30% 22%, #f8faf7, #5ca8d8 34%, #141819 72%)"
      }
    ],
    promoLinks: [
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
    ],
    images: [
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
        title: "Robbie Rolla GQ Cover",
        detail: "Fitness and culture promo cover",
        src: "./artist-media/robbie-rolla/robbie-rolla-gq-cover-light.png"
      },
      {
        title: "Poolside Focus",
        detail: "Lifestyle promo photo",
        src: "./artist-media/robbie-rolla/robbie-rolla-pool.png"
      },
      {
        title: "Mountain Discipline",
        detail: "Athletic promo photo",
        src: "./artist-media/robbie-rolla/robbie-rolla-snow.png"
      },
      {
        title: "Beach Signal",
        detail: "Lifestyle promo photo",
        src: "./artist-media/robbie-rolla/robbie-rolla-beach.png"
      },
      {
        title: "Yacht Moment",
        detail: "Aspirational promo photo",
        src: "./artist-media/robbie-rolla/robbie-rolla-yacht.png"
      },
      {
        title: "Race Mode",
        detail: "Performance promo photo",
        src: "./artist-media/robbie-rolla/robbie-rolla-race.png"
      }
    ],
    videos: [
      {
        id: "robbie-rolla-richie-case",
        title: "Richie & Case",
        detail: "Public artist video",
        src: "./artist-media/robbie-rolla/robbie-rolla-richie-case.mov",
        type: "video/quicktime"
      },
      {
        id: "robbie-rolla-da-hustlas-prayer",
        title: "Da Hustla's Prayer",
        detail: "Public artist video",
        src: "./artist-media/robbie-rolla/robbie-rolla-da-hustlas-prayer.mov",
        type: "video/quicktime"
      }
    ]
  };
}

function linkFee(linkRequest) {
  if (linkRequest === "isrc") return 1.5;
  if (linkRequest === "upc") return 1;
  if (linkRequest === "both") return 2.5;
  return 0;
}

function sampleReviewStatus(sampleUse) {
  if (!sampleUse || sampleUse === "No samples used") return "Not Required";
  if (sampleUse === "Licensed sample") return "License Review";
  if (sampleUse === "Public use / public domain claim") return "Public Use Review";
  return "Admin Escalation";
}

function linkEligibility({ proofFile, linkRequest, sampleUse, sampleExplanation }) {
  if (!linkRequest || linkRequest === "none") return "No Paid Link Requested";
  if (!proofFile) return "Blocked: Proof Required";
  if (sampleUse && sampleUse !== "No samples used" && !sampleExplanation) return "Escalated: Sample Explanation Needed";
  if (sampleUse === "Unclear sample needs review") return "Escalated: Admin Sample Review";
  return "Eligible After JVM Scan";
}

function buildPromotionMatches(state) {
  const demoArtists = [
    {
      role: "Artist",
      name: state.subscriber.artistName,
      city: "Atlanta",
      radius: 50,
      genre: state.subscriber.genre,
      budget: Number(state.basic.artistSubscriptionPrice || 0) * 50,
      fanCount: state.fans?.profiles?.length || 0,
      averageViews: Math.max(500, (state.contents?.length || 1) * 750),
      stageDraw: Math.max(25, (state.fans?.profiles?.length || 1) * 10),
      businessReadiness: "Open to artist collaboration"
    }
  ];
  const artists = [
    ...state.promotion.profiles.filter((profile) => profile.role === "Artist"),
    ...demoArtists
  ].filter((artist, index, list) => artist.name && list.findIndex((candidate) => candidate.name === artist.name) === index);
  const matches = [];

  artists.forEach((profile) => {
    state.promotion.gigs.forEach((gig) => {
      const profileGenre = String(profile.genre || "").toLowerCase();
      const gigGenre = String(gig.genre || "").toLowerCase();
      const genreFit = gigGenre.includes(profileGenre) || profileGenre.includes(gigGenre);
      const cityFit = String(gig.location || "").toLowerCase().includes(String(profile.city || "").toLowerCase());
      const payFit = Number(gig.pay) >= Number(profile.budget || 0);
      const fanFit = Number(profile.fanCount || 0) >= Number(gig.minFanCount || 0);
      const viewFit = Number(profile.averageViews || 0) >= Number(gig.minAverageViews || 0);
      const drawFit = Number(profile.stageDraw || 0) >= Math.max(25, Number(gig.expectedAudience || 0) * 0.35);
      const score = [genreFit, cityFit, payFit, fanFit, viewFit, drawFit].filter(Boolean).length;

      if (score >= 2) {
        matches.push({
          ...gig,
          artistName: profile.name,
          fanCount: Number(profile.fanCount || 0),
          averageViews: Number(profile.averageViews || 0),
          stageDraw: Number(profile.stageDraw || 0),
          score: Math.round((score / 6) * 100),
          reason: `${profile.role} ${profile.name} matched by ${[genreFit && "genre", cityFit && "location", payFit && "pay", fanFit && "fan count", viewFit && "average views", drawFit && "stage draw"].filter(Boolean).join(", ")}. JVM recommends this show for booking, paid performance income, and artist page promotion.`
        });
      }
    });
  });

  return matches.sort((a, b) => b.score - a.score).slice(0, 12);
}

function calculateJvmSettlement({
  artistRouteCoinValue = 0,
  fanBaseCoinValue = 0,
  payoutRatio = 0.5
} = {}) {
  const artistValue = Number(artistRouteCoinValue || 0);
  const fanValue = Number(fanBaseCoinValue || 0);
  const blockchainValueBeforePayout = artistValue + fanValue;
  const blockchainValueAfterPayout = blockchainValueBeforePayout * Number(payoutRatio || 0);
  const artistPayoutValue = Math.min(fanValue, blockchainValueBeforePayout - blockchainValueAfterPayout);

  return {
    artistRouteCoinValue: artistValue,
    fanBaseCoinValue: fanValue,
    blockchainValueBeforePayout,
    blockchainValueAfterPayout,
    artistPayoutValue,
    retainedArtistMarketValue: artistValue,
    payoutRatio
  };
}

function applyRuntimeEvent(state, event) {
  const payload = event.payload || {};
  const now = event.createdAt;

  if (event.type === "jvm.time.updated") {
    const requestedAt = cleanText(payload.currentAt, now);
    state.jvmTime = {
      ...state.jvmTime,
      timeZone: cleanText(payload.timeZone, state.jvmTime?.timeZone || "America/New_York"),
      offsetMs: Date.parse(requestedAt) - Date.now(),
      source: "JVM internal clock",
      updatedAt: requestedAt,
      calendar: [
        ...(state.jvmTime?.calendar || []),
        {
          id: randomUUID(),
          label: cleanText(payload.calendarLabel, "JVM time updated"),
          timeZone: cleanText(payload.timeZone, state.jvmTime?.timeZone || "America/New_York"),
          scheduledAt: requestedAt,
          createdAt: now
        }
      ].slice(-20)
    };
  }

  if (event.type === "payment.capture.requested") {
    const payment = billingPayload(payload);
    state.billing.payments.push({
      id: cleanText(payload.paymentId, randomUUID()),
      ...payment,
      processor: "PayPal",
      status: cleanText(payload.status, "Capture Verification Required"),
      paypalOrderId: cleanText(payload.paypalOrderId),
      approvalUrl: cleanText(payload.approvalUrl),
      captureVerified: false,
      orderProcessApproved: false,
      createdAt: now
    });
  }

  if (event.type === "payment.paypal.order.created") {
    const payment = billingPayload(payload);
    state.billing.payments.push({
      id: cleanText(payload.paymentId, randomUUID()),
      ...payment,
      processor: "PayPal",
      status: "PayPal Order Created - Capture Verification Required",
      paypalOrderId: cleanText(payload.paypalOrderId),
      approvalUrl: cleanText(payload.approvalUrl),
      captureVerified: false,
      orderProcessApproved: false,
      createdAt: now
    });
  }

  if (event.type === "payment.paypal.capture.verified") {
    const payment = state.billing.payments.find((record) => record.paypalOrderId === cleanText(payload.paypalOrderId) || record.id === cleanText(payload.paymentId));

    if (payment) {
      payment.status = "Order Processing Approved";
      payment.captureId = cleanText(payload.captureId, payment.captureId);
      payment.captureStatus = cleanText(payload.captureStatus, "COMPLETED");
      payment.captureVerified = true;
      payment.orderProcessApproved = true;
      payment.verifiedAt = now;
    }

    if ((payload.marketPurpose === "platform-bitcoin-credit" || payload.marketPurpose === "artist-bitcoin-access") && payment?.captureVerified) {
      state.billing.closedMarketCredits.push({
        id: randomUUID(),
        paymentId: cleanText(payload.paymentId, payment.id),
        paypalOrderId: cleanText(payload.paypalOrderId, payment.paypalOrderId),
        payerUsername: cleanText(payload.payerUsername, payment.payerUsername),
        marketPurpose: cleanText(payload.marketPurpose, payment.marketPurpose),
        amount: cleanNumber(payload.amount, payment.amount),
        currency: cleanText(payload.currency, payment.currency || "USD"),
        status: "Wallet Verification Required Before Coin Credit",
        createdAt: now
      });
    }
  }

  if (event.type === "payment.paypal.webhook.received") {
    state.billing.payments.push({
      id: randomUUID(),
      payerType: "system",
      payerUsername: "paypal-webhook",
      contactEmail: "",
      plan: "webhook-verification",
      billingCycle: "event",
      amount: 0,
      currency: "USD",
      marketPurpose: cleanText(payload.eventType, "paypal-webhook"),
      walletStatus: "Not applicable",
      processor: "PayPal",
      status: cleanText(payload.status, "Webhook Received"),
      paypalOrderId: cleanText(payload.paypalOrderId),
      approvalUrl: "",
      captureVerified: Boolean(payload.captureVerified),
      orderProcessApproved: false,
      createdAt: now
    });
  }

  if (event.type === "wallet.verification.updated") {
    state.billing.walletVerifications.push({
      id: randomUUID(),
      payerUsername: cleanText(payload.payerUsername),
      payerType: cleanText(payload.payerType, "fan"),
      walletStatus: cleanText(payload.walletStatus, "Wallet review required"),
      verificationSource: cleanText(payload.verificationSource, "payment capture"),
      status: cleanText(payload.status, "Pending Review"),
      createdAt: now
    });
  }

  if (event.type === "public.analytics.recorded") {
    const record = {
      id: randomUUID(),
      artistSlug: cleanText(payload.artistSlug, "robbie-rolla"),
      artistName: cleanText(payload.artistName, "Robbie Rolla"),
      action: cleanText(payload.action, "page.view"),
      targetType: cleanText(payload.targetType, "page"),
      targetId: cleanText(payload.targetId, "artist-page"),
      targetTitle: cleanText(payload.targetTitle),
      targetUrl: cleanText(payload.targetUrl),
      isrc: cleanText(payload.isrc),
      referrer: cleanText(payload.referrer),
      pagePath: cleanText(payload.pagePath),
      createdAt: now
    };
    const key = analyticsKey(record);
    const current = state.publicAnalytics.totals[key] || {
      artistSlug: record.artistSlug,
      artistName: record.artistName,
      action: record.action,
      targetType: record.targetType,
      targetId: record.targetId,
      targetTitle: record.targetTitle,
      targetUrl: record.targetUrl,
      isrc: record.isrc,
      count: 0,
      firstAt: now,
      lastAt: now
    };

    state.publicAnalytics.events.push(record);
    state.publicAnalytics.events = state.publicAnalytics.events.slice(-1000);
    state.publicAnalytics.totals[key] = {
      ...current,
      targetTitle: record.targetTitle || current.targetTitle,
      targetUrl: record.targetUrl || current.targetUrl,
      isrc: record.isrc || current.isrc,
      count: Number(current.count || 0) + 1,
      lastAt: now
    };
  }

  if (event.type === "subscriber.created") {
    state.subscriber = {
      artistName: cleanText(payload.artistName, "Untitled Artist"),
      email: cleanText(payload.email),
      username: cleanText(payload.username),
      genre: cleanText(payload.genre),
      goal: cleanText(payload.goal, "Track royalties"),
      plan: payload.plan === "protection" ? "protection" : "platform",
      trackingConsent: Boolean(payload.trackingConsent),
      ownershipAttestation: Boolean(payload.ownershipAttestation),
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    };
  }

  if (event.type === "content.submitted") {
    const proofFile = cleanText(payload.proofFile);
    const content = {
      id: randomUUID(),
      title: cleanText(payload.title, "Untitled Track"),
      isrc: cleanText(payload.isrc),
      upc: cleanText(payload.upc),
      contentKind: cleanText(payload.contentKind, "Recent artist page post"),
      accessSetting: cleanText(payload.accessSetting, "public"),
      linkRequest: cleanText(payload.linkRequest, "none"),
      linkFee: linkFee(payload.linkRequest),
      sampleUse: cleanText(payload.sampleUse, "No samples used"),
      sampleExplanation: cleanText(payload.sampleExplanation),
      proofReviewStatus: proofFile ? "JVM Review Ready" : "Proof Needed",
      audioFingerprintStatus: "Pending",
      visualWatermarkStatus: payload.visualFile ? "Pending" : "Not Required",
      sampleReviewStatus: sampleReviewStatus(payload.sampleUse),
      linkEligibility: linkEligibility({
        proofFile,
        linkRequest: payload.linkRequest,
        sampleUse: payload.sampleUse,
        sampleExplanation: payload.sampleExplanation
      }),
      releaseType: cleanText(payload.releaseType, "Single"),
      splitNote: cleanText(payload.splitNote),
      platformLinks: cleanText(payload.platformLinks),
      audioFile: cleanText(payload.audioFile),
      visualFile: cleanText(payload.visualFile),
      proofFile,
      documentFile: cleanText(payload.documentFile),
      jpegFile: cleanText(payload.jpegFile),
      videoFile: cleanText(payload.videoFile),
      status: proofFile ? "Ready" : "Proof Needed",
      cover: covers[state.contents.length % covers.length],
      ...contentLifecycle({ createdAt: now })
    };

    state.contents.push(content);

    if (state.subscriber.plan === "protection") {
      state.requests.push({
        id: randomUUID(),
        contentId: content.id,
        type: "Index search and fingerprint review",
        status: "Open",
        createdAt: now
      });
    }
  }

  if (event.type === "content.lifecycle.pinned") {
    const item = state.contents.find((content) => content.id === cleanText(payload.contentId));
    if (item) {
      const shouldPin = Boolean(payload.pinned);
      const pinnedCount = state.contents.filter((content) => content.pinned).length;
      if (shouldPin && !item.pinned && pinnedCount >= 3) {
        item.lifecycleNotice = "Pin limit reached. Unpin another post before storing this one for two years.";
      } else {
        item.pinned = shouldPin;
        item.expiresAt = addMonths(item.refreshedAt || item.createdAt, shouldPin ? 24 : 6);
        item.lifecycleNotice = shouldPin ? "Pinned for up to two years." : "Returned to six-month recent content cycle.";
      }
    }
  }

  if (event.type === "content.lifecycle.refreshed") {
    const item = state.contents.find((content) => content.id === cleanText(payload.contentId));
    if (item) {
      item.refreshedAt = now;
      item.expiresAt = addMonths(now, item.pinned ? 24 : 6);
      item.lifecycleNotice = item.pinned ? "Pinned content date refreshed for two-year retention." : "Content date refreshed for another six months.";
    }
  }

  if (event.type === "basic.permissions.updated") {
    state.basic = {
      ...state.basic,
      accountModel: cleanText(payload.accountModel, "Creator customer/partner"),
      artistSubscriptionPrice: cleanNumber(payload.artistSubscriptionPrice, 4.99),
      stationName: cleanText(payload.stationName, "Artist Radio"),
      audience: cleanText(payload.audience, "18+ only"),
      acceptPlatformSubscribers: Boolean(payload.acceptPlatformSubscribers),
      captchaEnabled: Boolean(payload.captchaEnabled),
      minorSafeTerms: Boolean(payload.minorSafeTerms),
      adultTerms: Boolean(payload.adultTerms),
      monetizationEnabled: true,
      sellMusicEnabled: true,
      liveVideoEnabled: true,
      liveAudioRadioEnabled: true,
      canUseIndexScanning: false
    };
  }

  if (event.type === "basic.subscription.exchange.requested") {
    state.basic.exchanges.push({
      id: randomUUID(),
      fromArtist: cleanText(payload.fromArtist),
      toArtist: cleanText(payload.toArtist),
      status: "Pending 7-Day Review",
      requestedAt: now,
      eligibleAfter: addDays(now, 7)
    });
  }

  if (event.type === "fan.profile.created") {
    state.fans.profiles.push({
      id: randomUUID(),
      displayName: cleanText(payload.displayName, "Fan"),
      email: cleanText(payload.email),
      username: cleanText(payload.username),
      profilePicture: cleanText(payload.profilePicture),
      experience: cleanText(payload.experience, "Listen to new music"),
      visibility: cleanText(payload.visibility, "Public basic profile"),
      genres: Array.isArray(payload.genres) ? payload.genres.map((genre) => cleanText(genre)).filter(Boolean) : [],
      expectationNote: cleanText(payload.expectationNote),
      searchConsent: Boolean(payload.searchConsent),
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    });
  }

  if (event.type === "fan.tip.recorded") {
    const tipValue = cleanNumber(payload.tipValue, 0);
    const artistValueBoost = cleanNumber(payload.coinValue || payload.artistValueBoost, tipValue);
    const supportPath = cleanText(payload.supportPath, "tip");
    const cashOutRate = cleanNumber(payload.cashOutRate, 15);
    const platformFeeValue = supportPath === "tip" ? tipValue * (cashOutRate / 100) : 0;
    const payoutValue = supportPath === "tip" ? Math.max(0, tipValue - platformFeeValue) : 0;
    state.fans.tips.push({
      id: randomUUID(),
      artistName: cleanText(payload.artistName, state.subscriber.artistName),
      tipValue,
      coinValue: 0,
      artistValueBoost,
      supportPath,
      cashOutRate,
      platformFeeValue,
      tradeRequired: false,
      payoutValue,
      netValue: payoutValue,
      status: supportPath === "tip" ? "Tip Cash-Out Available" : "Investment/Perks Pending",
      createdAt: now
    });
  }

  if (event.type === "fan.artist.access.trade.requested") {
    const platformBitcoinValue = cleanNumber(payload.platformBitcoinValue, 0);
    const artistBitcoinValue = cleanNumber(payload.artistBitcoinValue, platformBitcoinValue);
    state.fans.accessTrades.push({
      id: randomUUID(),
      fanUsername: cleanText(payload.fanUsername, "fan"),
      artistName: cleanText(payload.artistName, state.subscriber.artistName),
      platformBitcoinValue,
      artistBitcoinValue,
      accessTier: cleanText(payload.accessTier, "Artist subscriber access"),
      accessWindow: cleanText(payload.accessWindow, "30 days"),
      tradeConsent: Boolean(payload.tradeConsent),
      status: "Pending Platform Bitcoin Purchase and Artist Bitcoin Trade Review",
      publicAccess: "Public content remains viewable after fan signup",
      subscribedAccess: "Private artist access opens after approved artist Bitcoin trade",
      createdAt: now
    });
  }

  if (event.type === "cloud.space.purchased") {
    state.cloud.leases.push({
      id: randomUUID(),
      username: cleanText(payload.username),
      email: cleanText(payload.email),
      artistName: cleanText(payload.artistName, state.subscriber.artistName),
      spacePackage: cleanText(payload.spacePackage, "Starter live page cloud - 100GB"),
      termsAccepted: Boolean(payload.termsAccepted),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      status: "Cloud Lease Planning",
      createdAt: now
    });
  }

  if (event.type === "tracking.requested") {
    state.requests.push({
      id: randomUUID(),
      contentId: payload.contentId || state.contents[0]?.id || null,
      type: cleanText(payload.type, "Royalty tracking review"),
      status: "Open",
      createdAt: now
    });
  }

  if (event.type === "promotion.profile.created") {
    state.promotion.active = true;
    state.promotion.profiles.push({
      id: randomUUID(),
      role: cleanText(payload.role, "Artist"),
      name: cleanText(payload.name, "Untitled Profile"),
      email: cleanText(payload.email),
      username: cleanText(payload.username),
      city: cleanText(payload.city),
      radius: cleanNumber(payload.radius, 50),
      genre: cleanText(payload.genre),
      budget: cleanNumber(payload.budget, 0),
      fanCount: cleanNumber(payload.fanCount, 0),
      averageViews: cleanNumber(payload.averageViews, 0),
      stageDraw: cleanNumber(payload.stageDraw, 0),
      businessReadiness: cleanText(payload.businessReadiness, "Open to shows only"),
      gpsConsent: Boolean(payload.gpsConsent),
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    });
  }

  if (event.type === "promotion.gig.created") {
    state.promotion.gigs.push({
      id: randomUUID(),
      title: cleanText(payload.title, "Untitled Paid Opportunity"),
      location: cleanText(payload.location),
      genre: cleanText(payload.genre),
      pay: cleanNumber(payload.pay, 0),
      eventType: cleanText(payload.eventType, "Showcase"),
      expectedAudience: cleanNumber(payload.expectedAudience, 0),
      minFanCount: cleanNumber(payload.minFanCount, 0),
      minAverageViews: cleanNumber(payload.minAverageViews, 0),
      createdAt: now
    });
  }

  if (event.type === "promotion.match.run") {
    state.promotion.alerts = buildPromotionMatches(state).map((match) => ({
      id: randomUUID(),
      title: match.title,
      message: match.reason,
      createdAt: now
    }));
  }

  if (event.type === "distribution.release.submitted") {
    const proofFile = cleanText(payload.proofFile);
    state.distribution.active = true;
    state.distribution.billing = payload.billing === "monthly" ? "monthly" : "yearly";
    state.distribution.releases.push({
      id: randomUUID(),
      releaseTitle: cleanText(payload.releaseTitle, "Untitled Release"),
      artistName: cleanText(payload.artistName, state.subscriber.artistName),
      isrc: cleanText(payload.isrc),
      upc: cleanText(payload.upc),
      rightsBasis: cleanText(payload.rightsBasis, "Copyright ownership"),
      targetPlatforms: cleanText(payload.targetPlatforms),
      audioFile: cleanText(payload.audioFile),
      artworkFile: cleanText(payload.artworkFile),
      proofFile,
      splitFile: cleanText(payload.splitFile),
      videoFile: cleanText(payload.videoFile),
      distributionAuthority: Boolean(payload.distributionAuthority),
      scanConsent: Boolean(payload.scanConsent),
      status: proofFile ? "Review Ready" : "Proof Needed",
      scanStatus: proofFile ? "Ready for ISRC and fingerprint scan" : "Waiting for rights proof",
      licenseId: "",
      createdAt: now
    });
  }

  if (event.type === "distribution.review.run") {
    state.distribution.releases = state.distribution.releases.map((release) => {
      const proofReady = Boolean(release.proofFile);
      const consentReady = release.distributionAuthority && release.scanConsent;
      const isrcReady = Boolean(release.isrc);
      const canLicense = proofReady && consentReady && isrcReady;

      return {
        ...release,
        status: canLicense ? "License Generated" : "Needs Review",
        scanStatus: canLicense ? "ISRC scan and fingerprint review cleared for internal prototype" : "Missing proof, authority, scan consent, or ISRC",
        licenseId: canLicense ? release.licenseId || `IA-DIST-${release.isrc}-${Date.parse(now)}` : ""
      };
    });
  }

  if (event.type === "bitcoin.tree.created") {
    state.bitcoin.active = true;
    state.bitcoin.trees.push({
      id: randomUUID(),
      artistName: cleanText(payload.artistName, state.subscriber.artistName),
      walletLabel: cleanText(payload.walletLabel, "Artist treasury wallet"),
      walletAddress: cleanText(payload.walletAddress, "internal-wallet-record"),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      rootCoin: "AWOBE",
      rootCoinPurchaseValue: cleanNumber(payload.rootCoinPurchaseValue, 0),
      chainBlockSource: cleanText(payload.chainBlockSource, "AWOBE root block / source outlet"),
      branchCoinSymbol: cleanText(payload.branchCoinSymbol, "ARTIST-SUB"),
      branchCoinSupply: cleanNumber(payload.branchCoinSupply, 1),
      baseValueMultiplier: cleanNumber(payload.baseValueMultiplier, 1),
      branchBaseValue: cleanNumber(payload.rootCoinPurchaseValue, 0) * cleanNumber(payload.baseValueMultiplier, 1),
      settlementRule: "JVM_HALF_SUM_AFTER_PAYOUT",
      packageType: cleanText(payload.packageType, "Fan vesting tree"),
      supportGoal: cleanNumber(payload.supportGoal, 0),
      vestingMonths: cleanNumber(payload.vestingMonths, 12),
      fanRewardPercent: cleanNumber(payload.fanRewardPercent, 0),
      dropAsset: cleanText(payload.dropAsset),
      campaignDescription: cleanText(payload.campaignDescription),
      riskConsent: Boolean(payload.riskConsent),
      legalReview: Boolean(payload.legalReview),
      status: "Planning Only",
      projection: null,
      createdAt: now
    });
  }

  if (event.type === "bitcoin.projection.run") {
    state.bitcoin.trees = state.bitcoin.trees.map((tree) => {
      const goal = Number(tree.supportGoal || 0);
      const rewardPool = goal * (Number(tree.fanRewardPercent || 0) / 100);
      const monthlyUnlock = rewardPool / Math.max(1, Number(tree.vestingMonths || 1));
      const branchBaseValue = Number(tree.rootCoinPurchaseValue || 0) * Number(tree.baseValueMultiplier || 1);
      const impliedBranchMarketValue = branchBaseValue * Number(tree.branchCoinSupply || 0);
      const settlement = calculateJvmSettlement({
        artistRouteCoinValue: impliedBranchMarketValue,
        fanBaseCoinValue: impliedBranchMarketValue
      });

      return {
        ...tree,
        branchBaseValue,
        projection: {
          rewardPool,
          monthlyUnlock,
          supportersNeededAt25: Math.ceil(goal / 25),
          supportersNeededAt50: Math.ceil(goal / 50),
          branchBaseValue,
          impliedBranchMarketValue,
          settlement
        },
        status: tree.riskConsent && tree.legalReview ? "Internal Projection Ready" : "Compliance Review Needed"
      };
    });
  }

  if (event.type === "partner.created") {
    state.partner.active = true;
    state.partner.annualPrice = cleanNumber(payload.annualPackage, 4000);
    state.partner.seatLimit = Math.min(50, cleanNumber(payload.seatLimit, 50));
    state.partner.business = {
      businessName: cleanText(payload.businessName, "Untitled Business Partner"),
      email: cleanText(payload.email),
      username: cleanText(payload.username),
      businessType: cleanText(payload.businessType, "Management company"),
      lobbyName: cleanText(payload.lobbyName, "Partner Lobby"),
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    };
  }

  if (event.type === "partner.artist.registered") {
    if (state.partner.artists.length < state.partner.seatLimit) {
      const artist = {
        id: randomUUID(),
        artistName: cleanText(payload.artistName, "Untitled Artist"),
        artistEmail: cleanText(payload.artistEmail),
        username: cleanText(payload.username),
        contractType: cleanText(payload.contractType, "Management"),
        accessPackage: cleanText(payload.accessPackage, "Full platform except Bitcoin Tree"),
        termsAccepted: Boolean(payload.termsAccepted),
        passwordConfigured: Boolean(payload.passwordConfigured),
        walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
        status: "Registered",
        createdAt: now
      };
      state.partner.active = true;
      state.partner.artists.push(artist);
      state.partner.market.subCoins.push({
        id: randomUUID(),
        symbol: `${artist.artistName.replaceAll(" ", "").slice(0, 6).toUpperCase()}-SUB`,
        artistName: artist.artistName,
        source: "Awobe Inc. Coin Tree",
        status: "Internal only"
      });
    }
  }

  if (event.type === "partner.deal.created") {
    state.partner.deals.push({
      id: randomUUID(),
      title: cleanText(payload.title, "Untitled Deal Proposal"),
      artistName: cleanText(payload.artistName),
      dealValue: cleanNumber(payload.dealValue, 0),
      status: "Admin Review",
      createdAt: now
    });
  }

  if (event.type === "partner.market.snapshot") {
    const artistCount = state.partner.artists.length;
    const dealValue = state.partner.deals.reduce((total, deal) => total + Number(deal.dealValue || 0), 0);
    state.partner.market.lastSnapshot = {
      rootCoin: "AWOBE",
      subCoinCount: state.partner.market.subCoins.length,
      artistSeatUse: `${artistCount}/${state.partner.seatLimit}`,
      internalDealValue: dealValue,
      status: "Internal market simulation only",
      createdAt: now
    };
  }

  return state;
}

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": process.env.ARHC_PUBLIC_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, PayPal-Auth-Algo, PayPal-Cert-Url, PayPal-Transmission-Id, PayPal-Transmission-Sig, PayPal-Transmission-Time"
  });
  response.end(`${JSON.stringify(body, null, 2)}\n`);
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const filePath = path.normalize(path.join(ROOT, pathname));

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const extension = path.extname(filePath);
    const contentTypes = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".wav": "audio/wav",
      ".mp3": "audio/mpeg",
      ".m4a": "audio/mp4",
      ".aac": "audio/aac",
      ".flac": "audio/flac",
      ".ogg": "audio/ogg",
      ".mp4": "video/mp4",
      ".mov": "video/quicktime"
    };
    const stat = await fs.stat(filePath);
    const contentType = contentTypes[extension] || "application/octet-stream";
    const staticHeaders = {
      "Content-Type": contentType,
      "Access-Control-Allow-Origin": process.env.ARHC_PUBLIC_ORIGIN || "*",
      "Accept-Ranges": "bytes"
    };

    const range = request.headers.range;
    if (range) {
      const match = range.match(/^bytes=(\d*)-(\d*)$/);
      if (!match) {
        response.writeHead(416, {
          ...staticHeaders,
          "Content-Range": `bytes */${stat.size}`
        });
        response.end();
        return;
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Number(match[2]) : stat.size - 1;

      if (start >= stat.size || end >= stat.size || start > end) {
        response.writeHead(416, {
          ...staticHeaders,
          "Content-Range": `bytes */${stat.size}`
        });
        response.end();
        return;
      }

      response.writeHead(206, {
        ...staticHeaders,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": end - start + 1
      });
      createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    const body = await fs.readFile(filePath);
    response.writeHead(200, {
      ...staticHeaders,
      "Content-Length": stat.size
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

function createServer() {
  return http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);

    if (request.method === "OPTIONS") {
      response.writeHead(204, {
        "Access-Control-Allow-Origin": process.env.ARHC_PUBLIC_ORIGIN || "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, PayPal-Auth-Algo, PayPal-Cert-Url, PayPal-Transmission-Id, PayPal-Transmission-Sig, PayPal-Transmission-Time",
        "Access-Control-Max-Age": "86400"
      });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, {
        ok: true,
        runtime: "index-audio-node",
        eventRules: [
          "jvm.time.updated",
          "subscriber.created",
          "basic.permissions.updated",
          "basic.subscription.exchange.requested",
          "fan.profile.created",
          "fan.tip.recorded",
          "fan.artist.access.trade.requested",
          "cloud.space.purchased",
          "content.submitted",
          "content.lifecycle.pinned",
          "content.lifecycle.refreshed",
          "tracking.requested",
          "promotion.profile.created",
          "promotion.gig.created",
          "promotion.match.run",
          "distribution.release.submitted",
          "distribution.review.run",
          "bitcoin.tree.created",
          "bitcoin.projection.run",
          "partner.created",
          "partner.artist.registered",
          "partner.deal.created",
          "partner.market.snapshot",
          "payment.capture.requested",
          "payment.paypal.order.created",
          "payment.paypal.capture.verified",
          "payment.paypal.webhook.received",
          "wallet.verification.updated",
          "public.analytics.recorded",
          "runtime.reset"
        ]
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/state") {
      sendJson(response, 200, await readState());
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/featured-artists/robbie-rolla") {
      const state = await readState();
      sendJson(response, 200, {
        ...featuredArtistPage(),
        analytics: state.publicAnalytics
      });
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/public/analytics") {
      const state = await readState();
      sendJson(response, 200, state.publicAnalytics);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/public/analytics") {
      const body = await readJson(request);
      const currentState = await readState();
      const event = {
        id: randomUUID(),
        type: "public.analytics.recorded",
        payload: body,
        createdAt: platformNowIso(currentState)
      };
      const state = applyRuntimeEvent(currentState, event);
      await writeState(state);
      await appendEvent(event);
      sendJson(response, 200, { event, totals: state.publicAnalytics.totals });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/payments/paypal/create-order") {
      const currentState = await readState();
      const payment = billingPayload(await readJson(request));
      const paymentId = randomUUID();

      if (!payment.billingConsent) {
        sendJson(response, 400, { error: "Billing consent is required before creating a PayPal order." });
        return;
      }

      if (!paypalConfigured()) {
        const event = {
          id: randomUUID(),
          type: "payment.capture.requested",
          payload: {
            ...payment,
            paymentId,
            status: "PayPal Env Required - Capture Verification Required"
          },
          createdAt: platformNowIso(currentState)
        };
        const state = applyRuntimeEvent(currentState, event);
        await writeState(state);
        await appendEvent(event);
        sendJson(response, 200, {
          configured: false,
          requiredEnv: ["PAYPAL_CLIENT_ID", "PAYPAL_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID"],
          event,
          state
        });
        return;
      }

      const order = await paypalFetch("/v2/checkout/orders", {
        method: "POST",
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: paymentId,
              custom_id: paymentId,
              description: `ARHC ${payment.plan} ${payment.billingCycle}`,
              amount: {
                currency_code: payment.currency,
                value: payment.amount.toFixed(2)
              }
            }
          ],
          application_context: {
            brand_name: "The ARHC",
            landing_page: "BILLING",
            user_action: "PAY_NOW",
            return_url: PAYPAL_RETURN_URL,
            cancel_url: PAYPAL_CANCEL_URL
          }
        })
      });
      const event = {
        id: randomUUID(),
        type: "payment.paypal.order.created",
        payload: {
          ...payment,
          paymentId,
          paypalOrderId: order.id,
          approvalUrl: getApprovalUrl(order)
        },
        createdAt: platformNowIso(currentState)
      };
      const state = applyRuntimeEvent(currentState, event);
      await writeState(state);
      await appendEvent(event);
      sendJson(response, 200, { configured: true, order, approvalUrl: getApprovalUrl(order), event, state });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/payments/paypal/capture-order") {
      if (!paypalConfigured()) {
        sendJson(response, 400, { error: "PayPal env is required before capture verification can run." });
        return;
      }

      const body = await readJson(request);
      const paypalOrderId = cleanText(body.paypalOrderId);
      if (!paypalOrderId) {
        sendJson(response, 400, { error: "paypalOrderId is required." });
        return;
      }

      const currentState = await readState();
      const payment = currentState.billing.payments.find((record) => record.paypalOrderId === paypalOrderId);
      if (!payment) {
        sendJson(response, 404, { error: "PayPal order was not found in the ARHC payment ledger." });
        return;
      }

      const capture = await paypalFetch(`/v2/checkout/orders/${paypalOrderId}/capture`, { method: "POST" });
      const captureUnit = capture.purchase_units?.[0]?.payments?.captures?.[0] || {};
      const captureStatus = cleanText(captureUnit.status, capture.status);
      if (captureStatus !== "COMPLETED") {
        sendJson(response, 409, { error: `PayPal capture is not complete: ${captureStatus}`, capture });
        return;
      }

      const event = {
        id: randomUUID(),
        type: "payment.paypal.capture.verified",
        payload: {
          paymentId: payment.id,
          paypalOrderId,
          captureId: cleanText(captureUnit.id),
          captureStatus,
          payerUsername: payment.payerUsername,
          marketPurpose: payment.marketPurpose,
          amount: payment.amount,
          currency: payment.currency
        },
        createdAt: platformNowIso(currentState)
      };
      const state = applyRuntimeEvent(currentState, event);
      await writeState(state);
      await appendEvent(event);
      sendJson(response, 200, { verified: true, capture, event, state });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/webhooks/paypal") {
      const webhookEvent = await readJson(request);
      const currentState = await readState();
      let signatureVerified = false;
      let verificationStatus = PAYPAL_WEBHOOK_ID ? "Webhook Signature Verification Pending" : "Webhook Received - Verification Env Required";

      if (paypalConfigured() && PAYPAL_WEBHOOK_ID) {
        const verification = await paypalFetch("/v1/notifications/verify-webhook-signature", {
          method: "POST",
          body: JSON.stringify({
            auth_algo: request.headers["paypal-auth-algo"],
            cert_url: request.headers["paypal-cert-url"],
            transmission_id: request.headers["paypal-transmission-id"],
            transmission_sig: request.headers["paypal-transmission-sig"],
            transmission_time: request.headers["paypal-transmission-time"],
            webhook_id: PAYPAL_WEBHOOK_ID,
            webhook_event: webhookEvent
          })
        });
        signatureVerified = verification.verification_status === "SUCCESS";
        verificationStatus = signatureVerified ? "Webhook Signature Verified" : "Webhook Signature Rejected";
      }

      const event = {
        id: randomUUID(),
        type: "payment.paypal.webhook.received",
        payload: {
          eventType: cleanText(webhookEvent.event_type),
          paypalOrderId: cleanText(webhookEvent.resource?.supplementary_data?.related_ids?.order_id || webhookEvent.resource?.id),
          status: verificationStatus,
          captureVerified: signatureVerified
        },
        createdAt: platformNowIso(currentState)
      };
      let state = applyRuntimeEvent(currentState, event);
      await appendEvent(event);

      if (signatureVerified && webhookEvent.event_type === "PAYMENT.CAPTURE.COMPLETED") {
        const paypalOrderId = cleanText(webhookEvent.resource?.supplementary_data?.related_ids?.order_id);
        const payment = state.billing.payments.find((record) => record.paypalOrderId === paypalOrderId);
        if (payment) {
          const verifiedEvent = {
            id: randomUUID(),
            type: "payment.paypal.capture.verified",
            payload: {
              paymentId: payment.id,
              paypalOrderId,
              captureId: cleanText(webhookEvent.resource?.id),
              captureStatus: cleanText(webhookEvent.resource?.status, "COMPLETED"),
              payerUsername: payment.payerUsername,
              marketPurpose: payment.marketPurpose,
              amount: cleanNumber(webhookEvent.resource?.amount?.value, payment.amount),
              currency: cleanText(webhookEvent.resource?.amount?.currency_code, payment.currency)
            },
            createdAt: platformNowIso(state)
          };
          state = applyRuntimeEvent(state, verifiedEvent);
          await appendEvent(verifiedEvent);
        }
      }

      await writeState(state);
      sendJson(response, 200, { received: true, signatureVerified, state });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/events") {
      const body = await readJson(request);
      const currentState = await readState();
      const event = {
        id: randomUUID(),
        type: cleanText(body.type),
        payload: body.payload || {},
        createdAt: platformNowIso(currentState)
      };

      if (event.type === "runtime.reset") {
        const state = initialState();
        await writeState(state);
        await appendEvent(event);
        sendJson(response, 200, { event, state });
        return;
      }

      const allowed = new Set([
        "jvm.time.updated",
        "subscriber.created",
        "basic.permissions.updated",
        "basic.subscription.exchange.requested",
        "fan.profile.created",
        "fan.tip.recorded",
        "fan.artist.access.trade.requested",
        "cloud.space.purchased",
        "content.submitted",
        "content.lifecycle.pinned",
        "content.lifecycle.refreshed",
        "tracking.requested",
        "promotion.profile.created",
        "promotion.gig.created",
        "promotion.match.run",
        "distribution.release.submitted",
        "distribution.review.run",
        "bitcoin.tree.created",
        "bitcoin.projection.run",
        "partner.created",
        "partner.artist.registered",
        "partner.deal.created",
        "partner.market.snapshot",
        "payment.capture.requested",
        "payment.paypal.order.created",
        "payment.paypal.capture.verified",
        "payment.paypal.webhook.received",
        "wallet.verification.updated",
        "public.analytics.recorded"
      ]);

      if (!allowed.has(event.type)) {
        sendJson(response, 400, { error: `Unknown runtime event: ${event.type}` });
        return;
      }

      const state = applyRuntimeEvent(currentState, event);
      await writeState(state);
      await appendEvent(event);
      sendJson(response, 200, { event, state });
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
  });
}

function startServer() {
  const server = createServer();

  server.on("error", (error) => {
    console.error(`Unable to start Index Audio runtime: ${error.message}`);
    process.exitCode = 1;
  });

  server.listen(PORT, HOST, () => {
    console.log(`Index Audio runtime listening at http://${HOST}:${PORT}`);
  });
}

startServer();

export {
  applyRuntimeEvent,
  buildPromotionMatches,
  calculateJvmSettlement,
  createServer,
  initialState
};
