module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 生成50个模拟粉丝投稿数据
    const contributions = [];
    const contributionContents = [
      '薛之谦的歌声真的太好听了，每次听都会感动到哭！',
      '薛之谦的演唱会太震撼了，希望能有机会再去看！',
      '薛之谦的新歌《天外来物2》太棒了，已经循环播放了一整天！',
      '薛之谦是我最喜欢的歌手，他的每首歌都能引起我的共鸣！',
      '薛之谦的努力和坚持真的很让人敬佩，我们会一直支持他！',
      '薛之谦的公益活动很有意义，希望能有机会参与！',
      '薛之谦的歌词写得太好了，每一句都能戳中人心！',
      '薛之谦的演唱会现场太燃了，氛围超级好！',
      '薛之谦的周边产品设计得很精美，已经买了很多了！',
      '薛之谦的线上直播很有趣，希望能多开几次！'
    ];
    
    for (let i = 0; i < 50; i++) {
      const randomContent = contributionContents[Math.floor(Math.random() * contributionContents.length)];
      const createdAt = new Date(Date.now() - Math.floor(Math.random() * 31536000000)); // 随机1年内创建
      
      contributions.push({
        fan_id: Math.floor(Math.random() * 100) + 1, // 随机粉丝ID（1-100）
        activity_id: Math.random() > 0.5 ? (Math.floor(Math.random() * 20) + 1) : null, // 50%关联活动（1-20）
        content: randomContent,
        img_url: Math.random() > 0.5 ? `https://picsum.photos/id/${Math.floor(Math.random() * 400)}/600/400` : null, // 50%有图片
        status: Math.random() > 0.2 ? (Math.random() > 0.5 ? 2 : 1) : 3, // 80%通过或待审核，20%驳回
        created_at: createdAt
      });
    }
    
    // 插入粉丝投稿数据
    await queryInterface.bulkInsert('fan_contributions', contributions, {});
  },
  
  down: async (queryInterface, Sequelize) => {
    // 删除所有粉丝投稿数据
    await queryInterface.bulkDelete('fan_contributions', null, {});
  }
};
