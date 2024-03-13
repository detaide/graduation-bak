import fs from "fs";
import path from "path";

function isDirectory(path : string) {
    return fs.statSync(path).isDirectory();
}

let globalModule = [];

export async function loadModule(dirpath : string)
{
    const files = await fs.readdirSync(dirpath);
    files.forEach(async (file) =>
    {
        let absolutePath = path.resolve(dirpath, file);
        if(!isDirectory(absolutePath))
        {
            if(file.endsWith(".module.js"))
            {
                const module = await import(absolutePath);
                if(!module)
                {
                    return;
                }
                console.log(`load Module[${absolutePath}]`)
                for(let moduleName in module)
                {
                    globalModule.push(module[moduleName]);
                }
            }
            return;
        }

        loadModule(absolutePath);
    })
    return globalModule;
}
