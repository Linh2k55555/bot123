module.exports = {
    config: {
        name: "uid",
        version: "1.0.0",
        hasPermission: 0,
        credits: "ShiGiun",
        description: "Lấy ID người dùng.",
        commandCategory: "Công cụ",
        cooldowns: 0,
        images: []
    },
    run: async function ({ api, event, args }) {
        const axios = require('axios');
        if (event.type === "message_reply") {
            const uid = event.messageReply.senderID;
            return api.sendMessage(`${uid}`, event.threadID, event.messageID);
        }

        if (!args || args.length === 0) {
            return api.sendMessage(`${event.senderID}`, event.threadID, event.messageID);
        } else {
            if (args[0].indexOf(".com/") !== -1) {
                const res_ID = await api.getUID(args[0]);
                return api.sendMessage(`${res_ID}`, event.threadID, event.messageID);
            } else {
                for (const [id, mention] of Object.entries(event.mentions)) {
                    api.sendMessage(`${mention.replace('@', '')}: ${id}`, event.threadID);
                }
                return;
            }
        }
    },
    handleEvent: async ({ api, event, args }) => {
        if (event.body && typeof event.body === 'string' && (event.body.toLowerCase() === "uid" || event.body.toLowerCase() === "Uid")) {
            await module.exports.run({ api, event, args: [] });
        }
    }
};
