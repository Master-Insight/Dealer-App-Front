# 🎨 Plan de Implementación por Etapas - Frontend Dealer App

Este documento define la **arquitectura y fases de desarrollo del frontend** de Dealer App, alineado con la estructura del backend y con una visión escalable hacia una futura **App híbrida (AppCel / React Native)**.

---

## 🧱 Stack Tecnológico Base

| Tecnología | Rol | Motivo de elección |
|-------------|-----|--------------------|
| **React 19 + Vite** | Framework base | Rápido, modular, compatible con AppShell |
| **TailwindCSS 4 + Radix UI** | UI y componentes accesibles | Estilo consistente y moderno |
| **TanStack Router / Query / Form** | Routing, data-fetching y formularios | Cohesión de datos y rutas tipadas |
| **Zod** | Validación de schemas | Seguridad de datos y tipado fuerte |
| **TypeScript 5** | Tipado estricto | Prevención de errores y mantenibilidad |
| **Vitest + Testing Library** | Pruebas unitarias | Cobertura fiable |
| **pnpm** | Gestor de paquetes | Rápido, eficiente y moderno |

---

## 🧩 Estructura de Carpetas Propuesta

```
dealerapp-front/
├─ src/
│  ├─ api/              # Clientes para llamadas al backend (FastAPI)
│  ├─ components/       # Componentes UI reutilizables
│  ├─ features/         # Módulos funcionales (users, clients, deals...)
│  ├─ hooks/            # Custom hooks globales
│  ├─ layouts/          # Layouts principales (auth, dashboard...)
│  ├─ pages/            # Entradas de rutas (TanStack Router)
│  ├─ store/            # Estado global (React Store)
│  ├─ styles/           # Tailwind config + estilos globales
│  ├─ utils/            # Helpers y validaciones comunes
│  └─ main.tsx          # Punto de entrada principal
├─ public/
├─ vite.config.ts
└─ tsconfig.json
```

---

## 🧩 Etapas de Desarrollo

| Etapa | Objetivo | Descripción |
|-------|-----------|-------------|
| **Fase 0 - Setup Base** | Infraestructura inicial | Configurar entorno, router, tema, autenticación base |
| **Fase 1 - MVP** | Flujo comercial básico | Login, dashboard, CRUD de clientes, productos y gestiones |
| **Fase 2 - UX avanzada** | Mejora visual y productividad | Formularios dinámicos, notificaciones, vistas de detalle |
| **Fase 3 - Integraciones** | Comunicación externa | Emails, WhatsApp, estadísticas en tiempo real |
| **Fase 4 - AppShell / Mobile Ready** | Convertibilidad a App | Estructura híbrida para PWA / React Native |

---

## 🧠 Fases Detalladas

### 🏁 **Fase 0 – Setup Inicial**

- Inicializar proyecto con Vite + React + TS  
- Configurar TailwindCSS 4 + Radix UI  
- Estructurar carpetas por dominio funcional  
- Configurar router (`@tanstack/react-router`)  
- Integrar autenticación básica con Supabase Auth  
- Definir `env` con `@t3-oss/env-core`  
- Estilos base + tipografía + tema claro/oscuro  

---

### 🚧 **Fase 1 – MVP Comercial**

- **Login / Logout / Protected Routes**  
- **Dashboard inicial**: vista resumen de gestiones y productos  
- **CRUD Clientes:**  
  - Crear cliente (nombre + teléfono mínimos)  
  - Autocompletar si ya existe  
- **CRUD Productos:**  
  - Listado + formulario simple  
  - Estado visual (`disponible`, `vendido`, etc.)  
- **CRUD Gestiones (Deals):**  
  - Listado + agenda + notas básicas  
  - Filtros por asesor, cliente o producto  
- **Store global (React Store)** para sesión y empresa activa  

---

### 💡 **Fase 2 – UX Avanzada**

- Formularios dinámicos con **TanStack Form + Zod**  
- Toasts y modales (Radix + Tailwind)  
- **Gestión de fotos** con Supabase Storage (upload y preview)  
- **Notificaciones visuales** (estados y alertas)  
- **Vistas detalladas** para cliente, producto y gestión  
- **Modo responsive completo**  
- **Lazy loading / Suspense** para mejorar rendimiento  

---

### 🌐 **Fase 3 – Integraciones**

- Envío de emails de confirmación (Resend API)  
- Integración con backend WhatsApp (fase 3 backend)  
- **Dashboards con TanStack Table + Chart.js/Recharts**  
- **Filtros avanzados y búsqueda global**  
- **Exportar CSV / PDF** (cotizaciones o clientes)  

---

### 📱 **Fase 4 – AppShell / Mobile Ready**

- Reorganización de layout tipo AppShell (sidebar + header fijo)  
- Compatibilidad PWA (manifest + service worker)  
- Pruebas en entorno móvil (Touch/ScreenSize)  
- Base lista para **port a React Native / Expo**  
- Soporte offline básico (cache localStorage + SW)  

---

## ⚙️ Infraestructura Complementaria

| Herramienta | Uso | Etapa |
|--------------|-----|--------|
| **Supabase Auth** | Sesión y tokens | Fase 0 |
| **Supabase Storage** | Imágenes de productos | Fase 2 |
| **Resend** | Emails | Fase 3 |
| **FastAPI Backend** | API REST principal | Fase 1 |
| **Vitest / Testing Library** | Unit tests y componentes | Fase 1-4 |
| **AppShell (PWA / Expo)** | App híbrida | Fase 4 |

---

## 🧩 Flujo de Navegación MVP

```
Login → Dashboard → [Clientes | Productos | Gestiones]
                      ↳ Crear / Editar / Ver detalle
```

---

## 🎯 Objetivos de UX

- Carga mínima de datos obligatorios  
- Formularios con validación visual inmediata  
- Feedback constante (toasts, loading states)  
- Tipografía legible y accesible  
- Interfaz limpia, adaptable y centrada en tareas  

---

## 📆 Orden de Implementación Recomendado

1. **Setup Base (Fase 0)**  
2. **Login + Dashboard + CRUD básicos (Fase 1)**  
3. **Fotos, notificaciones, UX avanzada (Fase 2)**  
4. **Integraciones externas y analítica (Fase 3)**  
5. **AppShell / Mobile + PWA (Fase 4)**  

---

## 🔄 Futuras Extensiones

- Chat interno entre asesores  
- Modo “Cliente” con acceso limitado  
- Integración con calendarios externos  
- Envío automático de reportes PDF  
- Widgets embebibles (iframe o link público)  

---

## 💡 Sugerencias Técnicas

- Mantener la interfaz modular y desacoplada (cada `feature` independiente)  
- Evitar dependencia excesiva en Supabase client-side → usar backend como proxy  
- Priorizar componentes Radix + Tailwind para mantener coherencia visual  
- Implementar skeletons y placeholders para UX fluida  

---

## ✅ Resultado Esperado del MVP

- Login funcional con control de roles  
- CRUD clientes, productos y gestiones operativo  
- UI consistente, responsiva y accesible  
- Comunicación estable con backend FastAPI vía REST  
- Base sólida para expansión a App híbrida

---
