/**
 * @author ProCoderMew
 * @warn Do not edit code or edit credits
 */

const axios = require('axios');
const join = require("../events/join").run;

module.exports.config = {
    name: "adduser",
    version: "2.0.3",
    hasPermission: 0,
    credits: "ShiGiun",
    description: "Thêm người dùng vào nhóm bằng link hoặc uid",
    commandCategory: "group",
    usages: "[args]",
    cooldowns: 5,
    dependencies: {
        "axios": ""
    }
};

module.exports.run = async function ({ api, event, args, Threads, Users }) {
    const { threadID, senderID, messageID } = event;
    const botID = api.getCurrentUserID();
    const out = msg => api.sendMessage(msg, threadID, messageID);

    var { participantIDs, approvalMode, adminIDs } = await Threads.getInfo(threadID) || await api.getThreadInfo(threadID);
    participantIDs = participantIDs.map(e => parseInt(e));

    if (!args[0]) return out("Vui lòng nhập 1 link profile user cần add.");

    if (!isNaN(args[0])) return adduser(args[0], undefined);
    else {
        try {
            const response = await axios.get("https://meewmeew.info/fbid?url=" + encodeURIComponent(args[0]));
            var { success, error, data } = response.data;

            if (!success) {
                if (error === "invalid url") return out("Liên kết không hợp lệ.");
                return out(JSON.stringify(error));
            } else {
                return adduser(data.id, data.name);
            }
        } catch (e) {
            return out(`${e.name}: ${e.message}.`);
        }
    }

    async function adduser(id, name) {
        id = parseInt(id);
        var form = {
            type: 'event',
            threadID: threadID,
            logMessageType: 'log:subscribe',
            logMessageData: { addedParticipants: [{ userFbId: id, fullName: name || "Facebook User" }] },
            author: api.getCurrentUserID()
        };
        
        if (participantIDs.includes(id)) return out(`${name ? name : "Thành viên"} đã có mặt trong nhóm.`);
        else {
            var admins = adminIDs.map(e => parseInt(e.id));
            try {
                await api.addUserToGroup(id, threadID);
            } catch {
                return out(`Không thể thêm ${name ? name : "người dùng"} vào nhóm.`);
            }
            if (approvalMode === true && !admins.includes(botID)) {
                return out(`Đã thêm ${name ? name : "thành viên"} vào danh sách phê duyệt!`);
            } else {
                return join({ api, event: form, Threads, Users });
            }
        }
    }
};
