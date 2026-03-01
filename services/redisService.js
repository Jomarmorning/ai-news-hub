/**
 * Redis 数据服务
 * 使用 Upstash Redis 实现数据持久化
 */

const { Redis } = require('@upstash/redis');

const DATA_KEY = 'ai-hub:data';

// 检查 Redis 是否配置
function isRedisConfigured() {
    return process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
}

// 获取 Redis 客户端（延迟初始化）
function getRedis() {
    if (!isRedisConfigured()) {
        return null;
    }
    return new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
}

// 从 Redis 读取数据
async function readFromRedis() {
    if (!isRedisConfigured()) {
        return null;
    }

    try {
        const redis = getRedis();
        if (!redis) return null;
        const data = await redis.get(DATA_KEY);
        return data;
    } catch (error) {
        console.error('Redis 读取失败:', error.message);
        return null;
    }
}

// 保存数据到 Redis
async function saveToRedis(data) {
    if (!isRedisConfigured()) {
        console.log('Redis 未配置，跳过保存');
        return false;
    }

    try {
        const redis = getRedis();
        if (!redis) return false;
        await redis.set(DATA_KEY, data);
        console.log('数据已保存到 Redis');
        return true;
    } catch (error) {
        console.error('Redis 保存失败:', error.message);
        return false;
    }
}

module.exports = {
    isRedisConfigured,
    readFromRedis,
    saveToRedis,
};
