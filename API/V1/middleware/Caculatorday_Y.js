const CTM = require("../model/Customer_Y.model")
module.exports = async(req,res,next) => {
    const Data = await CTM.find({
        deleted : false,
        Status : 1
    })
    const bulkOps = [];
    for (let item of Data) {
      if (item.startday != null && item.Status == "1") {
        const startDate = new Date(Number(item.startday));
        const now = new Date();
        const diffDays = (now - startDate) / (1000 * 60 * 60 * 24);
        if (diffDays > 0.05) {
          item.totalDay = item.totalDay - diffDays
          item.startday = Date.now()
        } else if (diffDays > item.totalDay) {
          item.totalDay = item.totalDay - diffDays
        }
      }

      if (item.totalDay <= 0) {
        item.Status = "2"
        item.totalDay = 0
        item.startday = null
      }
      bulkOps.push({
        updateOne: {
          filter: { _id: item._id },
          update: {
            $set: {
              totalDay: item.totalDay,
              startday: item.startday,
              Status: item.Status,
            },
          },
        },
      });
    }
    if (bulkOps.length > 0) {
      await CTM.bulkWrite(bulkOps);
    }
    next()
}