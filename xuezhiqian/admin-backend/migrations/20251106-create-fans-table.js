module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fans', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nickname: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      join_time: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
      }
    });
    
    // 创建索引
    await queryInterface.addIndex('fans', ['phone'], { unique: true });
    await queryInterface.addIndex('fans', ['nickname']);
    await queryInterface.addIndex('fans', ['status']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('fans');
  }
};