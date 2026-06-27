export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.createTable(
    "tickets",
    {
      id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      creator_id: {
        type: DataTypes.UUID,
        allowNull: false
      },
      creator_role: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      subject: {
        type: DataTypes.STRING(150),
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "unreviewed"
      },
      reviewed_at: {
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

  await queryInterface.addIndex("tickets", ["status"], {
    name: "tickets_status_index",
    transaction
  });

  await queryInterface.addIndex("tickets", ["creator_id", "creator_role"], {
    name: "tickets_creator_index",
    transaction
  });

  await queryInterface.addIndex("tickets", ["created_at"], {
    name: "tickets_created_at_index",
    transaction
  });
}
