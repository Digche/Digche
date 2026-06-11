export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.addColumn(
    "users",
    "first_name",
    {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    "users",
    "last_name",
    {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addColumn(
    "users",
    "username",
    {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    { transaction }
  );

  await queryInterface.addIndex("users", ["username"], {
    unique: true,
    name: "users_username_unique",
    transaction
  });
}