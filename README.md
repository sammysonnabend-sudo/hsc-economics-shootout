# HSC Economics Realtime Shootout

This is a realtime two-player version of the HSC Economics penalty shootout game.

## How it works
- One player creates a room.
- Send the room link once.
- Both players stay on the same page.
- The game updates live through WebSockets.
- Player A shoots, Player B defends, then roles swap.
- Wrong answers trigger memory locks and come back later as rematches.

## Run locally
```bash
npm install
npm start
```
Then open:
```text
http://localhost:3000
```

## Deploy online
This needs a Node/WebSocket host. Static hosting alone, like a plain HTML upload, will not provide realtime multiplayer.

Good options:
- Render
- Railway
- Replit
- Glitch

Use:
```bash
npm install
npm start
```

After deployment, create a room and send the room link to your friend once.


## Auto-join fix
This version auto-joins room links. If Player 1 sends:
`https://your-app.onrender.com/?room=ABCDE`

Player 2 opens it, enters their name, and joins the same room automatically.
