const path = require('path');
module.exports = {
    packagerConfig: {
        packageName: "Launcher",
        name: "Launcher",
        productName: "Launcher",
        icon: path.resolve(__dirname, 'app.ico')
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "Launcher",
                iconUrl: path.resolve(__dirname, 'app.ico'),
                //loadingGif: path.resolve(__dirname, 'src/assets/loading.gif'),
                setupIcon: path.resolve(__dirname, 'app.ico')
            }
        }
    ]
}
