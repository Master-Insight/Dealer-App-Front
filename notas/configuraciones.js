Paleta(Opción 1)

--da - deep: #0A2540(fondo / primario oscuro)

--da - blue: #2D8EFF(primario / CTA)

--da - gray: #F5F6FA(fondo claro)

--da - white: #FFFFFF(texto sobre oscuro)

--da - green: #32D583(éxito / acento)

Tokens Tailwind(sugeridos)

Agregalos en tu tailwind.config.js:

// tailwind.config.js
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        dealer: {
          deep: '#0A2540',
          blue: '#2D8EFF',
          gray: '#F5F6FA',
          white: '#FFFFFF',
          green: '#32D583',
        },
        // Semánticos (recomendado)
        bg: {
          DEFAULT: 'var(--bg)',
          soft: 'var(--bg-soft)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          muted: 'var(--fg-muted)',
        },
        brand: {
          DEFAULT: 'var(--brand)',
          alt: 'var(--brand-alt)',
          accent: 'var(--brand-accent)',
        },
      },
      boxShadow: {
        soft: '0 6px 24px rgba(10,37,64,0.12)',
      },
      borderRadius: {
        xl2: '1rem',
      },
    },
  },
  plugins: [],
}


Variables CSS(claro / oscuro):

/* tokens.css */
:root {
  --bg: #F5F6FA;        /* dealer.gray */
  --bg - soft: #FFFFFF;   /* dealer.white */
  --fg: #0A2540;        /* dealer.deep */
  --fg - muted: #334e68;  /* derivado */
  --brand: #2D8EFF;     /* dealer.blue (auto azul) */
  --brand - alt: #32D583; /* dealer.green (auto verde) */
  --brand - accent: #2D8EFF;
}

: root.dark, [data - theme="dark"] {
  --bg: #0A2540;        /* dealer.deep */
  --bg - soft: #0f3157;   /* tono */
  --fg: #FFFFFF;        /* dealer.white */
  --fg - muted: #D1D5DB;  /* gris claro */
  --brand: #2D8EFF;     /* auto azul por defecto */
  --brand - alt: #32D583; /* auto verde alternativo */
  --brand - accent: #32D583;
}


Uso rápido en front:

< !--Ejemplo: elegir auto azul o verde-- >
  <div class="bg-bg text-fg p-6 rounded-xl2 shadow-soft">
    <img src="/assets/dealerapp-motion_dark-blue.svg" class="h-10 dark:block hidden" alt="DealerApp logo dark blue" />
    <img src="/assets/dealerapp-motion_light-blue.svg" class="h-10 dark:hidden" alt="DealerApp logo light blue" />
  </div>


Si querés, también te exporto versiones monocromáticas y solo isotipo(auto) para favicon, barra lateral y splash.