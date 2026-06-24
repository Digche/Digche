export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.addColumn(
    "users",
    "profile_image_url",
    {
      type: DataTypes.STRING(2048),
      allowNull: true
    },
    { transaction }
  );
}