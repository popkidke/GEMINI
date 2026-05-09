const config = require("../config");
const axios = require('axios');
const { formatUptime, getNairobiTime } = require("../lib/utils");

// --- IMAGE CACHE VARIABLE ---
let menuBuffer = null;

module.exports = {
    cmd: "menu",
    alias: ["help", "list"],
    desc: "Ultra-Fast Vertical Menu",
    category: "MAIN",
    async execute(conn, m, { pushName }) {
        const uptime = formatUptime(process.uptime());

        // --- CLEAN DATE & TIME SPLIT ---
        const fullTime = getNairobiTime();
        const date = fullTime.split(' at ')[0].replace('Tuesday, ', '');
        const time = fullTime.split(' at ')[1];

        const totalPlugins = global.plugins.size;
        const ram = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);

        // --- PRE-LOAD IMAGE INTO RAM ---
        const imageUrl = "https://raw.githubusercontent.com/popkidke/GEMINI/main/popkid.jpg";
        
        if (!menuBuffer) {
            try {
                const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                menuBuffer = Buffer.from(response.data);
            } catch (e) {
                console.error("Menu Image Cache Error:", e);
            }
        }

        const catEmojis = {
            MAIN: "🏠", ADMIN: "🛡️", DOWNLOAD: "📥", TOOLS: "🛠️",
            OWNER: "👑", GROUP: "👥", SEARCH: "🔍", MISC: "🌀", AI: "🤖"
        };

        // ─── PREMIUM BOX HEADER ───
        let menuText = `╭══════════════════⊷\n` +
                       `║   ✨ *𝐏𝐎𝐏𝐊𝐈𝐃-𝐌𝐃 𝐕𝟑* ✨\n` +
                       `╠══════════════════⊷\n` +
                       `║ 👤 *ᴜꜱᴇʀ:* ${pushName || 'User'}\n` +
                       `║ 🚀 *ᴘʟᴜɢɪɴꜱ:* ${totalPlugins}\n` +
                       `║ ⏳ *ᴜᴘᴛɪᴍᴇ:* ${uptime}\n` +
                       `║ 📅 *ᴅᴀᴛᴇ:* ${date}\n` +
                       `║ ⌚ *ᴛɪᴍᴇ:* ${time}\n` +
                       `║ 📊 *ʀᴀᴍ:* ${ram}ᴍʙ\n` +
                       `║ 🌐 *ᴍᴏᴅᴇ:* ${config.MODE || 'Public'}\n` +
                       `╰══════════════════⊷\n\n`;

        if (totalPlugins > 0) {
            const categories = {};
            global.plugins.forEach(p => {
                const cat = (p.category || "MISC").toUpperCase();
                if (!categories[cat]) categories[cat] = [];
                categories[cat].push(p.cmd);
            });

            Object.keys(categories).sort().forEach(category => {
                const emoji = catEmojis[category] || "💠";
                menuText += `╔══════════════════⊷\n`;
                menuText += `║ ${emoji}  *${category}*\n`;
                menuText += `╠══════════════════⊷\n`;
                categories[category].sort().forEach(cmd => {
                    menuText += `║ ◈ ${config.PREFIX}${cmd}\n`;
                });
                menuText += `╚══════════════════⊷\n`;
            });
        }

        menuText += `\n*© 𝟤𝟢𝟤𝟨 ᴘᴏᴘᴋɪᴅ ᴋᴇɴʏᴀ* 🇰🇪`;

        // --- SEND WITH IMAGE ---
        try {
            await conn.sendMessage(m.chat, {
                image: menuBuffer ? menuBuffer : { url: imageUrl },
                caption: menuText,
                mimetype: 'image/jpeg'
            }, { quoted: m });
        } catch (e) {
            console.error("Menu Send Error:", e);
            // Absolute fallback to text if image sending fails entirely
            await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
        }
    }
};
