import { Injectable } from '@nestjs/common';

@Injectable()
export class HomeService {
    Hello() : string
    {
        return "Hello World";
    }
}
