import { Body, Controller, Get, Header, HttpStatus, Param, Post, Res, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileService } from './file.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { saveImage } from '@/utils/File/upload';
import { Response } from 'express';

@Controller('file')
export class FileController {
    public constructor(private readonly fileService : FileService) {}

    @Post("upload_image")
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(
        @UploadedFile() file: Express.Multer.File
    )
    {
        console.log(file);
    }


    @Post("upload_images")
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFiles(
        @UploadedFiles() files : Express.Multer.File[]
    )
    {
        let filePathList = await saveImage(files);
        return filePathList
    }

    @Get("get_image/:pictureName")
    @Header("Content-Type", 'image/*')
    async getImage(
        @Param("pictureName") pictureName : string,
        @Res() res : Response
    )
    {
        console.log(pictureName);
        let file = await this.fileService.getImage(pictureName);
        res.send(file);

    } 

}

