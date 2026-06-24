import { DataTypes } from "sequelize";
import { sequelize } from "../sequelize.js";
import { TICKET_STATUSES } from "../../../domain/constants/ticketStatuses.js";

export const TicketModel = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "creator_id"
    },
    creatorRole: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "creator_role"
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
      defaultValue: TICKET_STATUSES.UNREVIEWED
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reviewed_at"
    }
  },
  {
    tableName: "tickets",
    underscored: true,
    timestamps: true
  }
);
