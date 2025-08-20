/**
 * 数据备份与恢复系统
 * 
 * 提供自动和手动数据备份、恢复和迁移功能
 */

import { authenticatedApiRequest } from '../config/api';

// 备份类型
export enum BackupType {
  FULL = 'full',       // 完整备份
  INCREMENTAL = 'incremental', // 增量备份
  USER_DATA = 'user_data',   // 仅用户数据
  PRODUCT_DATA = 'product_data', // 仅产品数据
  ORDER_DATA = 'order_data',   // 仅订单数据
  SETTINGS = 'settings'     // 仅系统设置
}

// 备份状态
export enum BackupStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// 备份项目接口
export interface BackupItem {
  id: string;
  type: BackupType;
  createdAt: string;
  status: BackupStatus;
  size: number; // 字节
  description: string;
  metadata: {
    version: string;
    recordCount?: {
      users?: number;
      products?: number;
      orders?: number;
      settings?: number;
    };
    checksum?: string;
  };
}

// 备份数据接口
export interface BackupData {
  users?: any[];
  products?: any[];
  orders?: any[];
  settings?: any;
  metadata: {
    version: string;
    timestamp: string;
    type: BackupType;
  };
}

// 恢复选项接口
export interface RestoreOptions {
  includeUsers?: boolean;
  includeProducts?: boolean;
  includeOrders?: boolean;
  includeSettings?: boolean;
  overwriteExisting?: boolean;
  mergeStrategy?: 'overwrite' | 'skip' | 'merge';
}

// 备份服务类
export class BackupService {
  private static instance: BackupService;
  private backupScheduleInterval: number | null = null;
  private isBackupInProgress = false;
  
  private constructor() {
    // 私有构造函数
  }
  
  // 获取单例实例
  public static getInstance(): BackupService {
    if (!BackupService.instance) {
      BackupService.instance = new BackupService();
    }
    return BackupService.instance;
  }
  
  // 初始化自动备份
  public initAutoBackup(intervalHours = 24): void {
    // 清除现有的定时器
    if (this.backupScheduleInterval !== null) {
      window.clearInterval(this.backupScheduleInterval);
    }
    
    // 设置新的定时器
    this.backupScheduleInterval = window.setInterval(() => {
      this.createBackup(BackupType.FULL, '自动定期备份');
    }, intervalHours * 60 * 60 * 1000);
    
    console.log(`自动备份已设置，间隔: ${intervalHours}小时`);
  }
  
  // 停止自动备份
  public stopAutoBackup(): void {
    if (this.backupScheduleInterval !== null) {
      window.clearInterval(this.backupScheduleInterval);
      this.backupScheduleInterval = null;
      console.log('自动备份已停止');
    }
  }
  
  // 创建备份
  public async createBackup(type: BackupType = BackupType.FULL, description: string = ''): Promise<BackupItem | null> {
    if (this.isBackupInProgress) {
      console.warn('已有备份正在进行中，请稍后再试');
      return null;
    }
    
    try {
      this.isBackupInProgress = true;
      
      // 收集要备份的数据
      const backupData: BackupData = {
        metadata: {
          version: '1.0',
          timestamp: new Date().toISOString(),
          type
        }
      };
      
      // 根据备份类型收集不同的数据
      if (type === BackupType.FULL || type === BackupType.USER_DATA) {
        backupData.users = await this.fetchUserData();
      }
      
      if (type === BackupType.FULL || type === BackupType.PRODUCT_DATA) {
        backupData.products = await this.fetchProductData();
      }
      
      if (type === BackupType.FULL || type === BackupType.ORDER_DATA) {
        backupData.orders = await this.fetchOrderData();
      }
      
      if (type === BackupType.FULL || type === BackupType.SETTINGS) {
        backupData.settings = await this.fetchSettingsData();
      }
      
      // 发送备份数据到服务器
      const response = await authenticatedApiRequest('/api/backups', {
        method: 'POST',
        body: JSON.stringify({
          type,
          description,
          data: backupData
        })
      });
      
      console.log('备份创建成功:', response);
      return response.backup;
    } catch (error) {
      console.error('创建备份失败:', error);
      return null;
    } finally {
      this.isBackupInProgress = false;
    }
  }
  
  // 获取所有备份
  public async getBackups(): Promise<BackupItem[]> {
    try {
      const response = await authenticatedApiRequest('/api/backups');
      return response.backups || [];
    } catch (error) {
      console.error('获取备份列表失败:', error);
      return [];
    }
  }
  
  // 获取用户的备份
  public async getUserBackups(userId: string): Promise<BackupItem[]> {
    try {
      const response = await authenticatedApiRequest(`/api/backups?userId=${userId}`);
      return response.backups || [];
    } catch (error) {
      console.error('获取用户备份列表失败:', error);
      return [];
    }
  }
  
  // 获取最新的备份
  public async getLatestBackup(type: BackupType = BackupType.FULL): Promise<BackupItem | null> {
    try {
      const backups = await this.getBackups();
      
      // 筛选指定类型的备份并按创建时间排序
      const filteredBackups = backups
        .filter(backup => backup.type === type && backup.status === BackupStatus.COMPLETED)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return filteredBackups.length > 0 ? filteredBackups[0] : null;
    } catch (error) {
      console.error('获取最新备份失败:', error);
      return null;
    }
  }
  
  // 获取备份详情
  public async getBackupDetails(backupId: string): Promise<BackupData | null> {
    try {
      const backupResponse = await authenticatedApiRequest(`/api/backups/${backupId}`);
      return backupResponse.data;
    } catch (error) {
      console.error('获取备份详情失败:', error);
      return null;
    }
  }
  
  // 从备份恢复数据
  public async restoreFromBackup(
    backupId: string,
    options: RestoreOptions = {
      includeUsers: true,
      includeProducts: true,
      includeOrders: true,
      includeSettings: true,
      overwriteExisting: false,
      mergeStrategy: 'skip'
    }
  ): Promise<boolean> {
    try {
      // 获取备份数据
      const backupData = await this.getBackupDetails(backupId);
      
      if (!backupData) {
        console.error('备份数据不存在或无法访问');
        return false;
      }
      
      // 恢复用户数据
      if (options.includeUsers && backupData.users) {
        await this.restoreUserData(backupData.users, options);
      }
      
      // 恢复产品数据
      if (options.includeProducts && backupData.products) {
        await this.restoreProductData(backupData.products, options);
      }
      
      // 恢复订单数据
      if (options.includeOrders && backupData.orders) {
        await this.restoreOrderData(backupData.orders, options);
      }
      
      // 恢复设置数据
      if (options.includeSettings && backupData.settings) {
        await this.restoreSettingsData(backupData.settings, options);
      }
      
      console.log('数据恢复成功');
      return true;
    } catch (error) {
      console.error('从备份恢复数据失败:', error);
      return false;
    }
  }
  
  // 删除备份
  public async deleteBackup(backupId: string): Promise<boolean> {
    try {
      await authenticatedApiRequest(`/api/backups/${backupId}`, {
        method: 'DELETE'
      });
      
      console.log('备份删除成功');
      return true;
    } catch (error) {
      console.error('删除备份失败:', error);
      return false;
    }
  }
  
  // 导出备份为文件
  public async exportBackupToFile(backupId: string): Promise<boolean> {
    try {
      const backupData = await this.getBackupDetails(backupId);
      
      if (!backupData) {
        console.error('备份数据不存在或无法访问');
        return false;
      }
      
      // 将备份数据转换为JSON字符串
      const jsonData = JSON.stringify(backupData, null, 2);
      
      // 创建Blob对象
      const blob = new Blob([jsonData], { type: 'application/json' });
      
      // 创建下载链接
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${backupId}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      
      // 触发下载
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('导出备份失败:', error);
      return false;
    }
  }
  
  // 从文件导入备份
  public async importBackupFromFile(file: File): Promise<BackupItem | null> {
    try {
      // 读取文件内容
      const fileContent = await this.readFileAsText(file);
      
      // 解析JSON数据
      const backupData = JSON.parse(fileContent);
      
      // 验证备份数据格式
      if (!this.validateBackupData(backupData)) {
        throw new Error('无效的备份文件格式');
      }
      
      // 发送备份数据到服务器
      const response = await authenticatedApiRequest('/api/backups', {
        method: 'POST',
        body: JSON.stringify({
          type: backupData.metadata.type || BackupType.FULL,
          description: `从文件导入: ${file.name}`,
          data: backupData
        })
      });
      
      console.log('备份导入成功:', response);
      return response.backup;
    } catch (error) {
      console.error('导入备份失败:', error);
      return null;
    }
  }
  
  // 验证备份数据格式
  private validateBackupData(data: any): boolean {
    // 基本验证
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // 验证元数据
    if (!data.metadata || !data.metadata.version || !data.metadata.timestamp) {
      return false;
    }
    
    // 至少包含一种数据类型
    if (!data.users && !data.products && !data.orders && !data.settings) {
      return false;
    }
    
    return true;
  }
  
  // 读取文件内容为文本
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          resolve(event.target.result);
        } else {
          reject(new Error('读取文件失败'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    });
  }
  
  // 获取用户数据
  private async fetchUserData(): Promise<any[]> {
    try {
      const response = await authenticatedApiRequest('/api/admin/users');
      return response.users || [];
    } catch (error) {
      console.error('获取用户数据失败:', error);
      return [];
    }
  }
  
  // 获取产品数据
  private async fetchProductData(): Promise<any[]> {
    try {
      const response = await authenticatedApiRequest('/api/admin/products');
      return response.products || [];
    } catch (error) {
      console.error('获取产品数据失败:', error);
      return [];
    }
  }
  
  // 获取订单数据
  private async fetchOrderData(): Promise<any[]> {
    try {
      const response = await authenticatedApiRequest('/api/admin/orders');
      return response.orders || [];
    } catch (error) {
      console.error('获取订单数据失败:', error);
      return [];
    }
  }
  
  // 获取设置数据
  private async fetchSettingsData(): Promise<any> {
    try {
      const response = await authenticatedApiRequest('/api/admin/settings');
      return response.settings || {};
    } catch (error) {
      console.error('获取设置数据失败:', error);
      return {};
    }
  }
  
  // 恢复用户数据
  private async restoreUserData(users: any[], options: RestoreOptions): Promise<void> {
    try {
      await authenticatedApiRequest('/api/admin/restore/users', {
        method: 'POST',
        body: JSON.stringify({
          users,
          overwriteExisting: options.overwriteExisting,
          mergeStrategy: options.mergeStrategy
        })
      });
    } catch (error) {
      console.error('恢复用户数据失败:', error);
      throw error;
    }
  }
  
  // 恢复产品数据
  private async restoreProductData(products: any[], options: RestoreOptions): Promise<void> {
    try {
      await authenticatedApiRequest('/api/admin/restore/products', {
        method: 'POST',
        body: JSON.stringify({
          products,
          overwriteExisting: options.overwriteExisting,
          mergeStrategy: options.mergeStrategy
        })
      });
    } catch (error) {
      console.error('恢复产品数据失败:', error);
      throw error;
    }
  }
  
  // 恢复订单数据
  private async restoreOrderData(orders: any[], options: RestoreOptions): Promise<void> {
    try {
      await authenticatedApiRequest('/api/admin/restore/orders', {
        method: 'POST',
        body: JSON.stringify({
          orders,
          overwriteExisting: options.overwriteExisting,
          mergeStrategy: options.mergeStrategy
        })
      });
    } catch (error) {
      console.error('恢复订单数据失败:', error);
      throw error;
    }
  }
  
  // 恢复设置数据
  private async restoreSettingsData(settings: any, options: RestoreOptions): Promise<void> {
    try {
      await authenticatedApiRequest('/api/admin/restore/settings', {
        method: 'POST',
        body: JSON.stringify({
          settings,
          overwriteExisting: options.overwriteExisting,
          mergeStrategy: options.mergeStrategy
        })
      });
    } catch (error) {
      console.error('恢复设置数据失败:', error);
      throw error;
    }
  }
}

// 导出单例实例
export default BackupService.getInstance();