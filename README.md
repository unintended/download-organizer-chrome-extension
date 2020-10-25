download-organizer-chrome-extension
===================================

Chrome extesion that allows you to set custom download locations with a flexible regexp-based rules.

Try at [Chrome web store](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)

## Debugging

Before opening an issue, please do the following and try to figure out what fields are most suiatble for your rule. To debug the addon:
1. Open chrome://extensions/
1. Open inspect view and check console ![image](https://user-images.githubusercontent.com/641973/97117295-beedb900-1713-11eb-8e79-541f2d89659b.png)
1. Download something and you will get your log ![image](https://user-images.githubusercontent.com/641973/97117265-95349200-1713-11eb-8eea-6fd394632e92.png)

The most interesting part is "Downloading item": you have to check the fields and try to figure out a working rule. Unfortunately, there is no universal rule for all sites, because different sites have different link and content delivery structure. If still unsure, open the issue and attach your item dump from the console log.
