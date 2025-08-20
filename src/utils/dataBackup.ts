/**
 * 数据备份与恢复机制
 * 
 * 提供本地数据备份、云端同步和数据恢复功能
 */

import { apiRequest, API_CONFIG } from '../config/api';

// 备份类型
export enum BackupType {
  USER_DATA = 'user_data',
  CART_DATA = 'cart_data',
  PREFERENCES = 'preferences',
  FORM_DATA = 'form_data',
  OFFLINE_ORDERS = 'offline_orders',
  ALL = 'all'
}

// 备份频率
export enum BackupFrequency {
  MANUAL = 'manual',
  ON_CHANGE = 'on_change',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

// 备份存储位置
export enum BackupStorage {
  LOCAL_STORAGE = 'local_storage',
  SESSION_STORAGE = 'session_storage',
  INDEXED_DB = 'indexed_db',
  CLOUD = 'cloud'
}

// 备份配置接口
export interface BackupConfig {
  type: BackupType;
  frequency: BackupFrequency;
  storage: BackupStorage;
  encryptionEnabled: boolean;
  compressionEnabled: boolean;
  maxBackupCount: number;
  retentionDays: number;
}

// 备份元数据接口
export interface BackupMetadata {
  id: string;
  type: BackupType;
  timestamp: string;
  size: number;
  checksum: string;
  version: string;
  userId?: string;
}

// 默认备份配置
const defaultBackupConfig: BackupConfig = {
  type: BackupType.ALL,
  frequency: BackupFrequency.ON_CHANGE,
  storage: BackupStorage.LOCAL_STORAGE,
  encryptionEnabled: false,
  compressionEnabled: true,
  maxBackupCount: 5,
  retentionDays: 30
};

// 数据备份服务
export class DataBackupService {
  private static instance: DataBackupService;
  private config: BackupConfig;
  private backupRegistry: Map<string, BackupMetadata> = new Map();
  private backupIntervalId: number | null = null;
  
  private constructor(config: Partial<BackupConfig> = {}) {
    this.config = { ...defaultBackupConfig, ...config };
    this.loadBackupRegistry();
    this.setupAutomaticBackups();
  }
  
  // 获取单例实例
  public static getInstance(config: Partial<BackupConfig> = {}): DataBackupService {
    if (!DataBackupService.instance) {
      DataBackupService.instance = new DataBackupService(config);
    }
    return DataBackupService.instance;
  }
  
  // 更新配置
  public updateConfig(config: Partial<BackupConfig>): void {
    this.config = { ...this.config, ...config };
    this.setupAutomaticBackups();
  }
  
  // 获取当前配置
  public getConfig(): BackupConfig {
    return { ...this.config };
  }
  
  // 创建备份
  public async createBackup(type: BackupType = this.config.type): Promise<BackupMetadata | null> {
    try {
      // 收集要备份的数据
      const data = this.collectDataForBackup(type);
      if (!data) {
        console.warn(`No data to backup for type: ${type}`);
        return null;
      }
      
      // 处理数据（压缩、加密等）
      const processedData = await this.processDataForBackup(data);
      
      // 生成备份元数据
      const metadata: BackupMetadata = {
        id: `backup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type,
        timestamp: new Date().toISOString(),
        size: new TextEncoder().encode(JSON.stringify(processedData)).length,
        checksum: await this.generateChecksum(processedData),
        version: '1.0'
      };
      
      // 存储备份
      await this.storeBackup(metadata, processedData);
      
      // 更新备份注册表
      this.backupRegistry.set(metadata.id, metadata);
      this.saveBackupRegistry();
      
      // 清理旧备份
      this.cleanupOldBackups();
      
      console.log(`Backup created: ${metadata.id} (${metadata.type})`);
      return metadata;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  }
  
  // 恢复备份
  public async restoreBackup(backupId: string): Promise<boolean> {
    try {
      // 获取备份元数据
      const metadata = this.backupRegistry.get(backupId);
      if (!metadata) {
        console.error(`Backup not found: ${backupId}`);
        return false;
      }
      
      // 获取备份数据
      const backupData = await this.retrieveBackup(metadata);
      if (!backupData) {
        console.error(`Failed to retrieve backup data: ${backupId}`);
        return false;
      }
      
      // 处理备份数据（解密、解压等）
      const processedData = await this.processDataForRestore(backupData);
      
      // 应用备份数据
      const success = this.applyBackupData(metadata.type, processedData);
      
      if (success) {
        console.log(`Backup restored: ${backupId} (${metadata.type})`);
      }
      
      return success;
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }
  
  // 列出所有备份
  public listBackups(type?: BackupType): BackupMetadata[] {
    const backups = Array.from(this.backupRegistry.values());
    
    if (type) {
      return backups.filter(backup => backup.type === type);
    }
    
    return backups;
  }
  
  // 删除备份
  public async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const metadata = this.backupRegistry.get(backupId);
      if (!metadata) {
        console.error(`Backup not found: ${backupId}`);
        return false;
      }
      
      // 从存储中删除备份
      await this.removeBackupFromStorage(metadata);
      
      // 从注册表中删除
      this.backupRegistry.delete(backupId);
      this.saveBackupRegistry();
      
      console.log(`Backup deleted: ${backupId}`);
      return true;
    } catch (error) {
      console.error('Error deleting backup:', error);
      return false;
    }
  }
  
  // 同步备份到云端
  public async syncToCloud(backupId: string): Promise<boolean> {
    try {
      if (this.config.storage === BackupStorage.CLOUD) {
        console.log('Backup is already stored in the cloud');
        return true;
      }
      
      const metadata = this.backupRegistry.get(backupId);
      if (!metadata) {
        console.error(`Backup not found: ${backupId}`);
        return false;
      }
      
      // 获取备份数据
      const backupData = await this.retrieveBackup(metadata);
      if (!backupData) {
        console.error(`Failed to retrieve backup data: ${backupId}`);
        return false;
      }
      
      // 上传到云端
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.BACKUPS}`, {
        method: 'POST',
        body: JSON.stringify({
          metadata,
          data: backupData
        })
      });
      
      if (response.success) {
        console.log(`Backup synced to cloud: ${backupId}`);
        return true;
      } else {
        console.error('Failed to sync backup to cloud:', response.message);
        return false;
      }
    } catch (error) {
      console.error('Error syncing backup to cloud:', error);
      return false;
    }
  }
  
  // 从云端恢复备份
  public async restoreFromCloud(userId: string): Promise<boolean> {
    try {
      // 获取云端备份列表
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.BACKUPS}?userId=${userId}`);
      
      if (!response.success || !response.data || !response.data.backups || response.data.backups.length === 0) {
        console.error('No cloud backups found');
        return false;
      }
      
      // 获取最新的备份
      const latestBackup = response.data.backups[0];
      
      // 下载备份数据
      const backupResponse = await apiRequest(`${API_CONFIG.ENDPOINTS.BACKUPS}/${latestBackup.id}`);
      
      if (!backupResponse.success || !backupResponse.data) {
        console.error('Failed to download backup from cloud');
        return false;
      }
      
      // 处理备份数据
      const processedData = await this.processDataForRestore(backupResponse.data.data);
      
      // 应用备份数据
      const success = this.applyBackupData(latestBackup.type, processedData);
      
      if (success) {
        console.log(`Cloud backup restored: ${latestBackup.id}`);
        
        // 添加到本地注册表
        this.backupRegistry.set(latestBackup.id, latestBackup);
        this.saveBackupRegistry();
      }
      
      return success;
    } catch (error) {
      console.error('Error restoring from cloud:', error);
      return false;
    }
  }
  
  // 设置自动备份
  private setupAutomaticBackups(): void {
    // 清除现有的定时器
    if (this.backupIntervalId !== null) {
      window.clearInterval(this.backupIntervalId);
      this.backupIntervalId = null;
    }
    
    // 根据频率设置新的定时器
    if (this.config.frequency === BackupFrequency.HOURLY) {
      this.backupIntervalId = window.setInterval(() => this.createBackup(), 60 * 60 * 1000);
    } else if (this.config.frequency === BackupFrequency.DAILY) {
      this.backupIntervalId = window.setInterval(() => this.createBackup(), 24 * 60 * 60 * 1000);
    } else if (this.config.frequency === BackupFrequency.WEEKLY) {
      this.backupIntervalId = window.setInterval(() => this.createBackup(), 7 * 24 * 60 * 60 * 1000);
    }
    
    // 对于ON_CHANGE频率，在相关数据变化时手动调用createBackup
  }
  
  // 收集要备份的数据
  private collectDataForBackup(type: BackupType): any {
    const data: Record<string, any> = {};
    
    if (type === BackupType.ALL || type === BackupType.USER_DATA) {
      data.userData = this.getUserData();
    }
    
    if (type === BackupType.ALL || type === BackupType.CART_DATA) {
      data.cartData = this.getCartData();
    }
    
    if (type === BackupType.ALL || type === BackupType.PREFERENCES) {
      data.preferences = this.getPreferences();
    }
    
    if (type === BackupType.ALL || type === BackupType.FORM_DATA) {
      data.formData = this.getFormData();
    }
    
    if (type === BackupType.ALL || type === BackupType.OFFLINE_ORDERS) {
      data.offlineOrders = this.getOfflineOrders();
    }
    
    return Object.keys(data).length > 0 ? data : null;
  }
  
  // 获取用户数据
  private getUserData(): any {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
  
  // 获取购物车数据
  private getCartData(): any {
    try {
      const cartData = localStorage.getItem('cart');
      return cartData ? JSON.parse(cartData) : null;
    } catch (error) {
      console.error('Error getting cart data:', error);
      return null;
    }
  }
  
  // 获取用户偏好设置
  private getPreferences(): any {
    try {
      const preferences = localStorage.getItem('preferences');
      return preferences ? JSON.parse(preferences) : null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }
  
  // 获取表单数据
  private getFormData(): any {
    try {
      const formData = localStorage.getItem('form_data');
      return formData ? JSON.parse(formData) : null;
    } catch (error) {
      console.error('Error getting form data:', error);
      return null;
    }
  }
  
  // 获取离线订单
  private getOfflineOrders(): any {
    try {
      const offlineOrders = localStorage.getItem('offline_orders');
      return offlineOrders ? JSON.parse(offlineOrders) : null;
    } catch (error) {
      console.error('Error getting offline orders:', error);
      return null;
    }
  }
  
  // 处理备份数据（压缩、加密等）
  private async processDataForBackup(data: any): Promise<any> {
    // 转换为JSON字符串
    const jsonData = JSON.stringify(data);
    
    // 压缩数据
    let processedData = jsonData;
    if (this.config.compressionEnabled) {
      processedData = await this.compressData(jsonData);
    }
    
    // 加密数据
    if (this.config.encryptionEnabled) {
      processedData = await this.encryptData(processedData);
    }
    
    return processedData;
  }
  
  // 处理恢复数据（解密、解压等）
  private async processDataForRestore(data: any): Promise<any> {
    let processedData = data;
    
    // 解密数据
    if (this.config.encryptionEnabled) {
      processedData = await this.decryptData(processedData);
    }
    
    // 解压数据
    if (this.config.compressionEnabled) {
      processedData = await this.decompressData(processedData);
    }
    
    // 解析JSON
    try {
      return JSON.parse(processedData);
    } catch (error) {
      console.error('Error parsing backup data:', error);
      return null;
    }
  }
  
  // 压缩数据（简化实现）
  private async compressData(data: string): Promise<string> {
    // 实际应用中应使用真正的压缩算法
    // 这里仅作为示例
    return data;
  }
  
  // 解压数据（简化实现）
  private async decompressData(data: string): Promise<string> {
    // 实际应用中应使用真正的解压算法
    // 这里仅作为示例
    return data;
  }
  
  // 加密数据（简化实现）
  private async encryptData(data: string): Promise<string> {
    // 实际应用中应使用真正的加密算法
    // 这里仅作为示例
    return data;
  }
  
  // 解密数据（简化实现）
  private async decryptData(data: string): Promise<string> {
    // 实际应用中应使用真正的解密算法
    // 这里仅作为示例
    return data;
  }
  
  // 生成校验和
  private async generateChecksum(data: any): Promise<string> {
    // 实际应用中应使用真正的校验和算法
    // 这里仅作为示例
    const jsonData = typeof data === 'string' ? data : JSON.stringify(data);
    let hash = 0;
    
    for (let i = 0; i < jsonData.length; i++) {
      const char = jsonData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return hash.toString(16);
  }
  
  // 存储备份
  private async storeBackup(metadata: BackupMetadata, data: any): Promise<void> {
    try {
      switch (this.config.storage) {
        case BackupStorage.LOCAL_STORAGE:
          localStorage.setItem(`backup_${metadata.id}`, JSON.stringify(data));
          break;
        case BackupStorage.SESSION_STORAGE:
          sessionStorage.setItem(`backup_${metadata.id}`, JSON.stringify(data));
          break;
        case BackupStorage.INDEXED_DB:
          // 实际应用中应使用IndexedDB API
          console.log('IndexedDB storage not implemented');
          break;
        case BackupStorage.CLOUD:
          await this.storeBackupInCloud(metadata, data);
          break;
        default:
          throw new Error(`Unsupported storage type: ${this.config.storage}`);
      }
    } catch (error) {
      console.error('Error storing backup:', error);
      throw error;
    }
  }
  
  // 在云端存储备份
  private async storeBackupInCloud(metadata: BackupMetadata, data: any): Promise<void> {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.BACKUPS}`, {
        method: 'POST',
        body: JSON.stringify({
          metadata,
          data
        })
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to store backup in cloud');
      }
    } catch (error) {
      console.error('Error storing backup in cloud:', error);
      throw error;
    }
  }
  
  // 获取备份
  private async retrieveBackup(metadata: BackupMetadata): Promise<any> {
    try {
      switch (this.config.storage) {
        case BackupStorage.LOCAL_STORAGE: {
          const data = localStorage.getItem(`backup_${metadata.id}`);
          return data ? JSON.parse(data) : null;
        }
        case BackupStorage.SESSION_STORAGE: {
          const data = sessionStorage.getItem(`backup_${metadata.id}`);
          return data ? JSON.parse(data) : null;
        }
        case BackupStorage.INDEXED_DB:
          // 实际应用中应使用IndexedDB API
          console.log('IndexedDB retrieval not implemented');
          return null;
        case BackupStorage.CLOUD:
          return await this.retrieveBackupFromCloud(metadata.id);
        default:
          throw new Error(`Unsupported storage type: ${this.config.storage}`);
      }
    } catch (error) {
      console.error('Error retrieving backup:', error);
      return null;
    }
  }
  
  // 从云端获取备份
  private async retrieveBackupFromCloud(backupId: string): Promise<any> {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.BACKUPS}/${backupId}`);
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to retrieve backup from cloud');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error retrieving backup from cloud:', error);
      throw error;
    }
  }
  
  // 从存储中删除备份
  private async removeBackupFromStorage(metadata: BackupMetadata): Promise<void> {
    try {
      switch (this.config.storage) {
        case BackupStorage.LOCAL_STORAGE:
          localStorage.removeItem(`backup_${metadata.id}`);
          break;
        case BackupStorage.SESSION_STORAGE:
          sessionStorage.removeItem(`backup_${metadata.id}`);
          break;
        case BackupStorage.INDEXED_DB:
          // 实际应用中应使用IndexedDB API
          console.log('IndexedDB removal not implemented');
          break;
        case BackupStorage.CLOUD:
          await this.removeBackupFromCloud(metadata.id);
          break;
        default:
          throw new Error(`Unsupported storage type: ${this.config.storage}`);
      }
    } catch (error) {
      console.error('Error removing backup from storage:', error);
      throw error;
    }
  }
  
  // 从云端删除备份
  private async removeBackupFromCloud(backupId: string): Promise<void> {
    try {
      const response = await apiRequest(`${API_CONFIG.ENDPOINTS.BACKUPS}/${backupId}`, {
        method: 'DELETE'
      });
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to remove backup from cloud');
      }
    } catch (error) {
      console.error('Error removing backup from cloud:', error);
      throw error;
    }
  }
  
  // 应用备份数据
  private applyBackupData(type: BackupType, data: any): boolean {
    try {
      if (!data) {
        return false;
      }
      
      if (type === BackupType.ALL || type === BackupType.USER_DATA) {
        if (data.userData) {
          localStorage.setItem('user', JSON.stringify(data.userData));
        }
      }
      
      if (type === BackupType.ALL || type === BackupType.CART_DATA) {
        if (data.cartData) {
          localStorage.setItem('cart', JSON.stringify(data.cartData));
        }
      }
      
      if (type === BackupType.ALL || type === BackupType.PREFERENCES) {
        if (data.preferences) {
          localStorage.setItem('preferences', JSON.stringify(data.preferences));
        }
      }
      
      if (type === BackupType.ALL || type === BackupType.FORM_DATA) {
        if (data.formData) {
          localStorage.setItem('form_data', JSON.stringify(data.formData));
        }
      }
      
      if (type === BackupType.ALL || type === BackupType.OFFLINE_ORDERS) {
        if (data.offlineOrders) {
          localStorage.setItem('offline_orders', JSON.stringify(data.offlineOrders));
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error applying backup data:', error);
      return false;
    }
  }
  
  // 加载备份注册表
  private loadBackupRegistry(): void {
    try {
      const registryData = localStorage.getItem('backup_registry');
      
      if (registryData) {
        const registry = JSON.parse(registryData);
        
        if (Array.isArray(registry)) {
          this.backupRegistry = new Map(registry.map(item => [item.id, item]));
        }
      }
    } catch (error) {
      console.error('Error loading backup registry:', error);
      this.backupRegistry = new Map();
    }
  }
  
  // 保存备份注册表
  private saveBackupRegistry(): void {
    try {
      const registryData = Array.from(this.backupRegistry.values());
      localStorage.setItem('backup_registry', JSON.stringify(registryData));
    } catch (error) {
      console.error('Error saving backup registry:', error);
    }
  }
  
  // 清理旧备份
  private cleanupOldBackups(): void {
    try {
      const backups = this.listBackups();
      
      // 按类型分组
      const backupsByType = backups.reduce((acc, backup) => {
        if (!acc[backup.type]) {
          acc[backup.type] = [];
        }
        acc[backup.type].push(backup);
        return acc;
      }, {} as Record<string, BackupMetadata[]>);
      
      // 对每种类型的备份进行清理
      for (const type in backupsByType) {
        const typeBackups = backupsByType[type];
        
        // 按时间排序（最新的在前）
        typeBackups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // 保留最新的N个备份
        if (typeBackups.length > this.config.maxBackupCount) {
          const backupsToDelete = typeBackups.slice(this.config.maxBackupCount);
          
          for (const backup of backupsToDelete) {
            this.deleteBackup(backup.id).catch(error => {
              console.error(`Failed to delete old backup ${backup.id}:`, error);
            });
          }
        }
        
        // 删除超过保留天数的备份
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionDays);
        
        for (const backup of typeBackups) {
          const backupDate = new Date(backup.timestamp);
          
          if (backupDate < cutoffDate) {
            this.deleteBackup(backup.id).catch(error => {
              console.error(`Failed to delete expired backup ${backup.id}:`, error);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
    }
  }
}

// 导出默认实例
export default DataBackupService.getInstance();