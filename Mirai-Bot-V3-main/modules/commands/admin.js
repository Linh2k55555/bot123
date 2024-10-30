const fs = require('fs');

module.exports.config = {
  name: "admin",
  version: "1.0.0",
  hasPermssion: 1,
  credits: "ShiGiun",
  description: "Manage admins",
  commandCategory: "Admin",
  usages: "admin list/add/remove [userID]",
  cooldowns: 2,
  dependencies: {
    "fs-extra": ""
  }
};

module.exports.run = async function ({ api, event, args }) {
  const configPath = './config.json';

  // Load the config file
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Get the list of admins
  const admins = config.NDH || [];

  // Handle different subcommands
  switch (args[0]) {
    case "list":
      if (admins.length === 0) {
        api.sendMessage("Hiện đang không có ai làm quản trị viên Bot.", event.threadID, event.messageID);
      } else {
        const adminList = admins.map(admin => `- ${admin}`).join('\n');
        api.sendMessage(`Danh sách quản trị viên:\n${adminList}`, event.threadID, event.messageID);
      }
      break;

    case "add":
      const newAdminID = args[1];
      if (!newAdminID) {
        api.sendMessage("Vui lòng thêm ID người muốn thêm vào danh sách quản trị viên.", event.threadID, event.messageID);
        return;
      }
      if (admins.includes(newAdminID)) {
        api.sendMessage("Người dùng này đã là quản trị viên.", event.threadID, event.messageID);
        return;
      }
      admins.push(newAdminID);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      api.sendMessage(`Đã thêm ${newAdminID} làm quản trị viên.`, event.threadID, event.messageID);
      break;

    case "remove":
      const adminToRemoveID = args[1];
      if (!adminToRemoveID) {
        api.sendMessage("Vui lòng thêm ID người muốn xoá khỏi danh sách quản trị viên.", event.threadID, event.messageID);
        return;
      }
      if (!admins.includes(adminToRemoveID)) {
        api.sendMessage("Người dùng này không phải là quản trị viên.", event.threadID, event.messageID);
        return;
      }
      const adminIndex = admins.indexOf(adminToRemoveID);
      admins.splice(adminIndex, 1);
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      api.sendMessage(`Đã xoá ${adminToRemoveID} khỏi danh sách quản trị viên.`, event.threadID, event.messageID);
      break;

    default:
      api.sendMessage("Lệnh không phù hợp. Vui lòng dùng: admin list/add/remove [userID]", event.threadID, event.messageID);
      break;
  }
};