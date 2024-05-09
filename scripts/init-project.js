const dotenv = require('dotenv');
const { prompt } = require("enquirer");
const fs = require("fs-extra");
const path = require("path");


function InitProject() {

    // const projectList = ['talvey', 'rybrevant','ibd-cultural-humility-toolkit'];
    
    const scriptRoot = path.join(__dirname, "../");
    const envFilePath = `${scriptRoot}.env`;
    let projectList; 
    const envList = ['development', 'stage', 'production'];
    const steps = ['setup', 'start'];

    function checkEnv(){

        if( ! fs.existsSync(envFilePath)){
            return false;
        }
        return true;
    }

    function getProjectsFromEnv(){
        const envParsed = dotenv.parse(fs.readFileSync(`${scriptRoot}.env`));
        const projectList = {}; 
        for(const [projectKey, projectPath] of Object.entries(envParsed)){
            const projectName = projectKey.split("_")[1].toLowerCase();
            projectList[projectName] = {name : projectName, path : projectPath};
        }
        return projectList;
    }

    async function chooseOption(){

        const choice = await prompt({
            type:"select",
            name:"option",
            message:"Create new or Start project",
            choices:['start', 'create']
        });
        return { "choice" : choice.option };
    }


    async function createNewProject(){

        const questions = [
            {
                type:"input",
                name:"project_name",
                message:"Enter the name of the project",
            },
            {
                type:"input",
                name:"project_path",
                message:"Enter the full local path where the project folder is to be created",
                validate:function(projectPath){
                    if( !fs.existsSync(projectPath)){
                        return `Incorrect path ${projectPath} entered.`;
                    }
                    return true;
                }
            }
        ];

        const answers = await prompt(questions);
        return answers;
    }

    async function selectProject() {

        // projectList = Object.keys(getProjectsFromEnv());

        const questions = [
            // {
            //     type:"select",
            //     name:'project_name',
            //     message:"Enter Project Name",
            //     choices:projectList,
            // },
            {
                type:"select",
                name:'project_env',
                message:"Enter dev environment",
                choices:envList,
            },
            {
                type:"select",
                name:'project_step',
                message:"Setup or start project",
                choices:steps,
            }
        ];

        const answers = await prompt(questions);
        return answers;
    }

    // function checkProject(projectName, projectPath){
    function checkProject(projectObj){

        if(fs.existsSync(projectObj.project_path)){
            console.log(`Project ${projectObj.project_name} exists at ${projectObj.project_path}`);
            return true;
        }
        console.log(`Incorrect project path ${projectObj.project_path} for ${projectObj.project_name}.`);
        return false;
    }

    function initialSrcSetup(projectName, projectPath){

        const setup = { status : 'error' , 'msg' : 'setup failed'};
        const fullProjectPath = `${projectPath}/${projectName}`;
        const srcFolders = ['_data/global', '_data/template', '_includes', 
                            '_layouts', 'assets/fonts','/assets/images',
                            '/assets/css', '/assets/js', '/assets/files', 'pages'
                           ].map( folder => path.join(`${fullProjectPath}/src/`,folder) );
        
        try {
            srcFolders.forEach(folderPaths => {
                fs.mkdirsSync(`${folderPaths}`, {recursive: true});
            })
            const envVar = `PROJECT_${projectName.toUpperCase()}=${fullProjectPath}`;
            fs.appendFileSync(envFilePath, envVar);
            setup.status = 'success';
            setup.msg = 'setup successful';
            return setup;
        }
        catch(error){
            console.log("Error setting up new project", error);
            return setup;    
        } 
    }

    return {
        checkEnv,
        chooseOption,
        createNewProject,
        selectProject,
        checkProject,
        initialSrcSetup
    }
}

module.exports = InitProject;