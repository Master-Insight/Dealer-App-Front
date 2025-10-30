# 🚀 Plan de Implementación por Etapas - Backend Dealer App

Este documento detalla las **etapas progresivas de implementación** del backend, priorizando un **MVP funcional**, seguido por fases de expansión con **mayor automatización, control y analítica**.

---

## 🧩 Estructura General de Etapas

| Etapa | Objetivo principal | Descripción |
|-------|--------------------|--------------|
| **Fase 0 - Setup Base** | Infraestructura inicial | Configuración de entorno, Supabase, FastAPI y estructura modular |
| **Fase 1 - MVP** | Primer flujo usable | CRUD básico: usuarios, clientes, productos y gestiones |
| **Fase 2 - Expansión Operativa** | Mayor control y trazabilidad | Roles avanzados, fotos, estadísticas, cotizaciones, emails |
| **Fase 3 - Integraciones y Escalabilidad** | Automatización e integraciones externas | WhatsApp, dashboards, multicompañía |
| **Fase 4 - Optimización** | Rendimiento y mantenimiento | Tests, validaciones, optimización de consultas y seguridad |

---

## 🧱 Entidades y Fases de Desarrollo

### 1️⃣ Users (Usuarios del sistema) — **Fase 0 / Fase 1**

- **Fase 0**  
  - Conexión Supabase Auth  
  - Modelo base `user_profiles`  
  - Middleware de autenticación (`get_current_user`)  
- **Fase 1**  
  - CRUD usuarios (admin/root)  
  - Control por `role`  
  - Asociación con `company_id`  
- **Fase 2**  
  - Activar/desactivar usuarios  
  - Logs de actividad  
  - Posible relación N:M con compañías (si se habilita multiempresa)  

---

### 2️⃣ Companies (Compañías) — **Fase 0 / Fase 3**

- **Fase 0**  
  - Tabla base con `id`, `nombre`, `teléfono`, `dirección`  
- **Fase 3**  
  - Control multiempresa (usuarios ven solo su empresa)  
  - Configuraciones de branding (logo, color, etc.)  
  - Filtros y dashboards por empresa  

---

### 3️⃣ Clients (Clientes) — **Fase 1**

- CRUD básico (nombre + teléfono obligatorios)  
- Búsqueda por DNI o email  
- Asociación con `company_id`  
- Historial de operaciones (relación con `deals`)  
- **Fase 2:**  
  - Enriquecer ficha cliente (más datos, validaciones, notas internas)  
  - Exportación CSV o a Google Sheets  

---

### 4️⃣ Products (Vehículos) — **Fase 1**

- CRUD básico (nombre, descripción, precio, estado)  
- Filtrado por `estado` y `empresa_id`  
- **Fase 2:**  
  - Control de disponibilidad en `deals`  
  - Integración con fotos (`product_photos`)  
  - Búsqueda avanzada por atributos  

---

### 5️⃣ Product Photos — **Fase 2**

- Carga y almacenamiento en Supabase Storage  
- Control de orden (portada, galería)  
- Enlace FK con `products`  
- Endpoint de actualización / eliminación  

---

### 6️⃣ Deals (Gestiones o Citas) — **Fase 1**

- CRUD básico  
- Campos: `asesor_id`, `cliente_id`, `producto_id`, `estado`, `notas`, `fecha_hora`  
- Validación de acceso por usuario (solo ve sus gestiones)  
- **Fase 2:**  
  - Agenda visual (por fechas y asesor)  
  - Envío de confirmaciones por email (Resend)  
  - Estado automático según actividad  

---

### 7️⃣ Deal Notes — **Fase 2**

- Registro histórico de comentarios internos  
- FK con `deal_id` y `user_id`  
- Endpoint tipo `/deals/{id}/notes`  

---

### 8️⃣ Quotations (Presupuestos) — **Fase 3**

- CRUD cotizaciones vinculadas a `deal` o `product`  
- Campos: `monto`, `vencimiento`, `producto_id`, `deal_id`  
- **Fase 3:**  
  - Exportación PDF  
  - Envío automático por email  
  - Integración con planes financieros  

---

## ⚙️ Infraestructura y Servicios

| Componente | Descripción | Fase |
|-------------|--------------|------|
| **Supabase Auth** | Autenticación y control de roles | Fase 0 |
| **Supabase Storage** | Fotos de productos | Fase 2 |
| **Resend** | Envío de emails (confirmaciones) | Fase 2 |
| **WhatsApp (API)** | Notificaciones y confirmaciones | Fase 3 |
| **FastAPI + Pydantic** | Validaciones y endpoints | Fase 0 |
| **PostgreSQL (Supabase)** | Persistencia principal | Fase 0 |
| **Tests + CI/CD** | Validaciones automáticas | Fase 4 |

---

## 🧠 Roles y Permisos por Etapa

| Acción | Fase | Root | Admin | Usuario |
|--------|------|------|-------|----------|
| Login / Auth | 0 | ✅ | ✅ | ✅ |
| CRUD Usuarios | 1 | ✅ | ✅ (solo su empresa) | ❌ |
| CRUD Clientes | 1 | ✅ | ✅ | ✅ |
| CRUD Productos | 1 | ✅ | ✅ | ❌ |
| CRUD Gestiones | 1 | ✅ | ✅ | ✅ propias |
| Ver todas las gestiones | 2 | ✅ | ✅ | ❌ |
| Fotos de productos | 2 | ✅ | ✅ | ❌ |
| Email citas | 2 | ✅ | ✅ | ✅ |
| Estadísticas / dashboards | 3 | ✅ | ✅ | ❌ |
| WhatsApp | 3 | ✅ | ✅ | ✅ |

---

## 📆 Orden de Desarrollo Detallado

### 🏁 **Fase 0 – Setup Inicial**

- Estructura FastAPI modular  
- Configuración Supabase y variables `.env`  
- Configuración de rutas `app/modules/routes.py`  
- Middleware de autenticación y excepciones personalizadas  

### 🚧 **Fase 1 – MVP Operativo**

- CRUD Usuarios / Clientes / Productos / Deals  
- Roles básicos (root, admin, user)  
- Validaciones de acceso  
- Relaciones FK entre tablas principales  
- Tests iniciales de endpoints   (Manuales por Postman)

### 🔄 **Fase 2 – Expansión Operativa**

- Fotos de productos  
- Notas en gestiones  
- Emails automáticos con Resend  
- Mejora en búsqueda y filtros  
- Estado dinámico de gestiones  
- Exportaciones (CSV, PDF)  

### 🌐 **Fase 3 – Integraciones**

- Modo multiempresa  
- Integración WhatsApp API  
- Dashboard analítico (ventas, citas, productos)  
- Cotizaciones avanzadas  

### 🧩 **Fase 4 – Optimización**

- Logging avanzado  
- Auditoría y trazabilidad  
- Refactor de consultas SQL  
- Tests unitarios y CI/CD  
