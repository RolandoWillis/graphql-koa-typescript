// koa
import * as Koa from 'koa'
import * as KoaLogger from 'koa-logger'
import { Context } from '@core/koa'
import Middlewares from './middlewares/index'
import {connectDB, connectMongo} from './database/conectDB'
import Session from "./utils/session";
import Store from "./utils/session/store";

const _DEV_ = process.env.NODE_ENV === 'development'

const App: Koa = new Koa();

if(_DEV_) {
	App.use(KoaLogger())
}

App.keys = ['APP_Keys'];
App.use(Session({
  key: 'SESSION_ID',
  store: new Store(),
  signed: true,
  maxAge: 1000 * 60 * 60,
}));

Middlewares(App)

App.use(async (ctx: Context, next: () => Promise<any>) => {
	const path = ctx.request.path
	console.log(`path: ${path}`)
	if(path === '/') {
		ctx.body = 'Welcome to koa-graphql server.'
	}
	
	await next()

	ctx.set('X-Powered-By', 'Keefe');
})

export const start = (port: number):void => {
	console.log('start app...')
	App.listen(port, (): void => {
		console.log(`Koa server has started, running with: http://127.0.0.1:${port}. `)
		connectDB() // db start after server running
		connectMongo() // connect mongodb
	})
}
