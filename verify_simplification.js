
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
    });
    const page = await context.newPage();

    try {
        console.log('Navigating to Dashboard...');
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

        // 1. Capture Overview
        console.log('Capturing Overview...');
        await page.waitForTimeout(1000); // Allow animations
        await page.screenshot({ path: 'simplification_overview.png', fullPage: true });

        // 2. Capture Payoff Plan
        console.log('Navigating to Payoff Plan...');
        await page.click('text=Payoff Plan'); // Assuming menu item text
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'simplification_payoff.png', fullPage: true });

        // 3. Capture Trends (Cash Flow - Default)
        console.log('Navigating to Trends...');
        await page.click('text=Trends');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'simplification_trends_cashflow.png', fullPage: true });

        // 4. Capture Trends (Savings Rate)
        console.log('Switching to Savings Rate tab...');
        await page.click('text=Savings Rate');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'simplification_trends_savings.png', fullPage: true });

    } catch (error) {
        console.error('Error during verification:', error);
    } finally {
        await browser.close();
    }
})();
