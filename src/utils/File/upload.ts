import path from "path";
import fs from "fs";
import { uuidGenerate } from "../general/uuid";

let image_not_uuid_path = 'image_not_uuid';
const tempDir = path.resolve(__dirname, "../../../image_temp");

export async function saveImage(Files : Express.Multer.File[])
{
    let fileNameList = [];
    await Files.forEach(async (file) =>
    {
        let fileSuffix = file.originalname.split('.');
        let fileName = uuidGenerate() + '.' + (fileSuffix.length ? fileSuffix[fileSuffix.length - 1] : 'png');
        
        await saveImageToDir(file ,fileName);
        fileNameList.push(fileName);
    })
    return fileNameList;

}

export async function saveBase64Iamge(base64String : string, fileRegex : string = 'png') {
    let fileName = uuidGenerate() + '.' + fileRegex;

    let subUUIDList = fileName.split("-");

    await fs.access(tempDir, fs.constants.F_OK, async (err) =>
    {
        if(err)
            await fs.mkdirSync(tempDir);

            let parentDir = tempDir + '\\' + (subUUIDList.length ? subUUIDList[0] : image_not_uuid_path);
            await fs.access(parentDir, fs.constants.F_OK, async (err) =>
            {
                if(err)
                    await fs.mkdirSync(parentDir);
        
                let absoluteName = parentDir + '\\' + fileName;
                console.log(`[File Upload] ${absoluteName}`);
                base64String = base64String.replace(/^data:image\/\w+;base64,/, '');
                const binaryData = Buffer.from(base64String, 'base64');
                await fs.writeFile(absoluteName, binaryData, (err) =>
                {
                    if(err)
                    {
                        console.log(err);
                        throw new Error("fs write error");
                    }

                })
        })
    })

    return fileName;
}

export async function saveImageToDir(file : Express.Multer.File,  fileName? : string) {

    // let tempDir = path.resolve(__dirname, "../../../image_temp");

    await fs.access(tempDir, fs.constants.F_OK, async (err) =>
    {
        if(err)
            await fs.mkdirSync(tempDir);

        let subUUIDList = fileName.split("-");
        let parentDir = tempDir + '\\' + (subUUIDList.length ? subUUIDList[0] : image_not_uuid_path);
        await fs.access(parentDir, fs.constants.F_OK, async (err) =>
        {
            if(err)
                await fs.mkdirSync(parentDir);
    
            let absoluteName = parentDir + '\\' + fileName;
            console.log(`[File Upload] ${absoluteName}`);
            await fs.writeFile(absoluteName, file.buffer, (err) =>
            {
                if(err)
                {
                    console.log(err);
                    throw new Error("fs write error");
                }

            })
        })
    })

    
}

export async function getImage(fileName : string) {
    let fileNameSplit = fileName.split('-');
    let parentDir = fileNameSplit.length ? fileNameSplit[0]  : image_not_uuid_path;
    // let tempDir = path.resolve(__dirname, "../../../image_temp");

    let absoluteParentDir = `${tempDir}\\${parentDir}`;

    await fs.access(absoluteParentDir, (err) =>
    {
        if(err)
        {
            console.log(`[File Request] ${absoluteParentDir}\\${fileName} not found.`);
            throw new Error("path not found");
        }
    })

    let absoluteName = `${absoluteParentDir}\\${fileName}`;
    
    await fs.access(absoluteName, (err) =>
    {
        if(err)
        {
            console.log(`[File Request] ${absoluteParentDir}\\${fileName} not found.`);
            throw new Error("path not found");
        }
    })

    return fs.readFileSync(absoluteName);

}