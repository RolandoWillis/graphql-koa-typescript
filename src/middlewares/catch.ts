import * as Koa from 'koa'
import {APIlogger, ERRlogger} from '../core/logger'

export default async (ctx: Koa.Context, next: () => Promise<any>) => {
  const start = Date.now()
  try {
    await next();
    const status: number = ctx.status || 404;
    if (status === 404) {
      ctx.throw(404);
    }
    if(ctx.path === '/graphql' && ctx.body.errors) {
      ERRlogger(ctx, {
        status: status,
        time: Date.now() - start,
        errors: ctx.body.errors,
        msg: 'graphql error'
      }); // error log
    } else {
      APIlogger(ctx, { time: Date.now() - start }) // api log
    }
  } catch (err) {
    console.log('catch', err, err.status);
    try {
      let status: number = err.status || 500;
      ERRlogger(ctx, {
        status: status,
        time: Date.now() - start,
        errors: err.stack.split('\n'),
        msg: err.toString()
      }); // error log
      ctx.status = status;
      if (status === 404) {
        ctx.body = {status: 404, data: null, msg: 'Not Found'};
      } else {
        let msg: string = err.message ? err.message : err.toString();
        let errors: string = err.stack ? err.stack.split('\n') : err.toString();
        ctx.body = {status: status, data: null, msg: msg, errors: errors};
      }
    } catch (e) {
      let msg: string = e.message ? e.message : e.toString();
      let errors: string = e.stack ? e.stack.split('\n') : e.toString();
      ctx.body = {status: 500, data: null, msg: msg, errors: errors};
    }
  }
};
