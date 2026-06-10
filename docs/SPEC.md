# Especificacion del juego

## Objetivo

El jugador pertenece al equipo 1. El objetivo es que su celula principal sea la ultima celula principal viva. El jugador solo elige la posicion inicial dentro de su cuadrante; despues la simulacion avanza automaticamente.

## Tablero

- El tablero inicial para pruebas es 10x10.
- El tamano debe ser configurable y preparado para crecer a 100x100.
- El tablero se divide en cuatro cuadrantes:
  - Equipo 1: superior izquierdo.
  - Equipo 2: superior derecho.
  - Equipo 3: inferior izquierdo.
  - Equipo 4: inferior derecho.
- No puede haber dos celulas principales iniciando en la misma celda.

## Equipos y celulas

- Hay 4 equipos.
- Cada equipo tiene una sola celula principal.
- Cada equipo puede tener muchos rastros.
- Los rastros no se mueven, no se reproducen y no son celulas principales.
- Los rastros ocupan celdas y pueden ser comidos por celulas principales enemigas.

## Movimiento

Cada tick, todas las celulas principales vivas intentan moverse de forma pseudoaleatoria en una de 8 direcciones: arriba, abajo, izquierda, derecha, arriba izquierda, arriba derecha, abajo izquierda y abajo derecha.

Reglas:

- Si una celula intenta salir del tablero, el movimiento se cancela.
- Si el movimiento se cancela, no deja rastro.
- Si una celula se mueve a una celda vacia, deja un rastro de su equipo en la posicion anterior.
- Si entra en una celda con rastro enemigo, lo elimina, ocupa esa celda y deja rastro en la posicion anterior.
- Si intenta entrar en una celda con rastro propio, el movimiento se cancela.

## Combate

Hay combate entre celulas principales cuando:

- Dos o mas celulas intentan moverse a la misma celda.
- Una celula intenta entrar en la celda ocupada por una celula principal enemiga.
- Dos celulas intercambian posiciones en el mismo tick.

El combate se resuelve por preferencia del tick. La celula con mayor preferencia gana, completa su movimiento y deja rastro en su posicion anterior. Las perdedoras son eliminadas y no dejan rastro nuevo.

## Preferencia del tick

Con 4 equipos, la preferencia rota asi:

- Tick 1: 1, 2, 3, 4
- Tick 2: 4, 1, 2, 3
- Tick 3: 3, 4, 1, 2
- Tick 4: 2, 3, 4, 1

Luego se repite.

## Estados

- `setup`: el jugador elige posicion inicial.
- `running`: la simulacion corre.
- `paused`: la simulacion esta pausada.
- `player_lost`: el jugador murio, pero puede seguir viendo.
- `finished`: queda una sola celula principal viva.

## Victoria y derrota

La simulacion termina oficialmente cuando solo queda una celula principal viva. El jugador gana si el equipo 1 es el ultimo vivo. El jugador pierde si la celula principal del equipo 1 muere, aunque debe poder seguir viendo hasta el final.

## Puntuacion

- +1 por cada tick sobrevivido.
- +10 por cada rastro enemigo comido.
- +50 por cada celula principal enemiga eliminada.
- +100 extra si gana el jugador.
