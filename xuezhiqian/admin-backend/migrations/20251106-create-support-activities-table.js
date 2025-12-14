module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('support_activities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      cover_img: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      start_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_time: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.TINYINT,
        allowNull: false,
        defaultValue: 1
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'admin_users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
    
    // 创建索引
    await queryInterface.addIndex('support_activities', ['title']);
    await queryInterface.addIndex('support_activities', ['status']);
    await queryInterface.addIndex('support_activities', ['created_by']);
    await queryInterface.addIndex('support_activities', ['start_time']);
    await queryInterface.addIndex('support_activities', ['end_time']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('support_activities');
  }
};