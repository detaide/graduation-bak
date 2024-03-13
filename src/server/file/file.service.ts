import { getImage } from '@/utils/File/upload';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
    Hello()
    {
        return "Hello World";
    }

    async getImage(imageName : string)
    {
        return await getImage(imageName);
    }
}
