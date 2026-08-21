/* ============================================================
   NUTRIPLAN — planificador diario de alimentación
   Todo lo que necesitas modificar está en la sección CONFIG
   y en el arreglo FOODS. El resto del archivo es lógica que
   lee esos datos, así que normalmente no hace falta tocarlo.
   ============================================================ */

/* ------------------------------------------------------------
   1. CONFIGURACIÓN — edita aquí tus objetivos y tolerancias
   ------------------------------------------------------------ */
const CONFIG = {
  // Objetivos diarios
  goals: {
    calories: 3450,   // kcal
    protein: 195,     // g
    carbs: 525,       // g
    fat: 80,           // g
  },

  // Rango (en % del objetivo) dentro del cual cada macro se
  // considera "cumplido". Ej: protein [100,110] = entre el
  // 100% y el 110% del objetivo de proteína.
  complianceRanges: {
    calories: [100, 105],
    protein: [100, 110],
    carbs: [95, 105],
    fat: [90, 110],
  },

  // A cuántos puntos porcentuales de distancia del rango
  // todavía se considera "🟡 cerca del objetivo" en vez de
  // "🔴 fuera del objetivo".
  nearThresholdPoints: 8,

  // Etiquetas legibles de cada macro, usadas en toda la UI.
  macroLabels: {
    calories: { label: "Calorías", unit: "kcal", short: "kcal" },
    protein: { label: "Proteína", unit: "g", short: "prot" },
    carbs: { label: "Carbohidratos", unit: "g", short: "carbs" },
    fat: { label: "Grasas", unit: "g", short: "grasa" },
  },
};

/* ------------------------------------------------------------
   2. ALIMENTOS — edita, agrega o elimina alimentos aquí
   ------------------------------------------------------------
   baseAmount: la cantidad a la que corresponden kcal/protein/
               carbs/fat (ej. 100 para "por 100 g", 1 para
               "por pieza" o "por scoop").
   unit:       texto de la unidad que se muestra junto al slider.
   baseLabel:  texto de referencia ("100 g", "1 pieza"...).
   min/max/step: rango y pasos del slider (y de los botones +/-).
   ------------------------------------------------------------ */
const FOODS = [
  {
    id: "arroz", name: "Arroz cocido", emoji: "🍚",
    baseAmount: 100, unit: "g", baseLabel: "100 g",
    kcal: 130, protein: 2.7, carbs: 28, fat: 0.3,
    min: 0, max: 1000, step: 25,
  },
  {
    id: "frijoles", name: "Frijoles cocidos", emoji: "🫘",
    baseAmount: 100, unit: "g", baseLabel: "100 g",
    kcal: 127, protein: 8.7, carbs: 23, fat: 0.5,
    min: 0, max: 1000, step: 25,
  },
  {
    id: "huevo", name: "Huevo", emoji: "🥚",
    baseAmount: 1, unit: "pieza(s)", baseLabel: "1 pieza",
    kcal: 72, protein: 6.3, carbs: 0.4, fat: 4.8,
    min: 0, max: 10, step: 1,
  },
  {
    id: "pollo", name: "Pechuga de pollo", emoji: "🍗",
    baseAmount: 100, unit: "g", baseLabel: "100 g",
    kcal: 165, protein: 31, carbs: 0, fat: 3.6,
    min: 0, max: 500, step: 25,
  },
  {
    id: "atun", name: "Atún en agua", emoji: "🐟",
    baseAmount: 100, unit: "g", baseLabel: "100 g",
    kcal: 115, protein: 25, carbs: 0, fat: 1,
    min: 0, max: 400, step: 25,
  },
  {
    id: "avena", name: "Avena", emoji: "🌾",
    baseAmount: 100, unit: "g", baseLabel: "100 g",
    kcal: 389, protein: 17, carbs: 66, fat: 7,
    min: 0, max: 600, step: 10,
  },
  {
    id: "leche", name: "Leche entera", emoji: "🥛",
    baseAmount: 250, unit: "ml", baseLabel: "250 ml",
    kcal: 150, protein: 8, carbs: 12, fat: 8,
    min: 0, max: 2000, step: 50,
  },
  {
    id: "papa", name: "Papa cocida", emoji: "🥔",
    baseAmount: 100, unit: "g", baseLabel: "100 g",
    kcal: 77, protein: 2, carbs: 17, fat: 0.1,
    min: 0, max: 1000, step: 25,
  },
  {
    id: "pan", name: "Pan blanco", emoji: "🍞",
    baseAmount: 1, unit: "porción(es) de 2 rebanadas", baseLabel: "50 g / 2 rebanadas",
    kcal: 133, protein: 4, carbs: 25, fat: 1.6,
    min: 0, max: 20, step: 1,
  },
  {
    id: "nutella", name: "Nutella", emoji: "🍫",
    baseAmount: 30, unit: "g", baseLabel: "30 g",
    kcal: 160, protein: 2, carbs: 18, fat: 9,
    min: 0, max: 300, step: 5,
  },
  {
    id: "whey", name: "Proteína whey", emoji: "🥤",
    baseAmount: 1, unit: "scoop(s)", baseLabel: "30 g / 1 scoop",
    kcal: 120, protein: 24, carbs: 3, fat: 1.5,
    min: 0, max: 5, step: 0.5,
  },
  {
    id: "chocolate", name: "Chocolate en polvo (malteada)", emoji: "🥄",
    baseAmount: 20, unit: "g", baseLabel: "20 g",
    kcal: 75, protein: 1.5, carbs: 17, fat: 0.8,
    min: 0, max: 100, step: 5,
  },
];

/* Combinación de ejemplo cargada por "⚡ CARGAR EJEMPLO".
   Edítala libremente para que se acerque más a tus gustos. */
const EXAMPLE_COMBO = {
  arroz: 500, frijoles: 200, huevo: 2, pollo: 200, atun: 0,
  avena: 150, leche: 500, papa: 200, pan: 2, nutella: 30,
  whey: 1, chocolate: 40,
};

const STORAGE_KEYS = {
  draft: "nutriplan_draft_v1",
  recipes: "nutriplan_recipes_v1",
};

/* ------------------------------------------------------------
   3. ESTADO
   ------------------------------------------------------------ */
const state = {
  quantities: Object.fromEntries(FOODS.map((f) => [f.id, 0])),
};

/* ------------------------------------------------------------
   4. CÁLCULOS — todo se deriva de FOODS, nunca hardcodeado
   ------------------------------------------------------------ */

// Valores nutricionales de un alimento a una cantidad dada.
// No se redondea aquí: el redondeo es solo visual, al mostrar.
function computeFoodValues(food, quantity) {
  const factor = quantity / food.baseAmount;
  return {
    kcal: food.kcal * factor,
    protein: food.protein * factor,
    carbs: food.carbs * factor,
    fat: food.fat * factor,
  };
}

// Suma los totales de todos los alimentos según las cantidades actuales.
function computeTotals(quantities) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const food of FOODS) {
    const qty = quantities[food.id] || 0;
    if (qty <= 0) continue;
    const values = computeFoodValues(food, qty);
    totals.calories += values.kcal;
    totals.protein += values.protein;
    totals.carbs += values.carbs;
    totals.fat += values.fat;
  }
  return totals;
}

// Estado de un macro individual respecto a su rango de cumplimiento.
function computeMacroStatus(macroKey, consumed) {
  const goal = CONFIG.goals[macroKey];
  const [low, high] = CONFIG.complianceRanges[macroKey];
  const percent = goal > 0 ? (consumed / goal) * 100 : 0;

  let status = "ok";
  let diffPoints = 0; // distancia en puntos porcentuales al rango
  if (percent < low) {
    status = "below";
    diffPoints = low - percent;
  } else if (percent > high) {
    status = "above";
    diffPoints = percent - high;
  }

  // Cantidad (en unidades del macro) para entrar al rango.
  let amountToRange = 0;
  if (status === "below") {
    amountToRange = (goal * low) / 100 - consumed;
  } else if (status === "above") {
    amountToRange = consumed - (goal * high) / 100;
  }

  return { percent, status, diffPoints, amountToRange };
}

// 🟢🟡🔴 a partir del estado de un macro.
function computeSemaphore(macroStatus) {
  if (macroStatus.status === "ok") {
    return { level: "green", icon: "🟢", label: "Dentro del objetivo" };
  }
  if (macroStatus.diffPoints <= CONFIG.nearThresholdPoints) {
    return { level: "yellow", icon: "🟡", label: "Cerca del objetivo" };
  }
  return { level: "red", icon: "🔴", label: "Fuera del objetivo" };
}

function roundToStep(value, step, min, max) {
  const rounded = Math.round(value / step) * step;
  const clamped = Math.min(max, Math.max(min, rounded));
  // Evita -0 y errores de coma flotante como 24.999999999996
  return Math.round(clamped * 1000) / 1000;
}

function fmt(value, decimals) {
  const n = Number(value) || 0;
  return n.toLocaleString("es-MX", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/* ------------------------------------------------------------
   5. RENDER — panel resumen
   ------------------------------------------------------------ */
function renderSummary() {
  const totals = computeTotals(state.quantities);
  const macroKeys = ["calories", "protein", "carbs", "fat"];
  const statuses = {};

  for (const key of macroKeys) {
    statuses[key] = computeMacroStatus(key, totals[key]);
  }

  // Barras de progreso + números
  for (const key of macroKeys) {
    const meta = CONFIG.macroLabels[key];
    const goal = CONFIG.goals[key];
    const consumed = totals[key];
    const st = statuses[key];
    const semaphore = computeSemaphore(st);
    const decimals = key === "calories" ? 0 : 1;

    const consumedEl = document.getElementById(`summary-${key}-consumed`);
    const goalEl = document.getElementById(`summary-${key}-goal`);
    const pctEl = document.getElementById(`summary-${key}-pct`);
    const fillEl = document.getElementById(`summary-${key}-fill`);
    const zoneEl = document.getElementById(`summary-${key}-zone`);
    const badgeEl = document.getElementById(`summary-${key}-badge`);

    consumedEl.textContent = fmt(consumed, decimals);
    goalEl.textContent = `${fmt(goal, decimals)} ${meta.unit}`;
    pctEl.textContent = `${Math.round(st.percent)}%`;

    const fillPct = Math.min(130, Math.max(0, st.percent));
    fillEl.style.width = `${(fillPct / 130) * 100}%`;
    fillEl.dataset.level = semaphore.level;

    // Zona sombreada que marca el rango de cumplimiento sobre la barra
    const [low, high] = CONFIG.complianceRanges[key];
    zoneEl.style.left = `${(low / 130) * 100}%`;
    zoneEl.style.width = `${((high - low) / 130) * 100}%`;

    badgeEl.textContent = `${semaphore.icon} ${semaphore.label}`;
    badgeEl.dataset.level = semaphore.level;
  }

  // "Te faltan"
  const remainingList = document.getElementById("remainingList");
  remainingList.innerHTML = "";
  let anyRemaining = false;
  for (const key of macroKeys) {
    const meta = CONFIG.macroLabels[key];
    const decimals = key === "calories" ? 0 : 1;
    const remaining = CONFIG.goals[key] - totals[key];
    const li = document.createElement("li");
    if (remaining > 0.05) {
      anyRemaining = true;
      li.innerHTML = `<span class="remaining-value">${fmt(remaining, decimals)} ${meta.unit}</span> de ${meta.label.toLowerCase()}`;
    } else {
      li.innerHTML = `<span class="remaining-value done">✓</span> ${meta.label} cubierta`;
    }
    remainingList.appendChild(li);
  }
  document.getElementById("remainingBlock").classList.toggle("all-done", !anyRemaining);

  // Banner de cumplimiento
  const allOk = macroKeys.every((k) => statuses[k].status === "ok");
  const banner = document.getElementById("complianceBanner");
  const detailList = document.getElementById("complianceDetail");
  detailList.innerHTML = "";

  for (const key of macroKeys) {
    const meta = CONFIG.macroLabels[key];
    const st = statuses[key];
    const decimals = key === "calories" ? 0 : 1;
    const li = document.createElement("li");
    if (st.status === "ok") {
      li.innerHTML = `<span class="detail-icon ok">✓</span> ${meta.label} dentro del objetivo`;
    } else if (st.status === "below") {
      li.innerHTML = `<span class="detail-icon bad">❌</span> Faltan ${fmt(st.amountToRange, decimals)} ${meta.unit} de ${meta.label.toLowerCase()}`;
    } else {
      li.innerHTML = `<span class="detail-icon warn">⚠</span> ${meta.label} ${fmt(st.amountToRange, decimals)} ${meta.unit} por encima`;
    }
    detailList.appendChild(li);
  }

  if (allOk) {
    banner.classList.add("success");
    banner.innerHTML = `
      <div class="banner-title">✓ OBJETIVO DIARIO CUMPLIDO</div>
      <div class="banner-subtitle">Esta combinación entra dentro de tus objetivos de calorías y macronutrientes.</div>
    `;
  } else {
    banner.classList.remove("success");
    banner.innerHTML = `<div class="banner-title">○ Todavía no cumples el objetivo</div>`;
  }

  return { totals, statuses, allOk };
}

/* ------------------------------------------------------------
   6. RENDER — tarjetas de alimentos
   ------------------------------------------------------------ */
function foodCardTemplate(food) {
  const qty = state.quantities[food.id] || 0;
  return `
    <article class="food-card" data-food="${food.id}">
      <header class="food-card-header">
        <span class="food-emoji" aria-hidden="true">${food.emoji}</span>
        <div>
          <h3>${food.name}</h3>
          <p class="food-base">${fmt(food.kcal, 0)} kcal / ${food.baseLabel}</p>
        </div>
      </header>

      <div class="food-slider-row">
        <button type="button" class="step-btn minus" aria-label="Reducir ${food.name}">−</button>
        <input
          type="range"
          class="food-slider"
          min="${food.min}"
          max="${food.max}"
          step="${food.step}"
          value="${qty}"
          aria-label="Cantidad de ${food.name}"
        />
        <button type="button" class="step-btn plus" aria-label="Aumentar ${food.name}">+</button>
      </div>

      <div class="food-qty-display">
        <span class="qty-value">${fmt(qty, food.step < 1 ? 1 : 0)}</span>
        <span class="qty-unit">${food.unit}</span>
      </div>

      <dl class="food-values">
        <div><dt>Calorías</dt><dd class="v-kcal">0 kcal</dd></div>
        <div><dt>Proteína</dt><dd class="v-protein">0 g</dd></div>
        <div><dt>Carbohidratos</dt><dd class="v-carbs">0 g</dd></div>
        <div><dt>Grasas</dt><dd class="v-fat">0 g</dd></div>
      </dl>
    </article>
  `;
}

function renderFoodGrid() {
  const grid = document.getElementById("foodsGrid");
  grid.innerHTML = FOODS.map(foodCardTemplate).join("");

  grid.querySelectorAll(".food-card").forEach((card) => {
    const foodId = card.dataset.food;
    const slider = card.querySelector(".food-slider");
    const minusBtn = card.querySelector(".minus");
    const plusBtn = card.querySelector(".plus");

    slider.addEventListener("input", () => {
      setQuantity(foodId, parseFloat(slider.value));
    });
    minusBtn.addEventListener("click", () => stepQuantity(foodId, -1));
    plusBtn.addEventListener("click", () => stepQuantity(foodId, 1));
  });

  updateAllFoodCards();
}

function updateFoodCard(food) {
  const card = document.querySelector(`.food-card[data-food="${food.id}"]`);
  if (!card) return;
  const qty = state.quantities[food.id] || 0;
  const values = computeFoodValues(food, qty);

  card.querySelector(".food-slider").value = qty;
  card.querySelector(".qty-value").textContent = fmt(qty, food.step < 1 ? 1 : 0);
  card.querySelector(".v-kcal").textContent = `${fmt(values.kcal, 0)} kcal`;
  card.querySelector(".v-protein").textContent = `${fmt(values.protein, 1)} g`;
  card.querySelector(".v-carbs").textContent = `${fmt(values.carbs, 1)} g`;
  card.querySelector(".v-fat").textContent = `${fmt(values.fat, 1)} g`;

  card.classList.toggle("has-quantity", qty > 0);
}

function updateAllFoodCards() {
  FOODS.forEach(updateFoodCard);
}

/* ------------------------------------------------------------
   7. ACCIONES sobre cantidades
   ------------------------------------------------------------ */
function setQuantity(foodId, value) {
  const food = FOODS.find((f) => f.id === foodId);
  if (!food) return;
  state.quantities[foodId] = roundToStep(value, food.step, food.min, food.max);
  updateFoodCard(food);
  renderSummary();
  persistDraft();
}

function stepQuantity(foodId, direction) {
  const food = FOODS.find((f) => f.id === foodId);
  if (!food) return;
  const current = state.quantities[foodId] || 0;
  const next = current + direction * food.step;
  setQuantity(foodId, next);
}

function resetAll() {
  if (!confirm("¿Restablecer todas las cantidades a 0?")) return;
  FOODS.forEach((f) => (state.quantities[f.id] = 0));
  updateAllFoodCards();
  renderSummary();
  persistDraft();
}

function loadExample() {
  FOODS.forEach((f) => {
    const val = EXAMPLE_COMBO[f.id] ?? 0;
    state.quantities[f.id] = roundToStep(val, f.step, f.min, f.max);
  });
  updateAllFoodCards();
  renderSummary();
  persistDraft();
}

/* ------------------------------------------------------------
   8. GENERAR / COPIAR COMIDA
   ------------------------------------------------------------ */
function getActiveFoods() {
  return FOODS.filter((f) => (state.quantities[f.id] || 0) > 0);
}

function buildMealSummaryData() {
  const active = getActiveFoods();
  const { totals, allOk, statuses } = renderSummary(); // asegura datos frescos
  return { active, totals, allOk, statuses };
}

function generateMeal() {
  const { active, totals, allOk } = buildMealSummaryData();
  const modalBody = document.getElementById("mealModalBody");

  if (active.length === 0) {
    modalBody.innerHTML = `<p class="empty-state">Todavía no has añadido ningún alimento. Mueve algún slider primero.</p>`;
  } else {
    const rows = active
      .map((f) => {
        const qty = state.quantities[f.id];
        return `<li><span class="meal-emoji">${f.emoji}</span> ${f.name} — <strong>${fmt(qty, f.step < 1 ? 1 : 0)} ${f.unit}</strong></li>`;
      })
      .join("");

    modalBody.innerHTML = `
      <ul class="meal-list">${rows}</ul>
      <div class="meal-total">
        <h4>TOTAL</h4>
        <p>${fmt(totals.calories, 0)} kcal</p>
        <p>${fmt(totals.protein, 1)} g proteína</p>
        <p>${fmt(totals.carbs, 1)} g carbohidratos</p>
        <p>${fmt(totals.fat, 1)} g grasa</p>
      </div>
      <p class="meal-status ${allOk ? "ok" : "pending"}">
        ${allOk ? "✓ Objetivo diario cumplido" : "○ Todavía no cumples el objetivo — revisa el panel de arriba para ver qué falta."}
      </p>
    `;
  }

  openModal("mealModal");
}

function buildCopyText() {
  const { active, totals, allOk } = buildMealSummaryData();
  const lines = ["COMIDA DEL DÍA", ""];
  if (active.length === 0) {
    lines.push("(sin alimentos añadidos)");
  } else {
    active.forEach((f) => {
      const qty = state.quantities[f.id];
      lines.push(`- ${f.name}: ${fmt(qty, f.step < 1 ? 1 : 0)} ${f.unit}`);
    });
  }
  lines.push("");
  lines.push("TOTAL:");
  lines.push(`${fmt(totals.calories, 0)} kcal`);
  lines.push(`${fmt(totals.protein, 1)} g proteína`);
  lines.push(`${fmt(totals.carbs, 1)} g carbohidratos`);
  lines.push(`${fmt(totals.fat, 1)} g grasa`);
  lines.push("");
  lines.push(`OBJETIVO: ${allOk ? "✓ CUMPLIDO" : "○ NO CUMPLIDO"}`);
  return lines.join("\n");
}

async function copyList() {
  const text = buildCopyText();
  const btn = document.getElementById("copyListBtn");
  try {
    await navigator.clipboard.writeText(text);
    flashButton(btn, "✅ Copiado");
  } catch (err) {
    // Respaldo para navegadores sin permiso de portapapeles
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      flashButton(btn, "✅ Copiado");
    } catch (err2) {
      flashButton(btn, "⚠️ No se pudo copiar");
    }
    document.body.removeChild(textarea);
  }
}

function flashButton(btn, tempText) {
  if (!btn) return;
  const original = btn.dataset.originalText || btn.textContent;
  btn.dataset.originalText = original;
  btn.textContent = tempText;
  setTimeout(() => {
    btn.textContent = original;
  }, 1600);
}

/* ------------------------------------------------------------
   9. RECETAS GUARDADAS (localStorage)
   ------------------------------------------------------------ */
function loadRecipes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recipes);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

function saveRecipes(recipes) {
  localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify(recipes));
}

function saveCurrentAsRecipe() {
  const name = prompt("Nombre para esta receta (ej. 'Día de entrenamiento'):");
  if (!name || !name.trim()) return;

  const recipes = loadRecipes();
  const trimmed = name.trim();
  const existingIndex = recipes.findIndex((r) => r.name === trimmed);
  const entry = { name: trimmed, quantities: { ...state.quantities } };

  if (existingIndex >= 0) {
    if (!confirm(`Ya existe una receta llamada "${trimmed}". ¿Sobrescribirla?`)) return;
    recipes[existingIndex] = entry;
  } else {
    recipes.push(entry);
  }
  saveRecipes(recipes);
  renderSavedRecipes();
}

function applyRecipe(recipe) {
  FOODS.forEach((f) => {
    const val = recipe.quantities[f.id] ?? 0;
    state.quantities[f.id] = roundToStep(val, f.step, f.min, f.max);
  });
  updateAllFoodCards();
  renderSummary();
  persistDraft();
}

function renderSavedRecipes() {
  const container = document.getElementById("savedRecipesList");
  const recipes = loadRecipes();

  if (recipes.length === 0) {
    container.innerHTML = `<p class="empty-state">Todavía no has guardado ninguna receta.</p>`;
    return;
  }

  container.innerHTML = recipes
    .map(
      (r, i) => `
      <div class="recipe-row" data-index="${i}">
        <span class="recipe-name">${escapeHtml(r.name)}</span>
        <div class="recipe-actions">
          <button type="button" class="recipe-load" data-index="${i}">Cargar</button>
          <button type="button" class="recipe-rename" data-index="${i}">Renombrar</button>
          <button type="button" class="recipe-delete" data-index="${i}">Eliminar</button>
        </div>
      </div>
    `
    )
    .join("");

  container.querySelectorAll(".recipe-load").forEach((btn) =>
    btn.addEventListener("click", () => {
      const recipes = loadRecipes();
      const recipe = recipes[parseInt(btn.dataset.index, 10)];
      if (recipe) applyRecipe(recipe);
    })
  );

  container.querySelectorAll(".recipe-rename").forEach((btn) =>
    btn.addEventListener("click", () => {
      const recipes = loadRecipes();
      const idx = parseInt(btn.dataset.index, 10);
      const recipe = recipes[idx];
      if (!recipe) return;
      const newName = prompt("Nuevo nombre:", recipe.name);
      if (!newName || !newName.trim()) return;
      recipe.name = newName.trim();
      saveRecipes(recipes);
      renderSavedRecipes();
    })
  );

  container.querySelectorAll(".recipe-delete").forEach((btn) =>
    btn.addEventListener("click", () => {
      const recipes = loadRecipes();
      const idx = parseInt(btn.dataset.index, 10);
      const recipe = recipes[idx];
      if (!recipe) return;
      if (!confirm(`¿Eliminar la receta "${recipe.name}"?`)) return;
      recipes.splice(idx, 1);
      saveRecipes(recipes);
      renderSavedRecipes();
    })
  );
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ------------------------------------------------------------
   10. DRAFT AUTOMÁTICO (para no perder cambios al recargar)
   ------------------------------------------------------------ */
function persistDraft() {
  try {
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(state.quantities));
  } catch (err) {
    /* localStorage no disponible; no pasa nada, solo no persiste */
  }
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.draft);
    if (!raw) return;
    const saved = JSON.parse(raw);
    FOODS.forEach((f) => {
      if (typeof saved[f.id] === "number") {
        state.quantities[f.id] = roundToStep(saved[f.id], f.step, f.min, f.max);
      }
    });
  } catch (err) {
    /* ignorar draft corrupto */
  }
}

/* ------------------------------------------------------------
   11. SUGERIR AJUSTE (no modifica las cantidades automáticamente)
   ------------------------------------------------------------ */
// Alimento preferido para cubrir cada macro, en orden de prioridad.
const SUGGESTION_SOURCES = {
  protein: ["whey", "pollo", "atun", "huevo"],
  carbs: ["avena", "arroz", "papa", "pan"],
  fat: ["nutella", "chocolate"],
  calories: ["leche", "arroz", "avena"],
};

function suggestAdjustment() {
  const totals = computeTotals(state.quantities);
  const gaps = {
    calories: CONFIG.goals.calories - totals.calories,
    protein: CONFIG.goals.protein - totals.protein,
    carbs: CONFIG.goals.carbs - totals.carbs,
    fat: CONFIG.goals.fat - totals.fat,
  };

  const modalBody = document.getElementById("suggestionModalBody");

  if (gaps.calories <= 0 && gaps.protein <= 0 && gaps.carbs <= 0 && gaps.fat <= 0) {
    modalBody.innerHTML = `
      <p>Ya alcanzaste o superaste tus cuatro objetivos con lo que llevas seleccionado.</p>
      <p>Si algún macro quedó muy por encima de su rango, considera reducir ligeramente ese alimento.</p>
    `;
    openModal("suggestionModal");
    return;
  }

  const additions = {}; // foodId -> cantidad a añadir
  const runningQuantities = { ...state.quantities };
  const runningGaps = { ...gaps };

  function applyAddition(foodId, addQty) {
    const food = FOODS.find((f) => f.id === foodId);
    if (!food || addQty <= 0) return;
    additions[foodId] = (additions[foodId] || 0) + addQty;
    runningQuantities[foodId] = (runningQuantities[foodId] || 0) + addQty;
    const values = computeFoodValues(food, addQty);
    runningGaps.calories -= values.kcal;
    runningGaps.protein -= values.protein;
    runningGaps.carbs -= values.carbs;
    runningGaps.fat -= values.fat;
  }

  // Cubre proteína, carbohidratos y grasa (en ese orden) con su
  // fuente preferida; luego usa lo que falte de calorías con un
  // alimento "de relleno" si aún hace falta energía.
  ["protein", "carbs", "fat"].forEach((macroKey) => {
    if (runningGaps[macroKey] <= 0.5) return;
    const candidateId = SUGGESTION_SOURCES[macroKey].find((id) => {
      const food = FOODS.find((f) => f.id === id);
      const used = runningQuantities[id] || 0;
      return food && used < food.max;
    });
    if (!candidateId) return;
    const food = FOODS.find((f) => f.id === candidateId);
    const used = runningQuantities[candidateId] || 0;
    const perUnit = food[macroKey] / food.baseAmount;
    if (perUnit <= 0) return;
    const rawNeeded = runningGaps[macroKey] / perUnit;
    let addQty = roundToStep(rawNeeded, food.step, 0, food.max - used);
    if (addQty <= 0) addQty = food.step; // al menos un paso si todavía falta
    addQty = Math.min(addQty, food.max - used);
    applyAddition(candidateId, addQty);
  });

  if (runningGaps.calories > 60) {
    const candidateId = SUGGESTION_SOURCES.calories.find((id) => {
      const food = FOODS.find((f) => f.id === id);
      const used = runningQuantities[id] || 0;
      return food && used < food.max;
    });
    if (candidateId) {
      const food = FOODS.find((f) => f.id === candidateId);
      const used = runningQuantities[candidateId] || 0;
      const perUnit = food.kcal / food.baseAmount;
      const rawNeeded = runningGaps.calories / perUnit;
      let addQty = roundToStep(rawNeeded, food.step, 0, food.max - used);
      addQty = Math.min(addQty, food.max - used);
      applyAddition(candidateId, addQty);
    }
  }

  const additionEntries = Object.entries(additions).filter(([, qty]) => qty > 0);

  if (additionEntries.length === 0) {
    modalBody.innerHTML = `
      <p>Tus alimentos actuales ya están muy cerca de tus rangos, o los alimentos disponibles no alcanzan para cerrar la diferencia sin salirte de sus límites de slider.</p>
      <p>Prueba ajustando manualmente cantidades pequeñas de proteína o carbohidratos.</p>
    `;
    openModal("suggestionModal");
    return;
  }

  const gapLines = [];
  if (gaps.calories > 0) gapLines.push(`${fmt(gaps.calories, 0)} kcal`);
  if (gaps.protein > 0) gapLines.push(`${fmt(gaps.protein, 1)} g de proteína`);
  if (gaps.carbs > 0) gapLines.push(`${fmt(gaps.carbs, 1)} g de carbohidratos`);
  if (gaps.fat > 0) gapLines.push(`${fmt(gaps.fat, 1)} g de grasa`);

  const additionsHtml = additionEntries
    .map(([foodId, qty]) => {
      const food = FOODS.find((f) => f.id === foodId);
      return `<li>${food.emoji} +${fmt(qty, food.step < 1 ? 1 : 0)} ${food.unit} de ${food.name}</li>`;
    })
    .join("");

  const projected = computeTotals(runningQuantities);

  modalBody.innerHTML = `
    <p>Actualmente te faltan aproximadamente: <strong>${gapLines.join(", ")}</strong>.</p>
    <p>Una opción sería añadir:</p>
    <ul class="suggestion-list">${additionsHtml}</ul>
    <div class="meal-total">
      <h4>QUEDARÍA ASÍ</h4>
      <p>${fmt(projected.calories, 0)} kcal</p>
      <p>${fmt(projected.protein, 1)} g proteína</p>
      <p>${fmt(projected.carbs, 1)} g carbohidratos</p>
      <p>${fmt(projected.fat, 1)} g grasa</p>
    </div>
    <button type="button" class="btn primary" id="applySuggestionBtn">Aplicar esta sugerencia</button>
  `;

  document.getElementById("applySuggestionBtn").addEventListener("click", () => {
    additionEntries.forEach(([foodId, qty]) => {
      const food = FOODS.find((f) => f.id === foodId);
      const current = state.quantities[foodId] || 0;
      setQuantity(foodId, current + qty);
    });
    closeModal("suggestionModal");
  });

  openModal("suggestionModal");
}

/* ------------------------------------------------------------
   12. MODALES
   ------------------------------------------------------------ */
function openModal(id) {
  document.getElementById(id).classList.add("open");
  document.body.classList.add("modal-open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
  document.body.classList.remove("modal-open");
}

/* ------------------------------------------------------------
   13. INICIALIZACIÓN
   ------------------------------------------------------------ */
function init() {
  loadDraft();
  renderFoodGrid();
  renderSummary();
  renderSavedRecipes();

  document.getElementById("generateMealBtn").addEventListener("click", generateMeal);
  document.getElementById("copyListBtn").addEventListener("click", copyList);
  document.getElementById("saveRecipeBtn").addEventListener("click", saveCurrentAsRecipe);
  document.getElementById("resetBtn").addEventListener("click", resetAll);
  document.getElementById("loadExampleBtn").addEventListener("click", loadExample);
  document.getElementById("suggestBtn").addEventListener("click", suggestAdjustment);

  document.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll(".modal-backdrop").forEach((backdrop) => {
    backdrop.addEventListener("click", () => closeModal(backdrop.dataset.modal));
  });
}

document.addEventListener("DOMContentLoaded", init);
