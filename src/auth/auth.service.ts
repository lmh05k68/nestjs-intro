import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';
import authConfig from './config/auth.config';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { User } from 'src/users/user.entity';
import { LoginDto } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common'; // Thêm import này
import { HashingProvider } from './provider/hashing.provider';
import { JwtService } from '@nestjs/jwt';
import { ActiveUserType } from './interfaces/active-user-type.interface';
import { RefreshTokenDto } from './dto/refresh-token';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private readonly userService: UsersService,
        
        @Inject(authConfig.KEY)
        private readonly authConfiguration: ConfigType<typeof authConfig>,
    
        private readonly hashingProvider: HashingProvider,
        private readonly jwtService: JwtService
    ) {}
    // Sửa: Nên dùng kiểu nguyên thủy 'boolean' thay vì object 'Boolean'
    isAuthenticated: boolean = false;

    public async login(loginDto: LoginDto) {
    const user: User = await this.userService.findUserByUsername(loginDto.username);
    const isEqual: boolean = await this.hashingProvider.comparePassword(
        loginDto.password,
        user.password
    );

    if (!isEqual) {
        throw new UnauthorizedException('Incorrect Password');
    }

    //IF THE PASSWORD MATCH, LOGIN SUCCESS - RETURN ACCESS TOKEN
    //GENERATE JWT & SEND IT IN THE RESPONSE
    return this.generateToken(user);
}

    public async signup(CreateUserDto: CreateUserDto){
        return await this.userService.createUser(CreateUserDto);
    }

    private async signToken<T>(userId: number, expiresIn: number, payload?: T){
        return await this.jwtService.signAsync({
            sub: userId,
            ...payload 
        },{
            expiresIn: this.authConfiguration.expiresIn,
            secret: this.authConfiguration.secret,
            audience: this.authConfiguration.audience,
            issuer: this.authConfiguration.issuer
        })
    }

    private async generateToken(user: User){
        //GENERATE AN ACCESS TOKEN
        const accessToken = await this.signToken<Partial<ActiveUserType>>(user.id, this.authConfiguration.expiresIn, {email: user.email})

        //GENERATE A REFRESH TOKEN
        const refreshToken = await this.signToken(user.id, this.authConfiguration.refreshTokenExpiresIn);

        return {token: accessToken, refreshToken}
    }

    public async RefreshToken(refreshTokenDto: RefreshTokenDto){
        try{
            //1. VERIFY THE REFRESH TOKEN
            const {sub} = await this.jwtService.verifyAsync(refreshTokenDto.refreshToken, {
                secret: this.authConfiguration.secret,
                audience: this.authConfiguration.audience,
                issuer: this.authConfiguration.issuer
            })

            //2. FIND THE USER FROM DB USING USER ID
            const user = await this.userService.FindUserById(sub);

            //3. GENERATE AN ACCESS TOKEN & REFRESH TOKEN
            return await this.generateToken(user);
        } catch(error) {
            throw new UnauthorizedException(error);
        }
    }
}