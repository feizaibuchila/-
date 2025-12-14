module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 生成20个模拟应援活动数据
    const activities = [];
    const activityTitles = [
      '薛之谦新歌《天外来物2》打榜活动',
      '薛之谦2024演唱会上海站应援活动',
      '薛之谦生日应援活动',
      '薛之谦专辑《无数》宣传活动',
      '薛之谦粉丝见面会应援活动',
      '薛之谦公益活动',
      '薛之谦新歌MV拍摄应援活动',
      '薛之谦线上直播应援活动',
      '薛之谦周边产品设计大赛',
      '薛之谦歌词创作大赛',
      '薛之谦应援口号征集活动',
      '薛之谦应援视频征集活动',
      '薛之谦应援画作征集活动',
      '薛之谦应援歌曲创作大赛',
      '薛之谦应援徽章设计大赛',
      '薛之谦应援海报设计大赛',
      '薛之谦应援手幅设计大赛',
      '薛之谦应援灯牌设计大赛',
      '薛之谦应援毛巾设计大赛',
      '薛之谦应援服设计大赛'
    ];
    
    for (let i = 0; i < 20; i++) {
      const randomTitle = activityTitles[Math.floor(Math.random() * activityTitles.length)];
      const now = new Date();
      const startTime = new Date(now.getTime() - Math.floor(Math.random() * 31536000000)); // 随机1年内开始
      const endTime = new Date(startTime.getTime() + Math.floor(Math.random() * 2592000000)); // 随机30天内结束
      
      activities.push({
        title: randomTitle,
        content: `这是${randomTitle}的详细内容，欢迎所有谦友积极参与！我们需要大家的支持和参与，让我们一起为薛之谦加油！`,
        cover_img: `https://picsum.photos/id/${Math.floor(Math.random() * 300)}/800/400`,
        start_time: startTime,
        end_time: endTime,
        status: endTime < now ? 3 : (startTime > now ? 1 : 2), // 已结束:3, 未开始:1, 进行中:2
        created_by: 1, // 默认管理员ID
        created_at: startTime,
        updated_at: new Date()
      });
    }
    
    // 插入应援活动数据
    await queryInterface.bulkInsert('support_activities', activities, {});
  },
  
  down: async (queryInterface, Sequelize) => {
    // 删除所有应援活动数据
    await queryInterface.bulkDelete('support_activities', null, {});
  }
};
