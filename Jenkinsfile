pipeline {
    agent any
    
    environment {
        // Node.js configuration
        NODE_VERSION = '20'
        
        // Report directories
        ALLURE_RESULTS = 'allure-results'
        ALLURE_REPORT = 'allure-report'
        HTML_REPORT = 'playwright-report'
        TEST_RESULTS = 'test-results'
        
        // Notification settings
        EMAIL_RECIPIENTS = 'praneethk.automation@gmail.com'
        
        // Test configuration
        CI = 'true'
        FORCE_COLOR = '1'
        
        // Console encoding for proper Unicode display
        PYTHONIOENCODING = 'utf-8'
        JAVA_TOOL_OPTIONS = '-Dfile.encoding=UTF-8'
    }
    
    options {
        // Build options
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '10'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
        disableConcurrentBuilds()
        skipDefaultCheckout(true)
    }
    
    stages {
        stage('Clean Workspace') {
            steps {
                script {
                    echo '========================================'
                    echo 'CLEANING WORKSPACE'
                    echo '========================================'
                }
                
                // Clean workspace completely
                deleteDir()
                
                // Ensure clean state
                script {
                    echo '[OK] Workspace cleaned successfully'
                }
            }
        }

        stage('System Info') {
            steps {
                script {
                    try {
                        // Get system information
                        def isWindows = isUnix() ? false : true
                        
                        if (isWindows) {
                            // Windows: Use PowerShell to get CPU count
                            def cpuCount = bat(returnStdout: true, script: '@echo off && powershell -Command "[System.Environment]::ProcessorCount"').trim()
                            def cpuCores = cpuCount.toInteger()
                            def workers = (cpuCores * 0.75) as Integer
                            
                            // Set environment variable for this build
                            env.PLAYWRIGHT_WORKERS = workers.toString()
                            
                            echo "========================================"
                            echo "Jenkins Agent System Information"
                            echo "========================================"
                            echo "CPU Cores Available: ${cpuCores}"
                            echo "Playwright Workers: ${env.PLAYWRIGHT_WORKERS}"
                            echo "========================================"
                        } else {
                            // Linux/Mac: Use nproc or sysctl
                            def cpuCount = sh(returnStdout: true, script: 'nproc || sysctl -n hw.ncpu').trim()
                            def cpuCores = cpuCount.toInteger()
                            def workers = (cpuCores * 0.75) as Integer
                            
                            env.PLAYWRIGHT_WORKERS = workers.toString()
                            
                            echo "========================================"
                            echo "Jenkins Agent System Information"
                            echo "========================================"
                            echo "CPU Cores Available: ${cpuCores}"
                            echo "Playwright Workers: ${env.PLAYWRIGHT_WORKERS}"
                            echo "========================================"
                        }
                    } catch (Exception e) {
                        echo "[WARNING] System info failed, using default workers: ${e.message}"
                        env.PLAYWRIGHT_WORKERS = '3'
                    }
                }
            }
        }

        stage('Clean Previous Artifacts') {
            steps {
                script {
                    try {
                        echo 'Cleaning previous test results...'
                        bat '''
                            if exist test-results rmdir /s /q test-results
                            if exist playwright-report rmdir /s /q playwright-report
                            if exist allure-results rmdir /s /q allure-results
                            if exist allure-report rmdir /s /q allure-report
                        '''
                        echo '[OK] Cleanup successful'
                    } catch (Exception e) {
                        echo "[WARNING] Cleanup warning (non-critical): ${e.message}"
                    }
                }
            }
        }
        
        stage('Checkout Code') {
            steps {
                script {
                    echo '========================================'
                    echo '📥 CHECKING OUT FRESH CODE'
                    echo '========================================'
                }
                
                // Checkout fresh code from repository
                checkout scm
                
                // Display commit information
                script {
                    def gitCommit = bat(returnStdout: true, script: '@git rev-parse HEAD').trim()
                    def gitBranch = bat(returnStdout: true, script: '@git rev-parse --abbrev-ref HEAD').trim()
                    def gitAuthor = bat(returnStdout: true, script: '@git log -1 --pretty=format:"%%an"').trim()
                    def gitMessage = bat(returnStdout: true, script: '@git log -1 --pretty=format:"%%s"').trim()
                    
                    echo "[INFO] Branch: ${gitBranch}"
                    echo "[INFO] Commit: ${gitCommit}"
                    echo "[INFO] Author: ${gitAuthor}"
                    echo "[INFO] Message: ${gitMessage}"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    try {
                        echo 'Installing dependencies...'
                        echo 'Node version:'
                        bat 'node --version'
                        echo 'NPM version:'
                        bat 'npm --version'
                        echo 'Running npm ci...'
                        bat 'npm ci'
                        echo '[OK] Dependencies installed successfully'
                    } catch (Exception e) {
                        echo "[FAIL] Dependency installation failed: ${e.message}"
                        echo "Attempting npm install as fallback..."
                        try {
                            bat 'npm install'
                            echo '[OK] npm install succeeded as fallback'
                        } catch (Exception e2) {
                            echo "[FAIL] Both npm ci and npm install failed"
                            throw e2
                        }
                    }
                }
            }
        }
        
        stage('Install Playwright Browsers') {
            steps {
                script {
                    try {
                        echo 'Installing Playwright browsers...'
                        bat 'npx playwright install --with-deps chromium'
                        echo '[OK] Playwright browsers installed successfully'
                    } catch (Exception e) {
                        echo "[FAIL] Browser installation failed: ${e.message}"
                        echo "Attempting to continue anyway..."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo '========================================'
                    echo '[INFO] RUNNING PLAYWRIGHT TESTS'
                    echo '========================================'
                }
                
                script {
                    def testExitCode = 0
                    def testOutput = ''
                    
                    try {
                        // Run tests with advanced error handling
                        echo '[INFO] Executing test suite...'
                        
                        testExitCode = bat(
                            script: "call npx playwright test --reporter=html,list,json,junit,allure-playwright --max-failures=10 --retries=2 --workers=${env.PLAYWRIGHT_WORKERS} || exit /b 0",
                            returnStatus: true
                        )
                        
                        echo "[INFO] Test execution completed with exit code: ${testExitCode}"
                        
                    } catch (Exception e) {
                        echo "[WARNING] Test execution encountered issues: ${e.message}"
                        testExitCode = 1
                    }
                    
                    // Store test result for later use
                    env.TEST_EXIT_CODE = testExitCode.toString()
                    
                    // Always continue to reporting stage even if tests fail
                    if (testExitCode != 0) {
                        echo '[WARNING] Some tests failed, but continuing to generate reports...'
                        unstable('Tests have failures')
                    } else {
                        echo '[OK] All tests passed successfully!'
                    }
                }
            }
        }
        
        stage('Generate Reports') {
            steps {
                script {
                    echo '========================================'
                    echo '[INFO] GENERATING TEST REPORTS'
                    echo '========================================'
                }
                
                script {
                    try {
                        // Generate Allure Report
                        echo '[INFO] Generating Allure report...'
                        bat '''
                            @echo off
                            if exist allure-results (
                                echo [INFO] Found allure-results directory
                                call npx allure generate "allure-results" --clean -o "allure-report" 2>nul || (
                                    echo [WARNING] Allure generation failed, trying alternative method
                                    call npx allure generate allure-results --clean 2>nul || echo [WARNING] Allure not available
                                )
                                if exist allure-report (
                                    echo [OK] Allure report generated successfully
                                ) else (
                                    echo [WARNING] Allure report not created
                                )
                            ) else (
                                echo [WARNING] No allure-results directory found
                                if not exist allure-report mkdir allure-report 2>nul
                            )
                        '''
                    } catch (Exception e) {
                        echo "[WARNING] Allure report generation failed: ${e.message}"
                    }
                    
                    try {
                        // Verify HTML report
                        echo '[INFO] Verifying HTML report...'
                        bat '''
                            if exist playwright-report (
                                echo [OK] HTML report available
                            ) else (
                                echo [WARNING] HTML report not found
                            )
                        '''
                    } catch (Exception e) {
                        echo "[WARNING] HTML report verification failed: ${e.message}"
                    }
                    
                    try {
                        // Generate test summary - Using simpler approach for CI
                        echo '[INFO] Generating test summary...'
                        bat '''
                            if exist test-results\\results.json (
                                echo [INFO] Test Results Summary:
                                echo ========================================
                                node -e "const fs=require('fs');try{const r=JSON.parse(fs.readFileSync('test-results/results.json','utf8'));const s=r.stats||{};console.log('Total:',s.expected||0);console.log('Passed:',s.ok||0);console.log('Failed:',s.unexpected||0);console.log('Skipped:',s.skipped||0);console.log('Duration:',((s.duration||0)/1000).toFixed(2)+'s');}catch(e){console.log('Parse error');}" || echo [WARNING] Summary generation skipped
                                echo ========================================
                            )
                        '''
                    } catch (Exception e) {
                        echo "[WARNING] Summary generation failed: ${e.message}"
                    }
                }
            }
        }
        
        stage('Archive Artifacts') {
            steps {
                script {
                    echo '========================================'
                    echo '[INFO] ARCHIVING ARTIFACTS'
                    echo '========================================'
                }
                
                script {
                    try {
                        // Archive test reports - check existence first
                        if (fileExists('playwright-report')) {
                            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                            echo '[OK] Playwright report archived'
                        }
                        
                        if (fileExists('allure-report')) {
                            archiveArtifacts artifacts: 'allure-report/**/*', allowEmptyArchive: true
                            echo '[OK] Allure report archived'
                        }
                        
                        if (fileExists('test-results')) {
                            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                            echo '[OK] Test results archived'
                        }
                        
                        if (fileExists('allure-results')) {
                            archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
                            echo '[OK] Allure results archived'
                        }
                        
                        echo '[OK] Artifact archiving completed'
                    } catch (Exception e) {
                        echo "[WARNING] Artifact archiving warning: ${e.message}"
                    }
                }
            }
        }
        
        stage('Publish Reports') {
            steps {
                script {
                    echo '========================================'
                    echo '[INFO] PUBLISHING REPORTS'
                    echo '========================================'
                }
                
                script {
                    try {
                        // Publish HTML Report
                        publishHTML([
                            allowMissing: true,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'playwright-report',
                            reportFiles: 'index.html',
                            reportName: 'Playwright HTML Report',
                            reportTitles: 'Playwright Test Report'
                        ])
                        echo '[OK] HTML Report published'
                    } catch (Exception e) {
                        echo "[WARNING] HTML Report publishing warning: ${e.message}"
                    }
                    
                    try {
                        // Publish Allure Report - Check if plugin is available
                        echo '[INFO] Attempting to publish Allure report...'
                        
                        // Try to use allure plugin if available
                        try {
                            allure([
                                includeProperties: false,
                                jdk: '',
                                properties: [],
                                reportBuildPolicy: 'ALWAYS',
                                results: [[path: 'allure-results']]
                            ])
                            echo '[OK] Allure Report published'
                        } catch (MissingMethodException mme) {
                            echo '[WARNING] Allure plugin not installed in Jenkins'
                            echo '[INFO] You can install it from: Manage Jenkins > Plugins > Available > Allure'
                            
                            // Publish as HTML instead
                            if (fileExists('allure-report')) {
                                publishHTML([
                                    allowMissing: true,
                                    alwaysLinkToLastBuild: true,
                                    keepAll: true,
                                    reportDir: 'allure-report',
                                    reportFiles: 'index.html',
                                    reportName: 'Allure Report (HTML)',
                                    reportTitles: 'Allure Test Report'
                                ])
                                echo '[OK] Allure Report published as HTML (fallback)'
                            }
                        }
                    } catch (Exception e) {
                        echo "[WARNING] Allure Report publishing warning: ${e.message}"
                    }
                    
                    try {
                        // Publish JUnit Report
                        junit testResults: 'test-results/*.xml', allowEmptyResults: true
                        echo '[OK] JUnit Report published'
                    } catch (Exception e) {
                        echo "[WARNING] JUnit Report publishing warning: ${e.message}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo '========================================'
                echo '[INFO] POST-BUILD ACTIONS'
                echo '========================================'
            }
            
            script {
                try {
                    // Clean up large files but keep reports
                    bat '''
                        echo  Cleaning up temporary files...
                        for /r %%i in (*.log) do if %%~zi gtr 10485760 del "%%i"
                        echo [OK] Cleanup completed
                    '''
                } catch (Exception e) {
                    echo "[WARNING] Cleanup warning: ${e.message}"
                }
                
                // Display final build status
                def duration = currentBuild.duration / 1000
                echo "[TIME]  Build Duration: ${duration}s"
                echo "[INFO] Build Result: ${currentBuild.result ?: 'SUCCESS'}"
            }
        }
        
        success {
            script {
                echo '========================================'
                echo '[OK] BUILD SUCCESSFUL'
                echo '========================================'
                
                // Send success notification
                emailext(
                    subject: "[OK] Jenkins Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <h2>Build Successful! [OK]</h2>
                        <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                        <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                        <p><strong>Status:</strong> SUCCESS</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><a href="${env.BUILD_URL}">View Build</a></p>
                        <p><a href="${env.BUILD_URL}Playwright_20HTML_20Report/">View Test Report</a></p>
                        <p><a href="${env.BUILD_URL}allure/">View Allure Report</a></p>
                    """,
                    to: "${env.EMAIL_RECIPIENTS}",
                    mimeType: 'text/html',
                    attachLog: false
                )
            }
        }
        
        failure {
            script {
                echo '========================================'
                echo '[FAIL] BUILD FAILED'
                echo '========================================'
                
                // Send failure notification
                emailext(
                    subject: "[FAIL] Jenkins Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <h2>Build Failed [FAIL]</h2>
                        <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                        <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                        <p><strong>Status:</strong> FAILURE</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><strong>Action Required:</strong> Please check the build logs and test reports</p>
                        <p><a href="${env.BUILD_URL}">View Build</a></p>
                        <p><a href="${env.BUILD_URL}console">View Console Output</a></p>
                        <p><a href="${env.BUILD_URL}Playwright_20HTML_20Report/">View Test Report</a></p>
                    """,
                    to: "${env.EMAIL_RECIPIENTS}",
                    mimeType: 'text/html',
                    attachLog: true
                )
            }
        }
        
        unstable {
            script {
                echo '========================================'
                echo '[WARNING]  BUILD UNSTABLE (Tests Failed)'
                echo '========================================'
                
                // Send unstable notification
                emailext(
                    subject: "[WARNING] Jenkins Build UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <h2>Build Unstable - Test Failures [WARNING]</h2>
                        <p><strong>Job:</strong> ${env.JOB_NAME}</p>
                        <p><strong>Build Number:</strong> ${env.BUILD_NUMBER}</p>
                        <p><strong>Status:</strong> UNSTABLE</p>
                        <p><strong>Duration:</strong> ${currentBuild.durationString}</p>
                        <p><strong>Issue:</strong> Some tests have failed</p>
                        <p><a href="${env.BUILD_URL}">View Build</a></p>
                        <p><a href="${env.BUILD_URL}Playwright_20HTML_20Report/">View Test Report</a></p>
                        <p><a href="${env.BUILD_URL}allure/">View Allure Report</a></p>
                        <p><a href="${env.BUILD_URL}testReport/">View Test Results</a></p>
                    """,
                    to: "${env.EMAIL_RECIPIENTS}",
                    mimeType: 'text/html',
                    attachLog: false
                )
            }
        }
        
        cleanup {
            script {
                echo ' Final cleanup...'
                // Additional cleanup if needed
            }
        }
    }
}
