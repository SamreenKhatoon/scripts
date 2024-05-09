const path = require("path");
const fs = require("fs-extra");
const fg = require("fast-glob");

// function ProjectConfig(env, projectName, projectPath){
    function ProjectConfig(projectObj){

    const projectConfig = {};

    const projectRoot = projectObj.project_path;
    const projectEnv = projectObj.project_env;
    const stageImageMedinfoPath = "";
    const prodImageMedinfoPath = "https://edge.sitecorecloud.io/johnson-a2f05cf8/media/janssenscience/medinfohtml/images";
    const stageImageAttestationPath = "https://edge.sitecorecloud.io/johnson-ebb46b58/media/janssenscience/medinfohtml/images";
    const prodImageAttestationPath = "/media/attestation/medinfohtmlimages";

    const defaultSourceConfig = {
        "folder_paths": {
            "pages": "pages",
            "assets": "assets",
            "layouts": "_layouts",
            "includes": "_includes",
            "data": "_data",
            "sass": "_sass"
        }
    }

    const defaultAppConfig = {
        "folder": "app",
        "home_link": "/",
        "asset_folders" : ['/assets/fonts', '/assets/css', '/assets/js', '/assets/images','/assets/files'],
        "folder_paths": {
            "pages_path": "",
            "image_path": "./assets/images",
            "medinfo_image_path": "./assets/images",
            "css_path": "./assets/css",
            "css_image_path": "../images",
            "js_path": "./assets/js",
            "fonts_path": "./assets/fonts/",
            "file_path": "./assets/files",
            "base_url": "/"
        }
    }

    function getConfig(){

        if( !fs.existsSync(`${projectRoot}/site-config.js`)) {
            throw new Error("Sitecofig does not exist");
        }

        const config = {};
        config.project_env = (['build','production'].includes(projectEnv)) ? projectEnv : "development";
        config.default_root = projectRoot;

        const siteConfig = require(`${projectRoot}/site-config.js`);
        config.product_data = siteConfig;
        config.src_config = getSrcConfig(siteConfig);
        config.out_config = getOutConfig(siteConfig);

        return config;
    }

    function getSrcConfig(siteConfig) {
        const srcConfig = Object.assign({}, defaultSourceConfig);
        srcConfig.base_folder_path = projectRoot;
        srcConfig.source_path = fg.convertPathToPattern(path.join(projectRoot,"src", "/"));
        Object.entries(srcConfig.folder_paths).forEach( ([key, val]) => {
            srcConfig.folder_paths[key] = fg.convertPathToPattern(path.join(projectRoot,"src",val));
        })
        return srcConfig;
    }

    function getOutConfig(siteConfig) {

        const outConfig = Object.assign({}, defaultAppConfig);
        const outFolder = (projectEnv === 'build') ? 'build' : (projectEnv === 'production') ? "dist" : "app";
        outConfig.base_folder_path = fg.convertPathToPattern(path.join(projectRoot, outFolder));
        outConfig.folder = outFolder;
        outConfig.home_link = siteConfig.home_link ? siteConfig.home_link : defaultAppConfig.home_link;

        //check base url. one for home. one for image base url for medinfo and attestation assets
        if(projectEnv === 'production') {
            const imkId = siteConfig.imk_docid;
            const baseUrl =  siteConfig.base_url ?? `/products/${siteConfig.medical_content_name}/product-dossier/${siteConfig.medical_content_name}-digital-dossier/`;
            const medinfoBaseUrl = `${prodImageMedinfoPath}/${siteConfig.medical_content_name}/${imkId}`;
            const attnPath = `${prodImageMedinfoPath}/${siteConfig.medical_content_name}/${imkId}`;

            outConfig.home_link = baseUrl;
            outConfig.folder_paths.image_path = attnPath;
            outConfig.folder_paths.medinfo_image_path = medinfoBaseUrl;
            outConfig.folder_paths.css_image_path = attnPath;
            outConfig.folder_paths.file_path = attnPath;
            outConfig.folder_paths.base_url = baseUrl;
        }
        return outConfig;
    }

    return {
        getConfig,
    }

}

module.exports = ProjectConfig;