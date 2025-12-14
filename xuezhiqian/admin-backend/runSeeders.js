// 执行种子文件脚本
const { sequelize } = require('./config/db');
const fs = require('fs');
const path = require('path');

async function runSeeders() {
  try {
    const seedersPath = path.join(__dirname, 'seeders');
    
    // 按正确顺序执行种子文件
    const seederOrder = [
      '20251106-seed-fans.js',
      '20251106-seed-support-activities.js',
      '20251106-seed-fan-contributions.js'
    ];
    
    for (const fileName of seederOrder) {
      const seeder = require(path.join(seedersPath, fileName));
      
      // 先执行down方法清空表数据
      await seeder.down(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`清空表数据: ${fileName}`);
      
      // 再执行up方法插入种子数据
      await seeder.up(sequelize.getQueryInterface(), sequelize.Sequelize);
      console.log(`执行种子文件: ${fileName}`);
    }
    
    console.log('所有种子文件执行完成');
    process.exit(0);
  } catch (error) {
    console.error('执行种子文件失败:', error);
    process.exit(1);
  }
}

runSeeders();
