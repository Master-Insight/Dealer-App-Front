
# 📘 Arquitectura Backend - Dealer App

Este documento resume la arquitectura del backend para una plataforma de gestión comercial automotriz, con foco en **escalabilidad**, **experiencia del asesor** y **simplicidad operativa**.

---

## ✅ Modelo General

- Gestión de vehículos como productos comerciales
- Citas y gestiones asociadas a clientes
- Control por roles
- Multi-empresa (configurable)

---

## 🧱 Entidades del Sistema y Consideraciones

---

### 1️⃣ Users (usuarios del sistema)

#### 🧩 Propósito

Representan asesores, administradores y root con acceso a la plataforma.

#### ⭐ Consideraciones importantes

- Dependen del sistema de autenticación externo (Supabase Auth)
- Guardar **solo perfil + rol** aquí
- Cada usuario pertenece a **1 empresa** (recomendado para MVP)
  - Multi-empresa se puede agregar luego con tabla relacional

| Campo | Tipo | Notas |
|------|------|------|
| id | uuid | referencia auth |
| company_id | FK companies | ✅ control de acceso |
| email | string | único |
| role | enum(root, admin, user) | permisos backend |
| nombre | string |
| teléfono | string |
| activo | boolean | deshabilitar cuenta sin borrar |

---

### 2️⃣ Companies (concesionarias u organizaciones)

#### 🧩 Propósito

Permiten **multi-tenancy** (cada empresa ve solo lo suyo)

#### ⭐ Consideraciones

- Requerido incluso aunque por ahora haya una sola empresa
- Futuro: marketplace con múltiples concesionarias

| Campo | Tipo |
|------|------|
| id | uuid |
| nombre | string |
| teléfono | string |
| dirección | string |
| logo_url | string |

---

### 3️⃣ Clients (clientes)

#### 🧩 Propósito

Guardar referencias de clientes para:
✅ Reusar datos  
✅ Ver historial de operaciones  
✅ Búsquedas por DNI/email  
✅ Estadísticas por asesor

#### ⭐ Consideraciones

- No requerir CUIL ni todos los datos completos para facilitar carga
- DNI o teléfono como campos de referencia

| Campo | Tipo | Notas |
|------|------|------|
| id | uuid |
| company_id | FK companies |
| nombre | string |
| email | string |
| teléfono | string |
| dni | string | opcional pero útil para historial |
| creado_en | timestamp |

---

### 4️⃣ Products (vehículos)

#### 🧩 Propósito

Listado de vehículos comerciales

#### ⭐ Consideraciones

- Al cambiar de gestión → solo se actualiza el vínculo en `deals`
- Estados controlan disponibilidad visual

| Campo | Tipo |
|------|------|------|
| id | uuid |
| empresa_id | FK companies |
| nombre | string |
| descripción | text |
| precio | numeric |
| estado | enum(disponible, reservado, vendido, baja) |
| creado_en | timestamp |

---

### 5️⃣ Product Photos

#### ⭐ Consideraciones

- Orden permite mostrar portada primero
- Se almacenan en Supabase Storage

| Campo | Tipo |
|------|------|
| id | uuid |
| producto_id | FK products |
| url | string |
| orden | int |

---

### 6️⃣ Deals (Gestiones/Citas)

#### 🧩 Propósito

Registro de cada oportunidad comercial

#### ⭐ Consideraciones

- Agenda del asesor
- Se puede vincular o no a un producto
- Cliente vinculado por FK, no datos duros

| Campo | Tipo | Notas |
|------|------|------|
| id | uuid |
| empresa_id | FK companies |
| asesor_id | FK users |
| producto_id | FK products (opcional) |
| cliente_id | FK clients |
| fecha_hora | datetime |
| estado | enum(pendiente, asignada, realizada, perdida, en_cobro) |
| notas | text |

---

### 7️⃣ Deal Notes (Comentarios)

#### 🧩 Propósito

Historial interno por gestión

| Campo | Tipo |
|------|------|
| id | uuid |
| deal_id | FK deals |
| user_id | FK users |
| texto | text |
| fecha | timestamp |

---

### 8️⃣ Quotations (Opcional)

#### ⭐ Consideraciones

- Se puede usar sin producto para presupuestos de financiación

| Campo | Tipo |
|------|------|
| id | uuid |
| deal_id | FK deals (opcional) |
| producto_id | FK products (opcional) |
| monto | numeric |
| vencimiento | date |

---

## 🔁 Relaciones

- Company 1:N Users
- Company 1:N Clients
- Company 1:N Products
- Products 1:N Deals
- Deals 1:N Deal_Notes
- Products 1:N Photos
- Clients 1:N Deals

---

## 🧩 Roles y Permisos

| Acción | Root | Admin | Usuario |
|--------|------|-------|--------|
| CRUD Productos | ✅ | ✅ | ❌ |
| CRUD Gestiones | ✅ | ✅ | ✅ propias |
| Ver gestiones de todos | ✅ | ✅ | ❌ |
| Enviar Email Cita | ✅ | ✅ | ✅ |
| Gestión Agenda | ✅ | ✅ | ✅ |
| CRUD Usuarios | ✅ | ✅ (solo su empresa) | ❌ |
| CRUD Clientes | ✅ | ✅ | ✅ |
| Ver estadísticas | ✅ | ✅ | ❌ |

---

## 🎯 Acciones del Administrador

- Crear usuarios con rol "asesor"
- Ver gestiones de todos los asesores
- Modificar estado de productos
- Asignar producto en gestión
- Crear/editar clientes
- Reprogramar citas
- Ver estadísticas de rendimiento
- Enviar emails automáticos a clientes

---

## 🧠 UX de Carga Simple (punto crítico)

✔ Cliente se crea **mínimo** con nombre + teléfono  
✔ DNI opcional pero recomendado  
✔ Auto-completar si ya existe  
✔ Gestor no necesita entender estados complejos  
✔ Backend controla disponibilidad

---

## 📩 Integraciones MVP

- Supabase Auth → login, roles
- Supabase Storage → fotos
- Resend → confirmaciones email
- WhatsApp (fase 2)

---

## ✅ Orden de Implementación Recomendado

| Fase | Funcionalidades |
|------|----------------|
| MVP | Users + Clients + Products + Deals |
| Fase 2 | Quotations + Estadísticas + WhatsApp |

---
