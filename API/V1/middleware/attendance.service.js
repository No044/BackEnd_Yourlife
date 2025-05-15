const ZKLib = require("node-zklib");

module.exports = async () => {
  const zk = new ZKLib("192.168.1.201", 4370, 10000, 4000);

  try {
    await zk.createSocket();
    console.log("✅ Connected to device");

    const info = await zk.getInfo();
    console.log("📟 Device Info:", info);

    if (info.logCounts === 0) {
      await zk.disconnect();
      return [];
    }

    const log = await zk.getAttendances();

    if (!log || !log.data || log.data.length === 0) {
      await zk.disconnect();
      return [];
    }

    console.log(log.data[log.data.length - 1].deviceUserId);

    await zk.disconnect();
    return log.data;
  } catch (error) {
    return null;
  }
};
