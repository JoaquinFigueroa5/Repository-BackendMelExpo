# Plan de Migración: Mock → API (Frontend)

## Objetivo

Migrar todo el frontend de datos mock/estáticos a datos dinámicos provenientes de la API del backend, eliminando progresivamente los archivos de datos falsos y conectando cada vista con su hook correspondiente de React Query.

## Stack

- React 18 + TypeScript (Vite)
- @tanstack/react-query para fetching y cache
- axios para llamadas HTTP
- Tailwind CSS v4 + shadcn/ui

---

## Fase 0 — Tipos y Mappers

**Objetivo:** Asegurar que los tipos del frontend coincidan con los del backend y existan funciones mapper para transformar datos de API al formato local usado en el state.

### Archivos a modificar/crear

#### `src/app/types/index.ts`

Agregar interfaces faltantes que devuelve el backend:

```typescript
export interface ApiCareer {
  id: number
  name: string
  color?: string
  icon?: string
}

export interface ApiCategory {
  id: number
  name: string
  icon?: string
  color?: string
}

export interface ApiLoan {
  id: number
  userId: number
  toolId: number
  requestId: number
  qty: number
  loanDate: string
  dueDate: string
  returnDate?: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  user?: { name: string; carnet?: string }
  tool?: { name: string }
}

export interface ApiRequest {
  id: number
  userId: number
  toolId: number
  qty: number
  startDate: string
  endDate: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
  user?: { name: string; carnet?: string }
  tool?: { name: string }
}

export interface ApiTool {
  id: number
  name: string
  description?: string
  categoryId: number
  categoryName?: string
  totalQty: number
  availableQty: number
  location?: string
  photo?: string
  status: string
  careers?: number[]
  createdAt: string
  updatedAt: string
}

export interface ApiNotification {
  id: number
  userId: number
  title: string
  message: string
  type?: string
  read: boolean
  createdAt: string
}

export interface ApiUser {
  id: number
  name: string
  email: string
  password?: string
  role: string
  carnet?: string
  career?: string
  phone?: string
  photo?: string
  workshop?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type AuthResponse = {
  user: ApiUser
  token: string
  code?: string
}

export type VerifyMode = 'register' | 'reset'
```

#### `src/lib/mappers.ts` (CREAR)

Funciones para transformar datos de API al formato de los componentes locales:

```typescript
import type { Tool, Loan, AdminReq } from '../app/types'

export function mapApiToolToTool(api: any): Tool {
  return {
    id: api.id,
    name: api.name,
    category: api.categoryName || '',
    total: api.totalQty,
    available: api.availableQty,
    location: api.location || '',
    status: api.status as Tool['status'],
    image: api.photo || '',
    careers: api.careers || [],
    description: api.description || '',
  }
}

export function mapApiLoanToLoan(api: any): Loan {
  const start = new Date(api.loanDate || api.startDate)
  const end = new Date(api.dueDate || api.endDate)
  return {
    id: api.id,
    toolId: api.toolId,
    toolName: api.tool?.name || '',
    borrower: api.user?.name || '',
    career: api.user?.career || '',
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    status: api.status as Loan['status'],
    qty: api.qty || 1,
    notes: api.notes || '',
    returnDate: api.returnDate || '',
    days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  }
}

export function mapApiRequestToAdminReq(api: any): AdminReq {
  return {
    id: api.id,
    toolId: api.toolId,
    userId: api.userId,
    toolName: api.tool?.name || '',
    borrower: api.user?.name || '',
    career: api.user?.career || '',
    date: new Date(api.createdAt).toISOString().split('T')[0],
    status: api.status as AdminReq['status'],
    qty: api.qty || 1,
    startDate: new Date(api.startDate).toISOString().split('T')[0],
    endDate: new Date(api.endDate).toISOString().split('T')[0],
    notes: api.notes || '',
  }
}

export function mapApiCareerToCareer(api: any): { name: string; icon: string; color: string } {
  return {
    name: api.name,
    icon: api.icon || '🎓',
    color: api.color || '#6B7280',
  }
}

export function mapApiCategoryToCategory(api: any): string {
  return api.name
}
```

---

## Fase 1 — AppContext: State inicial vacío y fetch centralizado

**Objetivo:** Eliminar datos mock del state inicial. Mover la sincronización de datos al AppProvider usando los hooks existentes.

### Archivo: `src/app/context/AppContext.tsx`

#### 1a. State inicial vacío

| Campo | Antes | Después |
|-------|-------|---------|
| `tools` | `TOOLS0` (mock) | `[]` |
| `loans` | `LOANS0` (mock) | `[]` |
| `adminReqs` | `ADMIN_REQS0` (mock) | `[]` |
| `categories` | `CATEGORIES_DEFAULT` (mock) | `[]` |
| `careers` | `CAREERS_DEFAULT` (mock) | `[]` |
| `favorites` | `[3, 7]` (mock) | `[]` |

#### 1b. Fetch centralizado en AppProvider

Agregar hooks dentro del `AppProvider` (después de `useMe()`):

```typescript
const { data: apiTools } = useTools()
const { data: apiMyLoans } = useMyLoans()
const { data: apiMyFavorites } = useMyFavorites()
const { data: apiAdminCategories } = useAdminCategories()
const { data: apiAdminCareers } = useAdminCareers()
```

Agregar `useEffect` por cada uno para sincronizar al state del contexto:

```typescript
useEffect(() => {
  if (apiTools) update({ tools: apiTools.map(mapApiToolToTool) })
}, [apiTools])

useEffect(() => {
  if (apiMyLoans) update({ loans: apiMyLoans.map(mapApiLoanToLoan) })
}, [apiMyLoans])

useEffect(() => {
  if (apiMyFavorites) update({ favorites: apiMyFavorites.map(t => t.id) })
}, [apiMyFavorites])

useEffect(() => {
  if (apiAdminCategories) update({ categories: apiAdminCategories.map(c => c.name) })
}, [apiAdminCategories])

useEffect(() => {
  if (apiAdminCareers) update({ careers: apiAdminCareers.map(mapApiCareerToCareer) })
}, [apiAdminCareers])
```

#### 1c. Eliminar funciones obsoletas del contexto

| Función | Motivo | Reemplazo |
|---------|--------|-----------|
| `getTool` | Búsqueda simple | `state.tools.find(t => t.id === id)` directo |
| `submitLoan` | Ya no aplica | `useCreateRequest().mutateAsync()` en LoanFormModal |
| `openLoanForm` | Mantener | Solo actualiza estado visual |
| `openToolDetail` | Mantener | Solo actualiza estado visual |

#### 1d. Eliminar importaciones mock

```typescript
// ELIMINAR:
import { TOOLS0, LOANS0, ADMIN_REQS0, CAREERS_DEFAULT, CATEGORIES_DEFAULT } from '../data/...'
```

---

## Fase 2 — Reemplazar CURRENT_USER por API User

**Objetivo:** Eliminar el mock `CURRENT_USER` de todas las vistas y usar el objeto `user` del contexto (poblado por `useMe()`).

### Archivo a crear: `src/app/context/useUser.ts`

Hook helper:

```typescript
import { useApp } from './AppContext'

export function useUser() {
  const { user } = useApp()
  if (!user) return { name: 'Usuario', career: '', carnet: '', email: '', phone: '', workshop: '' }
  return {
    name: user.name,
    career: user.career || '',
    carnet: user.carnet || '',
    email: user.email,
    phone: user.phone || '',
    workshop: user.workshop || '',
  }
}
```

### Archivos a modificar (6 archivos)

| Archivo | Cambio |
|---------|--------|
| `components/views/catalog/CatalogView.tsx` | `import { CURRENT_USER }` → `import { useUser }`; `CURRENT_USER.name[0]` → `u.name[0]` |
| `components/views/catalog/ToolModal.tsx` | `CURRENT_USER.career` → `u.career` |
| `components/views/catalog/LoanFormModal.tsx` | `CURRENT_USER.name` → `u.name`, etc. |
| `components/views/account/AccountView.tsx` | `CURRENT_USER.*` → `u.*` (6-8 referencias) |
| `components/views/admin/AdminView.tsx` | `CURRENT_USER.name[0]` → `u.name[0]` (o "A") |
| `components/views/Landing.tsx` | Revisar si usa CURRENT_USER |

---

## Fase 3 — CatalogView: Favoritos desde API

**Objetivo:** Reemplazar mutación directa de `state.favorites` por hooks `useAddFavorite()` y `useRemoveFavorite()`.

### Archivo: `components/views/catalog/CatalogView.tsx`

#### Cambios en favoritos (botón estrella)

```typescript
// Antes
onClick={e => {
  e.stopPropagation()
  const newFavs = state.favorites.includes(t.id)
    ? state.favorites.filter(id => id !== t.id)
    : [...state.favorites, t.id]
  update({ favorites: newFavs })
}}

// Después
const addFav = useAddFavorite()
const removeFav = useRemoveFavorite()

onClick={e => {
  e.stopPropagation()
  if (state.favorites.includes(t.id)) {
    removeFav.mutate(t.id)
  } else {
    addFav.mutate(t.id)
  }
}}
```

#### Resultados parciales (loans atrasados)

Datos de loans ya vienen sincronizados desde Fase 1. No requiere cambios adicionales.

---

## Fase 4 — ToolModal: Detalle y movimientos desde API

**Objetivo:** Mostrar historial de préstamos y movimientos desde API.

### Archivo: `components/views/catalog/ToolModal.tsx`

```typescript
// Agregar hooks
const { data: toolDetail } = useTool(t?.id || 0)
const { data: movements } = useToolMovements(t?.id || 0)

// Usar tool detail si está disponible
const tool = toolDetail ? mapApiToolToTool(toolDetail) : t
```

---

## Fase 5 — LoanFormModal: Confirmar user de API

**Objetivo:** Solo requiere cambios de Fase 2 (CURRENT_USER → useUser()). La lógica de `useCreateRequest()` ya está correcta.

---

## Fase 6 — AccountView: Todas las secciones desde API

**Objetivo:** Conectar cada sección de la cuenta con hooks en vez de state mock.

### Archivo: `components/views/account/AccountView.tsx`

#### AccountInicio (L21-80)
- `state.loans` → sincronizado via Fase 1 ✅
- `state.favorites` → sincronizado via Fase 1 ✅
- `CURRENT_USER.name` → `u.name` (Fase 2)

#### AccountLoans (L84-114)
- `state.loans` → sincronizado via Fase 1 ✅

#### AccountProfile (L117-141)
- `CURRENT_USER.*` → `u.*`
- Botón "Editar Perfil" → usar `useUpdateProfile()`:
```typescript
const updateProfile = useUpdateProfile()
// onClick: abrir modal de edición con mutateAsync
```

#### AccountCareer (L144-173)
- `CURRENT_USER.career` → `u.career`
- `state.tools` → sincronizado via Fase 1 ✅

#### AccountFavorites (L176-203)
- `state.favorites` → sincronizado via Fase 1 ✅

#### AccountSettings (L206-231)
- "Cambiar Contraseña" → conectar con hook `useChangePassword()` (de `useAuth.ts`)
- Notificaciones → conectar con `useNotifications()` y `useMarkAsRead()`
- Cerrar Sesión → ya funciona (llama a una función de AppContext)

---

## Fase 7 — AdminView: Todas las sub-vistas desde API

**Objetivo:** Migrar las 8 sub-vistas del panel de administración.

### Archivo: `components/views/admin/AdminView.tsx`

#### 7a. AdminPanel (L26-71) — Dashboard

```typescript
const { data: stats } = useAdminStats()
const available = stats?.available ?? 0
const inUse = stats?.inUse ?? 0
const maintenance = stats?.maintenance ?? 0
const pending = stats?.pendingReqs ?? 0

// Actividad reciente
const { data: allLoans } = useAllLoans()
```

#### 7b. AdminEstadisticas (L74-137) — Gráficas

```typescript
const { data: categories } = useAdminCategories()
const { data: tools } = useTools()
```

#### 7c. AdminReportes (L140-202) — Reportes

```typescript
const { data: topTools } = useTopTools()
const { data: loansByMonth } = useLoansByMonth()
const { data: delays } = useDelays()
const { data: activeUsers } = useActiveUsers()
```

#### 7d. AdminSolicitudes (L205-238)

```typescript
const { data: requests } = useAllRequests()
const approve = useApproveRequest()
const reject = useRejectRequest()

// Reemplazar mutaciones directas:
onClick={() => approve.mutate(r.id)}
onClick={() => reject.mutate({ id: r.id, comment: '' })}
```

#### 7e. AdminActivos (L241-273)

```typescript
const { data: activeLoans } = useAllLoans({ status: 'active' })
const returnLoan = useReturnLoan()

onClick={() => returnLoan.mutate({ id: l.id, returnDate: today() })}
```

#### 7f. AdminInventario (L276-318)

```typescript
const deleteTool = useDeleteTool()
onClick={() => { if (!confirm(...)) return; deleteTool.mutate(t.id) }}
```

#### 7g. AdminAgregar (L321-448)

```typescript
const createTool = useCreateTool()
const updateTool = useUpdateTool()

// Guardar:
if (isEdit) {
  updateTool.mutate({ id: ef.id, ...ef })
} else {
  createTool.mutate(ef)
}
```

#### 7h. AdminCarreras (L451-526)

```typescript
const { data: careers } = useAdminCareers()
const createCareer = useCreateCareer()
const deleteCareer = useDeleteCareer()

createCareer.mutate({ name: ..., color: ..., icon: ... })
deleteCareer.mutate(cr.id)
```

---

## Fase 8 — Eliminar archivos de datos mock

**Objetivo:** Remover todos los archivos de datos falsos y mover constantes visuales a un archivo de diseño.

### Archivos a ELIMINAR

| Archivo | Contenido |
|---------|-----------|
| `src/app/data/tools.ts` | `TOOLS0` — 12 herramientas mock con imágenes |
| `src/app/data/loans.ts` | `LOANS0`, `ADMIN_REQS0` — préstamos y solicitudes mock |
| `src/app/data/user.ts` | `CURRENT_USER`, `CAREERS_DEFAULT` — usuario y carreras mock |
| `src/app/data/categories.ts` | `CATEGORIES_DEFAULT`, `CAT_ICONS`, `CAT_COLORS` |

### Archivo a crear: `src/app/constants/design.ts`

Los CAT_ICONS y CAT_COLORS se usan en CatalogView, ToolModal y AdminView para lookup visual. Moverlos aquí:

```typescript
export const CAT_ICONS: Record<string, string> = {
  'Computación': '💻',
  'Mecánica': '⚙️',
  'Electricidad': '⚡',
  'Electrónica': '🔌',
  'Diseño': '🎨',
  'Industrial': '🏭',
}

export const CAT_COLORS: Record<string, string> = {
  'Computación': '#2563EB',
  'Mecánica': '#FF9F0A',
  'Electricidad': '#FFD60A',
  'Electrónica': '#30D158',
  'Diseño': '#BF5AF2',
  'Industrial': '#FF375F',
}
```

---

## Fase 9 — Notificaciones (nueva UI)

**Objetivo:** Implementar indicador visual de notificaciones no leídas y panel de notificaciones.

### Archivos a modificar/crear

| Archivo | Cambio |
|---------|--------|
| `CatalogView.tsx` | Agregar badge de notificaciones no leídas al lado del avatar |
| `AccountView.tsx` | Agregar sección de notificaciones, conectar `useNotifications()` |
| `components/views/account/NotificationsPanel.tsx` (CREAR) | Panel desplegable con lista de notificaciones |

### Hook a usar

```typescript
const { data: notifs } = useNotifications(true) // solo no leídas
const markRead = useMarkAsRead()
```

---

## Fase 10 — Limpieza final

**Objetivo:** Eliminar código muerto y verificar consistencia.

| Acción | Detalle |
|--------|---------|
| Eliminar funciones del AppState | `getTool`, `submitLoan` si aún existen |
| Verificar CURRENT_USER | Que no quede ninguna referencia en ningún archivo |
| Verificar imports mock | Que no quede `from '../data/...'` en ningún lado |
| Verificar constantes | CAT_ICONS/CAT_COLORS importados desde constants/design.ts |
| Verificar estado loading | Agregar spinners/skeletons en vistas que cargan datos |
| Prueba manual | Login → Catalog → Solicitar → Cuenta → Admin |

---

## Resumen de archivos afectados

| Fase | Archivos | Tipo |
|------|----------|------|
| 0 | 2 | types/index.ts, lib/mappers.ts |
| 1 | 1 | context/AppContext.tsx |
| 2 | 7 | useUser.ts (crear) + 6 vistas |
| 3 | 1 | CatalogView.tsx |
| 4 | 1 | ToolModal.tsx |
| 5 | 0 | LoanFormModal.tsx (solo Fase 2) |
| 6 | 1 | AccountView.tsx |
| 7 | 1 | AdminView.tsx |
| 8 | 5 | Eliminar 4 + crear constants/design.ts |
| 9 | 2-3 | NotificationsPanel.tsx (crear) + vistas |
| **Total** | **~25 archivos** | |

---

## Backend: Confirmación de endpoints

| Ruta | Método | Hook frontend | Estado backend |
|------|--------|---------------|----------------|
| `/auth/register` | POST | useAuth().register | ✅ Listo |
| `/auth/login` | POST | useAuth().login | ✅ Listo |
| `/auth/me` | GET | useMe() | ✅ Listo |
| `/tools` | GET | useTools() | ✅ Listo |
| `/tools/:id` | GET | useTool() | ✅ Listo |
| `/tools/:id/movements` | GET | useToolMovements() | ✅ Listo |
| `/requests` | POST | useCreateRequest() | ✅ Listo |
| `/requests` | GET | useAllRequests() | ✅ Listo |
| `/requests/:id/approve` | PATCH | useApproveRequest() | ✅ Listo |
| `/requests/:id/reject` | PATCH | useRejectRequest() | ✅ Listo |
| `/user/loans` | GET | useMyLoans() | ✅ Listo |
| `/loans` | GET | useAllLoans() | ✅ Listo |
| `/loans/:id/return` | PATCH | useReturnLoan() | ✅ Listo |
| `/user/favorites` | GET | useMyFavorites() | ✅ Listo |
| `/user/favorites/:toolId` | POST | useAddFavorite() | ✅ Listo |
| `/user/favorites/:toolId` | DELETE | useRemoveFavorite() | ✅ Listo |
| `/user/profile` | PUT | useUpdateProfile() | ✅ Listo |
| `/user/requests` | GET | useMyRequests() | ✅ Listo |
| `/admin/stats` | GET | useAdminStats() | ✅ Listo |
| `/admin/users` | GET | useAdminUsers() | ✅ Listo |
| `/admin/careers` | GET | useAdminCareers() | ✅ Listo |
| `/admin/categories` | GET | useAdminCategories() | ✅ Listo |
| `/notifications` | GET | useNotifications() | ✅ Listo |
| `/notifications/:id/read` | PATCH | useMarkAsRead() | ✅ Listo |
| `/reports/top-tools` | GET | useTopTools() | ✅ Listo |
| `/reports/loans-by-month` | GET | useLoansByMonth() | ✅ Listo |
| `/reports/delays` | GET | useDelays() | ✅ Listo |
| `/reports/active-users` | GET | useActiveUsers() | ✅ Listo |
| `/tools` | POST | useCreateTool() | ✅ Listo |
| `/tools/:id` | PUT | useUpdateTool() | ✅ Listo |
| `/tools/:id` | DELETE | useDeleteTool() | ✅ Listo |
| `/admin/careers` | POST | useCreateCareer() | ✅ Listo |
| `/admin/careers/:id` | PUT | useUpdateCareer() | ✅ Listo |
| `/admin/careers/:id` | DELETE | useDeleteCareer() | ✅ Listo |
| `/admin/categories` | POST | useCreateCategory() | ✅ Listo |
| `/admin/categories/:id` | PUT | useUpdateCategory() | ✅ Listo |
| `/admin/categories/:id` | DELETE | useDeleteCategory() | ✅ Listo |
