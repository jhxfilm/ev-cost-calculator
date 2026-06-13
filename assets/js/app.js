const costFields = [
  "monthlyKm",
  "years",
  "icePrice",
  "iceEfficiency",
  "fuelPrice",
  "evPrice",
  "evEfficiency",
  "electricityPrice"
];

const loanFields = [
  "loanVehiclePrice",
  "nationalSubsidy",
  "localSubsidy",
  "acquisitionTaxDiscount",
  "downPayment",
  "annualRate",
  "loanMonths"
];

const chargingFields = [
  "chargeMonthlyKm",
  "chargeEfficiency",
  "customChargePrice",
  "slowChargePrice",
  "fastChargePrice"
];

const commuteFields = [
  "commuteMonthlyKm",
  "oldEfficiency",
  "commuteFuelPrice",
  "oldRepairCost",
  "oldCarCc",
  "newMonthlyPayment",
  "commuteEvEfficiency",
  "commuteElectricityPrice",
  "newAnnualTax",
  "monthlyTollCost",
  "tollDiscountRate"
];

const compactFields = [
  "compactMonthlyKm",
  "compactBaseToll",
  "compactFuelEfficiency",
  "compactFuelPrice",
  "compactTollDiscount",
  "compactEvEfficiency",
  "compactElectricityPrice",
  "compactEvTollDiscount"
];

const conversionFields = [
  "conversionEvPrice",
  "disposalValue",
  "conversionYears",
  "conversionMonthlyKm",
  "conversionIceEfficiency",
  "conversionFuelPrice",
  "conversionEvEfficiency",
  "conversionElectricityPrice"
];

const elements = Object.fromEntries(
  [
    ...costFields,
    ...loanFields,
    ...chargingFields,
    ...commuteFields,
    ...compactFields,
    ...conversionFields,
    "paybackBadge",
    "headlineResult",
    "summaryResult",
    "iceMonthlyCost",
    "evMonthlyCost",
    "monthlySaving",
    "periodSaving",
    "iceTotalLabel",
    "evTotalLabel",
    "iceBar",
    "evBar",
    "loanBadge",
    "loanHeadline",
    "loanSummary",
    "netVehiclePrice",
    "loanPrincipal",
    "monthlyPayment",
    "totalInterest",
    "totalPayment",
    "downPaymentRatio",
    "totalIncentive",
    "loanMood",
    "chargingBadge",
    "chargingHeadline",
    "chargingSummary",
    "monthlyKwh",
    "customChargeCost",
    "costPer100Km",
    "annualChargeCost",
    "slowChargeCost",
    "middleChargeCost",
    "fastChargeCost",
    "commuteBadge",
    "commuteHeadline",
    "commuteSummary",
    "oldMonthlyTotal",
    "newMonthlyTotal",
    "commuteMonthlyDiff",
    "commuteFiveYearDiff",
    "oldFuelMonthly",
    "commuteEvEnergyMonthly",
    "oldMonthlyTax",
    "tollMonthlySaving",
    "compactBadge",
    "compactHeadline",
    "compactSummary",
    "compactMonthlyTotal",
    "compactEvMonthlyTotal",
    "compactMonthlyDiff",
    "compactAnnualDiff",
    "compactFuelMonthly",
    "compactEvEnergyMonthly",
    "compactTollMonthly",
    "compactEvTollMonthly",
    "conversionBadge",
    "conversionHeadline",
    "conversionSummary",
    "netEvPurchaseCost",
    "conversionMonthlySaving",
    "conversionPeriodSaving",
    "conversionNetBurden",
    "conversionIceMonthly",
    "conversionEvMonthly",
    "conversionPayback",
    "year"
  ].map((id) => [id, document.getElementById(id)])
);

const won = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0
});

function getNumber(id) {
  const value = Number(elements[id]?.value);
  return Number.isFinite(value) ? value : 0;
}

function formatWon(value) {
  return won.format(Math.round(value));
}

function formatPercent(value) {
  return `${value.toFixed(1)}%`;
}

function formatKwh(value) {
  return `${value.toFixed(1)}kWh`;
}

function formatCompactKoreanWon(value) {
  const amount = Math.max(Math.round(value), 0);
  const eok = Math.floor(amount / 100000000);
  const man = Math.floor((amount % 100000000) / 10000);
  const parts = [];

  if (eok) parts.push(`${eok.toLocaleString("ko-KR")}억`);
  if (man) parts.push(`${man.toLocaleString("ko-KR")}만원`);

  return parts.join(" ");
}

function setupAmountHints() {
  document.querySelectorAll(".input-wrap").forEach((wrap) => {
    const input = wrap.querySelector("input");
    const unitEl = wrap.querySelector("b");
    const unit = unitEl?.textContent.trim() ?? "";

    if (!input || !unitEl || unit !== "원") return;

    const hint = document.createElement("span");
    hint.className = "amount-hint";
    hint.setAttribute("aria-hidden", "true");
    unitEl.insertAdjacentElement("beforebegin", hint);

    const updateHint = () => {
      const value = Number(input.value);
      if (!Number.isFinite(value) || value < 10000) {
        hint.textContent = "";
        wrap.classList.remove("has-amount-hint");
        return;
      }

      hint.textContent = formatCompactKoreanWon(value);
      wrap.classList.add("has-amount-hint");
    };

    input.addEventListener("input", updateHint);
    updateHint();
  });
}

function calculateCost(values) {
  const monthlyFuelLiters = values.monthlyKm / values.iceEfficiency;
  const monthlyEvKwh = values.monthlyKm / values.evEfficiency;
  const iceMonthly = monthlyFuelLiters * values.fuelPrice;
  const evMonthly = monthlyEvKwh * values.electricityPrice;
  const monthlySaving = iceMonthly - evMonthly;
  const months = values.years * 12;
  const periodSaving = monthlySaving * months;
  const purchaseGap = values.evPrice - values.icePrice;
  const iceTotal = values.icePrice + iceMonthly * months;
  const evTotal = values.evPrice + evMonthly * months;
  const totalSaving = iceTotal - evTotal;
  const paybackMonths = monthlySaving > 0 && purchaseGap > 0 ? purchaseGap / monthlySaving : 0;

  return {
    iceMonthly,
    evMonthly,
    monthlySaving,
    periodSaving,
    purchaseGap,
    iceTotal,
    evTotal,
    totalSaving,
    paybackMonths
  };
}

function buildMessage(values, result) {
  if (result.monthlySaving <= 0) {
    return {
      badge: "절감 효과 낮음",
      headline: "현재 입력값에서는 전기차의 에너지 비용 절감 효과가 크지 않습니다.",
      summary: "전기요금, 전비, 유류비를 다시 조정해 실제 충전 환경에 맞춰보세요."
    };
  }

  if (result.purchaseGap <= 0) {
    return {
      badge: "시작부터 유리",
      headline: "구매가까지 고려해도 전기차의 총비용이 더 낮습니다.",
      summary: `${values.years}년 동안 에너지 비용만 ${formatWon(result.periodSaving)} 절감되는 시나리오입니다.`
    };
  }

  const paybackYears = result.paybackMonths / 12;
  const breakEvenText =
    result.paybackMonths <= values.years * 12
      ? `약 ${paybackYears.toFixed(1)}년 후 구매가 차이를 회수할 수 있습니다.`
      : `${values.years}년 안에는 구매가 차이를 모두 회수하기 어렵습니다.`;

  return {
    badge: result.paybackMonths <= values.years * 12 ? "회수 가능" : "장기 보유 필요",
    headline: breakEvenText,
    summary: `월 ${formatWon(result.monthlySaving)} 절감, ${values.years}년 에너지 비용은 ${formatWon(result.periodSaving)} 줄어드는 조건입니다.`
  };
}

function renderCostCalculator() {
  const values = Object.fromEntries(costFields.map((id) => [id, Math.max(getNumber(id), 0)]));

  values.iceEfficiency = Math.max(values.iceEfficiency, 0.1);
  values.evEfficiency = Math.max(values.evEfficiency, 0.1);

  const result = calculateCost(values);
  const message = buildMessage(values, result);
  const maxTotal = Math.max(result.iceTotal, result.evTotal, 1);

  elements.paybackBadge.textContent = message.badge;
  elements.headlineResult.textContent = message.headline;
  elements.summaryResult.textContent = message.summary;
  elements.iceMonthlyCost.textContent = formatWon(result.iceMonthly);
  elements.evMonthlyCost.textContent = formatWon(result.evMonthly);
  elements.monthlySaving.textContent = formatWon(result.monthlySaving);
  elements.periodSaving.textContent = formatWon(result.periodSaving);
  elements.iceTotalLabel.textContent = formatWon(result.iceTotal);
  elements.evTotalLabel.textContent = formatWon(result.evTotal);
  elements.iceBar.style.width = `${Math.max((result.iceTotal / maxTotal) * 100, 4)}%`;
  elements.evBar.style.width = `${Math.max((result.evTotal / maxTotal) * 100, 4)}%`;
}

function calculateLoan(values) {
  const vehiclePrice = Math.max(values.loanVehiclePrice, 0);
  const totalIncentive = Math.min(
    Math.max(values.nationalSubsidy, 0) + Math.max(values.localSubsidy, 0) + Math.max(values.acquisitionTaxDiscount, 0),
    vehiclePrice
  );
  const netVehiclePrice = Math.max(vehiclePrice - totalIncentive, 0);
  const downPayment = Math.min(Math.max(values.downPayment, 0), netVehiclePrice);
  const principal = Math.max(netVehiclePrice - downPayment, 0);
  const months = Math.max(Math.round(values.loanMonths), 1);
  const monthlyRate = Math.max(values.annualRate, 0) / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * (1 + monthlyRate) ** months) / ((1 + monthlyRate) ** months - 1);
  const totalPayment = monthlyPayment * months;
  const totalInterest = Math.max(totalPayment - principal, 0);
  const downPaymentRatio = netVehiclePrice > 0 ? (downPayment / netVehiclePrice) * 100 : 0;

  return {
    vehiclePrice,
    totalIncentive,
    netVehiclePrice,
    downPayment,
    principal,
    months,
    monthlyPayment,
    totalPayment,
    totalInterest,
    downPaymentRatio
  };
}

function buildLoanMessage(result) {
  if (result.principal === 0) {
    return {
      badge: "할부 없음",
      headline: "선수금으로 실구매가를 모두 충당하는 조건입니다.",
      summary: "할부 원금이 없어 월 납입금과 이자가 발생하지 않습니다.",
      mood: "부담 낮음"
    };
  }

  if (result.monthlyPayment >= 1000000) {
    return {
      badge: "높은 납입액",
      headline: `월 ${formatWon(result.monthlyPayment)} 납입이 예상됩니다.`,
      summary: "상환 기간을 늘리거나 선수금을 높이면 월 납입액을 낮출 수 있습니다.",
      mood: "높은 편"
    };
  }

  if (result.monthlyPayment >= 600000) {
    return {
      badge: "중간 수준",
      headline: `월 ${formatWon(result.monthlyPayment)} 정도를 준비해야 합니다.`,
      summary: `${result.months}개월 동안 총 이자는 ${formatWon(result.totalInterest)}로 예상됩니다.`,
      mood: "보통"
    };
  }

  return {
    badge: "낮은 납입액",
    headline: `월 ${formatWon(result.monthlyPayment)} 수준으로 계산됩니다.`,
    summary: "현재 조건에서는 월 납입액이 비교적 낮은 편입니다.",
    mood: "낮은 편"
  };
}

function renderLoanCalculator() {
  const values = Object.fromEntries(loanFields.map((id) => [id, Math.max(getNumber(id), 0)]));
  const result = calculateLoan(values);
  const message = buildLoanMessage(result);

  elements.loanBadge.textContent = message.badge;
  elements.loanHeadline.textContent = message.headline;
  elements.loanSummary.textContent = message.summary;
  elements.netVehiclePrice.textContent = formatWon(result.netVehiclePrice);
  elements.loanPrincipal.textContent = formatWon(result.principal);
  elements.monthlyPayment.textContent = formatWon(result.monthlyPayment);
  elements.totalInterest.textContent = formatWon(result.totalInterest);
  elements.totalPayment.textContent = formatWon(result.totalPayment);
  elements.downPaymentRatio.textContent = formatPercent(result.downPaymentRatio);
  elements.totalIncentive.textContent = formatWon(result.totalIncentive);
  elements.loanMood.textContent = message.mood;
}

function calculateCharging(values) {
  const monthlyKm = Math.max(values.chargeMonthlyKm, 0);
  const efficiency = Math.max(values.chargeEfficiency, 0.1);
  const monthlyKwh = monthlyKm / efficiency;
  const customCost = monthlyKwh * Math.max(values.customChargePrice, 0);
  const slowCost = monthlyKwh * Math.max(values.slowChargePrice, 0);
  const fastCost = monthlyKwh * Math.max(values.fastChargePrice, 0);
  const costPer100Km = (100 / efficiency) * Math.max(values.customChargePrice, 0);
  const annualCost = customCost * 12;

  return {
    monthlyKm,
    efficiency,
    monthlyKwh,
    customCost,
    slowCost,
    fastCost,
    costPer100Km,
    annualCost
  };
}

function buildChargingMessage(result) {
  if (result.monthlyKm === 0) {
    return {
      badge: "주행거리 필요",
      headline: "월 주행거리를 입력하면 충전비가 계산됩니다.",
      summary: "전비와 kWh당 요금을 함께 입력해 실제 충전 환경에 맞춰보세요."
    };
  }

  if (result.customCost >= 150000) {
    return {
      badge: "충전비 높음",
      headline: `월 충전비는 ${formatWon(result.customCost)} 정도입니다.`,
      summary: "급속 충전 비중이 높거나 월 주행거리가 긴 조건일 수 있습니다."
    };
  }

  if (result.customCost >= 70000) {
    return {
      badge: "현실적인 범위",
      headline: `월 충전비는 ${formatWon(result.customCost)}로 예상됩니다.`,
      summary: `월 ${formatKwh(result.monthlyKwh)}를 충전하는 시나리오입니다.`
    };
  }

  return {
    badge: "경제적인 충전비",
    headline: `월 ${formatWon(result.customCost)} 수준으로 비교적 경제적입니다.`,
    summary: "완속 충전이나 저렴한 충전요금제를 잘 활용하는 조건에 가깝습니다."
  };
}

function renderChargingCalculator() {
  const values = Object.fromEntries(chargingFields.map((id) => [id, Math.max(getNumber(id), 0)]));
  const result = calculateCharging(values);
  const message = buildChargingMessage(result);

  elements.chargingBadge.textContent = message.badge;
  elements.chargingHeadline.textContent = message.headline;
  elements.chargingSummary.textContent = message.summary;
  elements.monthlyKwh.textContent = formatKwh(result.monthlyKwh);
  elements.customChargeCost.textContent = formatWon(result.customCost);
  elements.costPer100Km.textContent = formatWon(result.costPer100Km);
  elements.annualChargeCost.textContent = formatWon(result.annualCost);
  elements.slowChargeCost.textContent = formatWon(result.slowCost);
  elements.middleChargeCost.textContent = formatWon(result.customCost);
  elements.fastChargeCost.textContent = formatWon(result.fastCost);
}

function calculateAnnualCarTaxByCc(cc) {
  const displacement = Math.max(cc, 0);
  if (displacement === 0) return 0;

  const baseRate = displacement <= 1000 ? 80 : displacement <= 1600 ? 140 : 200;
  const baseTax = displacement * baseRate;
  const localEducationTax = baseTax * 0.3;
  return baseTax + localEducationTax;
}

function calculateCommuteSwitch(values) {
  const monthlyKm = Math.max(values.commuteMonthlyKm, 0);
  const oldEfficiency = Math.max(values.oldEfficiency, 0.1);
  const oldFuelMonthly = (monthlyKm / oldEfficiency) * Math.max(values.commuteFuelPrice, 0);
  const evEfficiency = Math.max(values.commuteEvEfficiency, 0.1);
  const evEnergyMonthly = (monthlyKm / evEfficiency) * Math.max(values.commuteElectricityPrice, 0);
  const oldAnnualTax = calculateAnnualCarTaxByCc(values.oldCarCc);
  const oldMonthlyTax = oldAnnualTax / 12;
  const oldMonthlyToll = Math.max(values.monthlyTollCost, 0);
  const oldMonthlyTotal = oldFuelMonthly + Math.max(values.oldRepairCost, 0) + oldMonthlyTax + oldMonthlyToll;
  const discountRate = Math.min(Math.max(values.tollDiscountRate, 0), 100) / 100;
  const newMonthlyToll = oldMonthlyToll * (1 - discountRate);
  const tollMonthlySaving = oldMonthlyToll - newMonthlyToll;
  const newMonthlyTax = Math.max(values.newAnnualTax, 0) / 12;
  const newMonthlyTotal =
    Math.max(values.newMonthlyPayment, 0) + evEnergyMonthly + newMonthlyTax + newMonthlyToll;
  const monthlyDiff = oldMonthlyTotal - newMonthlyTotal;
  const fiveYearDiff = monthlyDiff * 60;

  return {
    oldFuelMonthly,
    evEnergyMonthly,
    oldAnnualTax,
    oldMonthlyTax,
    oldMonthlyTotal,
    newMonthlyTax,
    newMonthlyToll,
    tollMonthlySaving,
    newMonthlyTotal,
    monthlyDiff,
    fiveYearDiff
  };
}

function buildCommuteMessage(result) {
  if (result.monthlyDiff > 0) {
    return {
      badge: "교체 유리",
      headline: `전기차 전환 시 월 ${formatWon(result.monthlyDiff)}를 절감할 수 있습니다.`,
      summary: `5년 기준으로는 약 ${formatWon(result.fiveYearDiff)} 차이가 나는 시나리오입니다.`
    };
  }

  if (result.monthlyDiff < 0) {
    return {
      badge: "기존차 유리",
      headline: `기존차 유지가 월 ${formatWon(Math.abs(result.monthlyDiff))} 더 저렴합니다.`,
      summary: "수리비가 늘어나거나 전기차 할부 조건이 달라질 때 다시 비교해볼 수 있습니다."
    };
  }

  return {
    badge: "거의 동일",
    headline: "두 선택지의 월 비용이 거의 같습니다.",
    summary: "정비 편의성, 안전 사양, 주행 피로도 같은 비용 외 요소도 함께 검토해보세요."
  };
}

function renderCommuteCalculator() {
  const values = Object.fromEntries(commuteFields.map((id) => [id, Math.max(getNumber(id), 0)]));
  const result = calculateCommuteSwitch(values);
  const message = buildCommuteMessage(result);

  elements.commuteBadge.textContent = message.badge;
  elements.commuteHeadline.textContent = message.headline;
  elements.commuteSummary.textContent = message.summary;
  elements.oldMonthlyTotal.textContent = formatWon(result.oldMonthlyTotal);
  elements.newMonthlyTotal.textContent = formatWon(result.newMonthlyTotal);
  elements.commuteMonthlyDiff.textContent = formatWon(result.monthlyDiff);
  elements.commuteFiveYearDiff.textContent = formatWon(result.fiveYearDiff);
  elements.oldFuelMonthly.textContent = formatWon(result.oldFuelMonthly);
  elements.commuteEvEnergyMonthly.textContent = formatWon(result.evEnergyMonthly);
  elements.oldMonthlyTax.textContent = formatWon(result.oldMonthlyTax);
  elements.tollMonthlySaving.textContent = formatWon(result.tollMonthlySaving);
}

function calculateCompactComparison(values) {
  const monthlyKm = Math.max(values.compactMonthlyKm, 0);
  const baseToll = Math.max(values.compactBaseToll, 0);
  const compactFuelEfficiency = Math.max(values.compactFuelEfficiency, 0.1);
  const evEfficiency = Math.max(values.compactEvEfficiency, 0.1);
  const compactFuelMonthly = (monthlyKm / compactFuelEfficiency) * Math.max(values.compactFuelPrice, 0);
  const evEnergyMonthly = (monthlyKm / evEfficiency) * Math.max(values.compactElectricityPrice, 0);
  const compactTollDiscount = Math.min(Math.max(values.compactTollDiscount, 0), 100) / 100;
  const evTollDiscount = Math.min(Math.max(values.compactEvTollDiscount, 0), 100) / 100;
  const compactTollMonthly = baseToll * (1 - compactTollDiscount);
  const evTollMonthly = baseToll * (1 - evTollDiscount);
  const compactMonthlyTotal = compactFuelMonthly + compactTollMonthly;
  const evMonthlyTotal = evEnergyMonthly + evTollMonthly;
  const monthlyDiff = compactMonthlyTotal - evMonthlyTotal;
  const annualDiff = monthlyDiff * 12;

  return {
    compactFuelMonthly,
    evEnergyMonthly,
    compactTollMonthly,
    evTollMonthly,
    compactMonthlyTotal,
    evMonthlyTotal,
    monthlyDiff,
    annualDiff
  };
}

function buildCompactMessage(result) {
  if (result.monthlyDiff > 0) {
    return {
      badge: "전기차 유리",
      headline: `전기차가 월 ${formatWon(result.monthlyDiff)} 더 저렴합니다.`,
      summary: `연간 기준으로는 약 ${formatWon(result.annualDiff)} 차이가 나는 조건입니다.`
    };
  }

  if (result.monthlyDiff < 0) {
    return {
      badge: "경차 유리",
      headline: `경차가 월 ${formatWon(Math.abs(result.monthlyDiff))} 더 저렴합니다.`,
      summary: "통행료 비중이 크거나 전기차 충전 단가가 높은 조건에서는 경차 혜택이 더 크게 반영됩니다."
    };
  }

  return {
    badge: "비슷한 수준",
    headline: "두 선택지의 월 유지비가 거의 같습니다.",
    summary: "주차 편의, 충전 환경, 실내 공간 같은 비용 외 조건도 함께 비교해보세요."
  };
}

function renderCompactCalculator() {
  const values = Object.fromEntries(compactFields.map((id) => [id, Math.max(getNumber(id), 0)]));
  const result = calculateCompactComparison(values);
  const message = buildCompactMessage(result);

  elements.compactBadge.textContent = message.badge;
  elements.compactHeadline.textContent = message.headline;
  elements.compactSummary.textContent = message.summary;
  elements.compactMonthlyTotal.textContent = formatWon(result.compactMonthlyTotal);
  elements.compactEvMonthlyTotal.textContent = formatWon(result.evMonthlyTotal);
  elements.compactMonthlyDiff.textContent = formatWon(result.monthlyDiff);
  elements.compactAnnualDiff.textContent = formatWon(result.annualDiff);
  elements.compactFuelMonthly.textContent = formatWon(result.compactFuelMonthly);
  elements.compactEvEnergyMonthly.textContent = formatWon(result.evEnergyMonthly);
  elements.compactTollMonthly.textContent = formatWon(result.compactTollMonthly);
  elements.compactEvTollMonthly.textContent = formatWon(result.evTollMonthly);
}

function calculateConversion(values) {
  const evPrice = Math.max(values.conversionEvPrice, 0);
  const disposalValue = Math.min(Math.max(values.disposalValue, 0), evPrice);
  const years = Math.max(values.conversionYears, 1);
  const months = years * 12;
  const monthlyKm = Math.max(values.conversionMonthlyKm, 0);
  const iceEfficiency = Math.max(values.conversionIceEfficiency, 0.1);
  const evEfficiency = Math.max(values.conversionEvEfficiency, 0.1);
  const iceMonthly = (monthlyKm / iceEfficiency) * Math.max(values.conversionFuelPrice, 0);
  const evMonthly = (monthlyKm / evEfficiency) * Math.max(values.conversionElectricityPrice, 0);
  const monthlySaving = iceMonthly - evMonthly;
  const periodSaving = monthlySaving * months;
  const netEvPurchaseCost = evPrice - disposalValue;
  const netBurden = netEvPurchaseCost - periodSaving;
  const paybackMonths = monthlySaving > 0 ? netEvPurchaseCost / monthlySaving : 0;

  return {
    years,
    iceMonthly,
    evMonthly,
    monthlySaving,
    periodSaving,
    netEvPurchaseCost,
    netBurden,
    paybackMonths
  };
}

function buildConversionMessage(result) {
  if (result.monthlySaving <= 0) {
    return {
      badge: "절감 효과 낮음",
      headline: "현재 조건에서는 전기차로 바꿔도 에너지 비용 차이가 크지 않습니다.",
      summary: "전비, 충전요금, 유류비를 실제 조건에 맞춰 다시 비교해보세요.",
      payback: "회수 어려움"
    };
  }

  const paybackYears = result.paybackMonths / 12;
  const paybackText = paybackYears >= 20 ? "20년 이상" : `약 ${paybackYears.toFixed(1)}년`;

  if (result.netBurden <= 0) {
    return {
      badge: "구매비 회수 가능",
      headline: `${result.years}년 안에 처분가 차감 후 구매비를 회수할 수 있습니다.`,
      summary: `에너지 비용 절감액이 남는 구매비보다 ${formatWon(Math.abs(result.netBurden))} 더 큽니다.`,
      payback: paybackText
    };
  }

  return {
    badge: "추가 비용 확인",
    headline: `${result.years}년 후에도 남는 비용은 ${formatWon(result.netBurden)}입니다.`,
    summary: `보유 기간 동안 에너지 비용은 ${formatWon(result.periodSaving)} 줄어드는 계산입니다.`,
    payback: paybackText
  };
}

function renderConversionCalculator() {
  const values = Object.fromEntries(conversionFields.map((id) => [id, Math.max(getNumber(id), 0)]));
  const result = calculateConversion(values);
  const message = buildConversionMessage(result);

  elements.conversionBadge.textContent = message.badge;
  elements.conversionHeadline.textContent = message.headline;
  elements.conversionSummary.textContent = message.summary;
  elements.netEvPurchaseCost.textContent = formatWon(result.netEvPurchaseCost);
  elements.conversionMonthlySaving.textContent = formatWon(result.monthlySaving);
  elements.conversionPeriodSaving.textContent = formatWon(result.periodSaving);
  elements.conversionNetBurden.textContent = formatWon(result.netBurden);
  elements.conversionIceMonthly.textContent = formatWon(result.iceMonthly);
  elements.conversionEvMonthly.textContent = formatWon(result.evMonthly);
  elements.conversionPayback.textContent = message.payback;
}

function setupCalculator(fields, render) {
  const activeFields = fields.map((id) => elements[id]).filter(Boolean);
  if (activeFields.length !== fields.length) return;

  activeFields.forEach((field) => field.addEventListener("input", render));
  render();
}

if (elements.year) {
  elements.year.textContent = new Date().getFullYear();
}

setupAmountHints();
setupCalculator(costFields, renderCostCalculator);
setupCalculator(loanFields, renderLoanCalculator);
setupCalculator(chargingFields, renderChargingCalculator);
setupCalculator(commuteFields, renderCommuteCalculator);
setupCalculator(compactFields, renderCompactCalculator);
setupCalculator(conversionFields, renderConversionCalculator);
