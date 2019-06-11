import 'reflect-metadata'; // Polyfill required by Typegoose and TypeGraphQL
import Express  from 'express';
import Mongoose from 'mongoose';
import Morgan   from 'morgan';
import * as HttpCodes from 'http-status-codes';
import * as Config    from './config';
import { apiRouter } from './routes/api';
import { shutdown, Log } from './modules/debug';
import { makeApolloServer } from './graphql/apollo-server';

async function bootstrap() {
    // change to Promise.all() with MongoDB connection setup in production.
    const apolloServer = await makeApolloServer();
    const app = Express()
        .use(Morgan('dev'))
        .use(Express.static(Config.Frontend.DistDir))
        .use(Express.static(Config.Frontend.AssetsDir));

    apolloServer.applyMiddleware({ app, path: '/graphql'});

    app .use('/api/v1', apiRouter)
        .get('*', (_req, res) => res.sendFile(Config.Frontend.IndexHtmlPath))
        .use(((err, _req, res, _next) => {
            Log.error(err);
            return res
                .status(err.status || HttpCodes.INTERNAL_SERVER_ERROR)
                .json({ err });
        }) as Express.ErrorRequestHandler);

    await Mongoose.connect(Config.DatabaseUrl, {
        useNewUrlParser:  true,
        keepAlive:        true,
        useCreateIndex:   true,
        connectTimeoutMS: 30000
    });
    app.listen(
        Config.Port,
        () => Log.info(`🚀  Server is listening on port ${Config.Port}`)
    );
    // Close DB connection when terminating the program
    process.on('SIGINT', () => Mongoose.disconnect().finally(() => process.exit(0)));
}


void bootstrap().catch(err => shutdown(err, 'bootstraping error'));

