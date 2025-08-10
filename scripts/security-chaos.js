#!/usr/bin/env node

/**
 * Security Chaos Monkey Script
 * 
 * Tests for security vulnerabilities:
 * - SQL injection attempts
 * - XSS payloads
 * - Path traversal
 * - Command injection
 * - Buffer overflow attempts
 * - Authentication bypass
 */

const http = require('http');
const https = require('https');

class SecurityChaosMonkey {
  constructor(targetUrl = 'http://localhost:3000') {
    this.targetUrl = targetUrl;
    this.testResults = [];
  }

  async runSecurityTests() {
    console.log('🔒 Security Chaos Monkey unleashed! Testing for vulnerabilities...\n');
    
    const securityTests = [
      { name: 'SQL Injection', fn: () => this.testSqlInjection() },
      { name: 'XSS Attacks', fn: () => this.testXssAttacks() },
      { name: 'Path Traversal', fn: () => this.testPathTraversal() },
      { name: 'Command Injection', fn: () => this.testCommandInjection() },
      { name: 'Buffer Overflow', fn: () => this.testBufferOverflow() },
      { name: 'Authentication Bypass', fn: () => this.testAuthBypass() },
      { name: 'Header Injection', fn: () => this.testHeaderInjection() },
      { name: 'Content Type Bypass', fn: () => this.testContentTypeBypass() }
    ];

    for (const test of securityTests) {
      console.log(`🔍 Testing: ${test.name}`);
      try {
        await test.fn();
        await this.wait(500);
      } catch (error) {
        console.log(`❌ ${test.name} failed: ${error.message}`);
      }
    }

    this.generateSecurityReport();
  }

  // Test SQL injection vulnerabilities
  async testSqlInjection() {
    const sqlPayloads = [
      '\' OR \'1\'=\'1',
      '\'; DROP TABLE users; --',
      '\' UNION SELECT * FROM users --',
      'admin\'--',
      '1\' OR \'1\' = \'1\' --',
      '\' OR 1=1#',
      '\'; EXEC xp_cmdshell(\'dir\'); --'
    ];

    const results = [];
    
    for (const payload of sqlPayloads) {
      try {
        const response = await this.makeRequest(`/api/user/${encodeURIComponent(payload)}`);
        results.push({
          payload,
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'SQL Injection',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${sqlPayloads.length} SQL injection payloads`);
  }

  // Test XSS attacks
  async testXssAttacks() {
    const xssPayloads = [
      '<script>alert(\'XSS\')</script>',
      '<img src=x onerror=alert(\'XSS\')>',
      'javascript:alert(\'XSS\')',
      '<svg onload=alert(\'XSS\')>',
      '\'"><script>alert(\'XSS\')</script>',
      '<iframe src=javascript:alert(\'XSS\')></iframe>',
      '<body onload=alert(\'XSS\')>'
    ];

    const results = [];
    
    for (const payload of xssPayloads) {
      try {
        const response = await this.makeRequest(`/api/user/${encodeURIComponent(payload)}`);
        results.push({
          payload,
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'XSS Attacks',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${xssPayloads.length} XSS payloads`);
  }

  // Test path traversal
  async testPathTraversal() {
    const pathPayloads = [
      '../../../etc/passwd',
      '..\\..\\..\\windows\\system32\\drivers\\etc\\hosts',
      '....//....//....//etc/passwd',
      '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd',
      '..%252f..%252f..%252fetc%252fpasswd',
      '..%c0%af..%c0%af..%c0%afetc%c0%afpasswd'
    ];

    const results = [];
    
    for (const payload of pathPayloads) {
      try {
        const response = await this.makeRequest(`/api/user/${payload}`);
        results.push({
          payload,
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'Path Traversal',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${pathPayloads.length} path traversal payloads`);
  }

  // Test command injection
  async testCommandInjection() {
    const commandPayloads = [
      '; ls -la',
      '| cat /etc/passwd',
      '&& whoami',
      '`id`',
      '$(whoami)',
      '; ping -c 1 127.0.0.1',
      '| nc -l 4444'
    ];

    const results = [];
    
    for (const payload of commandPayloads) {
      try {
        const response = await this.makeRequest(`/api/user/${encodeURIComponent(payload)}`);
        results.push({
          payload,
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payload,
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'Command Injection',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${commandPayloads.length} command injection payloads`);
  }

  // Test buffer overflow attempts
  async testBufferOverflow() {
    const bufferPayloads = [
      'A'.repeat(1000),
      'A'.repeat(10000),
      'A'.repeat(100000),
      Buffer.alloc(1000).toString(),
      Buffer.alloc(10000).toString(),
      'x'.repeat(1000) + 'y'.repeat(1000) + 'z'.repeat(1000)
    ];

    const results = [];
    
    for (const payload of bufferPayloads) {
      try {
        const response = await this.makeRequest(`/api/user/${encodeURIComponent(payload)}`);
        results.push({
          payloadLength: payload.length,
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payloadLength: payload.length,
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'Buffer Overflow',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${bufferPayloads.length} buffer overflow payloads`);
  }

  // Test authentication bypass
  async testAuthBypass() {
    const authPayloads = [
      { headers: { 'Authorization': 'Bearer null' } },
      { headers: { 'Authorization': 'Bearer undefined' } },
      { headers: { 'Authorization': 'Bearer ' } },
      { headers: { 'Authorization': 'Basic YWRtaW46YWRtaW4=' } }, // admin:admin
      { headers: { 'X-API-Key': 'null' } },
      { headers: { 'X-API-Key': 'undefined' } },
      { headers: { 'X-API-Key': '' } }
    ];

    const results = [];
    
    for (const payload of authPayloads) {
      try {
        const response = await this.makeRequest('/api/status', payload);
        results.push({
          payload: JSON.stringify(payload),
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payload: JSON.stringify(payload),
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'Authentication Bypass',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${authPayloads.length} authentication bypass payloads`);
  }

  // Test header injection
  async testHeaderInjection() {
    const headerPayloads = [
      { headers: { 'X-Forwarded-For': '127.0.0.1' } },
      { headers: { 'X-Real-IP': '192.168.1.1' } },
      { headers: { 'X-Forwarded-Host': 'evil.com' } },
      { headers: { 'X-Forwarded-Proto': 'https' } },
      { headers: { 'X-Original-URL': '/admin' } },
      { headers: { 'X-Rewrite-URL': '/admin' } }
    ];

    const results = [];
    
    for (const payload of headerPayloads) {
      try {
        const response = await this.makeRequest('/api/status', payload);
        results.push({
          payload: JSON.stringify(payload),
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payload: JSON.stringify(payload),
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'Header Injection',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${headerPayloads.length} header injection payloads`);
  }

  // Test content type bypass
  async testContentTypeBypass() {
    const contentTypePayloads = [
      { method: 'POST', body: '{"test": "data"}', headers: { 'Content-Type': 'application/json' } },
      { method: 'POST', body: '{"test": "data"}', headers: { 'Content-Type': 'text/plain' } },
      { method: 'POST', body: '{"test": "data"}', headers: { 'Content-Type': 'application/xml' } },
      { method: 'POST', body: '<xml>test</xml>', headers: { 'Content-Type': 'application/json' } },
      { method: 'POST', body: 'test=data', headers: { 'Content-Type': 'application/json' } }
    ];

    const results = [];
    
    for (const payload of contentTypePayloads) {
      try {
        const response = await this.makeRequest('/', payload);
        results.push({
          payload: JSON.stringify(payload),
          statusCode: response.statusCode,
          response: response.data.substring(0, 100)
        });
      } catch (error) {
        results.push({
          payload: JSON.stringify(payload),
          error: error.message
        });
      }
    }

    this.testResults.push({
      test: 'Content Type Bypass',
      status: 'completed',
      results,
      timestamp: new Date().toISOString()
    });

    console.log(`    Tested ${contentTypePayloads.length} content type bypass payloads`);
  }

  // Make HTTP request
  makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.targetUrl);
      const requestOptions = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: path,
        method: options.method || 'GET',
        headers: options.headers || {}
      };

      const client = url.protocol === 'https:' ? https : http;
      
      const req = client.request(requestOptions, (res) => {
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
      
      if (options.body) {
        req.write(options.body);
      }
      
      req.end();
    });
  }

  // Wait utility
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate security report
  generateSecurityReport() {
    console.log('\n🔒 Security Testing Report');
    console.log('==========================');
    
    const totalTests = this.testResults.length;
    const completedTests = this.testResults.filter(r => r.status === 'completed').length;
    
    console.log(`Total Security Tests: ${totalTests}`);
    console.log(`Completed: ${completedTests}`);
    
    console.log('\nDetailed Results:');
    this.testResults.forEach((result, index) => {
      console.log(`${index + 1}. 🔍 ${result.test} - ${result.status}`);
      
      if (result.results) {
        const successCount = result.results.filter(r => r.statusCode && r.statusCode < 500).length;
        const errorCount = result.results.filter(r => r.error).length;
        console.log(`   Results: ${successCount} successful responses, ${errorCount} errors`);
      }
    });
    
    // Save detailed report
    const reportPath = './security-chaos-report.json';
    require('fs').writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\n📄 Detailed security report saved to: ${reportPath}`);
    
    // Analyze for potential vulnerabilities
    this.analyzeVulnerabilities();
  }

  // Analyze results for potential vulnerabilities
  analyzeVulnerabilities() {
    console.log('\n🚨 Vulnerability Analysis');
    console.log('========================');
    
    let vulnerabilityCount = 0;
    
    this.testResults.forEach(result => {
      if (result.results) {
        result.results.forEach(testResult => {
          // Check for potential SQL injection
          if (testResult.response && testResult.response.includes('SQL')) {
            console.log(`⚠️  Potential SQL injection vulnerability detected in ${result.test}`);
            vulnerabilityCount++;
          }
          
          // Check for potential XSS
          if (testResult.response && testResult.response.includes('<script>')) {
            console.log(`⚠️  Potential XSS vulnerability detected in ${result.test}`);
            vulnerabilityCount++;
          }
          
          // Check for information disclosure
          if (testResult.response && testResult.response.includes('error')) {
            console.log(`⚠️  Potential information disclosure in ${result.test}`);
            vulnerabilityCount++;
          }
        });
      }
    });
    
    if (vulnerabilityCount === 0) {
      console.log('✅ No obvious vulnerabilities detected');
    } else {
      console.log(`🚨 ${vulnerabilityCount} potential vulnerabilities identified`);
    }
  }
}

// CLI interface
if (require.main === module) {
  const securityChaos = new SecurityChaosMonkey();
  
  process.on('SIGINT', () => {
    console.log('\n🛑 Security testing stopped');
    process.exit(0);
  });
  
  securityChaos.runSecurityTests();
}

module.exports = SecurityChaosMonkey;
