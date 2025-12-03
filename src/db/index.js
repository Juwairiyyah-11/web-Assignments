import { Sequelize, DataTypes } from 'sequelize';
const ssl = String(process.env.PG_SSL || 'true').toLowerCase() === 'true';
// for a self assigned certificate
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {}
});
// model
export const Task = sequelize.define(
  'Task',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    dueDate: { type: DataTypes.DATE },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'pending' },
    userId: { type: DataTypes.STRING, allowNull: false }
  },
  {}
);
