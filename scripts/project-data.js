const path = require("path");
const fg = require("fast-glob");
const matter = require("gray-matter");
const fs = require("fs-extra");

function ProjectData(config) {

    const srcConfig = config.src_config;
    const outConfig = config.out_config;
    const dataFilepath = srcConfig.folder_paths.data;
    const globalDataFiles = fg.sync(`${dataFilepath}/global/*.{js, json}`);
    const templateDataFiles = fg.sync(`${dataFilepath}/template/*.{js, json}`);
    // const { globaldataFilenames, templateDataFilenames } = getDataFileNames();

    function getGlobalData(){

        const globalData = {
            "product_data" : config.product_data,
            "env_config" : outConfig,
            "last_updated" : new Date().toLocaleString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
        };

        if(globalDataFiles.length) {
            globalDataFiles.forEach((jsfile) => {
                //if json needed condition needs to be added
                const [filename, file] = [path.basename(jsfile, ".js"), path.basename(jsfile)];
                // added to reload js data files when changed. delete existing require cache.
                delete require.cache[`${jsfile}`];
                globalData[filename] = require(`${jsfile}`);
            });
        }

        return globalData;
    }

    function getTemplateData(dataSourceFile){

        const dataFilename = path.parse(dataSourceFile).name;
        const datafile = templateDataFiles.find( (file) => {
            const filename = path.basename(file, ".js");
            return dataFilename === filename;
        });
        
        const templateData = {};    
        if(datafile && datafile != undefined) {
            delete require.cache[`${datafile}`];
            templateData[dataFilename] = require(`${datafile}`);
        }
        return templateData;
    }

    function getDataFileNames(){

        let datafileNames = { globaldataFilenames : [], templateDataFilenames : [] };
        // const allDatafiles = [...globalDataFiles, ...templateDataFiles];
        if(globalDataFiles.length) {
            datafileNames.globaldataFilenames = globalDataFiles.map((datafile) => path.basename(datafile,".js"));
        }

        if(templateDataFiles.length) {
            datafileNames.templateDataFilenames = templateDataFiles.map((datafile) => path.basename(datafile,".js"));
        }
        return datafileNames;
    }

    return {
        getGlobalData,
        getTemplateData,
    }
}

module.exports = ProjectData;
