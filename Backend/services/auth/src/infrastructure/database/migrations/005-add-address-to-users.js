export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.addColumn(
    "users",
    "address",
    {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    { transaction }
  );
}
