const path = require("path");
const fg = require("fast-glob");
const fs = require("fs-extra");


const TemplateSetup = require("./template-setup");
const FileHandlers = require("./file-handlers");
const SassSetup = require("./sass-setup");

function ProjectSetup(config) {

    const srcConfig = config.src_config;
    const outConfig = config.out_config;
    const templateSetup = TemplateSetup(config);
    const fileHandler = FileHandlers();
    const sassSetup = new SassSetup(config);


    function initialSrcSetup(projectName){


    }

    function createOutFolder() {

        const templateDataList = templateSetup.getPageTemplatesWithData();

        fileHandler.cleanProject(outConfig.base_folder_path);

        const assetImagesPath = `${srcConfig.folder_paths.assets}/images`;
        // const commonImages = fg.sync(`${srcConfig.folder_paths.assets}/images/common/*.{svg,png,ico,jpg,jpeg,gif}`, {caseSensitiveMatch : false });
        const commonImages = fg.sync(`${assetImagesPath}/common/*.{svg,png,ico,jpg,jpeg,gif}`, {caseSensitiveMatch : false });
        //pre compile sass files if any
        const outCssFiles = sassSetup.compileSCSStoCSS();

        templateDataList.forEach((templateFile) => {

            const globalData = templateFile.global_data;
            const matterData = templateFile.matter_data;
            const pageData = templateFile.page_data;

            // console.log(templateFile);
            const folders = [
                '/assets/fonts',
                '/assets/images',
                '/assets/css',
                '/assets/js',
                '/assets/files',
            ].map(folder => path.join(pageData.base_folder_list.join("/"), folder));

            // console.log(folders);
            fileHandler.makeDirs(folders, outConfig.base_folder_path);

            const outFilepath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/${pageData.out_filename}`;

            const templateData = {...globalData, ...matterData.data, page_data: pageData};

            // console.log(templateData);
            const outHtml = templateSetup.renderTemplateString(matterData.content, templateData);
            fs.writeFileSync(outFilepath, outHtml);

            const assetsBasePath = `${outConfig.base_folder_path}/${pageData.base_folder_path}/assets`;

            if (matterData.data.scripts) {
                matterData.data.scripts.forEach((file, idx) => {
                    let fromSrcJs;
                    if (fs.existsSync(`${srcConfig.folder_paths.assets}/js/${file}`)) {
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

                    const cssFilename = path.basename(file, ".css");
                    const cssFiles = fg.sync([`${srcConfig.folder_paths.assets}/css/${file}`, `${srcConfig.folder_paths.assets}/vendor/css/${file}`]);
                    const outCssFilename = `${assetsBasePath}/css/${file}`;

                    if(cssFiles && cssFiles.length > 0){
                        fs.copySync(`${cssFiles[0]}`, `${outCssFilename}`);
                    }

                    if(outCssFiles[cssFilename] && outCssFiles[cssFilename] != ""){
                        fs.writeFileSync(outCssFilename, outCssFiles[cssFilename]);
                    }
                })
            }

            let allImages = [];
            //if images in frontmatter
            if(matterData.data.images){
                matterData.data.images.forEach((imgfolder) => {
                    if(imgfolder === 'common' && commonImages.length){
                        allImages = [...commonImages];
                    }
                    else {
                        const folderImages = fg.sync(`${assetImagesPath}/${imgfolder}/*.{svg,png,ico,jpg,jpeg,gif}`, {caseSensitiveMatch : false});
                        // allImages = [...allImages, ...folderImages];
                        allImages.push(...folderImages);
                    }
                })
            }
            else {
                const folderImages = fg.sync(`${assetImagesPath}/${pageData.base_folder_path}/*.{svg,png,ico,jpg,jpeg,gif}`, {caseSensitiveMatch : false});
                allImages = [...commonImages, ...folderImages];
                // const allImages = [...commonImages, ...folderImages];
            }
            
            allImages.forEach((imagePath) => {
                const imageName = path.basename(imagePath);
                const toImagePath = `${assetsBasePath}/images`;
                fs.copySync(imagePath, `${toImagePath}/${imageName}`);
            });

            if(fs.existsSync(`${srcConfig.folder_paths.assets}/fonts`)){
                const fontPath = `${srcConfig.folder_paths.assets}/fonts`;
                fs.copySync(`${fontPath}`, `${assetsBasePath}/fonts`);
            }

            //copy all pdf files
            if(fs.existsSync(`${srcConfig.folder_paths.assets}/files`)){
                const pdfFilesPath = `${srcConfig.folder_paths.assets}/files`;
                fs.copySync(`${pdfFilesPath}`, `${assetsBasePath}/files`);
            }

        });
    }

    return{
        createOutFolder,
    }
}

module.exports = ProjectSetup