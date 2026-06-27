export async function up({ queryInterface, DataTypes, transaction }) {
  await addColumnIfMissing({
    queryInterface,
    tableName: "users",
    columnName: "token_version",
    definition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    transaction
  });

  await addColumnIfMissing({
    queryInterface,
    tableName: "admin_users",
    columnName: "token_version",
    definition: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    transaction
  });

  const tables = await queryInterface.showAllTables({ transaction });
  const tableNames = tables.map((table) => {
    if (typeof table === "string") {
      return table;
    }

    return table.tableName || table.table_name || table.name;
  });

  if (!tableNames.includes("registration_tokens")) {
    await queryInterface.createTable(
      "registration_tokens",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true
        },
        token_id: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true
        },
        phone: {
          type: DataTypes.STRING(20),
          allowNull: false
        },
        role: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        flow: {
          type: DataTypes.STRING(50),
          allowNull: false
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false
        },
        consumed_at: {
          type: DataTypes.DATE,
          allowNull: true
        },
        created_at: {
          type: DataTypes.DATE,
          allowNull: false
        }
      },
      { transaction }
    );

    await queryInterface.addIndex("registration_tokens", ["token_id"], {
      name: "registration_tokens_token_id_index",
      transaction
    });

    await queryInterface.addIndex("registration_tokens", ["phone", "role"], {
      name: "registration_tokens_phone_role_index",
      transaction
    });

    await queryInterface.addIndex("registration_tokens", ["expires_at"], {
      name: "registration_tokens_expires_at_index",
      transaction
    });
  }
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
