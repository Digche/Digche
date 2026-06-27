export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.createTable(
    "users",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    { transaction }
  );

  await queryInterface.createTable(
    "user_roles",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    { transaction }
  );

  await queryInterface.addIndex("user_roles", ["user_id", "role"], {
    unique: true,
    name: "user_roles_user_id_role_unique",
    transaction
  });

  await queryInterface.createTable(
    "chef_accounts",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "active"
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    { transaction }
  );

  await queryInterface.createTable(
    "admin_users",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "admin"
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "active"
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "admin_users",
          key: "id"
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE"
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false
      }
    },
    { transaction }
  );

  await queryInterface.createTable(
    "otp_codes",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      purpose: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      code_hash: {
        type: DataTypes.STRING,
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

  await queryInterface.addIndex("otp_codes", ["phone", "purpose"], {
    name: "otp_codes_phone_purpose_index",
    transaction
  });

  await queryInterface.addIndex("otp_codes", ["expires_at"], {
    name: "otp_codes_expires_at_index",
    transaction
  });

  await queryInterface.createTable(
    "refresh_tokens",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      owner_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      owner_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      scope: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      selected_role: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      token_hash: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false
      },
      revoked_at: {
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

  await queryInterface.addIndex("refresh_tokens", ["owner_id", "owner_type"], {
    name: "refresh_tokens_owner_id_owner_type_index",
    transaction
  });

  await queryInterface.addIndex("refresh_tokens", ["scope"], {
    name: "refresh_tokens_scope_index",
    transaction
  });

  await queryInterface.addIndex("refresh_tokens", ["token_hash"], {
    name: "refresh_tokens_token_hash_index",
    transaction
  });
}