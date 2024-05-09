const path = require("path");
const fg = require("fast-glob");
const fs = require("fs-extra");


const FileHandlers = () => {

    function makeDirs(dirnames, basepath) {

        if (Array.isArray(dirnames)) {
            dirnames.forEach((dirname, idx) => {
                fs.mkdirsSync(`${basepath}/${dirname}`, {recursive: true});
            })
        } else if (typeof dirnames === 'string') {
            fs.mkdirsSync(`${basepath}/${dirnames}`, {recursive: true});
        } else {
            console.log("Invalid directory name provided. Must be a string or array of strings");
            process.exit;
        }
    }

    function cleanProject(outFolderPath) {
        if (fs.existsSync(outFolderPath)) {
            fs.rmSync(outFolderPath, { recursive: true });
            console.log("%s directory removed.", outFolderPath);
        }
    }

    function fileChangeMessage(message){

        console.log(`- ${message}`, "\n");
    }

    return {
        makeDirs,
        cleanProject,
        fileChangeMessage
    }
}

module.exports = FileHandlers;