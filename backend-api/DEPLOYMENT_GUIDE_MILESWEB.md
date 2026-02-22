# Art & Craft Backend API Deployment Guide (MilesWeb)

## Prerequisites
- Node.js 18+ and npm
- Docker (if using container deployment)
- MySQL database credentials (MilesWeb)

## Steps

1. **Update Environment Variables**
   - Edit `backend-api/.env` with MilesWeb DB host, user, password, and other production values.

2. **Build Docker Image**
   - From project root:
     ```sh
     docker build -t artandcraft-api ./backend-api
     ```

3. **Run Docker Container**
   - Example:
     ```sh
     docker run -d --name artandcraft-api \
       -p 3000:3000 \
       --env-file ./backend-api/.env \
       artandcraft-api
     ```

4. **Direct Node Deployment (without Docker)**
   - SSH into MilesWeb server
   - Install Node.js and npm
   - Copy backend-api folder
   - Run:
     ```sh
     npm install
     npm run migrate
     npm run seed
     npm start
     ```

5. **Verify Deployment**
   - Access API at `http://<your-milesweb-ip>:3000`
   - Check logs for errors

## Notes
- Ensure MySQL user has correct permissions
- Use production values for JWT, SMTP, payment keys
- For troubleshooting, check logs and DB connectivity

---
For advanced setup (PM2, Nginx, SSL), see MilesWeb docs or request further help.
