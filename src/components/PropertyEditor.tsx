import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ComponentConfig {
  id: string;
  type: string;
  props: Record<string, any>;
  style?: Record<string, any>;
}

interface PropertyEditorProps {
  component: ComponentConfig;
  onUpdate: (updates: Partial<ComponentConfig>) => void;
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ component, onUpdate }) => {
  const handlePropChange = (key: string, value: any) => {
    onUpdate({
      props: { ...component.props, [key]: value }
    });
  };

  const renderPropertyInput = (key: string, value: any) => {
    // 根据属性名和值类型渲染不同的输入控件
    if (key.includes('Color') || key === 'color' || key === 'backgroundColor' || key === 'textColor') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="color"
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            className="w-8 h-8 rounded border"
          />
          <Input
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            placeholder="#000000"
          />
        </div>
      );
    }

    if (key === 'fontSize' || key === 'height' || key === 'width' || key === 'borderRadius') {
      return (
        <div className="flex items-center space-x-2">
          <Input
            value={value}
            onChange={(e) => handlePropChange(key, e.target.value)}
            placeholder="16px"
          />
          <span className="text-sm text-gray-500">px</span>
        </div>
      );
    }

    if (key === 'textAlign') {
      return (
        <select
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="left">左对齐</option>
          <option value="center">居中</option>
          <option value="right">右对齐</option>
          <option value="justify">两端对齐</option>
        </select>
      );
    }

    if (key === 'fontWeight') {
      return (
        <select
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="normal">正常</option>
          <option value="bold">粗体</option>
          <option value="lighter">细体</option>
          <option value="bolder">更粗</option>
        </select>
      );
    }

    if (key === 'layout') {
      return (
        <select
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="grid">网格布局</option>
          <option value="list">列表布局</option>
          <option value="carousel">轮播布局</option>
          <option value="masonry">瀑布流</option>
          <option value="accordion">手风琴</option>
        </select>
      );
    }

    if (key === 'style' && component.type === 'button') {
      return (
        <select
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="primary">主要按钮</option>
          <option value="secondary">次要按钮</option>
          <option value="outline">边框按钮</option>
          <option value="ghost">幽灵按钮</option>
        </select>
      );
    }

    if (key === 'size') {
      return (
        <select
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        >
          <option value="small">小</option>
          <option value="medium">中</option>
          <option value="large">大</option>
        </select>
      );
    }

    if (key === 'columns' || key === 'limit') {
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => handlePropChange(key, parseInt(e.target.value) || 1)}
          min="1"
          max="12"
        />
      );
    }

    if (key.includes('show') || key.includes('Show')) {
      return (
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handlePropChange(key, e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">{value ? '显示' : '隐藏'}</span>
        </label>
      );
    }

    if (key === 'content' || key === 'subtitle' || key === 'description') {
      return (
        <textarea
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          rows={3}
          placeholder="请输入内容"
        />
      );
    }

    if (key === 'endTime') {
      return (
        <Input
          type="datetime-local"
          value={value}
          onChange={(e) => handlePropChange(key, e.target.value)}
        />
      );
    }

    // 默认文本输入
    return (
      <Input
        value={value}
        onChange={(e) => handlePropChange(key, e.target.value)}
        placeholder={`请输入${key}`}
      />
    );
  };

  const getPropertyLabel = (key: string) => {
    const labels: Record<string, string> = {
      title: '标题',
      subtitle: '副标题',
      content: '内容',
      description: '描述',
      buttonText: '按钮文字',
      text: '文字',
      placeholder: '占位符',
      linkUrl: '链接地址',
      src: '图片地址',
      alt: '图片描述',
      backgroundColor: '背景颜色',
      textColor: '文字颜色',
      color: '颜色',
      fontSize: '字体大小',
      fontWeight: '字体粗细',
      textAlign: '文字对齐',
      lineHeight: '行高',
      width: '宽度',
      height: '高度',
      borderRadius: '圆角',
      layout: '布局方式',
      columns: '列数',
      limit: '显示数量',
      style: '样式',
      size: '尺寸',
      showPrice: '显示价格',
      showRating: '显示评分',
      showIcons: '显示图标',
      showStars: '显示星级',
      showPhone: '显示电话',
      showEmail: '显示邮箱',
      showAddress: '显示地址',
      showTitles: '显示标题',
      showSearch: '显示搜索',
      endTime: '结束时间',
      backgroundImage: '背景图片'
    };
    return labels[key] || key;
  };

  const getPropertyCategory = (key: string) => {
    if (['title', 'subtitle', 'content', 'description', 'buttonText', 'text', 'placeholder'].includes(key)) {
      return '内容设置';
    }
    if (['backgroundColor', 'textColor', 'color', 'fontSize', 'fontWeight', 'textAlign', 'lineHeight'].includes(key)) {
      return '样式设置';
    }
    if (['width', 'height', 'borderRadius', 'layout', 'columns', 'limit', 'size'].includes(key)) {
      return '布局设置';
    }
    if (key.includes('show') || key.includes('Show')) {
      return '显示选项';
    }
    if (['linkUrl', 'src', 'alt', 'endTime', 'backgroundImage'].includes(key)) {
      return '链接和媒体';
    }
    return '其他设置';
  };

  // 按类别分组属性
  const groupedProps = Object.entries(component.props).reduce((groups, [key, value]) => {
    const category = getPropertyCategory(key);
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push([key, value]);
    return groups;
  }, {} as Record<string, Array<[string, any]>>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">组件属性</h3>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {component.type}
        </div>
      </div>

      {Object.entries(groupedProps).map(([category, props]) => (
        <div key={category} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700 border-b pb-1">
            {category}
          </h4>
          <div className="space-y-3">
            {props.map(([key, value]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {getPropertyLabel(key)}
                </label>
                {renderPropertyInput(key, value)}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 快速样式预设 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 border-b pb-1">
          快速样式
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => {
              onUpdate({
                props: {
                  ...component.props,
                  backgroundColor: '#3b82f6',
                  textColor: '#ffffff'
                }
              });
            }}
            className="bg-blue-600 hover:bg-blue-700 text-xs py-1"
          >
            蓝色主题
          </Button>
          <Button
            onClick={() => {
              onUpdate({
                props: {
                  ...component.props,
                  backgroundColor: '#ec4899',
                  textColor: '#ffffff'
                }
              });
            }}
            className="bg-pink-600 hover:bg-pink-700 text-xs py-1"
          >
            粉色主题
          </Button>
          <Button
            onClick={() => {
              onUpdate({
                props: {
                  ...component.props,
                  backgroundColor: '#10b981',
                  textColor: '#ffffff'
                }
              });
            }}
            className="bg-green-600 hover:bg-green-700 text-xs py-1"
          >
            绿色主题
          </Button>
          <Button
            onClick={() => {
              onUpdate({
                props: {
                  ...component.props,
                  backgroundColor: '#f8fafc',
                  textColor: '#1f2937'
                }
              });
            }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-900 text-xs py-1"
          >
            浅色主题
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyEditor;