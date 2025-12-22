<div align="center">

# 📊 LibreChat Admin Panel 📊
## Soul Calibre
**A robust, private administrative suite for managing LibreChat instances with real-time hardware monitoring.**

---

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white" />
</p>

---

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/JBayudang/LibreChat-Admin-Dashboard)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/JBayudang/LibreChat-Admin-Dashboard/graphs/commit-activity)

</div>

---

## 📖 Overview
The **LibreChat Admin Panel** is a specialized management interface designed for administrators who need granular control over their LibreChat deployment. Whether you are hosting on a VPS or Google Cloud, this tool provides real-time insights into user activity, resource consumption, and database health.



## ✨ Features
* **👥 User Management:** Easily view user information and make changes when necessary.
* **📈 Resource Monitoring:** Real-time tracking of memory and disk usage (local storage), and API consumption.
* **📈 API Usage Tracker**: A 7-day bar graph displaying daily message traffic across all users.
* **🛡️ Secure Access**: Protected by a static, case-sensitive login system and session-based authentication.
* **⚙️ Backend Synchronization**: Directly triggers Docker commands to clean up LibreChat balances and associated user data when a user is removed.

---

## 📸 Screenshot
<div align="center">
  <img src="https://lh3.googleusercontent.com/pw/AP1GczNn9r78ux44GeYLIIIS4wcp5tEhquM6NXWsIKXoCM24eu4o381ElgQ9neu9NkLviy5F2b03azc6lvlKvuejRrNqxree0ifMj9sKlN-84rtVh4VAZ8C5GqCRNJ90A-QyCCmSQJrCqZdhxohqGTBc1GA=w919-h794-s-no-gm?authuser=0" alt="Admin Dashboard" width="800">
  <p><em>The main dashboard provides a high-level overview of your AI ecosystem.</em></p>
</div>

---

## 🚀 Installation

### Prerequisites
* LibreChat running via Docker (MongoDB accessible at `LocalIP`).
* Node.js `v18+` installed on your VPS.
* `pm2`, `express-session` and `systeminformation` packages installed.

### Setup
1. **Create directory and clone the repository:**
   ```bash
   mkdir /usr/local/lc-admin-dash
   cd /usr/local/lc-admin-dash/
   git clone [https://github.com/JBayudang/LibreChat-Admin-Dashboard.git](https://github.com/JBayudang/LibreChat-Admin-Dashboard.git)
   cd LibreChat-Admin-Dashboard
   ```
2. **Install the dependencies:**
   ```bash
   apt install nodejs
   apt install npm
   npm install express mongoose systeminformation
   npm install pm2@latest -g
   install express-session
   ```
3. **Configure the `server.js`, `index.html`, and `login.html` files depending on your preferences.**
   > server.js
   ```bash
   mongoose.connect('mongodb://DockerLocalIP:27017/LibreChat')
   const ADMIN_USER = "SampleAdminUsername";
   const ADMIN_PASS = "SampleAdminPassword";
   app.listen(2025, '127.0.0.1', () => console.log('Dashboard running on port 2025'));
   ```
   > public/index.html
   ```bash
   <title>Soul Calibre Admin Dashboard</title>
   <link rel="icon" type="image/png" href="favicon.png">
   <h1>LibreChat / Soul Calibre AI Dashboard</h1>
   <footer>© Jonathan P. Bayudang. All Rights Reserved.</footer>
   ```
   > public/login.html
   ```bash
   <title>Soul Calibre Login</title>
   <h2>Soul Calibre AI Admin Login</h2>
   ```
4. Create, start, and save the app:
   ```bash
   pm2 start server.js --name "lc-admin"
   pm2 save
   pm2 startup
   ```
5. Connect and access the Admin Dashboard
   > Open terminal on your local computer and run:
   ```bash
   ssh -L 2025:localhost:2025 VPSUsername@VPSIPAddress
   ```
   > Access browser:
   ```bash
   http://localhost:2025/
   ```
   >> There's no need to do this if you allow the admin dashboard to be accessed over the internet by using `app.listen(2025, '0.0.0.0', () => console.log('Dashboard running on port 2025'));`. Simply access `VPSIPAddress:2025`.
---
Whenever Docker is restarted, the `DockerLocalIP` changes so make sure to run this command if no user data is displayed on the Admin Dashboard:
```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' chat-mongodb
```
Take note of this `IP Address` and update the `server.js` file:
```bash
mongoose.connect('mongodb://DockerLocalIP:27017/LibreChat')
pm2 restart lc-admin
```
