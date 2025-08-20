

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">服务条款</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              最后更新日期：{new Date().toLocaleDateString('zh-CN')}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. 接受条款</h2>
              <p className="text-gray-700 mb-4">
                欢迎使用我们的电商平台。通过访问或使用我们的服务，您同意受本服务条款的约束。
                如果您不同意这些条款，请不要使用我们的服务。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. 服务描述</h2>
              <p className="text-gray-700 mb-4">
                我们提供在线电商平台服务，包括但不限于：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>商品展示和销售</li>
                <li>订单处理和管理</li>
                <li>支付处理服务</li>
                <li>客户支持服务</li>
                <li>用户账户管理</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. 用户账户</h2>
              <p className="text-gray-700 mb-4">
                为了使用某些服务，您需要创建一个账户。您同意：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>提供准确、完整的注册信息</li>
                <li>维护账户信息的准确性</li>
                <li>保护账户密码的安全</li>
                <li>对账户下的所有活动负责</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. 订单和支付</h2>
              <p className="text-gray-700 mb-4">
                关于订单和支付的条款：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>所有价格均以美元显示，包含适用税费</li>
                <li>我们保留拒绝或取消任何订单的权利</li>
                <li>支付必须在订单确认时完成</li>
                <li>我们接受主要信用卡和其他指定支付方式</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. 配送和退货</h2>
              <p className="text-gray-700 mb-4">
                配送和退货政策：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>配送时间因地区而异，通常为3-7个工作日</li>
                <li>配送费用在结账时显示</li>
                <li>30天内可申请退货，商品需保持原始状态</li>
                <li>退货运费由客户承担，除非商品有缺陷</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. 禁止行为</h2>
              <p className="text-gray-700 mb-4">
                使用我们的服务时，您不得：
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>违反任何适用的法律法规</li>
                <li>侵犯他人的知识产权</li>
                <li>发布虚假或误导性信息</li>
                <li>干扰或破坏服务的正常运行</li>
                <li>尝试未经授权访问系统</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. 知识产权</h2>
              <p className="text-gray-700 mb-4">
                我们的服务及其内容受知识产权法保护。未经我们明确书面许可，
                您不得复制、修改、分发或以其他方式使用我们的内容。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. 免责声明</h2>
              <p className="text-gray-700 mb-4">
                我们的服务按"现状"提供，不提供任何明示或暗示的保证。
                我们不对服务中断、错误或数据丢失承担责任。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. 责任限制</h2>
              <p className="text-gray-700 mb-4">
                在法律允许的最大范围内，我们对任何间接、偶然、特殊或后果性损害不承担责任，
                包括但不限于利润损失、数据丢失或业务中断。
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. 条款修改</h2>
              <p className="text-gray-700 mb-4">
                我们保留随时修改这些条款的权利。重大更改将通过网站通知或电子邮件通知您。
                继续使用服务即表示您接受修改后的条款。
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. 联系信息</h2>
              <p className="text-gray-700">
                如果您对本服务条款有任何疑问，请联系我们：<br />
                电子邮件：<a href="mailto:info@aimorelogy.com" className="text-blue-600 hover:text-blue-800">info@aimorelogy.com</a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;