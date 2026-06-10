# Cell Matrix Simulation

Juego/simulacion de celulas en una matriz. El proyecto se construira por fases, con documentacion y pruebas antes de implementar la interfaz completa.

## Estado actual

Fase 1 iniciada:

- Dockerfile revisado y ajustado para desarrollo.
- Estructura base creada.
- Documentacion inicial creada en `docs/`.
- Primeros tests del motor preparados para guiar Fase 2.

Los tests iniciales son intencionalmente una especificacion ejecutable: pueden fallar hasta que se implemente el motor en Fase 2.

## Docker

Construir el entorno:

```bash
docker compose build
```

Abrir una shell dentro del contenedor:

```bash
docker compose run --rm --service-ports dev
```

El contenedor incluye Node.js 22, npm, Corepack, git, openssh-client, curl y Hermes Agent.

## Instalar dependencias

Dentro del contenedor:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Backend

Ejecutar tests del backend:

```bash
cd backend
npm test
```

Ejecutar backend en desarrollo, cuando exista el servidor funcional:

```bash
cd backend
npm run dev
```

Puerto previsto: `3000`.

## Frontend

Ejecutar tests del frontend:

```bash
cd frontend
npm test
```

Ejecutar frontend en desarrollo:

```bash
cd frontend
npm run dev -- --host 0.0.0.0
```

Puerto previsto: `5173`.

## Documentacion

- `docs/SPEC.md`: reglas completas del juego.
- `docs/ARCHITECTURE.md`: separacion entre motor, API, frontend y almacenamiento.
- `docs/API.md`: endpoints esperados.
- `docs/TEST_PLAN.md`: estrategia de pruebas.
- `docs/ROADMAP.md`: fases de desarrollo.

## Alcance de la primera version

Incluye una simulacion local de una sola partida activa, cuatro equipos, tablero configurable, API REST, frontend React y puntuaciones en JSON.

No incluye multijugador, autenticacion, base de datos real, niveles, energia, vida, control manual de movimiento ni control de velocidad.
