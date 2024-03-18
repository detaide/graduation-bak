import { Controller, Get, HttpException, HttpStatus, UseFilters } from '@nestjs/common';
import { HomeService } from './home.service';
import { HttpExceptionFilter } from '@/http-exception.filter';

@Controller('home')
export class HomeController {

    constructor(private readonly homeService : HomeService) {}

    @Get()
    @UseFilters(new HttpExceptionFilter())
    findAll() : string
    {
        // return this.homeService.Hello();
        throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }
}
