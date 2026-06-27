export async function up({ queryInterface, DataTypes, transaction }) {
  await queryInterface.changeColumn(
    "chef_accounts",
    "status",
    {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "active"
    },
    { transaction }
  );

  await queryInterface.sequelize.query(
    `
      UPDATE chef_accounts
      SET status = 'suspended', updated_at = NOW()
      WHERE status IS NOT NULL AND status <> 'active';
    `,
    { transaction }
  );
}
