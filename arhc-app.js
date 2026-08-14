const STORAGE_KEY = "index-audio-entry-v2";
const RUNTIME_API = location.protocol.startsWith("http") ? "/api" : null;

const plans = {
  platform: {
    name: "Platform Access",
    price: 45,
    features: ["artist page", "music uploads", "streaming access", "launch dashboard", "support"]
  },
  protection: {
    name: "Index Protection",
    price: 90,
    features: ["index searches", "audio fingerprint enforcement", "off-platform tracking", "royalty request log", "support"]
  }
};

const distributionPlans = {
  yearly: {
    name: "Distribution Annual",
    price: 90,
    period: "year"
  },
  monthly: {
    name: "Distribution Monthly",
    price: 10,
    period: "month"
  }
};

const covers = [
  "linear-gradient(135deg, #17201b, #1d7d59 48%, #d89b27)",
  "radial-gradient(circle at 25% 25%, #f7f8f3, #285c8c 38%, #17201b 72%)",
  "linear-gradient(160deg, #be4f3d, #d89b27 46%, #1d7d59)",
  "conic-gradient(from 120deg, #285c8c, #1d7d59, #d89b27, #be4f3d, #285c8c)"
];

const initialState = {
  subscriber: {
    artistName: "Demo Artist",
    email: "artist@example.com",
    genre: "R&B",
    goal: "Track royalties",
    plan: "platform",
    trackingConsent: true,
    ownershipAttestation: true,
    createdAt: new Date().toISOString()
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
        id: crypto.randomUUID(),
        displayName: "Demo Listener",
        email: "fan@example.com",
        experience: "Listen to new music",
        visibility: "Public basic profile",
        genres: ["R&B", "Live studio sessions"],
        expectationNote: "Warm live sessions, early listens, and artists who talk through the music.",
        searchConsent: true,
        createdAt: new Date().toISOString()
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
        id: crypto.randomUUID(),
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
        createdAt: new Date().toISOString()
      }
    ],
    gigs: [
      {
        id: crypto.randomUUID(),
        title: "Friday Night R&B Showcase",
        location: "Atlanta, GA",
        genre: "R&B",
        pay: 350,
        eventType: "Showcase",
        expectedAudience: 150,
        minFanCount: 100,
        minAverageViews: 500,
        createdAt: new Date().toISOString()
      }
    ],
    alerts: []
  },
  distribution: {
    active: false,
    billing: "yearly",
    releases: [
      {
        id: crypto.randomUUID(),
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
        createdAt: new Date().toISOString()
      }
    ]
  },
  bitcoin: {
    active: false,
    trees: [
      {
        id: crypto.randomUUID(),
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
        createdAt: new Date().toISOString()
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
      createdAt: new Date().toISOString()
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
      id: crypto.randomUUID(),
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
      createdAt: new Date().toISOString()
    }
  ],
  jvmTime: {
    timeZone: "America/New_York",
    offsetMs: 0,
    source: "JVM internal clock",
    calendar: [],
    updatedAt: new Date().toISOString()
  },
  billing: {
    payments: [],
    walletVerifications: [],
    closedMarketCredits: []
  },
  requests: []
};

let state = loadState();
let runtimeOnline = false;
let captureStream = null;

const $ = (selector) => document.querySelector(selector);
const money = (value) => `$${Number(value || 0).toFixed(2)}`;

function platformNowIso() {
  const offsetMs = Number(state?.jvmTime?.offsetMs || 0);
  return new Date(Date.now() + offsetMs).toISOString();
}

function addDays(dateLike, days) {
  const date = new Date(dateLike);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function formatInJvmTime(dateLike, options = {}) {
  return new Intl.DateTimeFormat([], {
    timeZone: state.jvmTime?.timeZone || "America/New_York",
    ...options
  }).format(new Date(dateLike));
}

function timeZoneParts(dateLike, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date(dateLike));

  return Object.fromEntries(parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
}

function zonedDateTimeToIso(date, time, timeZone) {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const parts = timeZoneParts(utcGuess, timeZone);
  const zoneAsUtc = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute));
  const offsetMs = zoneAsUtc - utcGuess.getTime();
  return new Date(utcGuess.getTime() - offsetMs).toISOString();
}

function addMonths(dateLike, months) {
  const date = new Date(dateLike);
  date.setMonth(date.getMonth() + months);
  return date.toISOString();
}

function contentLifecycle({ createdAt = new Date().toISOString(), pinned = false } = {}) {
  return {
    createdAt,
    refreshedAt: createdAt,
    pinned,
    expiresAt: addMonths(createdAt, pinned ? 24 : 6)
  };
}

function activePinnedCount() {
  return state.contents.filter((item) => item.pinned).length;
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialState);

  try {
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(initialState),
      ...parsed,
      subscriber: { ...initialState.subscriber, ...(parsed.subscriber || {}) },
      basic: {
        ...initialState.basic,
        ...(parsed.basic || {}),
        exchanges: Array.isArray(parsed.basic?.exchanges) ? parsed.basic.exchanges : []
      },
      fans: {
        ...initialState.fans,
        ...(parsed.fans || {}),
        profiles: Array.isArray(parsed.fans?.profiles) ? parsed.fans.profiles : initialState.fans.profiles,
        tips: Array.isArray(parsed.fans?.tips) ? parsed.fans.tips : [],
        accessTrades: Array.isArray(parsed.fans?.accessTrades) ? parsed.fans.accessTrades : []
      },
      cloud: {
        ...initialState.cloud,
        ...(parsed.cloud || {}),
        leases: Array.isArray(parsed.cloud?.leases) ? parsed.cloud.leases : []
      },
      promotion: {
        ...initialState.promotion,
        ...(parsed.promotion || {}),
        profiles: Array.isArray(parsed.promotion?.profiles) ? parsed.promotion.profiles : initialState.promotion.profiles,
        gigs: Array.isArray(parsed.promotion?.gigs) ? parsed.promotion.gigs : initialState.promotion.gigs,
        alerts: Array.isArray(parsed.promotion?.alerts) ? parsed.promotion.alerts : []
      },
      distribution: {
        ...initialState.distribution,
        ...(parsed.distribution || {}),
        releases: Array.isArray(parsed.distribution?.releases) ? parsed.distribution.releases : initialState.distribution.releases
      },
      bitcoin: {
        ...initialState.bitcoin,
        ...(parsed.bitcoin || {}),
        trees: Array.isArray(parsed.bitcoin?.trees) ? parsed.bitcoin.trees : initialState.bitcoin.trees
      },
      partner: {
        ...initialState.partner,
        ...(parsed.partner || {}),
        business: { ...initialState.partner.business, ...(parsed.partner?.business || {}) },
        artists: Array.isArray(parsed.partner?.artists) ? parsed.partner.artists : [],
        deals: Array.isArray(parsed.partner?.deals) ? parsed.partner.deals : [],
        market: {
          ...initialState.partner.market,
          ...(parsed.partner?.market || {}),
          subCoins: Array.isArray(parsed.partner?.market?.subCoins) ? parsed.partner.market.subCoins : []
        }
      },
      jvmTime: {
        ...initialState.jvmTime,
        ...(parsed.jvmTime || {}),
        calendar: Array.isArray(parsed.jvmTime?.calendar) ? parsed.jvmTime.calendar : []
      },
      billing: {
        ...initialState.billing,
        ...(parsed.billing || {}),
        payments: Array.isArray(parsed.billing?.payments) ? parsed.billing.payments : [],
        walletVerifications: Array.isArray(parsed.billing?.walletVerifications) ? parsed.billing.walletVerifications : [],
        closedMarketCredits: Array.isArray(parsed.billing?.closedMarketCredits) ? parsed.billing.closedMarketCredits : []
      },
      contents: Array.isArray(parsed.contents) ? parsed.contents : initialState.contents,
      requests: Array.isArray(parsed.requests) ? parsed.requests : []
    };
  } catch {
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function syncFromRuntime() {
  if (!RUNTIME_API) return;

  try {
    const response = await fetch(`${RUNTIME_API}/state`, { cache: "no-store" });
    if (!response.ok) throw new Error("Runtime state unavailable");
    state = await response.json();
    runtimeOnline = true;
    render();
  } catch {
    runtimeOnline = false;
  }
}

async function emitRuntimeEvent(type, payload = {}) {
  if (!RUNTIME_API) return false;

  try {
    const response = await fetch(`${RUNTIME_API}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, payload })
    });

    if (!response.ok) throw new Error("Runtime event rejected");
    const result = await response.json();
    state = result.state;
    runtimeOnline = true;
    render();
    return true;
  } catch {
    runtimeOnline = false;
    return false;
  }
}

function applyLocalEvent(type, payload = {}) {
  const now = platformNowIso();

  if (type === "jvm.time.updated") {
    const requestedAt = payload.currentAt || now;
    state.jvmTime = {
      ...state.jvmTime,
      timeZone: payload.timeZone || state.jvmTime.timeZone || "America/New_York",
      offsetMs: Date.parse(requestedAt) - Date.now(),
      source: "JVM internal clock",
      updatedAt: requestedAt,
      calendar: [
        ...(state.jvmTime.calendar || []),
        {
          id: crypto.randomUUID(),
          label: payload.calendarLabel || "JVM time updated",
          timeZone: payload.timeZone || state.jvmTime.timeZone || "America/New_York",
          scheduledAt: requestedAt,
          createdAt: now
        }
      ].slice(-20)
    };
  }

  if (type === "payment.capture.requested") {
    state.billing.payments.push({
      id: crypto.randomUUID(),
      payerType: payload.payerType || "artist",
      payerUsername: payload.payerUsername || "",
      contactEmail: payload.contactEmail || "",
      plan: payload.plan || "artist-platform",
      billingCycle: payload.billingCycle || "yearly",
      amount: Number(payload.amount || 0),
      currency: payload.currency || "USD",
      marketPurpose: payload.marketPurpose || "platform-access",
      walletStatus: payload.walletStatus || "Wallet review required",
      processor: "PayPal",
      status: payload.status || "Runtime Required",
      paypalOrderId: payload.paypalOrderId || "",
      approvalUrl: payload.approvalUrl || "",
      createdAt: now
    });
  }

  if (type === "payment.paypal.order.created") {
    state.billing.payments.push({
      id: payload.paymentId || crypto.randomUUID(),
      payerType: payload.payerType || "artist",
      payerUsername: payload.payerUsername || "",
      contactEmail: payload.contactEmail || "",
      plan: payload.plan || "artist-platform",
      billingCycle: payload.billingCycle || "yearly",
      amount: Number(payload.amount || 0),
      currency: payload.currency || "USD",
      marketPurpose: payload.marketPurpose || "platform-access",
      walletStatus: payload.walletStatus || "Wallet review required",
      processor: "PayPal",
      status: payload.status || "PayPal Order Created",
      paypalOrderId: payload.paypalOrderId || "",
      approvalUrl: payload.approvalUrl || "",
      createdAt: now
    });
  }

  if (type === "payment.paypal.capture.verified") {
    const payment = state.billing.payments.find((record) => record.paypalOrderId === payload.paypalOrderId || record.id === payload.paymentId);
    if (payment) {
      payment.status = "Order Processing Approved";
      payment.captureId = payload.captureId || payment.captureId || "";
      payment.captureStatus = payload.captureStatus || "COMPLETED";
      payment.captureVerified = true;
      payment.orderProcessApproved = true;
      payment.verifiedAt = now;
    }

    if ((payload.marketPurpose === "platform-bitcoin-credit" || payload.marketPurpose === "artist-bitcoin-access") && payment?.captureVerified) {
      state.billing.closedMarketCredits.push({
        id: crypto.randomUUID(),
        paymentId: payload.paymentId || payment?.id || "",
        paypalOrderId: payload.paypalOrderId || payment?.paypalOrderId || "",
        payerUsername: payload.payerUsername || payment?.payerUsername || "",
        marketPurpose: payload.marketPurpose,
        amount: Number(payload.amount || payment?.amount || 0),
        currency: payload.currency || payment?.currency || "USD",
        status: "Wallet Verification Required Before Coin Credit",
        createdAt: now
      });
    }
  }

  if (type === "wallet.verification.updated") {
    state.billing.walletVerifications.push({
      id: crypto.randomUUID(),
      payerUsername: payload.payerUsername || "",
      payerType: payload.payerType || "fan",
      walletStatus: payload.walletStatus || "Wallet review required",
      verificationSource: payload.verificationSource || "payment capture",
      status: payload.status || "Pending Review",
      createdAt: now
    });
  }

  if (type === "subscriber.created") {
    state.subscriber = {
      artistName: payload.artistName,
      email: payload.email,
      username: payload.username,
      genre: payload.genre,
      goal: payload.goal,
      plan: payload.plan,
      trackingConsent: Boolean(payload.trackingConsent),
      ownershipAttestation: Boolean(payload.ownershipAttestation),
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    };
  }

  if (type === "content.submitted") {
    const proofFile = payload.proofFile || "";
    const createdAt = now;
    const content = {
      id: crypto.randomUUID(),
      title: payload.title,
      isrc: payload.isrc,
      upc: payload.upc,
      contentKind: payload.contentKind || "Recent artist page post",
      accessSetting: payload.accessSetting || "public",
      linkRequest: payload.linkRequest || "none",
      linkFee: linkFee(payload.linkRequest),
      sampleUse: payload.sampleUse || "No samples used",
      sampleExplanation: payload.sampleExplanation || "",
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
      releaseType: payload.releaseType,
      splitNote: payload.splitNote,
      platformLinks: payload.platformLinks,
      audioFile: payload.audioFile,
      visualFile: payload.visualFile,
      proofFile,
      documentFile: payload.documentFile,
      jpegFile: payload.jpegFile,
      videoFile: payload.videoFile,
      status: proofFile ? "Ready" : "Proof Needed",
      cover: covers[state.contents.length % covers.length],
      ...contentLifecycle({ createdAt })
    };
    state.contents.push(content);

    if (state.subscriber.plan === "protection") {
      applyLocalEvent("tracking.requested", {
        contentId: content.id,
        type: "Index search and fingerprint review"
      });
    }
  }

  if (type === "content.lifecycle.pinned") {
    const item = state.contents.find((content) => content.id === payload.contentId);
    if (item) {
      const shouldPin = Boolean(payload.pinned);
      if (shouldPin && !item.pinned && activePinnedCount() >= 3) {
        item.lifecycleNotice = "Pin limit reached. Unpin another post before storing this one for two years.";
      } else {
        item.pinned = shouldPin;
        item.expiresAt = addMonths(item.refreshedAt || item.createdAt, shouldPin ? 24 : 6);
        item.lifecycleNotice = shouldPin ? "Pinned for up to two years." : "Returned to six-month recent content cycle.";
      }
    }
  }

  if (type === "content.lifecycle.refreshed") {
    const item = state.contents.find((content) => content.id === payload.contentId);
    if (item) {
      item.refreshedAt = now;
      item.expiresAt = addMonths(item.refreshedAt, item.pinned ? 24 : 6);
      item.lifecycleNotice = item.pinned ? "Pinned content date refreshed for two-year retention." : "Content date refreshed for another six months.";
    }
  }

  if (type === "basic.permissions.updated") {
    state.basic = {
      ...state.basic,
      accountModel: payload.accountModel,
      artistSubscriptionPrice: Number(payload.artistSubscriptionPrice),
      stationName: payload.stationName,
      audience: payload.audience,
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

  if (type === "basic.subscription.exchange.requested") {
    state.basic.exchanges.push({
      id: crypto.randomUUID(),
      fromArtist: payload.fromArtist,
      toArtist: payload.toArtist,
      status: "Pending 7-Day Review",
      requestedAt: now,
      eligibleAfter: addDays(now, 7)
    });
  }

  if (type === "fan.profile.created") {
    state.fans.profiles.push({
      id: crypto.randomUUID(),
      displayName: payload.displayName,
      email: payload.email,
      username: payload.username,
      profilePicture: payload.profilePicture,
      experience: payload.experience,
      visibility: payload.visibility,
      genres: Array.isArray(payload.genres) ? payload.genres : [],
      expectationNote: payload.expectationNote,
      searchConsent: Boolean(payload.searchConsent),
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    });
  }

  if (type === "fan.tip.recorded") {
    const tipValue = Number(payload.tipValue || 0);
    const artistValueBoost = Number(payload.coinValue || payload.artistValueBoost || tipValue);
    const supportPath = payload.supportPath || "tip";
    const cashOutRate = Number(payload.cashOutRate ?? 15);
    const platformFeeValue = supportPath === "tip" ? tipValue * (cashOutRate / 100) : 0;
    const payoutValue = supportPath === "tip" ? Math.max(0, tipValue - platformFeeValue) : 0;
    state.fans.tips.push({
      id: crypto.randomUUID(),
      artistName: payload.artistName,
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

  if (type === "fan.artist.access.trade.requested") {
    const platformBitcoinValue = Number(payload.platformBitcoinValue || 0);
    const artistBitcoinValue = Number(payload.artistBitcoinValue || platformBitcoinValue);
    state.fans.accessTrades.push({
      id: crypto.randomUUID(),
      fanUsername: payload.fanUsername || "fan",
      artistName: payload.artistName || state.subscriber.artistName,
      platformBitcoinValue,
      artistBitcoinValue,
      accessTier: payload.accessTier || "Artist subscriber access",
      accessWindow: payload.accessWindow || "30 days",
      tradeConsent: Boolean(payload.tradeConsent),
      status: "Pending Platform Bitcoin Purchase and Artist Bitcoin Trade Review",
      publicAccess: "Public content remains viewable after fan signup",
      subscribedAccess: "Private artist access opens after approved artist Bitcoin trade",
      createdAt: now
    });
  }

  if (type === "cloud.space.purchased") {
    state.cloud.leases.push({
      id: crypto.randomUUID(),
      username: payload.username,
      email: payload.email,
      artistName: payload.artistName,
      spacePackage: payload.spacePackage,
      termsAccepted: Boolean(payload.termsAccepted),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      status: "Cloud Lease Planning",
      createdAt: now
    });
  }

  if (type === "tracking.requested") {
    const firstContent = state.contents[0];
    state.requests.push({
      id: crypto.randomUUID(),
      contentId: payload.contentId || firstContent?.id || null,
      type: payload.type,
      status: "Open",
      createdAt: now
    });
  }

  if (type === "promotion.profile.created") {
    state.promotion.active = true;
    state.promotion.profiles.push({
      id: crypto.randomUUID(),
      role: payload.role,
      name: payload.name,
      email: payload.email,
      username: payload.username,
      city: payload.city,
      radius: Number(payload.radius),
      genre: payload.genre,
      budget: Number(payload.budget),
      fanCount: Number(payload.fanCount || 0),
      averageViews: Number(payload.averageViews || 0),
      stageDraw: Number(payload.stageDraw || 0),
      businessReadiness: payload.businessReadiness || "Open to shows only",
      gpsConsent: Boolean(payload.gpsConsent),
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    });
  }

  if (type === "promotion.gig.created") {
    state.promotion.gigs.push({
      id: crypto.randomUUID(),
      title: payload.title,
      location: payload.location,
      genre: payload.genre,
      pay: Number(payload.pay),
      eventType: payload.eventType || "Showcase",
      expectedAudience: Number(payload.expectedAudience || 150),
      minFanCount: Number(payload.minFanCount || 0),
      minAverageViews: Number(payload.minAverageViews || 0),
      createdAt: now
    });
  }

  if (type === "promotion.match.run") {
    const matches = buildPromotionMatches();
    state.promotion.alerts = matches.map((match) => ({
      id: crypto.randomUUID(),
      title: match.title,
      message: match.reason,
      createdAt: now
    }));
  }

  if (type === "distribution.release.submitted") {
    const proofFile = payload.proofFile || "";
    const release = {
      id: crypto.randomUUID(),
      releaseTitle: payload.releaseTitle,
      artistName: payload.artistName,
      isrc: payload.isrc,
      upc: payload.upc,
      rightsBasis: payload.rightsBasis,
      targetPlatforms: payload.targetPlatforms,
      audioFile: payload.audioFile,
      artworkFile: payload.artworkFile,
      proofFile,
      splitFile: payload.splitFile,
      videoFile: payload.videoFile,
      distributionAuthority: Boolean(payload.distributionAuthority),
      scanConsent: Boolean(payload.scanConsent),
      status: proofFile ? "Review Ready" : "Proof Needed",
      scanStatus: proofFile ? "Ready for ISRC and fingerprint scan" : "Waiting for rights proof",
      licenseId: "",
      createdAt: now
    };
    state.distribution.active = true;
    state.distribution.billing = payload.billing === "monthly" ? "monthly" : "yearly";
    state.distribution.releases.push(release);
  }

  if (type === "distribution.review.run") {
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

  if (type === "bitcoin.tree.created") {
    state.bitcoin.active = true;
    state.bitcoin.trees.push({
      id: crypto.randomUUID(),
      artistName: payload.artistName,
      walletLabel: payload.walletLabel,
      walletAddress: payload.walletAddress || "internal-wallet-record",
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      rootCoin: "AWOBE",
      rootCoinPurchaseValue: Number(payload.rootCoinPurchaseValue || 0),
      chainBlockSource: payload.chainBlockSource,
      branchCoinSymbol: payload.branchCoinSymbol,
      branchCoinSupply: Number(payload.branchCoinSupply || 1),
      baseValueMultiplier: Number(payload.baseValueMultiplier || 1),
      branchBaseValue: Number(payload.rootCoinPurchaseValue || 0) * Number(payload.baseValueMultiplier || 1),
      settlementRule: "JVM_HALF_SUM_AFTER_PAYOUT",
      packageType: payload.packageType,
      supportGoal: Number(payload.supportGoal),
      vestingMonths: Number(payload.vestingMonths),
      fanRewardPercent: Number(payload.fanRewardPercent),
      dropAsset: payload.dropAsset,
      campaignDescription: payload.campaignDescription,
      riskConsent: Boolean(payload.riskConsent),
      legalReview: Boolean(payload.legalReview),
      status: "Planning Only",
      projection: null,
      createdAt: now
    });
  }

  if (type === "bitcoin.projection.run") {
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

  if (type === "partner.created") {
    state.partner.active = true;
    state.partner.annualPrice = Number(payload.annualPackage || 4000);
    state.partner.seatLimit = Math.min(50, Number(payload.seatLimit || 50));
    state.partner.business = {
      businessName: payload.businessName,
      email: payload.email,
      username: payload.username,
      businessType: payload.businessType,
      lobbyName: payload.lobbyName,
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      createdAt: now
    };
  }

  if (type === "partner.artist.registered") {
    if (state.partner.artists.length >= state.partner.seatLimit) return;
    const artist = {
      id: crypto.randomUUID(),
      artistName: payload.artistName,
      artistEmail: payload.artistEmail,
      username: payload.username,
      contractType: payload.contractType,
      accessPackage: payload.accessPackage,
      termsAccepted: Boolean(payload.termsAccepted),
      passwordConfigured: Boolean(payload.passwordConfigured),
      walletPasswordConfigured: Boolean(payload.walletPasswordConfigured),
      status: "Registered",
      createdAt: now
    };
    state.partner.active = true;
    state.partner.artists.push(artist);
    state.partner.market.subCoins.push({
      id: crypto.randomUUID(),
      symbol: `${artist.artistName.replaceAll(" ", "").slice(0, 6).toUpperCase()}-SUB`,
      artistName: artist.artistName,
      source: "Awobe Inc. Coin Tree",
      status: "Internal only"
    });
  }

  if (type === "partner.deal.created") {
    state.partner.deals.push({
      id: crypto.randomUUID(),
      title: payload.title,
      artistName: payload.artistName,
      dealValue: Number(payload.dealValue),
      status: "Admin Review",
      createdAt: now
    });
  }

  if (type === "partner.market.snapshot") {
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

  if (type === "runtime.reset") {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(initialState);
  }
}

async function runEvent(type, payload = {}) {
  const handledByRuntime = await emitRuntimeEvent(type, payload);
  if (!handledByRuntime) {
    applyLocalEvent(type, payload);
    render();
  }
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

function render() {
  renderPlan();
  renderJvmTime();
  renderBilling();
  renderBasic();
  renderFans();
  renderCloud();
  renderResolver();
  renderIndex();
  renderRequests();
  renderLaunch();
  renderDistribution();
  renderPromotion();
  renderBitcoin();
  renderPartner();
  renderSubscriberSummary();
  saveState();
}

function renderJvmTime() {
  const currentAt = platformNowIso();
  const timeZone = state.jvmTime?.timeZone || "America/New_York";
  const offsetMinutes = Math.round(Number(state.jvmTime?.offsetMs || 0) / 60000);
  const calendar = state.jvmTime?.calendar || [];

  $("#jvm-timezone-label").textContent = timeZone;
  $("#jvm-clock-label").textContent = formatInJvmTime(currentAt, {
    hour: "numeric",
    minute: "2-digit"
  });
  $("#jvm-date-label").textContent = formatInJvmTime(currentAt, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
  $("#jvm-source").textContent = runtimeOnline ? "Server Time" : "Local JVM";

  $("#jvm-time-summary").innerHTML = `
    <div><span>Internal timestamp</span><strong>${escapeHtml(currentAt)}</strong></div>
    <div><span>Time zone</span><strong>${escapeHtml(timeZone)}</strong></div>
    <div><span>Device offset</span><strong>${offsetMinutes} min</strong></div>
    <div><span>Calendar entries</span><strong>${calendar.length}</strong></div>
  `;

  $("#jvm-calendar-list").innerHTML = calendar.slice().reverse().map((entry) => `
    <article class="match-card" data-ai-record="jvm-calendar-entry">
      <div>
        <strong>${escapeHtml(entry.label)}</strong>
        <span>${escapeHtml(entry.timeZone)} - ${formatInJvmTime(entry.scheduledAt, { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}</span>
      </div>
      <small>JVM timestamp: ${escapeHtml(entry.scheduledAt)}</small>
    </article>
  `).join("") || `<p class="empty-state">No JVM calendar entries yet.</p>`;

  const form = $("#jvm-time-form");
  if (form && document.activeElement?.form !== form) {
    const current = new Date(currentAt);
    form.elements.timeZone.value = timeZone;
    const parts = timeZoneParts(current, timeZone);
    form.elements.calendarDate.value = `${parts.year}-${parts.month}-${parts.day}`;
    form.elements.clockTime.value = `${parts.hour}:${parts.minute}`;
  }
}

function renderBilling() {
  const payments = state.billing?.payments || [];
  const verifications = state.billing?.walletVerifications || [];
  const credits = state.billing?.closedMarketCredits || [];
  const rows = [
    ...payments.slice().reverse().map((payment) => `
      <article class="match-card" data-ai-record="paypal-payment">
        <div>
          <strong>${escapeHtml(payment.payerUsername || "Unnamed payer")} - ${escapeHtml(payment.plan)}</strong>
          <span>${money(payment.amount)} ${escapeHtml(payment.currency || "USD")} - ${escapeHtml(payment.billingCycle)} - ${escapeHtml(payment.processor || "PayPal")}</span>
        </div>
        <small>${escapeHtml(payment.status)}. Payment capture verified: ${payment.captureVerified ? "yes" : "no"}. Order processing approved: ${payment.orderProcessApproved ? "yes" : "no"}.</small>
        <small>Market purpose: ${escapeHtml(payment.marketPurpose)}. Wallet: ${escapeHtml(payment.walletStatus)}.${payment.paypalOrderId ? ` PayPal order: ${escapeHtml(payment.paypalOrderId)}.` : ""}</small>
        ${payment.approvalUrl ? `<a class="inline-link" href="${escapeHtml(payment.approvalUrl)}" target="_blank" rel="noreferrer">Open PayPal approval</a>` : ""}
        ${payment.paypalOrderId && !payment.captureVerified ? `<button class="secondary-button" type="button" data-billing-action="verify-capture" data-paypal-order-id="${escapeHtml(payment.paypalOrderId)}">Verify Capture</button>` : ""}
      </article>
    `),
    ...credits.slice().reverse().map((credit) => `
      <article class="match-card" data-ai-record="closed-market-credit">
        <div>
          <strong>${escapeHtml(credit.payerUsername || "Wallet user")} - ${escapeHtml(credit.marketPurpose)}</strong>
          <span>${money(credit.amount)} ${escapeHtml(credit.currency || "USD")} captured</span>
        </div>
        <small>${escapeHtml(credit.status)}. Closed ARHC market credit must wait for wallet verification and outsourced blockchain provider confirmation.</small>
      </article>
    `),
    ...verifications.slice().reverse().map((wallet) => `
      <article class="match-card" data-ai-record="wallet-verification">
        <div>
          <strong>${escapeHtml(wallet.payerUsername || "Wallet user")} - ${escapeHtml(wallet.walletStatus)}</strong>
          <span>${escapeHtml(wallet.payerType)} wallet verification</span>
        </div>
        <small>${escapeHtml(wallet.status)} from ${escapeHtml(wallet.verificationSource)}.</small>
      </article>
    `)
  ];

  $("#billing-count").textContent = `${payments.length} payment${payments.length === 1 ? "" : "s"}`;
  $("#billing-ledger").innerHTML = rows.join("") || `<p class="empty-state">No PayPal orders, verified captures, or wallet checks yet.</p>`;
}

function renderPlan() {
  const plan = plans[state.subscriber.plan] || plans.platform;
  $("#selected-plan-name").textContent = plan.name;
  $("#selected-plan-price").textContent = money(plan.price).replace(".00", "");

  document.querySelectorAll('[name="plan"]').forEach((input) => {
    input.checked = input.value === state.subscriber.plan;
  });
}

function renderResolver() {
  const gaps = getSetupGaps();
  const plan = plans[state.subscriber.plan] || plans.platform;

  $("#resolver-card").innerHTML = `
    <div class="metric-list">
      <div><span>Plan</span><strong>${escapeHtml(plan.name)}</strong></div>
      <div><span>Annual access</span><strong>${money(plan.price)}</strong></div>
      <div><span>Content submitted</span><strong>${state.contents.length}</strong></div>
      <div><span>Open setup items</span><strong>${gaps.length}</strong></div>
      <div><span>Runtime</span><strong>${runtimeOnline ? "Server" : "Local"}</strong></div>
    </div>
    <p class="helper-copy">${gaps[0] || "Your account is ready for launch support, campaign planning, and fan subscription setup."}</p>
  `;
}

function renderIndex() {
  const query = $("#search").value.trim().toLowerCase();
  const contents = state.contents.filter((item) => {
    const haystack = `${item.title} ${item.isrc} ${item.upc} ${item.releaseType} ${item.status} ${item.contentKind} ${item.accessSetting}`.toLowerCase();
    return haystack.includes(query);
  });

  $("#track-count").textContent = `${contents.length} item${contents.length === 1 ? "" : "s"}`;
  $("#track-list").innerHTML = contents.map((item) => `
    <article class="track-row" data-ai-record="content" data-content-id="${item.id}">
      <div class="cover" style="--cover: ${item.cover}"></div>
      <div class="track-meta">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.contentKind || "Recent artist page post")} - ${escapeHtml(item.accessSetting === "private" ? "Private / artist subscriber" : "Public")} - ISRC: ${escapeHtml(item.isrc || "Existing not provided")} - UPC: ${escapeHtml(item.upc || "Optional")}</span>
        <small>${escapeHtml(item.pinned ? "Pinned: stored up to 2 years" : "Recent: deletes after 6 months")} - Expires ${new Date(item.expiresAt || addMonths(item.createdAt, 6)).toLocaleDateString()} - ${escapeHtml(item.lifecycleNotice || "Refresh date before deletion to keep it active.")}</small>
        <small>${escapeHtml(item.linkEligibility || "Proof Needed")} - ${escapeHtml(item.audioFingerprintStatus || "Pending")} audio - ${escapeHtml(item.visualWatermarkStatus || "Pending")} visual - ${escapeHtml(item.sampleReviewStatus || "Not Required")}</small>
      </div>
      <div class="track-actions">
        <span class="status ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
        <button class="secondary-button" type="button" data-content-action="pin" data-content-id="${item.id}">${item.pinned ? "Unpin" : "Pin"}</button>
        <button class="ghost-button" type="button" data-content-action="refresh" data-content-id="${item.id}">Refresh Date</button>
      </div>
    </article>
  `).join("") || `<p class="empty-state">No matching content yet.</p>`;
}

function renderRequests() {
  const rows = state.requests.slice().reverse().map((request) => {
    const item = state.contents.find((content) => content.id === request.contentId);
    return `
      <tr>
        <td>${new Date(request.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</td>
        <td>${escapeHtml(item?.title || "General account")}</td>
        <td>${escapeHtml(request.type)}</td>
        <td><span class="status pending">${escapeHtml(request.status)}</span></td>
        <td>${escapeHtml(item?.proofFile || "Proof requested")}</td>
      </tr>
    `;
  });

  $("#ledger-body").innerHTML = rows.join("") || `
    <tr>
      <td colspan="5">No tracking requests yet. Add content, then log an index search or enforcement request.</td>
    </tr>
  `;
}

function renderLaunch() {
  const gaps = getSetupGaps();
  const totalChecks = 6;
  const score = Math.max(0, Math.round(((totalChecks - gaps.length) / totalChecks) * 100));
  $("#launch-score").textContent = `${score}%`;
  $("#launch-gaps").innerHTML = gaps.map((gap) => `<div>${escapeHtml(gap)}</div>`).join("") || "<div>Ready for campaign planning and fan subscription setup.</div>";
}

function renderSubscriberSummary() {
  const subscriber = state.subscriber;
  const plan = plans[subscriber.plan] || plans.platform;

  $("#subscriber-summary").innerHTML = `
    <div><span>Artist</span><strong>${escapeHtml(subscriber.artistName)}</strong></div>
    <div><span>Email</span><strong>${escapeHtml(subscriber.email)}</strong></div>
    <div><span>Plan</span><strong>${escapeHtml(plan.name)}</strong></div>
    <div><span>Goal</span><strong>${escapeHtml(subscriber.goal)}</strong></div>
  `;
}

function getSetupGaps() {
  const gaps = [];
  const subscriber = state.subscriber;
  const hasContent = state.contents.length > 0;
  const hasProof = state.contents.some((item) => item.proofFile);
  const hasIsrc = state.contents.some((item) => item.isrc);
  const hasLinks = state.contents.some((item) => item.platformLinks);

  if (!subscriber.artistName || subscriber.artistName === "Demo Artist") gaps.push("Create a real subscriber profile.");
  if (!subscriber.trackingConsent) gaps.push("Approve off-platform royalty and license tracking requests.");
  if (!subscriber.ownershipAttestation) gaps.push("Confirm ownership, license, or lease rights.");
  if (!hasContent) gaps.push("Upload at least one song or release.");
  if (!hasIsrc) gaps.push("Add an existing ISRC or request platform ISRC linking for $1.50.");
  if (!hasProof) gaps.push("Upload copyright, license, lease, or ownership proof.");
  if (!hasLinks) gaps.push("Add external platform links for royalty tracking.");
  if (subscriber.plan !== "protection") gaps.push("Upgrade to Index Protection for fingerprint enforcement and index searches.");
  if (!state.promotion.active) gaps.push("Activate Promotion Network for paid local performance matching.");
  if (!state.distribution.active) gaps.push("Activate Distribution Desk before transferring music to external streaming platforms.");
  if (!state.bitcoin.active) gaps.push("Create a Bitcoin Tree package before planning NFT or coin-based fan support.");
  if (!state.partner.active) gaps.push("Create a Business Partner platform for managed artist rosters and deal lobbies.");

  return gaps.slice(0, 6);
}

function addRequest(type) {
  return runEvent("tracking.requested", {
    contentId: state.contents[0]?.id || null,
    type
  });
}

function supportAnswer(issue) {
  const lower = issue.toLowerCase();

  if (lower.includes("upc")) {
    return "You can start with an ISRC. UPC is useful for release-level products, but it should stay optional at signup. Add UPC later when the release or distributor provides it.";
  }

  if (lower.includes("isrc")) {
    return "Existing ISRCs can be entered freely. Platform ISRC linking costs $1.50 and must wait for proof verification, audio fingerprint scan, visual watermark scan when needed, and sample review if the scan detects or the artist reports samples.";
  }

  if (lower.includes("proof") || lower.includes("copyright") || lower.includes("lease") || lower.includes("license")) {
    return "Before ISRC/UPC platform linking, request proof of ownership, copyright, license, lease, or split documentation. JVM can verify basic proof; unclear cases escalate to admin.";
  }

  if (lower.includes("sample") || lower.includes("public use")) {
    return "Samples do not automatically disqualify ISRC linking. If a sample is detected, apply public use/public domain/license review. Distribution licensing needs a more detailed explanation and targeted approval search.";
  }

  if (lower.includes("marketing") || lower.includes("campaign")) {
    return "Start with the artist goal, one target audience, one content theme, and a 14-day calendar. The launch dashboard can turn that into posts, artwork direction, and fan subscription offers.";
  }

  if (lower.includes("distribution") || lower.includes("distribute")) {
    return "Distribution is separate from the site subscription. Require an ISRC, proof of copyright/license/lease, distribution authority, and scan consent before generating a distribution license or preparing transfer to streaming platforms.";
  }

  if (lower.includes("fingerprint") || lower.includes("infringement") || lower.includes("soundscan") || lower.includes("mdx")) {
    return "For now this prototype marks scan readiness internally. Later, the scan layer can connect to services like SoundScan-style reporting, MDX-style matching, or an in-house fingerprint/copyright search engine.";
  }

  if (lower.includes("bitcoin") || lower.includes("nft") || lower.includes("vesting") || lower.includes("coin")) {
    return "The Bitcoin Tree should stay in planning mode until reviewed. Artists can record a wallet, NFT/drop plan, fan support tree, and vesting projection, but real income promises, tokens, or rewards need legal, tax, and compliance review first.";
  }

  if (lower.includes("fan") || lower.includes("spectator") || lower.includes("tip") || lower.includes("comment") || lower.includes("message")) {
    return "Fan/spectator profiles include access to content marked public. Artist subscription access is separate: the fan buys platform Bitcoin, requests a trade into the artist Bitcoin access record, and waits for wallet, fraud, and compliance review before private artist content opens.";
  }

  if (lower.includes("business") || lower.includes("partner") || lower.includes("merchant") || lower.includes("lobby")) {
    return "Use the Business Partner model before individual merchant accounts. A verified business can pay $4,000/year, manage up to 50 contracted artists, open a lobby, create deal proposals, and request admin review before contracts or internal coin activity move forward.";
  }

  if (lower.includes("basic") || lower.includes("subscriber") || lower.includes("subscription")) {
    return "Basic artists are creator customer/partners. They can sell music, receive monetization, stream live video/audio radio, and subscribe to 50 included artist pages. Index scanning requires an upgrade, and artist-subscription exchanges take up to 7 days.";
  }

  return "Use the setup resolver first: check plan, tracking consent, ownership proof, ISRC, platform links, and launch score. Then route the artist to either rights review, royalty tracking, marketing, or fan subscription setup.";
}

function renderBasic() {
  const basic = state.basic;
  const remaining = Math.max(0, Number(basic.includedArtistSubscriptions) - Number(basic.usedArtistSubscriptions || 0));

  $("#basic-summary").innerHTML = `
    <article class="match-card" data-ai-record="basic-permissions">
      <div>
        <strong>${escapeHtml(basic.accountModel)}</strong>
        <span>${escapeHtml(basic.stationName)} - ${money(basic.artistSubscriptionPrice)} artist subscription price</span>
      </div>
      <small>${remaining}/${basic.includedArtistSubscriptions} included artist subscriptions available. Index scanning: ${basic.canUseIndexScanning ? "Enabled" : "Upgrade required"}.</small>
    </article>
    ${basic.exchanges.map((exchange) => `
      <article class="match-card" data-ai-record="subscription-exchange">
        <div>
          <strong>${escapeHtml(exchange.fromArtist)} to ${escapeHtml(exchange.toArtist)}</strong>
          <span>${escapeHtml(exchange.status)}</span>
        </div>
        <small>Eligible after ${new Date(exchange.eligibleAfter).toLocaleDateString()} to prevent rapid subscription switching.</small>
      </article>
    `).join("")}
  `;
}

function renderFans() {
  const profiles = state.fans?.profiles || [];
  const tips = state.fans?.tips || [];
  const accessTrades = state.fans?.accessTrades || [];
  const matches = buildFanMatches();

  $("#fan-match-list").innerHTML = matches.map((match) => `
    <article class="match-card" data-ai-record="fan-artist-match">
      <div>
        <strong>${escapeHtml(match.fanName)} to ${escapeHtml(match.artistName)}</strong>
        <span>${escapeHtml(match.route)}</span>
      </div>
      <small>${escapeHtml(match.reason)} Public content can be viewed after fan signup; subscribed access requires artist Bitcoin trade.${match.profilePicture ? ` Profile picture: ${escapeHtml(match.profilePicture)}.` : ""}</small>
    </article>
  `).join("") || `<p class="empty-state">Create a fan profile and an artist profile to generate JVM matches.</p>`;

  $("#fan-access-ledger").innerHTML = accessTrades.slice().reverse().map((trade) => `
    <article class="match-card" data-ai-record="fan-artist-access-trade">
      <div>
        <strong>${escapeHtml(trade.fanUsername)} to ${escapeHtml(trade.artistName)}</strong>
        <span>${escapeHtml(trade.accessTier)} - ${escapeHtml(trade.accessWindow)}</span>
      </div>
      <small>${escapeHtml(trade.status)}. Platform Bitcoin: ${money(trade.platformBitcoinValue)}. Artist Bitcoin requested: ${money(trade.artistBitcoinValue)}. ${escapeHtml(trade.subscribedAccess)}</small>
    </article>
  `).join("") || `<p class="empty-state">No artist access Bitcoin trades requested yet.</p>`;

  $("#fan-tip-ledger").innerHTML = tips.slice().reverse().map((tip) => `
    <article class="match-card" data-ai-record="fan-tip">
      <div>
        <strong>${escapeHtml(tip.artistName)}</strong>
        <span>${escapeHtml(tip.supportPath === "investment" ? "Investment/perks" : "Free tip")} value: ${money(tip.tipValue)} - Artist value boost: ${money(tip.artistValueBoost ?? tip.tipValue)}</span>
      </div>
      <small>${escapeHtml(tip.status)}. Platform fee: ${Number(tip.cashOutRate ?? 15)}% (${money(tip.platformFeeValue || 0)}). Artist keeps: ${money(tip.payoutValue)}. Investment/perk benefits are determined by platform management.</small>
    </article>
  `).join("") || `<p class="empty-state">No fan tip intents recorded yet.</p>`;
}

function renderCloud() {
  const leases = state.cloud?.leases || [];

  $("#cloud-lease-list").innerHTML = leases.slice().reverse().map((lease) => `
    <article class="match-card" data-ai-record="cloud-lease">
      <div>
        <strong>${escapeHtml(lease.artistName)}</strong>
        <span>${escapeHtml(lease.spacePackage)} - ${escapeHtml(lease.username)}</span>
      </div>
      <small>${escapeHtml(lease.status)}. Wallet password configured: ${lease.walletPasswordConfigured ? "yes" : "no"}. Cloud storage, billing, CDN, and live replay infrastructure still need production services.</small>
    </article>
  `).join("") || `<p class="empty-state">No cloud space leases recorded yet.</p>`;
}

function buildFanMatches() {
  const profiles = state.fans?.profiles || [];
  const artists = [
    {
      artistName: state.subscriber.artistName,
      genre: state.subscriber.genre,
      route: state.basic.liveVideoEnabled ? "Live stream and artist page" : "Artist page"
    },
    ...state.promotion.profiles
      .filter((profile) => profile.role === "Artist")
      .map((profile) => ({
        artistName: profile.name,
        genre: profile.genre,
        route: "Promotion profile and paid performance alerts"
      })),
    ...state.partner.artists.map((artist) => ({
      artistName: artist.artistName,
      genre: artist.accessPackage,
      route: "Partner roster artist page"
    }))
  ].filter((artist) => artist.artistName);

  const matches = [];

  profiles.forEach((profile) => {
    artists.forEach((artist) => {
      const genres = Array.isArray(profile.genres) ? profile.genres : [];
      const artistGenre = String(artist.genre || "").toLowerCase();
      const genreFit = genres.some((genre) => artistGenre.includes(String(genre).toLowerCase()) || String(genre).toLowerCase().includes(artistGenre));
      const experience = String(profile.experience || "").toLowerCase();
      const liveFit = experience.includes("live") && artist.route.toLowerCase().includes("live");
      const discoverFit = experience.includes("discover") || experience.includes("listen");

      if (genreFit || liveFit || discoverFit) {
        matches.push({
          fanName: profile.displayName,
          profilePicture: profile.profilePicture,
          artistName: artist.artistName,
          route: artist.route,
          reason: `${profile.visibility} matched by ${[genreFit && "genre interest", liveFit && "live expectation", discoverFit && "discovery/listening intent"].filter(Boolean).join(", ")}. JVM can personalize public search, public comments, public messages, and public stream recommendations.`
        });
      }
    });
  });

  return matches.slice(0, 12);
}

function renderPartner() {
  const partner = state.partner;
  const artists = partner.artists || [];
  const deals = partner.deals || [];
  const seatsLeft = Math.max(0, Number(partner.seatLimit || 50) - artists.length);

  $("#partner-roster").innerHTML = `
    <article class="match-card" data-ai-record="business-partner">
      <div>
        <strong>${escapeHtml(partner.business.businessName)}</strong>
        <span>${escapeHtml(partner.business.businessType)} - ${escapeHtml(partner.business.lobbyName)} - ${artists.length}/${partner.seatLimit} seats used</span>
      </div>
      <small>$${Number(partner.annualPrice).toLocaleString()} yearly package. ${seatsLeft} artist seats available. Bitcoin Tree services billed separately.</small>
    </article>
    ${artists.map((artist) => `
      <article class="match-card" data-ai-record="partner-artist">
        <div>
          <strong>${escapeHtml(artist.artistName)}</strong>
          <span>${escapeHtml(artist.contractType)} - ${escapeHtml(artist.accessPackage)}</span>
        </div>
        <small>${escapeHtml(artist.status)} - ${escapeHtml(artist.artistEmail)}</small>
      </article>
    `).join("")}
    ${deals.map((deal) => `
      <article class="match-card" data-ai-record="partner-deal">
        <div>
          <strong>${escapeHtml(deal.title)}</strong>
          <span>${escapeHtml(deal.artistName)} - ${money(deal.dealValue)}</span>
        </div>
        <small>${escapeHtml(deal.status)} before artist acceptance or contract activation.</small>
      </article>
    `).join("")}
  `;

  const snapshot = partner.market.lastSnapshot;
  $("#partner-market").innerHTML = snapshot ? `
    <strong>${escapeHtml(snapshot.rootCoin)} internal market snapshot</strong>
    <span>Artist seats: ${escapeHtml(snapshot.artistSeatUse)}. Sub-coins: ${snapshot.subCoinCount}. Deal value: ${money(snapshot.internalDealValue)}.</span>
    <small>${escapeHtml(snapshot.status)}. No real trading, custody, or public exchange activity.</small>
  ` : `
    <span>Awobe Inc. Coin is the simulated root coin. Artist sub-coins are generated internally when artists are added to a partner roster.</span>
    <small>Run a market snapshot after registering artists or creating deal proposals.</small>
  `;
}

function toolOutput(tool) {
  const artist = state.subscriber.artistName || "the artist";
  const content = state.contents[0]?.title || "the first release";

  const outputs = {
    marketing: `Campaign plan for ${escapeHtml(artist)}: introduce the story behind ${escapeHtml(content)}, post proof-of-work studio clips, publish platform links, ask fans to follow the Index page, then invite supporters into the first subscription offer.`,
    artwork: `Artwork direction: create one bold cover image, one vertical motion visual, and three quote-style story graphics. Match the visuals to the song mood, not just the genre.`,
    fan: `Fan subscription starter: $3 supporter tier for early listens, $7 insider tier for unreleased demos and livestreams, and a founder badge for the first 50 fans.`,
    rights: `Rights checklist: confirm ISRC, request UPC only if release-level data is available, collect proof of ownership/license/lease, verify splits, then open tracking requests for external platforms.`,
    production: `Production workspace: keep audio versions, artwork, lyric sheets, metadata, collaborator notes, and approval status in one release room before launch.`,
    distribution: `Distribution desk: keep this separate from the site subscription. Require copyright, license, or lease proof; run ISRC and fingerprint review; generate a distribution license; then prepare transfer to streaming platforms.`,
    live: `Collaboration live format: host subscriber-only listening rooms, artist think tanks, live co-writing sessions, performance streams, and paid Q&A rooms with chat moderation.`,
    money: `Money tools: enable one-time tips, paid live sessions, funding goals, fan subscriptions, replay access, Bitcoin Tree planning, and a clear payout ledger showing gross, fees, net, pending, and paid.`
  };

  return outputs[tool] || "Choose a tool to generate launch guidance.";
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

function renderBitcoin() {
  const trees = state.bitcoin?.trees || [];
  const projectedTree = trees.find((tree) => tree.projection);

  $("#bitcoin-tree-list").innerHTML = trees.map((tree) => `
    <article class="match-card" data-ai-record="bitcoin-tree">
      <div>
        <strong>${escapeHtml(tree.artistName)} - ${escapeHtml(tree.packageType)}</strong>
        <span>${escapeHtml(tree.branchCoinSymbol || "ARTIST-SUB")} rooted to ${escapeHtml(tree.rootCoin || "AWOBE")} - Base: ${money(tree.branchBaseValue || 0)} - Supply: ${Number(tree.branchCoinSupply || 0).toLocaleString()}</span>
      </div>
      <small>${escapeHtml(tree.status)} - Source: ${escapeHtml(tree.chainBlockSource || "Root source pending")} - Goal: ${money(tree.supportGoal)} - ${escapeHtml(tree.campaignDescription)}</small>
    </article>
  `).join("") || `<p class="empty-state">No Bitcoin Tree packages created yet.</p>`;

  $("#bitcoin-projection").innerHTML = projectedTree?.projection ? `
    <strong>${escapeHtml(projectedTree.artistName)} projection</strong>
    <span>${escapeHtml(projectedTree.branchCoinSymbol || "ARTIST-SUB")} base value: ${money(projectedTree.projection.branchBaseValue)} from root purchase ${money(projectedTree.rootCoinPurchaseValue)}.</span>
    <small>Trade sum before payout: ${money(projectedTree.projection.settlement.blockchainValueBeforePayout)}. Blockchain value after payout: ${money(projectedTree.projection.settlement.blockchainValueAfterPayout)}. Artist payout value: ${money(projectedTree.projection.settlement.artistPayoutValue)}. Simulation only.</small>
  ` : `
    <span>No projection generated yet.</span>
    <small>Create a Bitcoin Tree, then run projection. This does not create real Bitcoin, NFT, token, or income rights.</small>
  `;
}

function renderDistribution() {
  const releases = state.distribution?.releases || [];
  const plan = distributionPlans[state.distribution?.billing || "yearly"];
  const licensedRelease = releases.find((release) => release.licenseId);

  $("#distribution-list").innerHTML = releases.map((release) => `
    <article class="match-card" data-ai-record="distribution-release">
      <div>
        <strong>${escapeHtml(release.releaseTitle)}</strong>
        <span>${escapeHtml(release.artistName)} - ISRC: ${escapeHtml(release.isrc || "Required")} - ${escapeHtml(release.rightsBasis)}</span>
      </div>
      <small>${escapeHtml(release.status)} - ${escapeHtml(release.scanStatus)} - ${escapeHtml(release.targetPlatforms)}</small>
    </article>
  `).join("") || `<p class="empty-state">No releases submitted for distribution review yet.</p>`;

  $("#distribution-license").innerHTML = licensedRelease ? `
    <strong>${escapeHtml(licensedRelease.licenseId)}</strong>
    <span>Index Audio has an internal distribution authority record for ${escapeHtml(licensedRelease.releaseTitle)} by ${escapeHtml(licensedRelease.artistName)}.</span>
    <small>Plan: ${escapeHtml(plan.name)} at ${money(plan.price)}/${plan.period}. Transfer remains blocked until real platform connections are established.</small>
  ` : `
    <span>No distribution license generated yet.</span>
    <small>Upload rights proof, authorize distribution, authorize scan review, then run the rights scan.</small>
  `;
}

function renderPromotion() {
  const profiles = state.promotion.profiles || [];
  const gigs = state.promotion.gigs || [];
  const matches = buildPromotionMatches();
  const collabs = buildArtistCollaborationMatches();
  const growthEvents = buildArtistGrowthEvents();
  const businessLeads = buildArtistBusinessLeads();

  $("#promotion-matches").innerHTML = matches.map((match) => `
    <article class="match-card" data-ai-record="performance-match">
      <div>
        <strong>${escapeHtml(match.artistName)} for ${escapeHtml(match.title)}</strong>
        <span>${escapeHtml(match.location)} - ${escapeHtml(match.eventType || "Showcase")} - ${money(match.pay)} - JVM ${match.score}%</span>
      </div>
      <small>${escapeHtml(match.reason)} Fans: ${Number(match.fanCount || 0).toLocaleString()}. Avg views: ${Number(match.averageViews || 0).toLocaleString()}. Stage draw: ${Number(match.stageDraw || 0).toLocaleString()}.</small>
    </article>
  `).join("") || `
    <p class="empty-state">Create a promotion profile and post a gig to see local paid performance matches.</p>
  `;

  $("#artist-collab-matches").innerHTML = collabs.map((match) => `
    <article class="match-card" data-ai-record="artist-collaboration-match">
      <div>
        <strong>${escapeHtml(match.primaryArtist)} x ${escapeHtml(match.partnerArtist)}</strong>
        <span>${escapeHtml(match.collabType)} - JVM ${match.score}%</span>
      </div>
      <small>${escapeHtml(match.reason)}</small>
    </article>
  `).join("") || `<p class="empty-state">Add at least two artist profiles to see JVM collaboration suggestions.</p>`;

  $("#artist-growth-events").innerHTML = growthEvents.map((event) => `
    <article class="match-card" data-ai-record="artist-growth-event">
      <div>
        <strong>${escapeHtml(event.artistName)} should appear at ${escapeHtml(event.title)}</strong>
        <span>${escapeHtml(event.location)} - ${escapeHtml(event.genre)} - ${money(event.pay)}</span>
      </div>
      <small>${escapeHtml(event.reason)}</small>
    </article>
  `).join("") || `<p class="empty-state">Post paid gigs or artist profiles to see fan-base growth event suggestions.</p>`;

  $("#artist-business-leads").innerHTML = businessLeads.map((lead) => `
    <article class="match-card" data-ai-record="artist-business-lead">
      <div>
        <strong>${escapeHtml(lead.artistName)} to ${escapeHtml(lead.leadType)}</strong>
        <span>${escapeHtml(lead.route)} - JVM ${lead.score}%</span>
      </div>
      <small>${escapeHtml(lead.reason)}</small>
    </article>
  `).join("") || `<p class="empty-state">Artists seeking management, label review, or contracts will appear here with JVM business leads.</p>`;

  $("#run-promotion-match").textContent = `Run Match (${profiles.length} profiles / ${gigs.length} gigs)`;
}

function promotionArtists() {
  const demoArtist = {
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
  };

  return [
    ...(state.promotion.profiles || []).filter((profile) => profile.role === "Artist"),
    demoArtist
  ].filter((artist, index, artists) => artist.name && artists.findIndex((candidate) => candidate.name === artist.name) === index);
}

function buildPromotionMatches() {
  const profiles = promotionArtists();
  const gigs = state.promotion.gigs || [];
  const matches = [];

  profiles.forEach((profile) => {
    gigs.forEach((gig) => {
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

function buildArtistCollaborationMatches() {
  const artists = promotionArtists();
  const matches = [];

  artists.forEach((artist, index) => {
    artists.slice(index + 1).forEach((partner) => {
      const sameGenre = String(artist.genre || "").toLowerCase() === String(partner.genre || "").toLowerCase();
      const sameCity = String(artist.city || "").toLowerCase() === String(partner.city || "").toLowerCase();
      const audienceBalance = Math.abs(Number(artist.fanCount || 0) - Number(partner.fanCount || 0)) <= Math.max(250, Number(artist.fanCount || 0) * 0.5);
      const viewLift = Number(artist.averageViews || 0) + Number(partner.averageViews || 0);
      const score = [sameGenre, sameCity, audienceBalance, viewLift >= 1000].filter(Boolean).length;

      if (score >= 2) {
        matches.push({
          primaryArtist: artist.name,
          partnerArtist: partner.name,
          collabType: sameGenre ? "same-genre release or live set" : "cross-audience feature",
          score: Math.round((score / 4) * 100),
          reason: `${sameGenre ? "Genre fit" : "Audience bridge"}${sameCity ? ", same city" : ""}. JVM suggests a collaboration live, co-writing room, shared show bill, or feature to increase fan overlap and artist page visits.`
        });
      }
    });
  });

  return matches.sort((a, b) => b.score - a.score).slice(0, 8);
}

function buildArtistGrowthEvents() {
  return buildPromotionMatches()
    .filter((match) => Number(match.expectedAudience || 150) >= Number(match.stageDraw || 0) || match.score >= 67)
    .map((match) => ({
      artistName: match.artistName,
      title: match.title,
      location: match.location,
      genre: match.genre,
      pay: match.pay,
      reason: `JVM recommends this event because it can place ${match.artistName} in front of ${Number(match.expectedAudience || 150).toLocaleString()} expected listeners while matching ${match.reason.toLowerCase()}`
    }))
    .slice(0, 8);
}

function buildArtistBusinessLeads() {
  const partner = state.partner?.business || {};
  return promotionArtists()
    .filter((artist) => String(artist.businessReadiness || "").includes("Seeking"))
    .map((artist) => {
      const readyForLabel = String(artist.businessReadiness).includes("label");
      const audienceScore = Number(artist.fanCount || 0) >= 1000 && Number(artist.averageViews || 0) >= 2500;
      const score = [readyForLabel, audienceScore, Number(artist.stageDraw || 0) >= 75].filter(Boolean).length;

      return {
        artistName: artist.name,
        leadType: readyForLabel ? "label / contract review" : "artist management",
        route: partner.businessName || "Partner lobby",
        score: Math.max(50, Math.round((score / 3) * 100)),
        reason: `${artist.name} is marked ${artist.businessReadiness}. JVM suggests routing the profile, fan count (${Number(artist.fanCount || 0).toLocaleString()}), average views (${Number(artist.averageViews || 0).toLocaleString()}), genre, and stage draw into a manager/label review lead before any contract or deal activation.`
      };
    })
    .slice(0, 8);
}

function statusClass(status) {
  if (status === "Ready") return "paid";
  if (status === "Proof Needed") return "pending";
  return "rejected";
}

function showView(viewId) {
  document.querySelectorAll(".nav-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.view === viewId);
  });

  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("is-visible", view.id === viewId);
  });

  const active = document.querySelector(`.nav-tab[data-view="${viewId}"]`);
  $("#view-title").textContent = active?.textContent || "Join";
}

function fileName(form, name) {
  const file = form.get(name);
  return file && file.name ? file.name : "";
}

function fileNames(form, name) {
  return form.getAll(name).filter((file) => file?.name).map((file) => file.name).join(", ");
}

function validatePasswords(form, label = "profile") {
  const password = form.get("password");
  const passwordConfirm = form.get("passwordConfirm");
  const walletPassword = form.get("walletPassword");
  const walletPasswordConfirm = form.get("walletPasswordConfirm");

  if (password !== null && password !== passwordConfirm) {
    alert(`The ${label} passwords do not match.`);
    return false;
  }

  if (walletPassword !== null && walletPassword !== walletPasswordConfirm) {
    alert(`The ${label} wallet passwords do not match.`);
    return false;
  }

  return true;
}

function credentialFlags(form) {
  return {
    username: form.get("username")?.trim() || "",
    passwordConfigured: Boolean(form.get("password")),
    walletPasswordConfigured: Boolean(form.get("walletPassword")),
    termsAccepted: form.get("termsAccepted") === "on"
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function captureControls() {
  return {
    video: $("#capture-preview"),
    placeholder: $("#capture-placeholder"),
    status: $("#capture-status"),
    readout: $("#capture-readout"),
    cameraSelect: $("#camera-select"),
    micSelect: $("#mic-select"),
    startButton: $("#start-capture"),
    cameraButton: $("#toggle-camera"),
    micButton: $("#toggle-mic"),
    stopButton: $("#stop-capture")
  };
}

function setCaptureStatus(label, status = "pending") {
  const { status: statusEl } = captureControls();
  statusEl.textContent = label;
  statusEl.className = `status ${status}`;
}

function describeCaptureStream(stream) {
  const videoTrack = stream.getVideoTracks()[0];
  const audioTrack = stream.getAudioTracks()[0];
  const videoSettings = videoTrack?.getSettings?.() || {};
  const audioLabel = audioTrack?.label || "microphone active";
  const videoLabel = videoTrack?.label || "camera active";
  const size = videoSettings.width && videoSettings.height ? `${videoSettings.width} x ${videoSettings.height}` : "preview resolution pending";

  return `${videoLabel} at ${size}. ${audioLabel}. Local capture only; WebRTC or HLS can be added after this device layer is stable.`;
}

function updateCaptureButtons() {
  const { cameraButton, micButton, stopButton, startButton, placeholder } = captureControls();
  const videoTrack = captureStream?.getVideoTracks()[0];
  const audioTrack = captureStream?.getAudioTracks()[0];
  const active = Boolean(captureStream);

  startButton.disabled = active;
  cameraButton.disabled = !videoTrack;
  micButton.disabled = !audioTrack;
  stopButton.disabled = !active;
  cameraButton.textContent = videoTrack?.enabled ? "Camera On" : "Camera Off";
  micButton.textContent = audioTrack?.enabled ? "Mic On" : "Mic Off";
  placeholder.classList.toggle("is-hidden", active);
}

async function loadCaptureDevices() {
  const { cameraSelect, micSelect, readout } = captureControls();

  if (!navigator.mediaDevices?.enumerateDevices) {
    setCaptureStatus("Unsupported", "rejected");
    readout.textContent = "This browser does not expose camera and microphone device controls.";
    return;
  }

  const devices = await navigator.mediaDevices.enumerateDevices();
  const cameras = devices.filter((device) => device.kind === "videoinput");
  const microphones = devices.filter((device) => device.kind === "audioinput");
  const selectedCamera = cameraSelect.value;
  const selectedMic = micSelect.value;

  cameraSelect.innerHTML = `<option value="">Default camera</option>${cameras.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Camera ${index + 1}`)}</option>`).join("")}`;
  micSelect.innerHTML = `<option value="">Default microphone</option>${microphones.map((device, index) => `<option value="${escapeHtml(device.deviceId)}">${escapeHtml(device.label || `Microphone ${index + 1}`)}</option>`).join("")}`;

  cameraSelect.value = [...cameraSelect.options].some((option) => option.value === selectedCamera) ? selectedCamera : "";
  micSelect.value = [...micSelect.options].some((option) => option.value === selectedMic) ? selectedMic : "";
}

function stopCapture() {
  const { video, readout } = captureControls();
  captureStream?.getTracks().forEach((track) => track.stop());
  captureStream = null;
  video.srcObject = null;
  setCaptureStatus("Stopped", "pending");
  readout.textContent = "Camera and microphone stopped. Nothing was uploaded, streamed, recorded, or saved.";
  updateCaptureButtons();
}

async function startCapture() {
  const { video, cameraSelect, micSelect, readout } = captureControls();

  if (!navigator.mediaDevices?.getUserMedia) {
    setCaptureStatus("Unsupported", "rejected");
    readout.textContent = "Camera capture requires a browser with media device support and a secure local origin.";
    return;
  }

  stopCapture();
  setCaptureStatus("Requesting", "pending");
  readout.textContent = "Waiting for browser camera and microphone permission.";

  try {
    const constraints = {
      video: cameraSelect.value ? { deviceId: { exact: cameraSelect.value } } : true,
      audio: micSelect.value ? { deviceId: { exact: micSelect.value } } : true
    };

    captureStream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = captureStream;
    await video.play();
    await loadCaptureDevices();
    setCaptureStatus("Preview Live", "paid");
    readout.textContent = describeCaptureStream(captureStream);
    updateCaptureButtons();
  } catch (error) {
    captureStream = null;
    setCaptureStatus("Blocked", "rejected");
    readout.textContent = `Camera or microphone was not started: ${error.message}`;
    updateCaptureButtons();
  }
}

document.addEventListener("click", (event) => {
  const navButton = event.target.closest("[data-view]");
  if (navButton) showView(navButton.dataset.view);

  const toolButton = event.target.closest("[data-tool]");
  if (toolButton) {
    $("#tool-output").textContent = toolOutput(toolButton.dataset.tool);
  }

  const contentAction = event.target.closest("[data-content-action]");
  if (contentAction) {
    const item = state.contents.find((content) => content.id === contentAction.dataset.contentId);
    if (!item) return;

    if (contentAction.dataset.contentAction === "pin") {
      runEvent("content.lifecycle.pinned", {
        contentId: item.id,
        pinned: !item.pinned
      });
    }

    if (contentAction.dataset.contentAction === "refresh") {
      runEvent("content.lifecycle.refreshed", {
        contentId: item.id
      });
    }
  }

  const billingAction = event.target.closest("[data-billing-action]");
  if (billingAction?.dataset.billingAction === "verify-capture") {
    const paypalOrderId = billingAction.dataset.paypalOrderId;
    if (!paypalOrderId || !RUNTIME_API) return;

    fetch(`${RUNTIME_API}/payments/paypal/capture-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paypalOrderId })
    })
      .then((response) => {
        if (!response.ok) throw new Error("Capture verification failed");
        return response.json();
      })
      .then((result) => {
        state = result.state;
        runtimeOnline = true;
        render();
      })
      .catch(() => {
        runtimeOnline = false;
        const payment = state.billing.payments.find((record) => record.paypalOrderId === paypalOrderId);
        if (payment) payment.status = "Capture Verification Failed";
        render();
      });
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches('[name="plan"]')) {
    state.subscriber.plan = event.target.value;
    render();
  }

  if (event.target.matches("#camera-select, #mic-select") && captureStream) {
    startCapture();
  }
});

$("#search").addEventListener("input", renderIndex);

$("#jvm-time-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const date = form.get("calendarDate");
  const time = form.get("clockTime");
  const timeZone = form.get("timeZone");
  await runEvent("jvm.time.updated", {
    timeZone,
    currentAt: zonedDateTimeToIso(date, time, timeZone),
    calendarLabel: form.get("calendarLabel").trim() || "JVM internal clock set",
    timeAuthority: form.get("timeAuthority") === "on"
  });
});

$("#billing-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const payload = {
    payerType: form.get("payerType"),
    payerUsername: form.get("payerUsername").trim(),
    plan: form.get("plan"),
    billingCycle: form.get("billingCycle"),
    amount: Number(form.get("amount")),
    currency: "USD",
    marketPurpose: form.get("marketPurpose"),
    walletStatus: form.get("walletStatus"),
    contactEmail: form.get("contactEmail").trim(),
    billingConsent: form.get("billingConsent") === "on"
  };

  if (RUNTIME_API) {
    try {
      const response = await fetch(`${RUNTIME_API}/payments/paypal/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error("PayPal order endpoint unavailable");
      const result = await response.json();
      state = result.state;
      runtimeOnline = true;
      render();
      event.currentTarget.reset();
      showView("billing");
      return;
    } catch {
      runtimeOnline = false;
    }
  }

  await runEvent("payment.capture.requested", {
    ...payload,
    status: "PayPal Runtime or Env Required - Capture Verification Required"
  });
  event.currentTarget.reset();
  showView("billing");
});

$("#signup-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!validatePasswords(form, "artist")) return;
  await runEvent("subscriber.created", {
    ...credentialFlags(form),
    artistName: form.get("artistName").trim(),
    email: form.get("email").trim(),
    genre: form.get("genre").trim(),
    goal: form.get("goal"),
    plan: form.get("plan"),
    trackingConsent: form.get("trackingConsent") === "on",
    ownershipAttestation: form.get("ownershipAttestation") === "on"
  });
  showView("upload");
});

$("#content-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("content.submitted", {
    title: form.get("title").trim(),
    isrc: form.get("isrc").trim(),
    upc: form.get("upc").trim(),
    linkRequest: form.get("linkRequest"),
    sampleUse: form.get("sampleUse"),
    sampleExplanation: form.get("sampleExplanation").trim(),
    releaseType: form.get("releaseType"),
    contentKind: form.get("contentKind"),
    accessSetting: form.get("accessSetting"),
    splitNote: form.get("splitNote").trim(),
    platformLinks: form.get("platformLinks").trim(),
    audioFile: fileNames(form, "audioFile"),
    visualFile: fileNames(form, "visualFile"),
    proofFile: fileNames(form, "proofFile"),
    documentFile: fileNames(form, "documentFile"),
    jpegFile: fileNames(form, "jpegFile"),
    videoFile: fileNames(form, "videoFile")
  });

  event.currentTarget.reset();
  showView("index");
});

$("#basic-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("basic.permissions.updated", {
    accountModel: form.get("accountModel"),
    artistSubscriptionPrice: Number(form.get("artistSubscriptionPrice")),
    stationName: form.get("stationName").trim(),
    audience: form.get("audience"),
    acceptPlatformSubscribers: form.get("acceptPlatformSubscribers") === "on",
    captchaEnabled: form.get("captchaEnabled") === "on",
    minorSafeTerms: form.get("minorSafeTerms") === "on",
    adultTerms: form.get("adultTerms") === "on"
  });
});

$("#subscription-exchange-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("basic.subscription.exchange.requested", {
    fromArtist: form.get("fromArtist").trim(),
    toArtist: form.get("toArtist").trim()
  });
  event.currentTarget.reset();
});

$("#fan-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!validatePasswords(form, "fan")) return;
  await runEvent("fan.profile.created", {
    ...credentialFlags(form),
    displayName: form.get("displayName").trim(),
    email: form.get("email").trim(),
    profilePicture: fileName(form, "profilePicture"),
    experience: form.get("experience"),
    visibility: form.get("visibility"),
    genres: form.getAll("genres"),
    expectationNote: form.get("expectationNote").trim(),
    searchConsent: form.get("searchConsent") === "on"
  });
  event.currentTarget.reset();
});

$("#fan-access-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("fan.artist.access.trade.requested", {
    fanUsername: form.get("fanUsername").trim(),
    artistName: form.get("artistName").trim(),
    platformBitcoinValue: Number(form.get("platformBitcoinValue")),
    artistBitcoinValue: Number(form.get("artistBitcoinValue")),
    accessTier: form.get("accessTier"),
    accessWindow: form.get("accessWindow"),
    tradeConsent: form.get("tradeConsent") === "on"
  });
  event.currentTarget.reset();
});

$("#cloud-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!validatePasswords(form, "cloud")) return;
  await runEvent("cloud.space.purchased", {
    ...credentialFlags(form),
    email: form.get("email").trim(),
    artistName: form.get("artistName").trim(),
    spacePackage: form.get("spacePackage")
  });
  event.currentTarget.reset();
});

$("#fan-tip-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("fan.tip.recorded", {
    artistName: form.get("artistName").trim(),
    tipValue: Number(form.get("tipValue")),
    coinValue: Number(form.get("coinValue")),
    supportPath: form.get("supportPath"),
    cashOutRate: Number(form.get("cashOutRate"))
  });
  event.currentTarget.reset();
});

$("#add-tracking-request").addEventListener("click", () => {
  const type = state.subscriber.plan === "protection" ? "Index search and enforcement" : "Royalty tracking review";
  addRequest(type);
});

$("#promotion-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!validatePasswords(form, "promotion")) return;
  await runEvent("promotion.profile.created", {
    ...credentialFlags(form),
    role: form.get("role"),
    name: form.get("name").trim(),
    email: form.get("email").trim(),
    city: form.get("city").trim(),
    radius: Number(form.get("radius")),
    genre: form.get("genre").trim(),
    budget: Number(form.get("budget")),
    fanCount: Number(form.get("fanCount")),
    averageViews: Number(form.get("averageViews")),
    stageDraw: Number(form.get("stageDraw")),
    businessReadiness: form.get("businessReadiness"),
    gpsConsent: form.get("gpsConsent") === "on"
  });
  event.currentTarget.reset();
});

$("#gig-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("promotion.gig.created", {
    title: form.get("title").trim(),
    location: form.get("location").trim(),
    genre: form.get("genre").trim(),
    pay: Number(form.get("pay")),
    eventType: form.get("eventType"),
    expectedAudience: Number(form.get("expectedAudience")),
    minFanCount: Number(form.get("minFanCount")),
    minAverageViews: Number(form.get("minAverageViews"))
  });
  event.currentTarget.reset();
});

$("#run-promotion-match").addEventListener("click", () => {
  runEvent("promotion.match.run");
});

$("#distribution-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("distribution.release.submitted", {
    billing: form.get("billing"),
    releaseTitle: form.get("releaseTitle").trim(),
    artistName: form.get("artistName").trim(),
    isrc: form.get("isrc").trim(),
    upc: form.get("upc").trim(),
    rightsBasis: form.get("rightsBasis"),
    targetPlatforms: form.get("targetPlatforms").trim(),
    audioFile: fileNames(form, "audioFile"),
    artworkFile: fileNames(form, "artworkFile"),
    proofFile: fileNames(form, "proofFile"),
    splitFile: fileNames(form, "splitFile"),
    videoFile: fileNames(form, "videoFile"),
    distributionAuthority: form.get("distributionAuthority") === "on",
    scanConsent: form.get("scanConsent") === "on"
  });
  event.currentTarget.reset();
});

$("#run-distribution-review").addEventListener("click", () => {
  runEvent("distribution.review.run");
});

$("#bitcoin-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!validatePasswords(form, "Bitcoin Tree")) return;
  await runEvent("bitcoin.tree.created", {
    ...credentialFlags(form),
    artistName: form.get("artistName").trim(),
    walletLabel: form.get("walletLabel").trim(),
    walletAddress: form.get("walletAddress").trim(),
    rootCoinPurchaseValue: Number(form.get("rootCoinPurchaseValue")),
    chainBlockSource: form.get("chainBlockSource").trim(),
    branchCoinSymbol: form.get("branchCoinSymbol").trim(),
    branchCoinSupply: Number(form.get("branchCoinSupply")),
    baseValueMultiplier: Number(form.get("baseValueMultiplier")),
    packageType: form.get("packageType"),
    supportGoal: Number(form.get("supportGoal")),
    vestingMonths: Number(form.get("vestingMonths")),
    fanRewardPercent: Number(form.get("fanRewardPercent")),
    dropAsset: fileName(form, "dropAsset"),
    campaignDescription: form.get("campaignDescription").trim(),
    riskConsent: form.get("riskConsent") === "on",
    legalReview: form.get("legalReview") === "on"
  });
  event.currentTarget.reset();
});

$("#run-bitcoin-projection").addEventListener("click", () => {
  runEvent("bitcoin.projection.run");
});

$("#partner-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!validatePasswords(form, "business partner")) return;
  await runEvent("partner.created", {
    ...credentialFlags(form),
    businessName: form.get("businessName").trim(),
    email: form.get("email").trim(),
    businessType: form.get("businessType"),
    annualPackage: Number(form.get("annualPackage")),
    seatLimit: Number(form.get("seatLimit")),
    lobbyName: form.get("lobbyName").trim(),
    termsAccepted: form.get("termsAccepted") === "on"
  });
  event.currentTarget.reset();
});

$("#partner-artist-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  if (!validatePasswords(form, "partner artist")) return;
  await runEvent("partner.artist.registered", {
    ...credentialFlags(form),
    artistName: form.get("artistName").trim(),
    artistEmail: form.get("artistEmail").trim(),
    contractType: form.get("contractType"),
    accessPackage: form.get("accessPackage")
  });
  event.currentTarget.reset();
});

$("#deal-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await runEvent("partner.deal.created", {
    title: form.get("title").trim(),
    artistName: form.get("artistName").trim(),
    dealValue: Number(form.get("dealValue"))
  });
  event.currentTarget.reset();
});

$("#run-partner-market").addEventListener("click", () => {
  runEvent("partner.market.snapshot");
});

$("#support-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  $("#support-answer").textContent = supportAnswer(form.get("issue"));
});

$("#reset-demo").addEventListener("click", () => {
  runEvent("runtime.reset");
  showView("join");
});

$("#start-capture").addEventListener("click", startCapture);

$("#stop-capture").addEventListener("click", stopCapture);

$("#toggle-camera").addEventListener("click", () => {
  const track = captureStream?.getVideoTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  updateCaptureButtons();
});

$("#toggle-mic").addEventListener("click", () => {
  const track = captureStream?.getAudioTracks()[0];
  if (!track) return;
  track.enabled = !track.enabled;
  updateCaptureButtons();
});

$("#tool-output").textContent = "Choose a launch tool to generate marketing, artwork, rights, or fan subscription guidance.";
loadCaptureDevices().catch(() => {});
updateCaptureButtons();
render();
setInterval(renderJvmTime, 30000);
syncFromRuntime();
