## Sitecore Multipage setup scripts  

Collection of scripts for setup of multipage projects for Janssen Sitecore  

Steps to setup the project  

* Run `npm install` in the folder to install all project dependencies and modules.  

* Create a `.env` file. Enter the list of projects to be run in the format **PROJECT_projectname=projectpath** where `projectname` is the name of the project and `projectpath` is the local path to the project.
* Run `npm run sitecore` to start working on a project.   
When run users will have the option of either starting a new project or creating one.  
If a user selects `start` then the list of projects will be shown. This list will be fetched from the values in the `.env` file.  
After selection a project, users can need to select the environment - development, stage or production.  
Users then can select whether to `setup` - this will create an output folder to be used or `start` - which will setup and then run the project on a local server. Users can then continue working on the code in the `src` folder of their projects. All changes will be reflected when changes are saved.   
If a user selects `setup` initially then a project will be created at the path specified with default directory structure. An entry will be created in the `.env` file. (WIP)

## Setting up projects  

Any project that is to be run using this script must have the following directory structure   
* `src` - The source folder of the project that contains all the code  
* Every project must have a `site-config.js` file located at the root. This file contains the project details relevant to sitecore. You can override the default config values by setting them here.
* `src/_data` - Location for all data files to be used for the project. `global` holds the global data that will be used across the whole site. `template` holds template specific data. The data file name must the same name as the template or the source must be specified in the frontmatter data for the template.
* `src/_includes` - Location for all partial templates that will be included in the other layouts or main templates
* `src/_layouts` - Location for page layouts that will be used for templates
* `src/assets` - Location for all template assets. Consists of  
    - `src/assets/css` - For css files. 
    - `src/assets/js` - Javascript script files 
    - `src/assets/files` - Any doc/video files
    - `src/assets/fonts` - Fonts to be used in the project
    - `src/assets/sass` - Sass scss files that will be compiled to css
    - `src/assets/images` - Images needed for a template. Folder name can have the same directory structure/name as the template or else the folder name to be used can defined in template frontmatter
* `src/pages` - Location of all the html template files. 

### Template FrontMatter Data  

You can define specific Frontmatter data for each template. This data will be used when creating the output files to be served. This data must be defined at the top of each template. Refer to YAML configuration for creating this data.   
Default data to be defined includes 
- `pagename` - the name of the template. Overrides the filename
- `pageheader` - The title of the page  
- `styles` - A list of the css files to be used. Scss files must be named as css. The files will be compiled to css and saved in the output folder
- `scripts` - Javascript script files to be included 
- `images` - Image folder from the `assets/images` that need to be copied for a template. 
- `permalink` - The output folder for the template. If specified then the out directory structure will be created per the format given and the template name will have the name specified. Else the directory structure from the `pages` directory will be copied as is.
