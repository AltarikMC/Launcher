const path = require('path');
module.exports = {
    packagerConfig: {
        packageName: "altarik-launcher",
        name: "altarik-launcher",
        productName: "altarik-launcher",
        icon: path.resolve(__dirname, 'app.ico')
    },
    makers: [
        {
            name: "@electron-forge/maker-squirrel",
            config: {
                name: "altarik-launcher",
                iconUrl: path.resolve(__dirname, 'app.ico'),
                //loadingGif: path.resolve(__dirname, 'src/assets/loading.gif'),
                setupIcon: path.resolve(__dirname, 'app.ico')
            }
        }
    ]
}
