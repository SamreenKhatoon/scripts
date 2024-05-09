const nunjucks = require("nunjucks");
const path = require("path");
const fg = require("fast-glob");
const matter = require("gray-matter");
const fs = require("fs-extra");
const ProjectData = require("./project-data");

function TemplateSetup(config) {

    const Templates = {};

    const srcConfig = config.src_config;
    const outConfig = config.out_config;
    const projectData = new ProjectData(config);

    // common template data
    function getGlobalData(){
        const templateData = {
            "product_data" : config.product_data,
            "env_config" : outConfig,
            "last_updated" : new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
        };

        const dataFilepath = srcConfig.folder_paths.data;
        const jsDataFiles = fg.sync(`${dataFilepath}/*.{js, json}`);

        if(jsDataFiles.length) {
            jsDataFiles.forEach((jsfile, idx) => {
                //if json needed condition needs to be added
                const [filename, file] = [path.basename(jsfile, ".js"), path.basename(jsfile)];
                // added to reload js data files when changed. delete existing require cache.
                delete require.cache[`${jsfile}`];
                templateData[filename] = require(`${jsfile}`);
            });
        }
        return templateData;
    }

    // parse front matter data
    function getGrayMatterData(templateFile){
        return matter.read(templateFile);
    }

    // get all templates from the pages folder
    function getPageTemplates(){
        const pageRoot = srcConfig.folder_paths.pages;
        const templateList = fg.sync(`${pageRoot}/**/*.html`);
        return templateList;
    }

    // loop through all page templates and add templatedata to each page
    function getPageTemplatesWithData(){

        const templates = getPageTemplates();
        // const globalData = getGlobalData();
        const globalData = projectData.getGlobalData();

        if(templates.length === 0) {
            throw new Error("Page templates list empty.");
        }

        const templatesWithData = templates.map((templateFile, idx) => {

            // const [filename, file] = [path.basename(templateFile, ".html"), path.basename(templateFile)];
            const parsedPath = path.parse(templateFile.replace(srcConfig.folder_paths.pages, ""));
            const [filename, file] = [parsedPath.name, parsedPath.base];
            
            let baseFilepath = templateFile.replace(srcConfig.folder_paths.pages, "");
            
            // let baseFolderList = templateFile.replace(srcConfig.folder_paths.pages, "").split("/").filter(f => f != '').slice(0,-1);
            let baseFolderList = parsedPath.dir.split("/").filter(f => f != '');
            
            let allTemplateData = { global_data : globalData };
            const matterData = getGrayMatterData(templateFile);
            const pageData = {};

            pageData.template_file_path = templateFile;
            pageData.filename = file;
            pageData.out_filename = file;
            pageData.base_folder_list = baseFolderList;
            pageData.base_out_filepath = baseFilepath;
            pageData.last_updated = new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

            let templateFileData, pageSourceData = {};
            templateFileData = projectData.getTemplateData(filename);
            
            allTemplateData.matter_data = { data : {}, content : matterData.content};
            if(Object.keys(matterData.data).length > 0){
                if(matterData.data.permalink) {

                    const permaLink = matterData.data.permalink.split("/");
                    pageData.out_filename = permaLink.pop();
                    pageData.base_folder_list = permaLink;
                    pageData.base_out_filepath = matterData.data.permalink;
                }
                allTemplateData.matter_data.data = matterData.data;

                if(matterData.data.pagedatasource){
                    pageSourceData = projectData.getTemplateData(matterData.data.pagedatasource);
                }
            }
            pageData.base_folder_path = pageData.base_folder_list.join("/");
            pageData.template_data = {...templateFileData, ...pageSourceData};
            allTemplateData.page_data = pageData;

            return allTemplateData;
        });
        return templatesWithData;
    }

    // parse njk templates and return the html
    function renderTemplateString(templateStr, templateData){
        const templatePaths = [srcConfig.source_path];
        const njkEnv = nunjucks.configure(templatePaths, { throwOnUndefined: true, noCache : true });
        return nunjucks.renderString(templateStr, templateData);
    }

    // get a single template and its data. takes full template path
    function getTemplateDataforPage(templateFilePath){

        let allTemplateData = {};

        if(fs.existsSync(templateFilePath)){

            // const globalData = getGlobalData();
            const globalData = projectData.getGlobalData();

            const [filename, file] = [path.basename(templateFilePath, ".html"), path.basename(templateFilePath)];
            let baseFolderList = templateFilePath.replace(srcConfig.folder_paths.pages, "").split("/").filter(f => f != '').slice(0,-1);
            allTemplateData = { global_data : globalData };
            const matterData = getGrayMatterData(templateFilePath);
            const pageData = {};

            pageData.template_file_path = templateFilePath;
            pageData.filename = file;
            pageData.out_filename = file;
            pageData.base_folder_list = baseFolderList;
            pageData.last_updated = new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" });

            let templateFileData, pageSourceData = {};
            templateFileData = projectData.getTemplateData(filename);

            allTemplateData.matter_data = { data : {}, content : matterData.content};
            if(Object.keys(matterData.data).length > 0){
                if(matterData.data.permalink) {
                    const permaLink = matterData.data.permalink.split("/");
                    pageData.out_filename = permaLink.pop();
                    pageData.base_folder_list = permaLink;
                }
                allTemplateData.matter_data.data = matterData.data;
                if(matterData.data.pagedatasource){
                    pageSourceData = projectData.getTemplateData(matterData.data.pagedatasource);
                }
            }
            pageData.base_folder_path = pageData.base_folder_list.join("/");
            pageData.template_data = {...templateFileData, ...pageSourceData};
            allTemplateData.page_data = pageData;
        }
        return allTemplateData;
    }

    return {
        getPageTemplates,
        getPageTemplatesWithData,
        getTemplateDataforPage,
        getGrayMatterData,
        renderTemplateString
    }
}

module.exports = TemplateSetup;