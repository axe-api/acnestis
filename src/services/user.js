const { db } = require("./db");

const getUserById = async (uuid) => {
  return await db.table("users").where("uuid", uuid).first();
};

module.exports = {
  getUserById,
};
