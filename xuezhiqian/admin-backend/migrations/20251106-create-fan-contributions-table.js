module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fan_contributions', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fans',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      activity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'support_activities',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      img_url: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // 创建索引
    await queryInterface.addIndex('fan_contributions', ['fan_id']);
    await queryInterface.addIndex('fan_contributions', ['activity_id']);
    await queryInterface.addIndex('fan_contributions', ['status']);
    await queryInterface.addIndex('fan_contributions', ['created_at']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('fan_contributions');
  }
};