const path = require("path");
const fg = require("fast-glob");
const fs = require("fs-extra");
const browserSync = require("browser-sync");

const TemplateSetup = require("./template-setup");
const SassSetup = require("./sass-setup");
const FileHandlers = require("./file-handlers");

function ProjectServer(config){

    const projectServerSetup = {};

    const srcConfig = config.src_config;
    const outConfig = config.out_config;
    const templateSetup = TemplateSetup(config);
    const sassSetup = new SassSetup(config);
    const fileHandler = FileHandlers();

    const bs = browserSync.create();

    function initServer(){

        bs.init({
            server : {
                baseDir: outConfig.base_folder_path,
                index : "index.html",
            },
            open: false,
            startPath:outConfig.home_link,
            reloadDelay: 1000,
            watchEvents: ["change","add","unlink","addDir"],
        })
    }

    function serveProject(){

        initServer();
        watchFiles();
    }

    function watchFiles(){

        const templatePaths = [
            `${srcConfig.folder_paths.pages}/**/*.html`,
            `${srcConfig.folder_paths.layouts}/**/*.html`,
            `${srcConfig.folder_paths.includes}/**/*.html`
        ];
        bs.watch(templatePaths, { ignoreInitial: true }, templateWatcher );

        bs.watch(`${srcConfig.folder_paths.assets}/**/*.{css,scss}`, { ignoreInitial: true }, stylesWatcher);
        bs.watch(`${srcConfig.folder_paths.assets}/**/*.{js,json}`, { ignoreInitial: true }, scriptWatcher);

        const assetFiles = [
            `${srcConfig.folder_paths.assets}/images/**/*.{svg,png,ico,jpg,jpeg,gif}`,
            `${srcConfig.folder_paths.assets}/files/**`,
            `${srcConfig.folder_paths.assets}/fonts/**`,
        ];
        bs.watch( assetFiles, { ignoreInitial: true }, fileWatcher);

        const dataFiles = `${srcConfig.folder_paths.data}/*.{js,json}`;
        bs.watch(dataFiles, {ignoreInitial: true}, dataWatcher);

    }

    function templateWatcher(evt, changedFilePath){

        // console.log(`Template ${changedFilePath} updated`, "Event", evt);
        fileHandler.fileChangeMessage(`Template ${changedFilePath} updated by event ${evt}`);

        const changedFile = changedFilePath.replace(/\\/g, '/');
        let baseFolderList = changedFile.replace(srcConfig.source_path, "").split("/").filter(f => f != '').slice(0,-1);
        const pageBaseFolder = baseFolderList.shift();
        // console.log("BASE", changedFile, pageBaseFolder, baseFolderList);

        let changedTemplates = [];

        changedTemplates = (['_includes', '_layouts'].includes(pageBaseFolder))
                            ? templateSetup.getPageTemplatesWithData()
                            : [templateSetup.getTemplateDataforPage(changedFile)];

        changedTemplates.forEach((templateFile) => {

            const globalData = templateFile.global_data;
            const matterData = templateFile.matter_data;
            const pageData = templateFile.page_data;

            const outFilepath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/${pageData.out_filename}`;
            const templateData = {...globalData, ...matterData.data, page_data: pageData};
            const outHtml = templateSetup.renderTemplateString(matterData.content, templateData);
            fs.writeFileSync(outFilepath, outHtml);

            // if needed check for scripts and css. copy them as well
            const assetsBasePath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/assets`;
            if (matterData.data.scripts) {
                matterData.data.scripts.forEach((file, idx) => {
                    let fromSrcJs;
                    if (fs.existsSync(`${srcConfig.assets}/js/${file}`)) {
                        fromSrcJs = `${srcConfig.folder_paths.assets}/js/${file}`;
                    } else if (fs.existsSync(`${srcConfig.folder_paths.assets}/vendor/js/${file}`)) {
                        fromSrcJs = `${srcConfig.folder_paths.assets}/vendor/js/${file}`;
                    }
                    const toOutJs = `${assetsBasePath}/js/${file}`;
                    if (fromSrcJs != undefined) {
                        fs.copySync(`${fromSrcJs}`, `${toOutJs}`);
                    }
                });
            }

            if (matterData.data.styles) {
                matterData.data.styles.forEach((file, idx) => {
                    let fromSrcCss;
                    if (fs.existsSync(`${srcConfig.folder_paths.assets}/css/${file}`)) {
                        fromSrcCss = `${srcConfig.folder_paths.assets}/css/${file}`;
                    } else if (fs.existsSync(`${srcConfig.folder_paths.assets}/vendor/css/${file}`)) {
                        fromSrcCss = `${srcConfig.folder_paths.assets}/vendor/css/${file}`;
                    }
                    const toOutCss = `${assetsBasePath}/css/${file}`;
                    if (fromSrcCss != undefined) {
                        fs.copySync(`${fromSrcCss}`, `${toOutCss}`);
                    }
                })
            }
        });

        bs.reload();
    }

    function scriptWatcher(evt, changedFilePath){

        // console.log(`Script ${changedFilePath} updated`);
        fileHandler.fileChangeMessage(`Script ${changedFilePath} updated`);

        const changedFile = changedFilePath.replace(/\\/g, '/');
        const [jsFileName, jsFile] = [path.basename(changedFile, ".js"), path.basename(changedFile)];
        const templateList = templateSetup.getPageTemplatesWithData();

        templateList.forEach((templateFile) => {

            // let baseFolderList = templateFile.replace(srcConfig.folder_paths.pages, "").split("/").filter(f => f != '').slice(0,-1);
            const matterData = templateFile.matter_data;
            const pageData = templateFile.page_data;

            if(matterData.data.scripts && matterData.data.scripts.includes(jsFile)){

                const assetsBasePath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/assets`;
                // console.log(`Copying ${jsFile} to ${assetsBasePath}/js/${jsFile}`);
                fileHandler.fileChangeMessage(`Copying ${jsFile} to ${assetsBasePath}/js/${jsFile}`);
                fs.copySync(changedFile, `${assetsBasePath}/js/${jsFile}`);
            }
        });
        bs.reload();
    }

    function stylesWatcher(evt, changedFilePath){

        // console.log(`Style ${changedFilePath} updated`);
        fileHandler.fileChangeMessage(`Style ${changedFilePath} updated`);

        const changedFile = changedFilePath.replace(/\\/g, '/');
        // const cssFile = path.basename(changedFile);
        const fileExt = path.extname(changedFile);

        // const [cssFileName, cssFile] = [path.basename(changedFile, ".css"), path.basename(changedFile)];
        const templateList = templateSetup.getPageTemplatesWithData();

        /*
        let cssFileName;
        if(fileExt === '.scss'){
            cssFileName = path.basename(changedFile, ".scss");
            const outCss = sassSetup.compileSCSS(changedFile);
        }
        else {
            cssFileName = path.basename(changedFile, ".css");
        } */
        const cssFileName = (fileExt === '.scss') ? path.basename(changedFile, ".scss") : path.basename(changedFile, ".css");

        const outCssFiles = sassSetup.compileSCSStoCSS();

        templateList.forEach((templateFile) => {

            const matterData = templateFile.matter_data;
            const pageData = templateFile.page_data;

            const assetsBasePath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/assets`;
            const outCssFilename = `${assetsBasePath}/css/${cssFileName}.css`;
            if(matterData.data.styles && matterData.data.styles.includes(`${cssFileName}.css`)){

                if(fileExt === '.scss' && outCssFiles[cssFileName]){
                    console.log(`Compiling ${cssFileName} to ${assetsBasePath}/css/${cssFileName}`);
                    fs.writeFileSync(outCssFilename, outCssFiles[cssFileName]);
                }

                if(fileExt === 'css'){
                    // console.log(`Copying ${cssFileName} to ${assetsBasePath}/css/${cssFileName}`);
                    fileHandler.fileChangeMessage(`Copying ${cssFileName} to ${assetsBasePath}/css/${cssFileName}`);
                    fs.copySync(changedFile, `${outCssFilename}`);
                }
            }
        });
        bs.reload();
    }

    function fileWatcher(evt, changedFilePath){

        if(evt === 'add' || evt === 'unlink'){

            // make changes to front matter by listing image folders in template
            const changedFile = changedFilePath.replace(/\\/g, '/');
            const commonImages = fg.sync(`${srcConfig.folder_paths.assets}/images/common/*.{svg,png,ico,jpg,jpeg,gif}`);

            const templateList = templateSetup.getPageTemplatesWithData();
            templateList.forEach((templateFile) => {

                const matterData = templateFile.matter_data;
                const pageData = templateFile.page_data;

                const assetsBasePath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/assets`;
                const folderImages = fg.sync(`${srcConfig.folder_paths.assets}/images/${pageData.base_folder_path}/*.{svg,png,ico,jpg,jpeg,gif}`);
                const allImages = [...commonImages, ...folderImages];

                allImages.forEach((imagePath) => {
                    const imageName = path.basename(imagePath);
                    const toImagePath = `${assetsBasePath}/images`;
                    fs.copySync(imagePath, `${toImagePath}/${imageName}`);
                });
            });
        }
    }

    // if there is any change in the data rebuild templates
    function dataWatcher(evt, changedFilePath){

        fileHandler.fileChangeMessage(`Data file ${changedFilePath} updated`);
        const changedFile = changedFilePath.replace(/\\/g, '/');
        const templateList = templateSetup.getPageTemplatesWithData();

        //rebuild the app/dist when data files change
        templateList.forEach((templateFile) => {

            const globalData = templateFile.global_data;
            const matterData = templateFile.matter_data;
            const pageData = templateFile.page_data;

            const outFilepath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/${pageData.out_filename}`;
            const templateData = {...globalData, ...matterData.data, page_data: pageData};

            const outHtml = templateSetup.renderTemplateString(matterData.content, templateData);
            fs.writeFileSync(outFilepath, outHtml);
        });
        bs.reload();
    }

    return {
        serveProject,
    }
}

module.exports = ProjectServer