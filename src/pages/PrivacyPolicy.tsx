

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              最后更新日期：{new Date().toLocaleDateString('zh-CN')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 信息收集</h2>
              <p className="text-gray-700 mb-4">
                我们收集您在使用我们服务时提供的信息，包括：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>个人身份信息（姓名、电子邮件地址、电话号码）</li>
                <li>账户信息（用户名、密码）</li>
                <li>订单和交易信息</li>
                <li>设备和使用信息</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 信息使用</h2>
              <p className="text-gray-700 mb-4">
                我们使用收集的信息用于：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>提供和改进我们的服务</li>
                <li>处理订单和交易</li>
                <li>与您沟通</li>
                <li>个性化用户体验</li>
                <li>确保平台安全</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 信息共享</h2>
              <p className="text-gray-700 mb-4">
                我们不会出售、交易或转让您的个人信息给第三方，除非：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>获得您的明确同意</li>
                <li>法律要求</li>
                <li>保护我们的权利和安全</li>
                <li>与可信的服务提供商合作（如支付处理商）</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 数据安全</h2>
              <p className="text-gray-700 mb-4">
                我们采用适当的安全措施保护您的个人信息，包括：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>数据加密</li>
                <li>安全的服务器</li>
                <li>访问控制</li>
                <li>定期安全审计</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 您的权利</h2>
              <p className="text-gray-700 mb-4">
                您有权：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>访问您的个人信息</li>
                <li>更正不准确的信息</li>
                <li>删除您的个人信息</li>
                <li>限制信息处理</li>
                <li>数据可携带性</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookie政策</h2>
              <p className="text-gray-700 mb-4">
                我们使用Cookie和类似技术来改善您的浏览体验、分析网站流量并个性化内容。
                您可以通过浏览器设置管理Cookie偏好。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 联系我们</h2>
              <p className="text-gray-700 mb-4">
                如果您对本隐私政策有任何疑问，请通过以下方式联系我们：
              </p>
              <p className="text-gray-700">
                电子邮件：<a href="mailto:info@aimorelogy.com" className="text-blue-600 hover:text-blue-800">info@aimorelogy.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 政策更新</h2>
              <p className="text-gray-700">
                我们可能会不时更新本隐私政策。任何更改将在此页面上发布，
                重大更改将通过电子邮件或网站通知您。
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;