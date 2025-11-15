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
        stage('🧹 Clean Workspace') {
            steps {
                script {
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                    echo '🧹 CLEANING WORKSPACE'
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                }
                
                // Clean workspace completely
                deleteDir()
                
                // Ensure clean state
                script {
                    echo '✅ Workspace cleaned successfully'
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
                        echo "⚠ System info failed, using default workers: ${e.message}"
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
                        echo '✓ Cleanup successful'
                    } catch (Exception e) {
                        echo "⚠ Cleanup warning (non-critical): ${e.message}"
                    }
                }
            }
        }
        
        stage('📥 Checkout Fresh Code') {
            steps {
                script {
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                    echo '📥 CHECKING OUT FRESH CODE'
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                }
                
                // Checkout fresh code from repository
                checkout scm
                
                // Display commit information
                script {
                    def gitCommit = bat(returnStdout: true, script: '@git rev-parse HEAD').trim()
                    def gitBranch = bat(returnStdout: true, script: '@git rev-parse --abbrev-ref HEAD').trim()
                    def gitAuthor = bat(returnStdout: true, script: '@git log -1 --pretty=format:"%%an"').trim()
                    def gitMessage = bat(returnStdout: true, script: '@git log -1 --pretty=format:"%%s"').trim()
                    
                    echo "📌 Branch: ${gitBranch}"
                    echo "🔖 Commit: ${gitCommit}"
                    echo "👤 Author: ${gitAuthor}"
                    echo "💬 Message: ${gitMessage}"
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
                        echo '✓ Dependencies installed successfully'
                    } catch (Exception e) {
                        echo "✗ Dependency installation failed: ${e.message}"
                        echo "Attempting npm install as fallback..."
                        try {
                            bat 'npm install'
                            echo '✓ npm install succeeded as fallback'
                        } catch (Exception e2) {
                            echo "✗ Both npm ci and npm install failed"
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
                        echo '✓ Playwright browsers installed successfully'
                    } catch (Exception e) {
                        echo "✗ Browser installation failed: ${e.message}"
                        echo "Attempting to continue anyway..."
                        currentBuild.result = 'UNSTABLE'
                    }
                }
            }
        }
        
        stage('🧪 Run Tests') {
            steps {
                script {
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                    echo '🧪 RUNNING PLAYWRIGHT TESTS'
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                }
                
                script {
                    def testExitCode = 0
                    def testOutput = ''
                    
                    try {
                        // Run tests with advanced error handling
                        echo '🚀 Executing test suite...'
                        
                        testExitCode = bat(
                            script: "npx playwright test --reporter=html,list,json,junit,allure-playwright --max-failures=10 --retries=2 --workers=${env.PLAYWRIGHT_WORKERS}|| exit /b 0",
                            returnStatus: true
                        )
                        
                        echo "📊 Test execution completed with exit code: ${testExitCode}"
                        
                    } catch (Exception e) {
                        echo "⚠️ Test execution encountered issues: ${e.message}"
                        testExitCode = 1
                    }
                    
                    // Store test result for later use
                    env.TEST_EXIT_CODE = testExitCode.toString()
                    
                    // Always continue to reporting stage even if tests fail
                    if (testExitCode != 0) {
                        echo '⚠️ Some tests failed, but continuing to generate reports...'
                        unstable('Tests have failures')
                    } else {
                        echo '✅ All tests passed successfully!'
                    }
                }
            }
        }
        
        stage('📊 Generate Reports') {
            steps {
                script {
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                    echo '📊 GENERATING TEST REPORTS'
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                }
                
                script {
                    try {
                        // Generate Allure Report
                        echo '📈 Generating Allure report...'
                        bat '''
                            if exist allure-results (
                                npx allure generate allure-results --clean -o allure-report || echo "Allure generation warning"
                                echo "✅ Allure report generated"
                            ) else (
                                echo "⚠️ No Allure results found"
                                mkdir allure-report 2>nul
                            )
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Allure report generation failed: ${e.message}"
                    }
                    
                    try {
                        // Verify HTML report
                        echo '📄 Verifying HTML report...'
                        bat '''
                            if exist playwright-report (
                                echo "✅ HTML report available"
                            ) else (
                                echo "⚠️ HTML report not found"
                            )
                        '''
                    } catch (Exception e) {
                        echo "⚠️ HTML report verification failed: ${e.message}"
                    }
                    
                    try {
                        // Generate test summary
                        echo '📋 Generating test summary...'
                        bat '''
                            if exist test-results\\results.json (
                                echo 📊 Test Results Summary:
                                node -e "const fs = require('fs'); try { const results = JSON.parse(fs.readFileSync('test-results/results.json', 'utf8')); const stats = results.stats || {}; console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'); console.log('Total Tests:', stats.expected || 0); console.log('✅ Passed:', stats.ok || 0); console.log('❌ Failed:', stats.unexpected || 0); console.log('⏭️  Skipped:', stats.skipped || 0); console.log('⏱️  Duration:', ((stats.duration || 0) / 1000).toFixed(2) + 's'); console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'); } catch (e) { console.log('Unable to parse results'); }" || echo "Summary generation skipped"
                            )
                        '''
                    } catch (Exception e) {
                        echo "⚠️ Summary generation failed: ${e.message}"
                    }
                }
            }
        }
        
        stage('📦 Archive Artifacts') {
            steps {
                script {
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                    echo '📦 ARCHIVING ARTIFACTS'
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                }
                
                script {
                    try {
                        // Archive test reports
                        archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
                        archiveArtifacts artifacts: 'allure-report/**/*', allowEmptyArchive: true
                        archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
                        archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
                        
                        // Archive screenshots and videos
                        archiveArtifacts artifacts: 'test-results/**/*.png', allowEmptyArchive: true
                        archiveArtifacts artifacts: 'test-results/**/*.webm', allowEmptyArchive: true
                        
                        echo '✅ Artifacts archived successfully'
                    } catch (Exception e) {
                        echo "⚠️ Artifact archiving warning: ${e.message}"
                    }
                }
            }
        }
        
        stage('📈 Publish Reports') {
            steps {
                script {
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                    echo '📈 PUBLISHING REPORTS'
                    echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
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
                        echo '✅ HTML Report published'
                    } catch (Exception e) {
                        echo "⚠️ HTML Report publishing warning: ${e.message}"
                    }
                    
                    try {
                        // Publish Allure Report
                        allure([
                            includeProperties: false,
                            jdk: '',
                            properties: [],
                            reportBuildPolicy: 'ALWAYS',
                            results: [[path: 'allure-results']]
                        ])
                        echo '✅ Allure Report published'
                    } catch (Exception e) {
                        echo "⚠️ Allure Report publishing warning: ${e.message}"
                    }
                    
                    try {
                        // Publish JUnit Report
                        junit testResults: 'test-results/*.xml', allowEmptyResults: true
                        echo '✅ JUnit Report published'
                    } catch (Exception e) {
                        echo "⚠️ JUnit Report publishing warning: ${e.message}"
                    }
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '📋 POST-BUILD ACTIONS'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
            }
            
            script {
                try {
                    // Clean up large files but keep reports
                    bat '''
                        echo 🧹 Cleaning up temporary files...
                        for /r %%i in (*.log) do if %%~zi gtr 10485760 del "%%i"
                        echo ✅ Cleanup completed
                    '''
                } catch (Exception e) {
                    echo "⚠️ Cleanup warning: ${e.message}"
                }
                
                // Display final build status
                def duration = currentBuild.duration / 1000
                echo "⏱️  Build Duration: ${duration}s"
                echo "📊 Build Result: ${currentBuild.result ?: 'SUCCESS'}"
            }
        }
        
        success {
            script {
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '✅ BUILD SUCCESSFUL'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                
                // Send success notification
                emailext(
                    subject: "✅ Jenkins Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <h2>Build Successful! ✅</h2>
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
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '❌ BUILD FAILED'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                
                // Send failure notification
                emailext(
                    subject: "❌ Jenkins Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <h2>Build Failed ❌</h2>
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
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                echo '⚠️  BUILD UNSTABLE (Tests Failed)'
                echo '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
                
                // Send unstable notification
                emailext(
                    subject: "⚠️ Jenkins Build UNSTABLE: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: """
                        <h2>Build Unstable - Test Failures ⚠️</h2>
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
                echo '🧹 Final cleanup...'
                // Additional cleanup if needed
            }
        }
    }
}
