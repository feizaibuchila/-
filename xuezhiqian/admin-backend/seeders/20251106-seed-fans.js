module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 生成100个模拟粉丝数据
    const fans = [];
    const nicknames = [
      '薛之谦的小迷弟', '谦谦结', '永远快乐薛之谦', '我心终有谦谦结', '薛氏情歌', 
      '世界和平', '薛之谦让我爱上音乐', '薛老板', '谦谦君子', '薛之谦让我流泪',
      '谦谦的歌声', '薛之谦让我感动', '薛之谦让我疯狂', '薛之谦让我着迷', '薛之谦让我温暖',
      '薛之谦让我坚强', '薛之谦让我成长', '薛之谦让我勇敢', '薛之谦让我快乐', '薛之谦让我幸福',
      '薛之谦让我思念', '薛之谦让我回忆', '薛之谦让我珍惜', '薛之谦让我感恩', '薛之谦让我满足',
      '薛之谦让我期待', '薛之谦让我惊喜', '薛之谦让我激动', '薛之谦让我骄傲', '薛之谦让我自豪'
    ];
    
    for (let i = 0; i < 100; i++) {
      const randomNickname = nicknames[Math.floor(Math.random() * nicknames.length)];
      const phonePrefix = ['130', '131', '132', '133', '134', '135', '136', '137', '138', '139'];
      const phone = `${phonePrefix[Math.floor(Math.random() * phonePrefix.length)]}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
      
      fans.push({
        nickname: `${randomNickname}_${i}`,
        phone: Math.random() > 0.2 ? phone : null, // 80%的粉丝有手机号
        avatar: `https://picsum.photos/id/${Math.floor(Math.random() * 200)}/200/200`,
        join_time: new Date(Date.now() - Math.floor(Math.random() * 31536000000)), // 随机1年内加入
        status: Math.random() > 0.1 ? 1 : 0 // 90%的粉丝处于正常状态
      });
    }
    
    // 插入粉丝数据
    await queryInterface.bulkInsert('fans', fans, {});
  },
  
  down: async (queryInterface, Sequelize) => {
    // 删除所有粉丝数据
    await queryInterface.bulkDelete('fans', null, {});
  }
};
