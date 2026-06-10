# API

Base URL esperada: `http://localhost:3000/api`.

## POST /game/new

Crea una nueva simulacion.

Request:

```json
{
  "boardSize": { "width": 10, "height": 10 }
}
```

Response esperado:

```json
{
  "game": {
    "status": "setup",
    "tick": 0
  }
}
```

## POST /game/start

Inicia la simulacion con la posicion elegida por el jugador.

Request:

```json
{
  "playerStart": { "x": 2, "y": 3 }
}
```

Debe rechazar posiciones fuera del cuadrante del equipo 1.

## POST /game/tick

Avanza un tick si la simulacion esta en `running` o si el jugador esta mirando como espectador despues de perder.

## GET /game

Devuelve el estado actual de la simulacion.

## POST /game/pause

Cambia el estado a `paused` si la simulacion esta corriendo.

## POST /game/resume

Regresa a `running` desde `paused`.

## POST /game/reset

Reinicia la simulacion a `setup`.

## POST /scores

Guarda una puntuacion.

Request:

```json
{
  "playerName": "Jugador",
  "score": 245,
  "ticksSurvived": 95,
  "trailsEaten": 5,
  "mainCellsKilled": 1,
  "result": "win"
}
```

## GET /scores

Devuelve la lista de puntuaciones guardadas.
