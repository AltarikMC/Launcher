# Launcher

Launcher is a Minecraft custom launcher developped to launch the game with our own modpack.

More info on: [https://altarik.fr](https://altarik.fr) [^1]

[^1]: Website still in developpement, a new fresh version will come in a near future.

## Preambule

Use main branch at your own risk, it may contains code which not compile nor contains known bugs which require bug fix.

If you want to use a version of the launcher how work, please download an already compiled asset from the lastest version ([https://github.com/AltarikMC/Launcher/releases/latest](https://github.com/AltarikMC/Launcher/releases/latest)) or checkout the latest tag.

## Installation and usage

Pre-compiled builds for Windows and Linux are available in the [release page](https://github.com/AltarikMC/Launcher/releases/latest)

If you use the launcher thank to git and not by downloading already compiled assets, use these step:

- Install dependency: [nodejs](https://nodejs.org/en/download/)
- Run the following commands: `corepack enable` to enable yarn, then `yarn` to install project dependencies and `yarn run start` to launch the launcher

### Others installation channel

The GitHub release page is the only official distributed channel and provide reproducible binaries through Github Actions. Any other source is not supported and therefore, should not be used.

Per example, a package is present on AUR but is not maintained by Altarik, we **don't** recommand to install this one, no support will be provided if the program is installed through unofficial sources.

## Copyright

The code and everything here is distributed under BSD 3-Clause License which autorize usage, modification and dsitribution of the launcher for a commercial or a private use, more information about the [licence here](https://github.com/AltarikMC/Launcher/blob/master/LICENSE).
