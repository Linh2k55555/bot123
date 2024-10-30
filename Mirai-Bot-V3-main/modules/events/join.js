module.exports.config = {
	name: "joinNoti",
	eventType: ["log:subscribe"],
	version: "1.0.3",
	credits: "ShiGiun",
	description: "Thông báo bot hoặc người vào nhóm",
	dependencies: {
		"fs-extra": ""
	}
};

module.exports.run = async function ({ api, event, Users }) {
	const { join } = global.nodemodule["path"];
	const { threadID } = event;
	const currentUserID = api.getCurrentUserID();

	// Check if the bot has joined
	if (event.logMessageData.addedParticipants.some(i => i.userFbId == currentUserID)) {
		api.changeNickname(`[ ${global.config.PREFIX} ] • ${(!global.config.BOTNAME) ? "Kết nối thành công :<" : global.config.BOTNAME}`, threadID, currentUserID);
		return api.sendMessage(`Hellooooooooooooooooooooooooooooooooooooooo <3`, threadID);
	} else {
		try {
			const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
			let { threadName, participantIDs } = await api.getThreadInfo(threadID);

			const threadData = global.data.threadData.get(parseInt(threadID)) || {};
			const path = join(__dirname, "cache", "joinGif");
			const pathGif = join(path, `${threadID}.gif`);

			let mentions = [], nameArray = [], memLength = [], i = 0;

			for (const participant of event.logMessageData.addedParticipants) {
				const userId = participant.userFbId; // Get the user ID
				const userName = participant.fullName;
				nameArray.push(userName);
				mentions.push({ tag: userName, id: userId });
				memLength.push(participantIDs.length - i++);

				if (!global.data.allUserID.includes(userId)) {
					await Users.createData(userId, { name: userName, data: {} });
					global.data.allUserID.push(userId);
					logger(global.getText("handleCreateDatabase", "newUser", userId), "[ DATABASE ]");
				}
			}
			memLength.sort((a, b) => a - b);

			let msg;
			if (typeof threadData.customJoin === "undefined") {
				msg = "👋Welcome {name}.\nChào mừng đã đến với {threadName}.\n{type} là thành viên thứ {soThanhVien} của nhóm 🥳";
			} else {
				msg = threadData.customJoin;
			}

			msg = msg
				.replace(/\{name}/g, nameArray.join(', '))
				.replace(/\{type}/g, (memLength.length > 1) ? 'các bạn' : 'bạn')
				.replace(/\{soThanhVien}/g, memLength.join(', '))
				.replace(/\{threadName}/g, threadName);

			if (!existsSync(path)) mkdirSync(path, { recursive: true });

			const formPush = existsSync(pathGif)
				? { body: msg, attachment: createReadStream(pathGif), mentions }
				: { body: msg, mentions };

			return api.sendMessage(formPush, threadID);
		} catch (e) {
			console.error(e);
			return api.sendMessage("Đã xảy ra lỗi khi xử lý thông báo thành viên mới.", threadID);
		}
	}
};
