export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.addColumn(
    "admin_users",
    "first_name",
    {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    "admin_users",
    "last_name",
    {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    "admin_users",
    "username",
    {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addIndex("admin_users", ["username"], {
    unique: true,
    name: "admin_users_username_unique",
    transaction
  });
}
