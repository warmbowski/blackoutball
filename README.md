# Blackout Ball

Blackout Ball is a multiplayer 2D game built with Rune and PixiJS. In this game, players navigate in darkness, trying to find a glowing volleyball, throw it at other players to score points, and become the winner.

## Game Mechanics

In Blackout Ball, the field is completely dark. Players can only see:

- A glowing volleyball (🏐) emoji
- The eyes (👀) of other players

### Player Actions

- **Move**: Arrow keys to move around
- **Take Ball**: Press Space when near the ball to pick it up
- **Hide Ball**: Press H to hide the ball when you have it
- **Show Ball**: Press S to make the ball visible again
- **Throw Ball**: Press T to enter throw mode, then click on screen to throw
- **Close Eyes**: Press C to make your eyes invisible to other players
- **Open Eyes**: Press O to make your eyes visible again

### Scoring

- Score points by throwing the ball and hitting other players
- Each successful hit awards 1 point
- The player with the highest score after 5 minutes wins

## Development

### `npm run dev`

Runs the game in Dev UI.

The page will reload when you make changes.

### `npm run upload`

Builds the game and starts upload process to Rune.

### `npm run build`

Builds the game. You can then upload it to Rune using `npx rune@latest upload`.

### `npm run lint`

Runs the validation rules. You can read about them in the [docs on server-side logic](https://developers.rune.ai/docs/advanced/server-side-logic).

### `npm run typecheck`

Verifies that TypeScript is valid.

## Learn More

See the [Rune docs](https://developers.rune.ai/docs/quick-start) for more info. You can also ask any questions in the [Rune Discord](https://discord.gg/rune-devs), we're happy to help!
