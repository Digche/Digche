export async function up({ queryInterface, transaction }) {
  await renameColumnIfNeeded({
    queryInterface,
    tableName: "users",
    from: "profile_image_url",
    to: "photo_url",
    transaction
  });

  await renameColumnIfNeeded({
    queryInterface,
    tableName: "admin_users",
    from: "profile_image_url",
    to: "photo_url",
    transaction
  });
}

async function renameColumnIfNeeded({
  queryInterface,
  tableName,
  from,
  to,
  transaction
}) {
  const table = await queryInterface.describeTable(tableName, { transaction });

  if (table[to]) {
    return;
  }

  if (!table[from]) {
    return;
  }

  await queryInterface.renameColumn(tableName, from, to, { transaction });
}
