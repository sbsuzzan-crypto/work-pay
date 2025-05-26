const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        icon: path.join(__dirname, 'icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false
        },
        titleBarStyle: 'default',
        show: false // Don't show until ready
    });

    // Load the app
    mainWindow.loadFile('index.html');

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Create application menu
    createMenu();
}

function createMenu() {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Worker',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.Workers && window.Workers.openWorkerModal) {
                                window.UI.showSection('workers');
                                window.Workers.openWorkerModal();
                            }
                        `);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Export Data',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            if (window.Settings && window.Settings.exportData) {
                                window.Settings.exportData();
                            }
                        `);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Quit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Dashboard',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`window.UI.showSection('dashboard')`);
                    }
                },
                {
                    label: 'Workers',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`window.UI.showSection('workers')`);
                    }
                },
                {
                    label: 'Work Log',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`window.UI.showSection('worklog')`);
                    }
                },
                {
                    label: 'Payroll',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`window.UI.showSection('payroll')`);
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        mainWindow.reload();
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Ctrl+Shift+I',
                    click: () => {
                        mainWindow.webContents.toggleDevTools();
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        mainWindow.webContents.executeJavaScript(`
                            window.UI.showToast('Worker Payroll Manager v1.0.0', 'info', 3000);
                        `);
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

// App event listeners
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 