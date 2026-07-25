const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Mobile view for PWA narrow shots
    await page.setViewport({ width: 768, height: 1376 });
    
    // Go to local dev server
    await page.goto('http://localhost:8788/', { waitUntil: 'networkidle0' });
    
    const themes = [
        { name: 'theme-elegant-dark', file: 'public/images/screenshot_elegant_dark.jpg' },
        { name: 'theme-elegant-light', file: 'public/images/screenshot_elegant_light.jpg' },
        { name: 'theme-steampunk', file: 'public/images/screenshot_steampunk.jpg' }
    ];
    
    for (const theme of themes) {
        // Evaluate in browser to change theme
        await page.evaluate((themeClass) => {
            document.body.classList.remove('theme-elegant-dark', 'theme-elegant-light', 'theme-steampunk');
            document.body.classList.add(themeClass);
        }, theme.name);
        
        // Wait a little for any transitions
        await new Promise(r => setTimeout(r, 500));
        
        await page.screenshot({ path: theme.file, type: 'jpeg', quality: 90 });
        console.log(`Saved ${theme.file}`);
    }
    
    await browser.close();
})();
