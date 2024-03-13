@echo off
set module_name=%1

nest generate service %module_name% && nest generate controller %module_name% && nest generate module %module_name%