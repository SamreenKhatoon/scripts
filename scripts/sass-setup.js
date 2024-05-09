const sass = require("sass");
const fs = require("fs-extra");
const fg = require("fast-glob");
const path = require("path");

function SassSetup(config){

    const srcConfig = config.src_config;
    const outConfig = config.out_config;
    const sassEnvVars = [`$sass-env: ${config.project_env};`, `$sass-imagepath: '${outConfig.folder_paths.css_image_path}';`];

    function compileSCSSFile(scssFile){
        const outCss = sass.compile(scssFile);
        return outCss.css;
    }

    function compileSCSSFileAsString(scssFile){
        console.log(scssFile)
        if( !fs.existsSync(scssFile)){
            throw new Error(`Cannot read SCSS file. File ${scssFile} not found.`)
        }
        
        let sassFileContent = fs.readFileSync(scssFile, 'utf-8');
        // console.log(sassEnvVars)
        sassFileContent = sassEnvVars.join("\n") + sassFileContent;

        return compileStringSCSS(sassFileContent);
    }

    function compileStringSCSS(sassString){
        const outCss = sass.compileString(sassString, { loadPaths: [`${srcConfig.folder_paths.assets}/sass/`] });
        return outCss.css;
    }

    function compileSCSStoCSS(){

        const sassFiles = fg.sync(`${srcConfig.folder_paths.assets}/sass/*.scss`);
        const cssFiles = {};
        if(sassFiles.length) {
            sassFiles.forEach((sassFile) => {
                const scssFilename = path.basename(sassFile, ".scss");
                // const outCss = compileSCSS(sassFile);
                /* let sassFileContent = fs.readFileSync(sassFile, 'utf-8');
                let sassEnvVars =   `$sass-env: ${config.project_env};
                                     $sass-imagepath: '${outConfig.folder_paths.css_image_path}';`;
                sassFileContent =   `${sassEnvVars}
                                     ${sassFileContent}`;
                const outCss = compileStringSCSS(sassFileContent); */
                const outCss = compileSCSSFileAsString(sassFile);
                cssFiles[scssFilename] = outCss;
            });
        }
        return cssFiles;
    }

    function setSASSEnv() {

        let sassEnvVar = `$sass-env: "dev"`;
        if(config.project_env === 'production'){
            sassEnvVar = `$sass-env: production`;
        }
        const envSassFile = `${srcConfig.folder_paths.assets}/sass/_env.scss`;
        fs.writeFileSync(envSassFile, sassEnvVar);
    }

    return{
        compileSCSSFile,
        compileSCSStoCSS,
        compileSCSSFileAsString
    }


}

module.exports = SassSetup;