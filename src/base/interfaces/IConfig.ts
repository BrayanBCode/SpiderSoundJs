export interface IConfig {
    token: string;
    ClientID: string;
    mongoURL: string;
    
    devToken: string;
    devClientID: string;
    devGuildID: string;
    devMongoURL: string;
    
    developerUserIDs: Array<string>;
}