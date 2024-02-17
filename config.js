module.exports.config = {
    imap: {
        user: process.env.EMAIL,
        password: process.env.PASSWORD,
        host: process.env.HOST,
        port: process.env.PORT,
        authTimeout: process.env.AUTH_TIMEOUT,
        tls: true,
        tlsOptions: { rejectUnauthorized: false },
    }
};