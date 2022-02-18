const path = require('path');
const pkg = require('./package.json')

module.exports = {
    packagerConfig: {
        packageName: "altarik-launcher",
        name: "Altarik Launcher",
        productName: "altarik-launcher",
        icon: path.resolve(__dirname, 'icon.ico')
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            platforms: ['darwin', 'win32'],
            config: {
                name: pkg.name,
                iconUrl: path.resolve(__dirname, 'icon.ico'),
                //loadingGif: path.resolve(__dirname, 'src/assets/loading.gif'),
                setupIcon: path.resolve(__dirname, 'icon.ico'),
                setupExe: `${pkg.name}-${pkg.version}-win32-x64.exe`
            }
        }
    ]
}
