export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.createTable(
    "chat_conversations",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "direct"
      },
      title: {
        type: DataTypes.STRING(150),
        allowNull: true
      },
      order_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      last_message_at: {
        type: DataTypes.DATE,
        allowNull: true
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
    "chat_participants",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "chat_conversations",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      participant_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      participant_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      display_name: {
        type: DataTypes.STRING(150),
        allowNull: true
      },
      last_read_message_id: {
        type: DataTypes.UUID,
        allowNull: true
      },
      last_read_at: {
        type: DataTypes.DATE,
        allowNull: true
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

  await queryInterface.addIndex(
    "chat_participants",
    ["conversation_id", "participant_id", "participant_type"],
    {
      unique: true,
      name: "chat_participants_conversation_actor_unique",
      transaction
    }
  );

  await queryInterface.addIndex(
    "chat_participants",
    ["participant_id", "participant_type"],
    {
      name: "chat_participants_actor_index",
      transaction
    }
  );

  await queryInterface.createTable(
    "chat_messages",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      conversation_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "chat_conversations",
          key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
      },
      sender_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      sender_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      client_message_id: {
        type: DataTypes.STRING(120),
        allowNull: true
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true
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

  await queryInterface.addIndex("chat_messages", ["conversation_id", "created_at"], {
    name: "chat_messages_conversation_created_at_index",
    transaction
  });

  await queryInterface.addIndex(
    "chat_messages",
    ["conversation_id", "client_message_id"],
    {
      name: "chat_messages_client_message_index",
      transaction
    }
  );
}
