const mongoose = require("mongoose");
const ZKLib = require("node-zklib");
const Customer = require("../model/Customer_Y.model")
const package = require("../model/Package_Y.model")
const CTM_PK = require("../model/CTM_PK_Y.model")
const CTM_SV = require("../model/CTM_SV_Y.model")
const History = require("../model/History_Y.model")
const helper = require("../../../helper/helper")
const validate = require("../middleware/validate_Y")
module.exports.GetALL = async (req, res) => {
  try {
    if (!req.user?.permission?.includes("view_customer") && req.user.role !== "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      });
    }
    const { key, status, page } = req.query;
    const find = { deleted: false };

    if (key && key !== "null") {
      const regex = new RegExp(key, "i");
      find.FullName = regex;
    }

    if (status && status !== "0" && status !== 4 && status !== "null") {
      find.Status = status;
    }

    let Data = [];
    let pagination;

    if (status == 4) {
      delete find.FullName;
      find.Status = "1";
      find.totalDay = { $lte: 5 };
      const total = await Customer.countDocuments(find);
      pagination = helper.paginet(page, 8, total);
      Data = await Customer.find(find).skip(pagination.skip).limit(pagination.limit);
    } else {
      const total = await Customer.countDocuments(find);
      pagination = helper.paginet(page, 8, total);
      Data = await Customer.find(find).skip(pagination.skip).limit(pagination.limit);
    }


    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: Data,
      total: pagination.count,
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    });
  }
};
module.exports.GetDetail = async (req, res) => {
  try {
    const { id } = req.params
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    let Data = null
    if (req.user.permission.includes("detail_customer") == false && req.user.role != "admin") {
      Data = await Customer.findOne({ _id: id, deleted: false }).select("FullName Email Phone_number Description");
      if (!Data) {
        return res.json({
          status: false,
          type: "Data",
          error: 300,
          data: null
        })
      }
      return res.json({
        status: true,
        type: "Auth",
        error: null,
        data: Data
      })
    }
    Data = await Customer.findOne({ _id: id, deleted: false });
    if (!Data) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: Data
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }
}

module.exports.patch = async (req, res) => {
  try {
    if (req.user.permission.includes("edit_customer") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Bạn Không Có Quyền Truy Cập",
        area: "CTMpatch",
        error: 100,
        data: null
      })
    }
    if (!req.body.Id || !mongoose.Types.ObjectId.isValid(req.body.Id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const requiredFields = ["FullName", "Email", "PhoneNumBer", "Description"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if (respondvalidate == false) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const NewObject = {
      FullName: req.body.FullName,
      Email: req.body.Email,
      Phone_number: req.body.Phone_number,
      Description: req.body.Description,
      updateAt: req.user.email,
      updateBy: helper.timenow()
    }
    const respond = await Customer.updateOne({
      _id: req.body.Id,
      deleted: false
    }, { $set: NewObject })


    if (respond.modifiedCount === 0) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const history = new History(
      {
        authen_id: req.user.userId,
        id_type: req.body.Id,
        action: "Chỉnh Sửa Khách Hàng",
        type: "Khách Hàng",
        detailtype: {
          field_1: NewObject.FullName
        },
        revenue: 0,
        datesearch: helper.YearNow(),
        createAt: helper.timenow(),
        CreateBy: req.user.email,
      }
    )
    await history.save()

    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: null
    })
  } catch (error) {
    if (error.name == "MongoServerError") {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }

}

module.exports.Post = async (req, res) => {
  try {
    if (req.user.permission.includes("create_customer") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Bạn Không Có Quyền Truy Cập",
        area: "CTMPOST",
        error: 100,
        data: null
      })
    }

    let hashedfinger = null
    if (req.body.id_fingerprint != null && req.body.id_fingerprint != "null") {
      let iv = req.body.id_fingerprint.split("*")[0]
      let encryptedData = req.body.id_fingerprint.split("*")[1]

      hashedfinger = helper.decrypt(encryptedData, iv);
      const zk = new ZKLib("192.168.1.201", 4370, 10000, 4000);
      await zk.createSocket();
      const users = await zk.getUsers();

      const check_id_fingerprint = users.data.some(
        user => user.userId === hashedfinger
      );

      if (!check_id_fingerprint) {
        return res.json({
          status: false,
          area: "CTMPOST",
          type: "Vân Tay Chưa Được Đăng Ký Trong Máy",
          error: 300,
          data: null
        });
      }

      const check_exist_user = await Customer.findOne({
        id_fingerprint: hashedfinger
      })

      if (check_exist_user) {
        return res.json({
          status: false,
          area: "CTMPOST",
          type: "Nhầm Vân Tay , Vân Tay Này Của Người Khác",
          error: 300,
          data: null
        });
      }
    }


    const requiredFields = ["FullName", "Email", "PhoneNumBer", "Description", "Status", "Package_id"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if (respondvalidate == false) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }

    if (!req.body.Package_id || !mongoose.Types.ObjectId.isValid(req.body.Package_id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }


    const NewObject = {
      FullName: req.body.FullName,
      Email: req.body.Email,
      Phone_number: req.body.PhoneNumBer,
      Status: req.body.Status,
      deleted: false,
      id_fingerprint: hashedfinger,
      Description: req.body.Description != null ? req.body.Description : null,
      createAt: helper.timenow().toString(),
      CreateBy: req.user.email,
      updateAt: req.user.email,
      updateBy: helper.timenow()
    }

    const data = new Customer(NewObject)

    const pack = await package.findOne({
      _id: req.body.Package_id,
      deleted: false
    })

    if (!pack) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }

    data.totalDay = data.totalDay + parseInt(pack.Duration);
    if (data.startday == null && data.Status != "3") {
      data.startday = Date.now()
    }
    await data.save()


    const historyCTM = new History(
      {
        authen_id: req.user.userId,
        id_type: data._id,
        action: "Thêm Khách Hàng",
        type: "Khách Hàng",
        detailtype: {
          field_1: req.body.FullName
        },
        revenue: 0,
        datesearch: helper.YearNow(),
        createAt: helper.timenow(),
        CreateBy: req.user.email,
      }
    )
    await historyCTM.save()



    const CTM_PKobject = {
      CTM_id: data._id,
      Package_id: req.body.Package_id,
      CreateAt: helper.timenow(),
      CreateBy: req.user.email,
      updateAt: null,
      updateBy: null
    }

    const handle = new CTM_PK(CTM_PKobject)
    await handle.save()


    const historyCTM_PK = new History(
      {
        authen_id: req.user.userId,
        id_type: pack.id,
        action: "Thêm Gói Tập",
        type: "Đăng Ký Gói Tập",
        detailtype: {
          field_1: pack.Name,
          field_2: req.body.FullName
        },
        revenue: pack.Price,
        datesearch: helper.YearNow(),
        createAt: helper.timenow(),
        CreateBy: req.user.email,
      }
    )
    await historyCTM_PK.save()

    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: null
    })

  } catch (error) {
    console.log(error)
    if (error.name == "MongoServerError") {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }
}

module.exports.deleted = async (req, res) => {
  try {
    if (req.user.permission.includes("deleted_customer") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const { id } = req.body
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    const checkctmpk = await CTM_PK.findOne({
      CTM_id: id,
      deleted: false
    })
    if (checkctmpk) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })

    }

    const checkctmsv = await CTM_SV.findOne({
      CTM_id: id,
      deleted: false
    })
    if (checkctmsv) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }


    const checkuser = await Customer.findOne({
      _id: id,
      deleted: false
    })
    if (!checkuser) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }

    const respond = await Customer.updateOne({
      _id: id,
      deleted: false
    }, { $set: { deleted: true } })
    if (respond.modifiedCount === 0) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }


    const historyCTM = new History(
      {
        authen_id: req.user.userId,
        id_type: id,
        action: "Xóa Khách Hàng",
        type: "Khách Hàng",
        detailtype: {
          field_1: checkuser.FullName
        },
        revenue: 0,
        datesearch: helper.YearNow(),
        createAt: helper.timenow(),
        CreateBy: req.user.email,
      }
    )
    await historyCTM.save()

    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: null
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }
}

module.exports.changeStatus = async (req, res) => {
  try {
    if (req.user.permission.includes("reserve_customer") == false && req.user.role != "admin") {
      return res.json({
        status: false,
        type: "Auth",
        error: 100,
        data: null
      })
    }
    const { changetype, type, arraycheck, date } = req.body
    const requiredFields = ["changetype", "type", "arraycheck"];
    const respondvalidate = validate.isValidRequest(req.body, requiredFields)
    if (respondvalidate == false) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }
    let respond = null
    if (type == "All") {
      if (changetype == "active") {
        const find = {
          Status: "3",
        }
        if (date.length > 0) {
          find.date_reserve = date
        }
        respond = await Customer.updateMany(find,
          { $set: { Status: 1, date_reserve: null, startday: Date.now(), deleted: false } })
      } else {
        respond = await Customer.updateMany({
          Status: "1"
        }, { $set: { Status: 3, date_reserve: helper.YearNow(), startday: null, deleted: false } })
      }
    } else {
      if (changetype == "active") {
        respond = await Customer.updateMany({
          _id: { $in: arraycheck },
          Status: "3"
        }, { $set: { Status: 1, date_reserve: null, startday: Date.now(), deleted: false } })
      } else {
        respond = await Customer.updateMany({
          _id: { $in: arraycheck },
          Status: "1"
        }, { $set: { Status: 3, date_reserve: helper.YearNow(), startday: null, deleted: false } })
      }
    }
    if (respond.modifiedCount === 0) {
      return res.json({
        status: false,
        type: "Data",
        error: 300,
        data: null
      })
    }

    const historyCTM = new History(
      {
        authen_id: req.user.userId,
        id_type: type == "All" ? "All" : arraycheck.join(","),
        action: "Thay Đổi Trạng Thái",
        type: "Khách Hàng",
        detailtype: {
          field_1: type == "All" ? "All" : arraycheck.length,
          field_2: changetype
        },
        revenue: 0,
        datesearch: helper.YearNow(),
        createAt: helper.timenow(),
        CreateBy: req.user.email,
      }
    )
    await historyCTM.save()

    return res.json({
      status: true,
      type: "Customer",
      error: null,
      data: null
    })
  } catch (error) {
    console.log(error)
    return res.json({
      status: false,
      type: "Customer",
      error: 500,
      data: null
    })
  }
}


module.exports.checkfingerprint = async (req, res) => {
  try {
    const zk = new ZKLib("192.168.1.201", 4370, 10000, 4000);
    await zk.createSocket();
    const log = await zk.getAttendances();

    if (!log || !log.data || log.data.length === 0) {
      await zk.disconnect();
      return [];
    }

    await zk.disconnect();
    const Data = await Customer.findOne({
      id_fingerprint: log.data[log.data.length - 1].deviceUserId

    })

    if (Data == null) {
      const hashedFinger = helper.encrypt((log.data[log.data.length - 1].deviceUserId).toString(), 10);
      return res.json({
        status: true,
        type: "Khách Hàng Chưa Tồn Tại",
        area: "Customercheckfinger",
        error: null,
        data: hashedFinger
      })
    }

    return res.json({
      status: true,
      type: "Khách Hàng Đã Tồn Tại",
      area: "Customercheckfinger",
      error: null,
      data: Data
    })
  } catch (error) {
    return res.json({
      status: false,
      type: "Không Kết Nối Được Máy Kiểm Tra Vân Tay",
      area: "Customercheckfinger",
      error: 500,
      data: null
    })
  }
}

module.exports.updatefinger = async (req,res) => {
  try {
    const { id } = req.body
    const zk = new ZKLib("192.168.1.201", 4370, 10000, 4000);
    await zk.createSocket();
    const log = await zk.getAttendances();

    if (!log || !log.data || log.data.length === 0) {
      await zk.disconnect();
      return [];
    }

    const check_exist_user = await Customer.findOne({
      id_fingerprint: log.data[log.data.length - 1].deviceUserId
    })

    if (check_exist_user) {
      return res.json({
        status: false,
        area: "CTMupdatefinger",
        type: "Nhầm Vân Tay , Vân Tay Này Của Người Khác",
        error: 300,
        data: null
      });
    }

    const check_finger = await Customer.findOne({
      _id: id
    }).select("id_fingerprint")

 if (check_finger.id_fingerprint != null && check_finger.id_fingerprint != "null") {
      return res.json({
        status: false,
        area: "CTMupdatefinger",
        type: "Người Dùng Đã Có Vân Tay",
        error: 300,
        data: null
      });
    }

    const respond = await Customer.updateOne({
      _id: id
    }, { $set: { id_fingerprint: log.data[log.data.length - 1].deviceUserId } })


    return res.json({
      status: true,
      type: "Cập Nhật Thành Công",
      area: "Customercheckfinger",
      error: null,
      data: Data
    })

  } catch (error) {
    return res.json({
      status: false,
      type: "Không Kết Nối Được Máy Kiểm Tra Vân Tay",
      area: "CTMupdatefinger",
      error: 500,
      data: null
    })
  }
} 