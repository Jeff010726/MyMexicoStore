import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 公司信息 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🛒</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-orange-300 bg-clip-text text-transparent">
                爆款生活馆
              </span>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              专业的日用品在线商城，为墨西哥用户提供优质的生活用品和贴心服务。让生活更便利，让家更温馨。
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-pink-400 transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-pink-300">🔥 热门分类</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=kitchen" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  🍳 厨房用品
                </Link>
              </li>
              <li>
                <Link to="/products?category=cleaning" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  🧽 清洁用品
                </Link>
              </li>
              <li>
                <Link to="/products?category=storage" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  📦 收纳整理
                </Link>
              </li>
              <li>
                <Link to="/products?category=bathroom" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  🚿 浴室用品
                </Link>
              </li>
            </ul>
          </div>

          {/* 客户服务 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-orange-300">💝 贴心服务</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Phone size={16} className="mr-2" />
                  在线客服
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center">
                  <Mail size={16} className="mr-2" />
                  邮件咨询
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  🔄 7天无理由退货
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  🚚 全国包邮
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  🛡️ 正品保障
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* 联系信息 */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="flex items-center text-gray-400">
              <MapPin size={16} className="mr-2 text-pink-400" />
              <span className="text-sm">墨西哥城，为全国用户提供服务</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Phone size={16} className="mr-2 text-orange-400" />
              <span className="text-sm">客服热线：24小时在线服务</span>
            </div>
            <div className="flex items-center text-gray-400">
              <Mail size={16} className="mr-2 text-purple-400" />
              <span className="text-sm">support@爆款生活馆.mx</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 爆款生活馆. 保留所有权利。让生活更美好 ❤️
          </p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">💳 支付方式:</span>
            <div className="flex space-x-2">
              <span className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1 rounded-full text-white">💳 Visa</span>
              <span className="text-xs bg-gradient-to-r from-red-600 to-red-700 px-3 py-1 rounded-full text-white">💳 MasterCard</span>
              <span className="text-xs bg-gradient-to-r from-green-600 to-green-700 px-3 py-1 rounded-full text-white">🏪 OXXO</span>
              <span className="text-xs bg-gradient-to-r from-purple-600 to-purple-700 px-3 py-1 rounded-full text-white">🏦 SPEI</span>
            </div>
          </div>
        </div>

        {/* 信任标识 */}
        <div className="border-t border-gray-800 mt-6 pt-6">
          <div className="flex flex-wrap justify-center items-center space-x-8 text-gray-500 text-sm">
            <div className="flex items-center">
              <span className="mr-2">🔒</span>
              <span>SSL安全加密</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">✅</span>
              <span>正品保证</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">🚚</span>
              <span>快速配送</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">💝</span>
              <span>贴心服务</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;