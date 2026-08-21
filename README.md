# 🍽 NutriPlan

Planificador personal de alimentación diaria. Ajusta cantidades de
alimentos con sliders hasta cuadrar tus objetivos de calorías y
macronutrientes. 100% estático (HTML + CSS + JS vanilla), sin
backend, sin base de datos, sin login. Todo corre en tu navegador y
lo que guardes (recetas, tu progreso actual) se queda en
`localStorage`, solo en tu dispositivo.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser privado).
2. Sube estos 4 archivos a la raíz del repositorio:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. En el repositorio, ve a **Settings → Pages**.
4. En **Source**, elige **Deploy from a branch**.
5. En **Branch**, elige `main` (o la que uses) y la carpeta `/root`.
6. Guarda. Después de uno o dos minutos, GitHub te dará una URL
   como `https://tu-usuario.github.io/tu-repositorio/`.

También puedes usarlo sin subir nada a internet: descarga los 4
archivos en una misma carpeta y abre `index.html` directamente en
tu navegador.

## Qué puedes modificar y dónde

Todo lo personalizable vive en la parte de arriba de `script.js`,
dentro de dos bloques: `CONFIG` y `FOODS`.

### 1. Tus objetivos diarios

En `script.js`, dentro de `CONFIG.goals`:

```js
goals: {
  calories: 3450,
  protein: 195,
  carbs: 525,
  fat: 80,
},
```

Cambia estos números por tus propios objetivos.

### 2. Rangos de cumplimiento

También en `CONFIG`, dentro de `complianceRanges`. Cada macro tiene
un rango en `%` del objetivo dentro del cual se considera
"cumplido":

```js
complianceRanges: {
  calories: [100, 105],
  protein: [100, 110],
  carbs: [95, 105],
  fat: [90, 110],
},
```

`nearThresholdPoints` controla a cuántos puntos porcentuales de
distancia del rango algo se muestra como 🟡 "cerca del objetivo" en
vez de 🔴 "fuera del objetivo".

### 3. Alimentos y valores nutricionales

En el arreglo `FOODS`, cada alimento es un objeto:

```js
{
  id: "arroz", name: "Arroz cocido", emoji: "🍚",
  baseAmount: 100, unit: "g", baseLabel: "100 g",
  kcal: 130, protein: 2.7, carbs: 28, fat: 0.3,
  min: 0, max: 1000, step: 25,
},
```

- `baseAmount` + `kcal/protein/carbs/fat`: los valores nutricionales
  corresponden a esa cantidad base (ej. "por 100 g" o "por 1
  pieza"). Todos los cálculos se derivan de ahí con una regla de
  tres, así que basta con cambiar estos números.
- `unit` / `baseLabel`: solo afectan el texto que se muestra.
- `min`, `max`, `step`: controlan el rango y los incrementos del
  slider (y de los botones `−` / `+`) para ese alimento.

Para **agregar un alimento nuevo**, copia uno de los objetos,
cámbiale el `id` (único, sin espacios) y sus valores. Aparecerá
automáticamente como una tarjeta más — no hay que tocar el HTML ni
el CSS.

Para **quitar un alimento**, elimina su objeto del arreglo.

### 4. Combinación de ejemplo ("⚡ Cargar ejemplo")

Justo debajo de `FOODS`, en `EXAMPLE_COMBO`, puedes definir qué
cantidades se cargan al presionar ese botón.

## Estructura del proyecto

```
/index.html   → estructura de la página (contenedores vacíos; el
                contenido real —tarjetas, resumen— lo genera script.js)
/style.css    → todo el diseño visual, mobile-first
/script.js    → configuración, datos nutricionales y toda la lógica
/README.md    → este archivo
```

## Funciones incluidas

- Panel resumen siempre visible con calorías/proteína/carbohidratos/
  grasas, barra de progreso (con la "zona de cumplimiento" marcada
  sobre la barra) y lo que falta para cada meta.
- Estado de cumplimiento explícito: no basta con "100%", cada macro
  debe caer dentro de su propio rango tolerado.
- Semáforo 🟢🟡🔴 con texto además de color, por accesibilidad.
- "🍽 Generar mi comida": lista limpia de lo que tiene cantidad > 0.
- "📋 Copiar lista": copia un resumen en texto plano listo para
  pegar en WhatsApp, Notas u Obsidian.
- "💾 Guardar receta": guarda combinaciones completas en
  `localStorage` (cargar, renombrar, eliminar).
- "↺ Restablecer" y "⚡ Cargar ejemplo".
- "✨ Sugerir ajuste": sugiere qué alimentos añadir para acercarte a
  tus objetivos — nunca cambia tus cantidades automáticamente, tú
  decides si aplicar la sugerencia.
- Tus cantidades actuales se guardan automáticamente en
  `localStorage` mientras las editas, así que si recargas la página
  no las pierdes (esto es independiente de "Guardar receta", que es
  para combinaciones que quieres conservar a propósito).

## Privacidad

La página no tiene autenticación ni envía datos a ningún servidor.
Todo el cálculo ocurre en tu navegador y lo único que se guarda
(recetas y tu progreso actual) vive en el `localStorage` de tu
propio dispositivo — nadie más lo ve, ni siquiera si publicas el
repositorio como público, porque el código no contiene ningún dato
personal tuyo.
