export interface IConfig {
    token: string;
    ClientID: string;
    mongoURL: string;

    devToken: string;
    devClientID: string;
    devGuildID: string;
    devMongoURL: string;

    nodes: [
        {
            name: string;
            host: string;
            port: number;
            password: string;
            secure: boolean;
        },
    ]
    SPOTIFY: {
        CLIENT_ID: string;
        CLIENT_SECRET: string;

    };

    developerUserIDs: Array<string>;
}