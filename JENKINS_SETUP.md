# Jenkins Pipeline Setup Guide

## 📋 Overview
This Jenkins pipeline provides a comprehensive CI/CD setup for Playwright test automation with:
- ✅ Clean workspace before each run
- ✅ Fresh code checkout
- ✅ Advanced exception handling
- ✅ Multiple reporting formats (HTML, Allure, JUnit, JSON)
- ✅ No skipped failed tests
- ✅ Detailed notifications

## 🔧 Prerequisites

### 1. Jenkins Installation
- Jenkins 2.x or higher
- Required Jenkins Plugins:
  - Pipeline
  - Git
  - NodeJS Plugin
  - HTML Publisher Plugin
  - Allure Plugin
  - Email Extension Plugin
  - JUnit Plugin

### 2. System Requirements
- Java 11 or higher (for Allure)
- Node.js 18 or higher
- Git

## 🚀 Setup Instructions

### Step 1: Install Jenkins Plugins

Navigate to: `Manage Jenkins` → `Manage Plugins` → `Available`

Install the following plugins:
1. **Pipeline** - For Jenkinsfile support
2. **Git Plugin** - For SCM integration
3. **NodeJS Plugin** - For Node.js environment
4. **HTML Publisher Plugin** - For HTML reports
5. **Allure Plugin** - For Allure reports
6. **Email Extension Plugin** - For notifications
7. **JUnit Plugin** - For test results

### Step 2: Configure Node.js in Jenkins

1. Go to: `Manage Jenkins` → `Global Tool Configuration`
2. Scroll to **NodeJS** section
3. Click **Add NodeJS**
4. Configure:
   - Name: `NodeJS 20`
   - Version: `20.x` or latest LTS
   - Check: ✅ Install automatically
5. Save

### Step 3: Configure Allure in Jenkins

1. Go to: `Manage Jenkins` → `Global Tool Configuration`
2. Scroll to **Allure Commandline** section
3. Click **Add Allure Commandline**
4. Configure:
   - Name: `Allure`
   - Install automatically: ✅ Yes
   - Version: Latest (2.x)
5. Save

### Step 4: Configure Email Notifications

1. Go to: `Manage Jenkins` → `Configure System`
2. Scroll to **Extended E-mail Notification** section
3. Configure SMTP server:
   - SMTP server: `smtp.gmail.com` (or your SMTP server)
   - SMTP Port: `587`
   - Use TLS: ✅ Yes
   - Add credentials for authentication
4. Set default recipients
5. Save

### Step 5: Create Jenkins Pipeline Job

1. Click **New Item**
2. Enter name: `Playwright-Test-Automation`
3. Select: **Pipeline**
4. Click **OK**

### Step 6: Configure Pipeline

In the Pipeline configuration:

#### General Settings:
- ✅ Discard old builds
  - Days to keep builds: `30`
  - Max # of builds to keep: `10`

#### Build Triggers (Optional):
- ✅ Poll SCM: `H/15 * * * *` (every 15 minutes)
- ✅ GitHub hook trigger for GITScm polling

#### Pipeline Definition:
1. Definition: **Pipeline script from SCM**
2. SCM: **Git**
3. Repository URL: `https://github.com/praneethkothari82-Surya/Playwright-Training-V1.git`
4. Credentials: Add your GitHub credentials
5. Branch: `*/main`
6. Script Path: `Jenkinsfile`

#### Advanced Settings:
- Lightweight checkout: ❌ Unchecked (for clean checkout)

### Step 7: Configure Pipeline Environment

In the Jenkinsfile, update these variables:
```groovy
environment {
    EMAIL_RECIPIENTS = 'your-email@example.com'  // Update this
}
```

## 📊 Reports Configuration

### HTML Report
- Published automatically after each run
- Access: `Build` → `Playwright HTML Report`
- Contains: Screenshots, videos, traces

### Allure Report
- Generated from `allure-results` directory
- Access: `Build` → `Allure Report`
- Features:
  - Test history
  - Categories
  - Timeline
  - Trends

### JUnit Report
- Published for test trend graphs
- Access: `Build` → `Test Results`
- Shows: Pass/Fail trends over time

### JSON Report
- Stored in `test-results/results.json`
- Useful for custom analytics
- Archived as artifact

## 🔍 Advanced Features

### 1. Exception Handling
```groovy
try {
    // Test execution
} catch (Exception e) {
    echo "⚠️ Test execution encountered issues: ${e.message}"
    // Continue to reporting
    unstable('Tests have failures')
}
```

### 2. No Skipped Failed Tests
- `--max-failures=0` - Run all tests regardless of failures
- `--retries=2` - Retry failed tests automatically
- Exit code checked separately from execution

### 3. Clean Workspace
```groovy
stage('🧹 Clean Workspace') {
    steps {
        deleteDir()  // Complete clean before each run
    }
}
```

### 4. Fresh Code Checkout
```groovy
stage('📥 Checkout Fresh Code') {
    steps {
        checkout scm  // Fresh clone every time
    }
}
```

## 📧 Notifications

The pipeline sends email notifications for:

### ✅ Success
- Subject: `✅ Jenkins Build SUCCESS`
- Contains: Links to build and reports

### ❌ Failure
- Subject: `❌ Jenkins Build FAILED`
- Contains: Console logs, error details

### ⚠️ Unstable (Test Failures)
- Subject: `⚠️ Jenkins Build UNSTABLE`
- Contains: Links to test reports, failed test details

## 🎯 Running the Pipeline

### Automatic Triggers:
1. **Push to GitHub** - If webhook configured
2. **SCM Polling** - Every 15 minutes (if configured)
3. **Scheduled** - Cron pattern (if configured)

### Manual Trigger:
1. Open Jenkins job
2. Click **Build Now**
3. Monitor in **Console Output**

## 📈 Monitoring

### Build Progress:
- Stage View shows real-time progress
- Each stage displays emoji indicators
- Duration tracked for each stage

### Test Results:
- JUnit graph shows trends
- Allure shows detailed history
- HTML report shows individual test details

## 🛠️ Troubleshooting

### Common Issues:

#### 1. Allure Not Generating
**Solution:**
- Ensure Java is installed
- Check Allure plugin configuration
- Verify `allure-results` directory has files

#### 2. Node.js Not Found
**Solution:**
- Configure NodeJS in Global Tool Configuration
- Add NodeJS installation step in Jenkinsfile

#### 3. Tests Not Running
**Solution:**
- Check test file paths in `playwright.config.ts`
- Verify `testMatch` patterns
- Check console output for errors

#### 4. Reports Not Publishing
**Solution:**
- Install HTML Publisher Plugin
- Check report paths match configuration
- Verify files exist in workspace

## 📝 Best Practices

1. ✅ **Always clean workspace** - Prevents state issues
2. ✅ **Use retries** - Handle flaky tests
3. ✅ **Archive artifacts** - Keep reports and screenshots
4. ✅ **Send notifications** - Keep team informed
5. ✅ **Version control Jenkinsfile** - Track changes
6. ✅ **Use environment variables** - Easy configuration
7. ✅ **Handle exceptions** - Never skip reporting

## 🔐 Security

- Store credentials in Jenkins Credential Store
- Use environment variables for sensitive data
- Don't commit secrets to Git
- Restrict pipeline access with Jenkins permissions

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Allure Report](https://docs.qameta.io/allure/)
- [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/)

## 🤝 Support

For issues or questions:
1. Check Jenkins console output
2. Review test logs in reports
3. Check GitHub issues
4. Contact team lead

---

**Last Updated:** November 2025
**Version:** 1.0
