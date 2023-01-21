const { db } = require("./db");

const getSiteById = async (uuid) => {
  return await db.table("sites").where("uuid", uuid).first();
};

module.exports = {
  getSiteById,
};
