# Performance Testing Guide

## Overview

This guide covers the comprehensive performance testing implemented in the Hello World test project, including load testing, stress testing, memory analysis, and performance optimization techniques.

## Performance Testing Framework

### 1. Load Testing

#### Basic Load Testing
```javascript
// scripts/chaos-monkey.js - loadTesting method
async loadTesting() {
  console.log('🚀 Starting load testing...');
  
  const concurrentRequests = 10;
  const totalRequests = 100;
  const results = [];
  
  for (let i = 0; i < totalRequests; i += concurrentRequests) {
    const batch = [];
    
    for (let j = 0; j < concurrentRequests && (i + j) < totalRequests; j++) {
      batch.push(this.makeRequest('/api/status'));
    }
    
    const batchStart = Date.now();
    const batchResults = await Promise.allSettled(batch);
    const batchEnd = Date.now();
    
    results.push({
      batch: Math.floor(i / concurrentRequests) + 1,
      duration: batchEnd - batchStart,
      success: batchResults.filter(r => r.status === 'fulfilled').length,
      failed: batchResults.filter(r => r.status === 'rejected').length
    });
    
    // Small delay between batches
    await this.wait(100);
  }
  
  return results;
}
```

#### Extreme Load Testing
```javascript
// scripts/chaos-monkey.js - extremeLoadTesting method
async extremeLoadTesting() {
  console.log('🔥 Starting extreme load testing...');
  
  const concurrentRequests = 50;
  const totalRequests = 200;
  const results = [];
  
  const startTime = Date.now();
  
  // Create all requests at once
  const requests = [];
  for (let i = 0; i < totalRequests; i++) {
    requests.push(this.makeRequest('/api/status'));
  }
  
  // Execute in batches
  for (let i = 0; i < requests.length; i += concurrentRequests) {
    const batch = requests.slice(i, i + concurrentRequests);
    const batchStart = Date.now();
    
    const batchResults = await Promise.allSettled(batch);
    const batchEnd = Date.now();
    
    const successCount = batchResults.filter(r => r.status === 'fulfilled').length;
    const failureCount = batchResults.filter(r => r.status === 'rejected').length;
    
    results.push({
      batch: Math.floor(i / concurrentRequests) + 1,
      duration: batchEnd - batchStart,
      successCount,
      failureCount,
      successRate: (successCount / batch.length) * 100
    });
  }
  
  const totalDuration = Date.now() - startTime;
  const totalSuccess = results.reduce((sum, r) => sum + r.successCount, 0);
  const totalFailure = results.reduce((sum, r) => sum + r.failureCount, 0);
  
  return {
    totalDuration,
    totalRequests,
    totalSuccess,
    totalFailure,
    overallSuccessRate: (totalSuccess / totalRequests) * 100,
    requestsPerSecond: totalRequests / (totalDuration / 1000),
    batchResults: results
  };
}
```

### 2. Memory Testing

#### Memory Pressure Testing
```javascript
// scripts/chaos-monkey.js - memoryPressure method
async memoryPressure() {
  console.log('💾 Starting memory pressure testing...');
  
  const memoryLeaks = [];
  const leakSize = 1024 * 1024; // 1MB per leak
  const maxLeaks = 100;
  
  const startMemory = process.memoryUsage();
  console.log(`Initial memory: ${this.formatBytes(startMemory.heapUsed)}`);
  
  for (let i = 0; i < maxLeaks; i++) {
    // Create a large object that won't be garbage collected
    const leak = Buffer.alloc(leakSize);
    leak.fill(`leak-${i}-${Date.now()}`);
    memoryLeaks.push(leak);
    
    if (i % 10 === 0) {
      const currentMemory = process.memoryUsage();
      console.log(`Leak ${i}: ${this.formatBytes(currentMemory.heapUsed)}`);
      
      // Check if we're approaching memory limits
      if (currentMemory.heapUsed > 500 * 1024 * 1024) { // 500MB
        console.log('⚠️  Memory limit approaching, stopping leaks');
        break;
      }
    }
    
    await this.wait(50); // Small delay
  }
  
  const endMemory = process.memoryUsage();
  const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed;
  
  return {
    initialMemory: this.formatBytes(startMemory.heapUsed),
    finalMemory: this.formatBytes(endMemory.heapUsed),
    memoryIncrease: this.formatBytes(memoryIncrease),
    leakCount: memoryLeaks.length,
    leakSize: this.formatBytes(leakSize),
    totalLeaked: this.formatBytes(memoryLeaks.length * leakSize)
  };
}
```

#### Memory Leak Detection
```javascript
// scripts/chaos-monkey.js - memoryLeakDetection method
async memoryLeakDetection() {
  console.log('🔍 Starting memory leak detection...');
  
  const measurements = [];
  const iterations = 50;
  const leakSize = 1024 * 1024; // 1MB
  
  for (let i = 0; i < iterations; i++) {
    // Create temporary objects
    const tempObjects = [];
    for (let j = 0; j < 10; j++) {
      tempObjects.push(Buffer.alloc(leakSize));
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const memory = process.memoryUsage();
    measurements.push({
      iteration: i,
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      external: memory.external,
      rss: memory.rss
    });
    
    // Clear temp objects (should be garbage collected)
    tempObjects.length = 0;
    
    await this.wait(100);
  }
  
  // Analyze memory growth pattern
  const memoryGrowth = this.analyzeMemoryGrowth(measurements);
  
  return {
    measurements,
    memoryGrowth,
    isLeaking: memoryGrowth.rate > 0.1, // 10% growth threshold
    recommendations: this.generateMemoryRecommendations(memoryGrowth)
  };
}
```

### 3. CPU Testing

#### CPU Spike Testing
```javascript
// scripts/chaos-monkey.js - cpuSpike method
async cpuSpike() {
  console.log('⚡ Starting CPU spike testing...');
  
  const intensity = 1000; // Number of iterations
  const startTime = Date.now();
  
  // Perform CPU-intensive operations
  let result = 0;
  for (let i = 0; i < intensity; i++) {
    result += Math.sqrt(i) * Math.sin(i) * Math.cos(i);
    
    // Add some variation
    if (i % 100 === 0) {
      result = Math.abs(result) % 1000;
    }
  }
  
  const endTime = Date.now();
  const duration = endTime - startTime;
  
  return {
    intensity,
    duration,
    operationsPerSecond: intensity / (duration / 1000),
    result: result.toFixed(2)
  };
}
```

#### Sustained CPU Load
```javascript
// scripts/chaos-monkey.js - sustainedCpuLoad method
async sustainedCpuLoad() {
  console.log('🔥 Starting sustained CPU load testing...');
  
  const duration = 10000; // 10 seconds
  const interval = 100; // 100ms intervals
  const iterations = duration / interval;
  
  const startTime = Date.now();
  const measurements = [];
  
  for (let i = 0; i < iterations; i++) {
    const intervalStart = Date.now();
    
    // Perform CPU work
    let work = 0;
    for (let j = 0; j < 1000; j++) {
      work += Math.pow(j, 2) + Math.sqrt(j);
    }
    
    const intervalEnd = Date.now();
    const intervalDuration = intervalEnd - intervalStart;
    
    measurements.push({
      interval: i,
      work: work.toFixed(2),
      duration: intervalDuration,
      cpuIntensity: 1000 / intervalDuration
    });
    
    // Wait for next interval
    const waitTime = interval - intervalDuration;
    if (waitTime > 0) {
      await this.wait(waitTime);
    }
  }
  
  const totalDuration = Date.now() - startTime;
  const avgCpuIntensity = measurements.reduce((sum, m) => sum + m.cpuIntensity, 0) / measurements.length;
  
  return {
    targetDuration: duration,
    actualDuration: totalDuration,
    intervals: measurements.length,
    averageCpuIntensity: avgCpuIntensity.toFixed(2),
    measurements
  };
}
```

### 4. Network Performance Testing

#### Latency Testing
```javascript
// scripts/chaos-monkey.js - networkLatency method
async networkLatency() {
  console.log('🌐 Starting network latency testing...');
  
  const requests = 50;
  const results = [];
  
  for (let i = 0; i < requests; i++) {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest('/api/status');
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      results.push({
        request: i + 1,
        latency,
        status: response.statusCode,
        success: response.statusCode === 200
      });
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      results.push({
        request: i + 1,
        latency,
        error: error.message,
        success: false
      });
    }
    
    // Small delay between requests
    await this.wait(50);
  }
  
  const latencies = results.map(r => r.latency);
  const avgLatency = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);
  
  return {
    totalRequests: requests,
    successfulRequests: results.filter(r => r.success).length,
    failedRequests: results.filter(r => !r.success).length,
    averageLatency: avgLatency.toFixed(2),
    minLatency,
    maxLatency,
    latencyDistribution: this.calculateLatencyDistribution(latencies),
    results
  };
}
```

#### Throughput Testing
```javascript
// scripts/chaos-monkey.js - throughputTesting method
async throughputTesting() {
  console.log('📊 Starting throughput testing...');
  
  const testDuration = 10000; // 10 seconds
  const concurrentConnections = 20;
  const startTime = Date.now();
  
  const connections = [];
  const results = [];
  
  // Create concurrent connections
  for (let i = 0; i < concurrentConnections; i++) {
    const connection = this.createPersistentConnection(i);
    connections.push(connection);
  }
  
  // Monitor throughput over time
  const interval = setInterval(() => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    
    const totalRequests = connections.reduce((sum, conn) => sum + conn.requestCount, 0);
    const currentThroughput = totalRequests / (elapsed / 1000);
    
    results.push({
      timestamp: currentTime,
      elapsed,
      totalRequests,
      currentThroughput: currentThroughput.toFixed(2),
      activeConnections: connections.filter(c => c.active).length
    });
    
    if (elapsed >= testDuration) {
      clearInterval(interval);
    }
  }, 1000);
  
  // Wait for test completion
  await new Promise(resolve => setTimeout(resolve, testDuration));
  
  // Close connections
  connections.forEach(conn => conn.close());
  
  const totalRequests = connections.reduce((sum, conn) => sum + conn.requestCount, 0);
  const averageThroughput = totalRequests / (testDuration / 1000);
  
  return {
    testDuration,
    concurrentConnections,
    totalRequests,
    averageThroughput: averageThroughput.toFixed(2),
    peakThroughput: Math.max(...results.map(r => r.currentThroughput)),
    results
  };
}
```

## Performance Metrics

### 1. Response Time Metrics
```javascript
// Performance analysis utilities
class PerformanceMetrics {
  static calculateResponseTimeStats(times) {
    const sorted = times.sort((a, b) => a - b);
    const count = sorted.length;
    
    return {
      count,
      min: sorted[0],
      max: sorted[count - 1],
      mean: times.reduce((sum, t) => sum + t, 0) / count,
      median: sorted[Math.floor(count / 2)],
      p95: sorted[Math.floor(count * 0.95)],
      p99: sorted[Math.floor(count * 0.99)]
    };
  }
  
  static calculateThroughput(requests, duration) {
    return {
      requestsPerSecond: requests / (duration / 1000),
      requestsPerMinute: requests / (duration / 60000),
      averageResponseTime: duration / requests
    };
  }
}
```

### 2. Memory Metrics
```javascript
// Memory analysis utilities
class MemoryMetrics {
  static formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  static analyzeMemoryGrowth(measurements) {
    const growthRates = [];
    for (let i = 1; i < measurements.length; i++) {
      const growth = measurements[i].heapUsed - measurements[i-1].heapUsed;
      const rate = growth / measurements[i-1].heapUsed;
      growthRates.push(rate);
    }
    
    return {
      averageGrowthRate: growthRates.reduce((sum, r) => sum + r, 0) / growthRates.length,
      maxGrowthRate: Math.max(...growthRates),
      minGrowthRate: Math.min(...growthRates),
      trend: this.determineTrend(growthRates)
    };
  }
  
  static determineTrend(rates) {
    const positive = rates.filter(r => r > 0).length;
    const negative = rates.filter(r => r < 0).length;
    
    if (positive > negative * 2) return 'increasing';
    if (negative > positive * 2) return 'decreasing';
    return 'stable';
  }
}
```

## Performance Configuration

### 1. Test Configuration
```javascript
// scripts/chaos-monkey.js - Configuration
const performanceConfig = {
  // Load testing
  loadTest: {
    concurrentRequests: 10,
    totalRequests: 100,
    delayBetweenBatches: 100
  },
  
  // Memory testing
  memoryTest: {
    leakSize: 1024 * 1024, // 1MB
    maxLeaks: 100,
    measurementInterval: 50
  },
  
  // CPU testing
  cpuTest: {
    intensity: 1000,
    sustainedLoadDuration: 10000,
    interval: 100
  },
  
  // Network testing
  networkTest: {
    requests: 50,
    delayBetweenRequests: 50,
    testDuration: 10000,
    concurrentConnections: 20
  }
};
```

### 2. Environment Configuration
```bash
# .env - Performance testing configuration
NODE_ENV=production
PERFORMANCE_TESTING=true
MAX_CONCURRENT_REQUESTS=100
MEMORY_LIMIT_MB=500
CPU_INTENSITY=1000
NETWORK_TIMEOUT_MS=5000
```

## Running Performance Tests

### 1. Individual Performance Tests
```bash
# Run specific performance tests
npm run chaos -- --test=load
npm run chaos -- --test=memory
npm run chaos -- --test=cpu
npm run chaos -- --test=network
```

### 2. Comprehensive Performance Testing
```bash
# Run all performance tests
npm run test:integration:chaos

# Run with performance focus
node scripts/test-integration.js chaos --performance
```

### 3. Continuous Performance Monitoring
```bash
# Monitor performance over time
node scripts/chaos-monkey.js --monitor --duration=3600000

# Generate performance report
node scripts/chaos-monkey.js --report --format=json
```

## Performance Optimization

### 1. Application-Level Optimizations
```javascript
// src/index.js - Performance optimizations
const app = express();

// Enable compression
app.use(compression());

// Optimize JSON parsing
app.use(express.json({ 
  limit: '1mb',
  strict: true 
}));

// Add response time header
app.use((req, res, next) => {
  req.startTime = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    res.setHeader('X-Response-Time', `${duration}ms`);
  });
  next();
});

// Cache static responses
app.use('/api/status', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
  next();
});
```

### 2. Database Optimizations
```javascript
// Database connection pooling
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});
```

### 3. Caching Strategies
```javascript
// Redis caching for frequently accessed data
const redis = require('redis');
const client = redis.createClient();

async function getCachedData(key) {
  try {
    const cached = await client.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    const data = await fetchDataFromDatabase();
    await client.setex(key, 300, JSON.stringify(data)); // 5 minutes
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    return await fetchDataFromDatabase();
  }
}
```

## Performance Monitoring

### 1. Real-Time Monitoring
```javascript
// Performance monitoring middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const duration = seconds * 1000 + nanoseconds / 1000000;
    
    // Log performance metrics
    console.log(`${req.method} ${req.path} - ${duration.toFixed(2)}ms`);
    
    // Send to monitoring service
    if (duration > 1000) { // Log slow requests
      console.warn(`Slow request: ${req.method} ${req.path} took ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
});
```

### 2. Performance Alerts
```javascript
// Performance alerting
class PerformanceAlerts {
  static checkResponseTime(duration, threshold = 1000) {
    if (duration > threshold) {
      this.sendAlert('High Response Time', {
        duration,
        threshold,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  static checkMemoryUsage(usage, threshold = 500 * 1024 * 1024) {
    if (usage > threshold) {
      this.sendAlert('High Memory Usage', {
        usage: this.formatBytes(usage),
        threshold: this.formatBytes(threshold),
        timestamp: new Date().toISOString()
      });
    }
  }
  
  static sendAlert(type, data) {
    console.error(`🚨 PERFORMANCE ALERT: ${type}`, data);
    // Send to monitoring service, Slack, etc.
  }
}
```

## Performance Reporting

### 1. Performance Dashboard
```javascript
// Generate performance dashboard
function generatePerformanceDashboard(results) {
  const dashboard = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: results.length,
      passedTests: results.filter(r => r.status === 'passed').length,
      failedTests: results.filter(r => r.status === 'failed').length,
      averageResponseTime: calculateAverageResponseTime(results),
      peakThroughput: findPeakThroughput(results)
    },
    details: results,
    recommendations: generatePerformanceRecommendations(results)
  };
  
  return dashboard;
}
```

### 2. Performance Trends
```javascript
// Analyze performance trends over time
function analyzePerformanceTrends(historicalData) {
  const trends = {
    responseTime: analyzeTrend(historicalData, 'responseTime'),
    throughput: analyzeTrend(historicalData, 'throughput'),
    memoryUsage: analyzeTrend(historicalData, 'memoryUsage'),
    cpuUsage: analyzeTrend(historicalData, 'cpuUsage')
  };
  
  return {
    trends,
    recommendations: generateTrendRecommendations(trends),
    alerts: generateTrendAlerts(trends)
  };
}
```

## Resources

- [Node.js Performance Best Practices](https://nodejs.org/en/docs/guides/performance/)
- [Express.js Performance](https://expressjs.com/en/advanced/best-practices-performance.html)
- [Performance Testing with Artillery](https://artillery.io/)
- [Memory Leak Detection](https://nodejs.org/en/docs/guides/memory-leaks/)
- [Performance Monitoring Tools](https://nodejs.org/en/docs/guides/debugging-getting-started/)
