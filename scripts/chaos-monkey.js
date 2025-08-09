#!/usr/bin/env node

/**
 * Chaos Monkey Script for Hello World App
 * 
 * This script injects various failure scenarios to test the app's resilience:
 * - Memory pressure
 * - CPU spikes
 * - Network latency
 * - Random errors
 * - Resource exhaustion
 */

const http = require('http');
const { exec } = require('child_process');
const fs = require('fs');

class ChaosMonkey {
  constructor(targetUrl = 'http://localhost:3000') {
    this.targetUrl = targetUrl;
    this.isRunning = false;
    this.chaosInterval = null;
    this.testResults = [];
  }

  // Start chaos testing
  start() {
    console.log('🐒 Chaos Monkey is loose! Starting chaos testing...\n');
    this.isRunning = true;
    
    // Run different chaos scenarios
    this.runChaosScenarios();
    
    // Set up continuous chaos
    this.chaosInterval = setInterval(() => {
      this.injectRandomChaos();
    }, 2000);
  }

  // Stop chaos testing
  stop() {
    console.log('\n🛑 Chaos Monkey contained. Stopping chaos testing...');
    this.isRunning = false;
    if (this.chaosInterval) {
      clearInterval(this.chaosInterval);
    }
    this.generateReport();
  }

  // Run various chaos scenarios
  async runChaosScenarios() {
    const scenarios = [
      { name: 'Memory Pressure', fn: () => this.injectMemoryPressure() },
      { name: 'CPU Spike', fn: () => this.injectCpuSpike() },
      { name: 'Network Latency', fn: () => this.injectNetworkLatency() },
      { name: 'Random Errors', fn: () => this.injectRandomErrors() },
      { name: 'Resource Exhaustion', fn: () => this.injectResourceExhaustion() },
      { name: 'Concurrent Load', fn: () => this.injectConcurrentLoad() },
      { name: 'Malformed Requests', fn: () => this.injectMalformedRequests() }
    ];

    for (const scenario of scenarios) {
      if (!this.isRunning) break;
      
      console.log(`🔥 Running: ${scenario.name}`);
      try {
        await scenario.fn();
        await this.wait(1000);
      } catch (error) {
        console.log(`❌ ${scenario.name} failed: ${error.message}`);
      }
    }
  }

  // Inject memory pressure
  injectMemoryPressure() {
    console.log('  💾 Injecting memory pressure...');
    
    // Create memory pressure by allocating large objects
    const memoryHogs = [];
    for (let i = 0; i < 100; i++) {
      memoryHogs.push(Buffer.alloc(1024 * 1024)); // 1MB chunks
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    this.testResults.push({
      scenario: 'Memory Pressure',
      status: 'completed',
      timestamp: new Date().toISOString()
    });
  }

  // Inject CPU spike
  injectCpuSpike() {
    console.log('  🔥 Injecting CPU spike...');
    
    // Create CPU-intensive operations
    const start = Date.now();
    let result = 0;
    
    // Simulate heavy computation
    for (let i = 0; i < 1000000; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    
    const duration = Date.now() - start;
    console.log(`    CPU spike completed in ${duration}ms`);
    
    this.testResults.push({
      scenario: 'CPU Spike',
      status: 'completed',
      duration: duration,
      timestamp: new Date().toISOString()
    });
  }

  // Inject network latency
  injectNetworkLatency() {
    console.log('  🌐 Injecting network latency...');
    
    // Simulate network delays
    return new Promise((resolve) => {
      setTimeout(() => {
        this.testResults.push({
          scenario: 'Network Latency',
          status: 'completed',
      timestamp: new Date().toISOString()
        });
        resolve();
      }, Math.random() * 1000 + 500); // 500-1500ms delay
    });
  }

  // Inject random errors
  injectRandomErrors() {
    console.log('  💥 Injecting random errors...');
    
    const errors = [
      new Error('Simulated chaos error'),
      new TypeError('Chaos type error'),
      new RangeError('Chaos range error'),
      new ReferenceError('Chaos reference error')
    ];
    
    const randomError = errors[Math.floor(Math.random() * errors.length)];
    console.log(`    Throwing: ${randomError.message}`);
    
    this.testResults.push({
      scenario: 'Random Errors',
      status: 'error',
      error: randomError.message,
      timestamp: new Date().toISOString()
    });
  }

  // Inject resource exhaustion
  injectResourceExhaustion() {
    console.log('  ⚠️ Injecting resource exhaustion...');
    
    // Try to exhaust file descriptors
    const files = [];
    try {
      for (let i = 0; i < 100; i++) {
        const tempFile = `/tmp/chaos-${i}-${Date.now()}`;
        fs.writeFileSync(tempFile, 'chaos data');
        files.push(tempFile);
      }
      
      // Clean up
      files.forEach(file => {
        try {
          fs.unlinkSync(file);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
      
      this.testResults.push({
        scenario: 'Resource Exhaustion',
        status: 'completed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      this.testResults.push({
        scenario: 'Resource Exhaustion',
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Inject concurrent load
  injectConcurrentLoad() {
    console.log('  🚀 Injecting concurrent load...');
    
    const concurrentRequests = 10;
    const promises = [];
    
    for (let i = 0; i < concurrentRequests; i++) {
      promises.push(this.makeRequest(`/api/user/user${i}`));
    }
    
    return Promise.allSettled(promises).then((results) => {
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      console.log(`    Concurrent load: ${successCount} success, ${failureCount} failures`);
      
      this.testResults.push({
        scenario: 'Concurrent Load',
        status: 'completed',
        successCount,
        failureCount,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Make HTTP request
  makeRequest(path) {
    return new Promise((resolve, reject) => {
      const req = http.request(`${this.targetUrl}${path}`, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      req.end();
    });
  }

  // Inject random chaos
  injectRandomChaos() {
    if (!this.isRunning) return;
    
    const chaosTypes = [
      'memory',
      'cpu',
      'network',
      'error',
      'resource',
      'load',
      'extreme-load',
      'memory-leak'
    ];
    
    const randomType = chaosTypes[Math.floor(Math.random() * chaosTypes.length)];
    
    switch (randomType) {
      case 'memory':
        this.injectMemoryPressure();
        break;
      case 'cpu':
        this.injectCpuSpike();
        break;
      case 'network':
        this.injectNetworkLatency();
        break;
      case 'error':
        this.injectRandomErrors();
        break;
      case 'resource':
        this.injectResourceExhaustion();
        break;
      case 'load':
        this.injectConcurrentLoad();
        break;
      case 'extreme-load':
        this.injectExtremeLoad();
        break;
      case 'memory-leak':
        this.injectMemoryLeak();
        break;
    }
  }

  // Inject extreme load
  injectExtremeLoad() {
    console.log('  🌋 Injecting extreme load...');
    
    const extremeRequests = 50;
    const promises = [];
    
    for (let i = 0; i < extremeRequests; i++) {
      promises.push(this.makeRequest(`/api/user/extreme${i}`));
    }
    
    return Promise.allSettled(promises).then((results) => {
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      console.log(`    Extreme load: ${successCount} success, ${failureCount} failures`);
      
      this.testResults.push({
        scenario: 'Extreme Load',
        status: 'completed',
        successCount,
        failureCount,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Inject memory leak
  injectMemoryLeak() {
    console.log('  🕳️ Injecting memory leak...');
    
    // Create a memory leak by storing references
    if (!this.memoryLeaks) {
      this.memoryLeaks = [];
    }
    
    // Add more memory without cleaning up
    for (let i = 0; i < 50; i++) {
      this.memoryLeaks.push({
        data: Buffer.alloc(1024 * 1024), // 1MB
        timestamp: Date.now(),
        id: `leak-${i}-${Date.now()}`
      });
    }
    
    console.log(`    Memory leak: ${this.memoryLeaks.length} objects stored`);
    
    this.testResults.push({
      scenario: 'Memory Leak',
      status: 'completed',
      leakCount: this.memoryLeaks.length,
      timestamp: new Date().toISOString()
    });
  }

  // Inject malformed requests
  injectMalformedRequests() {
    console.log('  🚫 Injecting malformed requests...');
    
    const malformedRequests = [
      { method: 'GET', path: '/api/user/', headers: { 'Content-Type': 'invalid/json' } },
      { method: 'POST', path: '/api/user/', body: 'invalid json string', headers: { 'Content-Type': 'application/json' } },
      { method: 'GET', path: '/api/user/' + 'x'.repeat(1000), headers: {} }, // Extremely long path
      { method: 'PUT', path: '/api/user/test', body: Buffer.from([0x00, 0x01, 0x02]), headers: { 'Content-Type': 'application/octet-stream' } },
      { method: 'DELETE', path: '/api/user/test', headers: { 'Authorization': 'Bearer invalid-token' } }
    ];
    
    const promises = malformedRequests.map(req => this.makeMalformedRequest(req));
    
    return Promise.allSettled(promises).then((results) => {
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.filter(r => r.status === 'rejected').length;
      
      console.log(`    Malformed requests: ${successCount} handled, ${failureCount} failed`);
      
      this.testResults.push({
        scenario: 'Malformed Requests',
        status: 'completed',
        successCount,
        failureCount,
        timestamp: new Date().toISOString()
      });
    });
  }

  // Make malformed HTTP request
  makeMalformedRequest(requestConfig) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: requestConfig.path,
        method: requestConfig.method,
        headers: requestConfig.headers || {}
      };
      
      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ 
          statusCode: res.statusCode, 
          headers: res.headers,
          data 
        }));
      });
      
      req.on('error', reject);
      req.setTimeout(5000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      
      if (requestConfig.body) {
        req.write(requestConfig.body);
      }
      
      req.end();
    });
  }

  // Wait utility
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate chaos report
  generateReport() {
    console.log('\n📊 Chaos Testing Report');
    console.log('========================');
    
    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(r => r.status === 'completed').length;
    const failedTests = this.testResults.filter(r => r.status === 'error').length;
    
    console.log(`Total Scenarios: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\nDetailed Results:');
    this.testResults.forEach((result, index) => {
      const status = result.status === 'completed' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.scenario} - ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });
    
    // Save report to file
    const reportPath = './chaos-monkey-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Detailed report saved to: ${reportPath}`);
  }
}

// CLI interface
if (require.main === module) {
  const chaosMonkey = new ChaosMonkey();
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    chaosMonkey.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    chaosMonkey.stop();
    process.exit(0);
  });
  
  // Start chaos testing
  chaosMonkey.start();
  
  // Stop after 30 seconds
  setTimeout(() => {
    chaosMonkey.stop();
    process.exit(0);
  }, 30000);
}

module.exports = ChaosMonkey;
