import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Type,
  Image,
  Square,
  Layout,
  Eye,
  Save,
  Undo,
  Redo,
  Settings,
  Trash2,
  Move,
  Smartphone,
  Monitor,
  Tablet
} from 'lucide-react';

// 组件类型定义
interface ComponentConfig {
  id: string;
  type: 'text' | 'image' | 'button' | 'hero' | 'products' | 'container';
  props: Record<string, any>;
  children?: ComponentConfig[];
}

interface ComponentLibraryItem {
  type: string;
  name: string;
  icon: React.ReactNode;
  defaultProps: Record<string, any>;
}

// 可拖拽组件
const SortableComponent = ({ component, onSelect, isSelected }: {
  component: ComponentConfig;
  onSelect: (id: string) => void;
  isSelected: boolean;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const renderComponent = () => {
    switch (component.type) {
      case 'text':
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-700">{component.props.content || '文本内容'}</p>
          </div>
        );
      case 'image':
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
              <Image className="text-gray-400" size={32} />
            </div>
          </div>
        );
      case 'button':
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <button className="bg-blue-600 text-white px-4 py-2 rounded">
              {component.props.text || '按钮'}
            </button>
          </div>
        );
      case 'hero':
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-lg text-center">
              <h1 className="text-3xl font-bold mb-4">{component.props.title || '英雄标题'}</h1>
              <p className="text-lg">{component.props.subtitle || '副标题描述'}</p>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">{component.props.title || '商品展示'}</h3>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 p-4 rounded">
                  <div className="w-full h-20 bg-gray-200 rounded mb-2"></div>
                  <p className="text-sm">商品 {i}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">未知组件类型</p>
          </div>
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect(component.id)}
    >
      {renderComponent()}
      
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded p-1 cursor-move"
      >
        <Move size={16} className="text-gray-600" />
      </div>
      
      {/* 删除按钮 */}
      <div className="absolute top-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white border rounded p-1 cursor-pointer hover:bg-red-50">
        <Trash2 size={16} className="text-red-600" />
      </div>
    </div>
  );
};

const PageEditor = () => {
  const [components, setComponents] = useState<ComponentConfig[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 组件库
  const componentLibrary: ComponentLibraryItem[] = [
    {
      type: 'text',
      name: '文本',
      icon: <Type size={20} />,
      defaultProps: { content: '这是一段文本内容', fontSize: '16px', color: '#000000' }
    },
    {
      type: 'image',
      name: '图片',
      icon: <Image size={20} />,
      defaultProps: { src: '', alt: '图片', width: '100%', height: 'auto' }
    },
    {
      type: 'button',
      name: '按钮',
      icon: <Square size={20} />,
      defaultProps: { text: '点击按钮', color: '#3B82F6', textColor: '#FFFFFF' }
    },
    {
      type: 'hero',
      name: '英雄区块',
      icon: <Layout size={20} />,
      defaultProps: { title: '欢迎来到我们的网站', subtitle: '发现更多精彩内容', backgroundImage: '' }
    },
    {
      type: 'products',
      name: '商品展示',
      icon: <Square size={20} />,
      defaultProps: { title: '热门商品', limit: 8, columns: 4 }
    }
  ];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  const addComponent = (type: string) => {
    const libraryItem = componentLibrary.find(item => item.type === type);
    if (!libraryItem) return;

    const newComponent: ComponentConfig = {
      id: `component-${Date.now()}`,
      type: type as ComponentConfig['type'],
      props: { ...libraryItem.defaultProps },
    };

    setComponents(prev => [...prev, newComponent]);
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const updateComponentProps = (id: string, newProps: Record<string, any>) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, props: { ...comp.props, ...newProps } } : comp
    ));
  };

  const selectedComponent = components.find(comp => comp.id === selectedComponentId);

  const getPreviewWidth = () => {
    switch (previewMode) {
      case 'mobile':
        return 'w-80';
      case 'tablet':
        return 'w-96';
      default:
        return 'w-full';
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* 左侧组件库 */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">组件库</h2>
        </div>
        
        <div className="flex-1 p-4 space-y-2">
          {componentLibrary.map((item) => (
            <button
              key={item.type}
              onClick={() => addComponent(item.type)}
              className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-colors"
            >
              <div className="text-gray-600">{item.icon}</div>
              <span className="text-sm font-medium text-gray-700">{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 中间编辑区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Save size={16} />
              <span>保存</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Undo size={16} />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Redo size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* 预览模式切换 */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`p-2 rounded ${previewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor size={16} className={previewMode === 'desktop' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setPreviewMode('tablet')}
                className={`p-2 rounded ${previewMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
              >
                <Tablet size={16} className={previewMode === 'tablet' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`p-2 rounded ${previewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone size={16} className={previewMode === 'mobile' ? 'text-blue-600' : 'text-gray-600'} />
              </button>
            </div>

            <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Eye size={16} />
              <span>预览</span>
            </button>
          </div>
        </div>

        {/* 画布区域 */}
        <div className="flex-1 p-6 overflow-auto">
          <div className={`mx-auto bg-white rounded-lg shadow-sm border min-h-96 ${getPreviewWidth()}`}>
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
                <div className="p-6 space-y-4">
                  {components.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Layout size={48} className="mx-auto mb-4 text-gray-300" />
                      <p>从左侧组件库拖拽组件到这里开始设计</p>
                    </div>
                  ) : (
                    components.map((component) => (
                      <SortableComponent
                        key={component.id}
                        component={component}
                        onSelect={setSelectedComponentId}
                        isSelected={selectedComponentId === component.id}
                      />
                    ))
                  )}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeId ? (
                  <div className="opacity-50">
                    {/* 拖拽时的预览 */}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>

      {/* 右侧属性面板 */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">属性设置</h2>
        </div>
        
        <div className="flex-1 p-4">
          {selectedComponent ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">组件类型</h3>
                <p className="text-sm text-gray-600 capitalize">{selectedComponent.type}</p>
              </div>

              {selectedComponent.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">文本内容</label>
                    <textarea
                      value={selectedComponent.props.content || ''}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { content: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">字体大小</label>
                    <input
                      type="text"
                      value={selectedComponent.props.fontSize || '16px'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { fontSize: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">文字颜色</label>
                    <input
                      type="color"
                      value={selectedComponent.props.color || '#000000'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {selectedComponent.type === 'button' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">按钮文字</label>
                    <input
                      type="text"
                      value={selectedComponent.props.text || ''}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { text: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">背景颜色</label>
                    <input
                      type="color"
                      value={selectedComponent.props.color || '#3B82F6'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { color: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">文字颜色</label>
                    <input
                      type="color"
                      value={selectedComponent.props.textColor || '#FFFFFF'}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { textColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {selectedComponent.type === 'hero' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">主标题</label>
                    <input
                      type="text"
                      value={selectedComponent.props.title || ''}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { title: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">副标题</label>
                    <input
                      type="text"
                      value={selectedComponent.props.subtitle || ''}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { subtitle: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">背景图片URL</label>
                    <input
                      type="url"
                      value={selectedComponent.props.backgroundImage || ''}
                      onChange={(e) => updateComponentProps(selectedComponent.id, { backgroundImage: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => removeComponent(selectedComponent.id)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 size={16} />
                  <span>删除组件</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Settings size={48} className="mx-auto mb-4 text-gray-300" />
              <p>选择一个组件来编辑属性</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageEditor;