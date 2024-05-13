#!/usr/bin/env node
require('dotenv').config();
const fg = require("fast-glob");
const path = require("path");

const InitProject = require("./init-project");
const ProjectConfig = require("./project-config");
const ProjectSetup = require("./project-setup");
const ProjectServer = require("./project-server");

let projectSelected, projectEnv;
const init = new InitProject();

async function main(){

    // if( !init.checkEnv()) {
    //     throw new Error(".env file does not exist. Create one with the project paths specified");
    // }

    const optResponse = await init.chooseOption();
    // const optResponse = {choice : "start"}

    let initStatus = { 'status' : "error", "msg" : "init failed"};
    if(optResponse.choice === 'start'){

        //add check for env file. move env file reading to init and return full config instead
        const project = await init.selectProject();
        // const project ={project_env : "development", project_name : "", project_step : "start"};
        projectSelected = "";
        projectEnv = project.project_env;
        // const projectPath = fg.convertPathToPattern(process.env[`PROJECT_${projectSelected.toUpperCase()}`]);
        console.log(path.resolve("."))
        // const projectObj = {...project, project_path : __dirname.substring(0,  __dirname.indexOf('node_modules'))};
        const projectObj = {...project, project_path : path.resolve(".")};

        // let initStatus = { 'status' : "error", "msg" : "init failed"};
        // if(init.checkProject(projectSelected, projectPath)){
        if(init.checkProject(projectObj)){
            // const defaultConfig = new ProjectConfig(projectEnv, projectSelected, projectPath);
            const defaultConfig = new ProjectConfig(projectObj);
            const projectConfigObj = defaultConfig.getConfig();
            ProjectSetup(projectConfigObj).createOutFolder();

            initStatus['status'] = "success";
            initStatus['msg'] = "Setup done";

            if(project.project_step === 'start'){
                initStatus['status'] = "success";
                initStatus['msg'] = "Starting server";
                ProjectServer(projectConfigObj).serveProject();
            }
            return initStatus;
        }
        else {
            throw new Error("Project path incorrect or does not exist");
        }
    }
    else {
        const setup = await init.createNewProject();
        const setupResponse = init.initialSrcSetup(setup.project_name, setup.project_path);
        if(setupResponse['status'] == 'success'){
            initStatus['status'] = "success";
            initStatus['msg'] = setupResponse['msg'];
        }
        return initStatus;
    }
}

main()
    .then( (response) => {
        console.log(`Status: ${response.status}. Message: ${response.msg}`);
    })
    .catch((error) => {
        console.log("Error in main script.Exiting.", error);
    })
