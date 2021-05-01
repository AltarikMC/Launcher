const path = require('path');
module.exports = {
    packagerConfig: {
        packageName: "altarik-launcher",
        name: "altarik-launcher",
        productName: "altarik-launcher",
        icon: path.resolve(__dirname, 'icon.ico')
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            platforms: ['darwin', 'win32'],
            config: {
                name: "altarik-launcher",
                iconUrl: path.resolve(__dirname, 'icon.ico'),
                //loadingGif: path.resolve(__dirname, 'src/assets/loading.gif'),
                setupIcon: path.resolve(__dirname, 'icon.ico'),
                setupExe: "altarik-launcher-win32-x64.exe"
            }
        }
    ]
}
