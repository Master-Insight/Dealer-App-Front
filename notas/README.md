# DealerApp Logo Pack (from provided SVG)

Este paquete se generó a partir del SVG original provisto. Todas las variantes mantienen:
- **viewBox flexible** (sin `width/height`)
- **fondo transparente**
- **proporciones exactas** del diseño original
- **texto trazado** (según el SVG provisto)
- **versiones horizontales y apiladas**
- **colores fijos y variables**

## 🎨 Paleta
- Deep: `#0A2540`
- Blue: `#2D8EFF`
- Green: `#32D583`
- White: `#FFFFFF`

## 📁 Estructura
- `fixed-colors/`
  - `horizontal/` → composiciones horizontales
  - `stacked/` → composiciones en lienzo cuadrado (centradas y escaladas)
  - `icons/` → isotipo (solo auto)
- `css-variables/`
  - `horizontal/dealerapp-motion_variable.svg` → usa `var(--brand)` y `var(--fg)`
  - `stacked/dealerapp-motion_variable.svg`
  - `icons/dealerapp-icon_variable.svg`

## 🧩 Ejemplo Tailwind (horizontal principal)
```html
<header class="flex items-center justify-between px-6 py-3 bg-[#0A2540] text-white">
  <div class="flex items-center gap-3">
    <img src="/dealerapp-logo-pack-v2/fixed-colors/horizontal/dealerapp-motion_blue.svg"
         alt="DealerApp logo" class="h-10 w-auto" />
    <span class="text-xl font-semibold">DealerApp</span>
  </div>
  <button class="bg-[#2D8EFF] hover:bg-[#32D583] text-white font-medium px-4 py-2 rounded-lg transition">
    Ingresar
  </button>
</header>
```

## 🌈 Variables CSS
```css
:root {
  --brand: #2D8EFF;
  --fg: #FFFFFF;
}
[data-theme="green"] {
  --brand: #32D583;
}
```
```html
<img src="/dealerapp-logo-pack-v2/css-variables/horizontal/dealerapp-motion_variable.svg"
     class="h-10 w-auto" alt="DealerApp logo variable"/>
```

> Nota: Si necesitás un ajuste fino del **isotipo** (p.ej. aislar curvas adicionales),
> indicá qué paths corresponden al auto en el SVG base y lo ajusto.
