const path = require('path');
const pkg = require('./package.json')

module.exports = {
    packagerConfig: {
        packageName: "altarik-launcher",
        name: "Altarik Launcher",
        productName: "altarik-launcher",
        icon: path.resolve(__dirname, 'icon.ico'),
        asar: true,
    },
    plugins: [
        {
            name: '@electron-forge/plugin-auto-unpack-natives',
            config: {}
        }
    ],
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
        },
        {
            name: '@electron-forge/maker-zip',
            platforms: ['linux']
        }
    ],
    publishers: [
        {
            name: '@electron-forge/publisher-github',
            config: {
                repository: {
                    owner: 'AltarikMC',
                    name: 'Launcher'
                },
                preRelease: false,
                draft: true,
                tagPrefix: ''
            }
        }
    ]
}
