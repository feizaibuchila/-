const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 生成密码哈希
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    // 插入默认管理员数据
    await queryInterface.bulkInsert('admin_users', [
      {
        username: 'admin',
        password: hashedPassword,
        created_at: new Date()
      }
    ], {});
  },
  
  down: async (queryInterface, Sequelize) => {
    // 删除默认管理员数据
    await queryInterface.bulkDelete('admin_users', { username: 'admin' }, {});
  }
};