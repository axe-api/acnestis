const uuid = require("uuid");
const { db } = require("./db");

const createNewBuild = async (siteUuid) => {
  const buildUuid = uuid.v4();

  await db.table("builds").insert({
    uuid: buildUuid,
    site_uuid: siteUuid,
    trigger_type: "Dummy",
    status: "InProgress",
    created_at: new Date(),
    updated_at: new Date(),
  });

  return buildUuid;
};

module.exports = {
  createNewBuild,
};
