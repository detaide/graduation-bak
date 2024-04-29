import * as nodemail from "nodemailer";
import dotenv from "dotenv";

const env = dotenv.config().parsed;

const selfEmailConfig =  {
    alias : "ptu-comunication",
    host : "smtp.163.com",
    port : 465,
    secure : true,
    user : env.Email_163_email,
    pass : env.Email_163_Key
}

export class Email{
    private transporter = null;

    public constructor(){
        this.transporter = nodemail.createTransport({
            host: selfEmailConfig.host,
            port: selfEmailConfig.port,
            secure: selfEmailConfig.secure,
            auth: {
                user: selfEmailConfig.user,
                pass: selfEmailConfig.pass
            }
        });
    }

    public send({email, subject="auth check", html = "验证码为{{code}}", code})
    {
        
        const options = {
            from : `${selfEmailConfig.alias}<${selfEmailConfig.user}>`,
            to : email,
            subject,
            text : `验证码为${code}`,
            html : html,
        }

        options.html = options.html.replace("{{code}}", code);

        this.transporter.sendMail(options, (error, info) =>
        {
            if(error)
            {
                console.log("邮件发送失败");
                console.log(error);
            }
            else{
                console.log("邮件发送成功");
                console.log(info);
            }
        })
    }
}