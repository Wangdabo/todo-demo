'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Todo.init({
    name: DataTypes.STRING,
    endTime: DataTypes.DATE,
    content: DataTypes.STRING,
    status: { // 表模型中添加字段, 因为是枚举值，所以给一个默认值，默认是1即代办
      type: DataTypes.INTEGER,
      defaultValue: 1
    }
  }, {
    sequelize,
    modelName: 'Todo',
    timestamps:false // 把默认的数据时间给禁止掉
  });
  return Todo;
};