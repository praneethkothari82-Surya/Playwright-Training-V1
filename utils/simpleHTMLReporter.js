const fs = require('fs');
const path = require('path');

/**
 * Simple HTML Reporter for Playwright
 * Generates a clean, comprehensive HTML report with test results
 */
class SimpleHTMLReporter {
  constructor(options = {}) {
    this.outputFile = options.outputFile || 'test-results/simple-report.html';
  }

  onBegin(config, suite) {
    this.suite = suite;
    this.startTime = Date.now();
    this.results = [];
    this.config = config;
  }

  onTestEnd(test, result) {
    this.results.push({
      title: test.title,
      titlePath: test.titlePath(),
      status: result.status,
      duration: result.duration,
      error: result.error ? result.error.message : null,
      errorStack: result.error ? result.error.stack : null,
      location: `${test.location.file}:${test.location.line}`,
      annotations: test.annotations,
      retry: result.retry,
      project: test.parent.project()?.name || 'default',
    });
  }

  async onEnd(result) {
    const duration = Date.now() - this.startTime;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const timedOut = this.results.filter(r => r.status === 'timedOut').length;
    const interrupted = this.results.filter(r => r.status === 'interrupted').length;

    const html = this.generateHTML({
      total: this.results.length,
      passed,
      failed,
      skipped,
      timedOut,
      interrupted,
      duration,
      results: this.results,
      timestamp: new Date().toISOString(),
      config: this.config,
    });

    const dir = path.dirname(this.outputFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.outputFile, html);
    console.log(`\n📄 Simple HTML report saved to: ${this.outputFile}`);
  }

  generateHTML(data) {
    const passRate = data.total > 0 ? ((data.passed / data.total) * 100).toFixed(2) : 0;
    const statusColor = data.failed > 0 ? '#ef4444' : data.skipped > 0 ? '#f59e0b' : '#10b981';
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Test Report</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .header p {
            opacity: 0.9;
            font-size: 1.1rem;
        }
        
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8fafc;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            text-align: center;
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .stat-label {
            color: #64748b;
            text-transform: uppercase;
            font-size: 0.85rem;
            letter-spacing: 1px;
        }
        
        .stat-card.total .stat-value { color: #3b82f6; }
        .stat-card.passed .stat-value { color: #10b981; }
        .stat-card.failed .stat-value { color: #ef4444; }
        .stat-card.skipped .stat-value { color: #f59e0b; }
        .stat-card.duration .stat-value { color: #8b5cf6; }
        .stat-card.pass-rate .stat-value { color: ${statusColor}; }
        
        .filters {
            padding: 20px 30px;
            background: white;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
            align-items: center;
        }
        
        .filter-btn {
            padding: 8px 16px;
            border: 2px solid #e2e8f0;
            background: white;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .filter-btn:hover {
            border-color: #667eea;
            color: #667eea;
        }
        
        .filter-btn.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .tests-container {
            padding: 30px;
        }
        
        .test-item {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 15px;
            overflow: hidden;
            transition: all 0.2s;
        }
        
        .test-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .test-header {
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f8fafc;
        }
        
        .test-header:hover {
            background: #f1f5f9;
        }
        
        .test-title {
            font-weight: 600;
            font-size: 1.05rem;
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .status-badge {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .status-badge.passed {
            background: #d1fae5;
            color: #065f46;
        }
        
        .status-badge.failed {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .status-badge.skipped {
            background: #fef3c7;
            color: #92400e;
        }
        
        .status-badge.timedOut {
            background: #fecaca;
            color: #7f1d1d;
        }
        
        .test-meta {
            display: flex;
            gap: 20px;
            align-items: center;
            font-size: 0.9rem;
            color: #64748b;
        }
        
        .test-details {
            padding: 20px;
            border-top: 1px solid #e2e8f0;
            display: none;
            background: white;
        }
        
        .test-details.show {
            display: block;
        }
        
        .error-message {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 15px 0;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            color: #991b1b;
            white-space: pre-wrap;
            overflow-x: auto;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-label {
            font-weight: 600;
            color: #475569;
            font-size: 0.85rem;
        }
        
        .info-value {
            color: #64748b;
            font-size: 0.9rem;
        }
        
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 0.9rem;
            border-top: 1px solid #e2e8f0;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 1.8rem;
            }
            
            .summary {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .test-meta {
                flex-direction: column;
                align-items: flex-start;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 Playwright Test Report</h1>
            <p>Generated on ${new Date(data.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="stat-card total">
                <div class="stat-label">Total Tests</div>
                <div class="stat-value">${data.total}</div>
            </div>
            <div class="stat-card passed">
                <div class="stat-label">Passed</div>
                <div class="stat-value">${data.passed}</div>
            </div>
            <div class="stat-card failed">
                <div class="stat-label">Failed</div>
                <div class="stat-value">${data.failed}</div>
            </div>
            <div class="stat-card skipped">
                <div class="stat-label">Skipped</div>
                <div class="stat-value">${data.skipped}</div>
            </div>
            <div class="stat-card duration">
                <div class="stat-label">Duration</div>
                <div class="stat-value">${(data.duration / 1000).toFixed(2)}s</div>
            </div>
            <div class="stat-card pass-rate">
                <div class="stat-label">Pass Rate</div>
                <div class="stat-value">${passRate}%</div>
            </div>
        </div>
        
        <div class="filters">
            <button class="filter-btn active" onclick="filterTests('all')">All (${data.total})</button>
            <button class="filter-btn" onclick="filterTests('passed')">✓ Passed (${data.passed})</button>
            <button class="filter-btn" onclick="filterTests('failed')">✗ Failed (${data.failed})</button>
            <button class="filter-btn" onclick="filterTests('skipped')">⊘ Skipped (${data.skipped})</button>
        </div>
        
        <div class="tests-container">
            ${data.results.map((test, index) => `
                <div class="test-item" data-status="${test.status}">
                    <div class="test-header" onclick="toggleDetails(${index})">
                        <div class="test-title">
                            <span>${test.status === 'passed' ? '✓' : test.status === 'failed' ? '✗' : test.status === 'skipped' ? '⊘' : '⏱'}</span>
                            <span>${test.titlePath.join(' › ')}</span>
                        </div>
                        <div class="test-meta">
                            <span class="status-badge ${test.status}">${test.status}</span>
                            <span>⏱ ${(test.duration / 1000).toFixed(2)}s</span>
                            <span>📦 ${test.project}</span>
                        </div>
                    </div>
                    <div class="test-details" id="details-${index}">
                        ${test.error ? `
                            <div class="error-message">
                                <strong>Error:</strong><br>
                                ${this.escapeHtml(test.error)}
                            </div>
                        ` : ''}
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">📍 Location</div>
                                <div class="info-value">${test.location}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">🔄 Retry</div>
                                <div class="info-value">${test.retry}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">📦 Project</div>
                                <div class="info-value">${test.project}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">⏱️ Duration</div>
                                <div class="info-value">${(test.duration / 1000).toFixed(3)}s</div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Generated by Playwright Test Framework | ${new Date(data.timestamp).toLocaleString()}</p>
        </div>
    </div>
    
    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            details.classList.toggle('show');
        }
        
        function filterTests(status) {
            const tests = document.querySelectorAll('.test-item');
            const buttons = document.querySelectorAll('.filter-btn');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            tests.forEach(test => {
                if (status === 'all' || test.dataset.status === status) {
                    test.style.display = 'block';
                } else {
                    test.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
    `.trim();
  }

  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

module.exports = SimpleHTMLReporter;
