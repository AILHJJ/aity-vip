/**
 * 测试讨论API响应格式
 * 验证修复后的API是否返回正确的数据结构
 */

const testDiscussionApiResponse = () => {
  console.log('========== 讨论API响应格式测试 ==========\n');

  // 模拟修复前的响应(错误格式)
  console.log('❌ 修复前的响应格式:');
  console.log(JSON.stringify({
    code: 200,
    message: "Success",
    data: [  // 直接是数组
      {
        id: 1,
        title: "测试讨论",
        content: "测试内容",
        user_name: "测试用户"
      }
    ]
  }, null, 2));

  console.log('\n前端解析结果:');
  const oldResponse = {
    code: 200,
    message: "Success",
    data: [
      { id: 1, title: "测试讨论", content: "测试内容", user_name: "测试用户" }
    ]
  };
  console.log('res.data.discussions:', oldResponse.data.discussions); // undefined
  console.log('✗ 问题: res.data.discussions = undefined\n');

  // 模拟修复后的响应(正确格式)
  console.log('\n✅ 修复后的响应格式:');
  console.log(JSON.stringify({
    code: 200,
    message: "Success",
    data: {  // 包装为对象
      discussions: [  // discussions作为属性
        {
          id: 1,
          title: "测试讨论",
          content: "测试内容",
          user_name: "测试用户"
        }
      ]
    }
  }, null, 2));

  console.log('\n前端解析结果:');
  const newResponse = {
    code: 200,
    message: "Success",
    data: {
      discussions: [
        { id: 1, title: "测试讨论", content: "测试内容", user_name: "测试用户" }
      ]
    }
  };
  console.log('res.data.discussions:', newResponse.data.discussions); // 正确获取到数组
  console.log('✓ 成功: res.data.discussions = [Array]\n');

  console.log('=====================================');
  console.log('📋 问题总结:');
  console.log('1. 后端原本返回: res.json(success(discussionsArray))');
  console.log('2. 前端期望: res.data.discussions');
  console.log('3. 修复方案: res.json(success({ discussions: discussionsArray }))');
  console.log('=====================================\n');
};

testDiscussionApiResponse();
