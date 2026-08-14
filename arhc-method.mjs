const DEFAULT_OWNER_NAME = "Jason GLamount Reeves";
const DEFAULT_METHOD_NAME = "Awobe/JGR Bitcoin Method";
const DEFAULT_OWNER_PLATFORM_EXEMPT = true;
const DEFAULT_EXTERNAL_PLATFORM_FEE_RATE = 0.02;
const DEFAULT_PAYOUT_RATIO = 0.5;

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function text(value, fallback = "") {
  const cleaned = String(value ?? "").trim();
  return cleaned || fallback;
}

export function createMethodNotice({
  ownerName = DEFAULT_OWNER_NAME,
  methodName = DEFAULT_METHOD_NAME,
  indexWrapper = `${DEFAULT_OWNER_NAME} Index Wrapper`,
  externalPlatformFeeRate = DEFAULT_EXTERNAL_PLATFORM_FEE_RATE,
  ownerPlatformExempt = DEFAULT_OWNER_PLATFORM_EXEMPT
} = {}) {
  return {
    methodName: text(methodName, DEFAULT_METHOD_NAME),
    ownerName: text(ownerName, DEFAULT_OWNER_NAME),
    indexWrapper: text(indexWrapper, `${DEFAULT_OWNER_NAME} Index Wrapper`),
    externalPlatformFeeRate: number(externalPlatformFeeRate, DEFAULT_EXTERNAL_PLATFORM_FEE_RATE),
    ownerPlatformExempt: Boolean(ownerPlatformExempt),
    publicWrapperRequired: false,
    notice:
      "Internal method record only. Do not expose as a public wrapper unless the platform owner chooses to publish licensing terms."
  };
}

export function calculateExternalPlatformFee({
  totalSum = 0,
  externalPlatformFeeRate = DEFAULT_EXTERNAL_PLATFORM_FEE_RATE,
  isOwnerPlatform = false
} = {}) {
  const base = number(totalSum);
  const feeRate = number(externalPlatformFeeRate, DEFAULT_EXTERNAL_PLATFORM_FEE_RATE);
  const feeValue = isOwnerPlatform ? 0 : base * feeRate;

  return {
    totalSum: base,
    feeRate,
    feeValue,
    isOwnerPlatform: Boolean(isOwnerPlatform),
    feeApplies: !isOwnerPlatform
  };
}

export function calculateBranchBase({
  rootCoinPurchaseValue = 0,
  baseValueMultiplier = 1,
  branchCoinSupply = 1
} = {}) {
  const rootValue = number(rootCoinPurchaseValue);
  const multiplier = number(baseValueMultiplier, 1);
  const supply = number(branchCoinSupply, 1);
  const branchBaseValue = rootValue * multiplier;

  return {
    rootCoinPurchaseValue: rootValue,
    baseValueMultiplier: multiplier,
    branchCoinSupply: supply,
    branchBaseValue,
    impliedBranchMarketValue: branchBaseValue * supply
  };
}

export function calculateJvmSettlement({
  artistRouteCoinValue = 0,
  fanBaseCoinValue = 0,
  payoutRatio = DEFAULT_PAYOUT_RATIO
} = {}) {
  const artistValue = number(artistRouteCoinValue);
  const fanValue = number(fanBaseCoinValue);
  const ratio = number(payoutRatio, DEFAULT_PAYOUT_RATIO);
  const blockchainValueBeforePayout = artistValue + fanValue;
  const blockchainValueAfterPayout = blockchainValueBeforePayout * ratio;
  const artistPayoutValue = Math.min(fanValue, blockchainValueBeforePayout - blockchainValueAfterPayout);

  return {
    artistRouteCoinValue: artistValue,
    fanBaseCoinValue: fanValue,
    blockchainValueBeforePayout,
    blockchainValueAfterPayout,
    artistPayoutValue,
    retainedArtistMarketValue: artistValue,
    payoutRatio: ratio
  };
}

export function calculateTipSupport({
  tipValue = 0,
  platformFeeRate = 0.15,
  supportPath = "tip"
} = {}) {
  const base = number(tipValue);
  const feeRate = number(platformFeeRate, 0.15);
  const path = text(supportPath, "tip");
  const platformFeeValue = path === "tip" ? base * feeRate : 0;
  const artistPayoutValue = path === "tip" ? Math.max(0, base - platformFeeValue) : 0;

  return {
    tipValue: base,
    supportPath: path,
    platformFeeRate: feeRate,
    platformFeeValue,
    artistPayoutValue,
    investmentLedgerValue: path === "investment" ? base : 0
  };
}

export function createArtistCoinRecord({
  artistName,
  rootCoin = "AWOBE",
  chainBlockSource = "AWOBE root block / source outlet",
  branchCoinSymbol = "ARTIST-SUB",
  rootCoinPurchaseValue = 0,
  branchCoinSupply = 1,
  baseValueMultiplier = 1,
  fanBaseCoinValue,
  payoutRatio = DEFAULT_PAYOUT_RATIO
} = {}) {
  const branch = calculateBranchBase({
    rootCoinPurchaseValue,
    baseValueMultiplier,
    branchCoinSupply
  });

  const fanValue = fanBaseCoinValue === undefined ? branch.impliedBranchMarketValue : number(fanBaseCoinValue);
  const settlement = calculateJvmSettlement({
    artistRouteCoinValue: branch.impliedBranchMarketValue,
    fanBaseCoinValue: fanValue,
    payoutRatio
  });

  return {
    artistName: text(artistName, "Untitled Artist"),
    rootCoin: text(rootCoin, "AWOBE"),
    chainBlockSource: text(chainBlockSource, "AWOBE root block / source outlet"),
    branchCoinSymbol: text(branchCoinSymbol, "ARTIST-SUB"),
    settlementRule: "JVM_GENERIC_SETTLEMENT",
    ...branch,
    settlement
  };
}

export function calculateTotalBranchMarketValue(branchCoins = []) {
  return branchCoins.reduce((total, coin) => {
    const value =
      coin?.impliedBranchMarketValue ??
      coin?.artistRouteCoinValue ??
      coin?.marketValue ??
      coin?.value ??
      0;

    return total + number(value);
  }, 0);
}

export function createAssetLeaseRecord({
  artistName,
  fanHolderName,
  assetName,
  assetType = "artist support asset",
  leaseValue = 0,
  artistRouteCoinValue = 0,
  leaseTerm = "platform-managed",
  platformOwner = "Awobe",
  status = "Platform-Owned Asset Lease Pending"
} = {}) {
  const value = number(leaseValue || artistRouteCoinValue);

  return {
    artistName: text(artistName, "Untitled Artist"),
    fanHolderName: text(fanHolderName, "Fan holder"),
    assetName: text(assetName, "Artist asset"),
    assetType: text(assetType, "artist support asset"),
    leaseValue: value,
    artistRouteCoinValue: number(artistRouteCoinValue, value),
    leaseTerm: text(leaseTerm, "platform-managed"),
    platformOwner: text(platformOwner, "Awobe"),
    ownership: "Platform-owned",
    beneficiary: text(artistName, "Untitled Artist"),
    status: text(status, "Platform-Owned Asset Lease Pending")
  };
}

export default {
  calculateBranchBase,
  calculateExternalPlatformFee,
  calculateJvmSettlement,
  calculateTipSupport,
  calculateTotalBranchMarketValue,
  createAssetLeaseRecord,
  createArtistCoinRecord,
  createMethodNotice
};
