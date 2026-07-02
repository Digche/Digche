export async function up({ queryInterface, DataTypes, transaction }) {
  await addColumnIfMissing({
    queryInterface,
    tableName: "tickets",
    columnName: "admin_reply_text",
    definition: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transaction
  });

  await addColumnIfMissing({
    queryInterface,
    tableName: "tickets",
    columnName: "replied_by_admin_id",
    definition: {
      type: DataTypes.UUID,
      allowNull: true
    },
    transaction
  });

  await addColumnIfMissing({
    queryInterface,
    tableName: "tickets",
    columnName: "replied_by_admin_role",
    definition: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    transaction
  });

  await addColumnIfMissing({
    queryInterface,
    tableName: "tickets",
    columnName: "replied_at",
    definition: {
      type: DataTypes.DATE,
      allowNull: true
    },
    transaction
  });

  await addIndexIfMissing({
    queryInterface,
    tableName: "tickets",
    fields: ["replied_at"],
    indexName: "tickets_replied_at_index",
    transaction
  });
}

async function addColumnIfMissing({
  queryInterface,
  tableName,
  columnName,
  definition,
  transaction
}) {
  const table = await queryInterface.describeTable(tableName, { transaction });

  if (table[columnName]) {
    return;
  }

  await queryInterface.addColumn(tableName, columnName, definition, {
    transaction
  });
}

async function addIndexIfMissing({
  queryInterface,
  tableName,
  fields,
  indexName,
  transaction
}) {
  const indexes = await queryInterface.showIndex(tableName, { transaction });
  const indexExists = indexes.some((index) => index.name === indexName);

  if (indexExists) {
    return;
  }

  await queryInterface.addIndex(tableName, fields, {
    name: indexName,
    transaction
  });
}
