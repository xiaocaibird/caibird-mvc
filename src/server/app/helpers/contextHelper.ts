/**
 * @Owners cmZhou
 * @Title app contextHelper
 */
import { createNamespace } from 'cls-hooked';

import { cError } from '../../consts/cError';

class ContextHelper {
    public static readonly instance = new ContextHelper();
    private constructor() { }

    private readonly ZONE_NAME = 'context';
    private readonly CTX_KEY = 'ctx';
    private readonly TAMP_KEY = 'tamp';

    private defaultTimestamp = true;

    private clearTimeout = eCaibird.Date.MsCount.OneSec;

    private readonly zone = createNamespace(this.ZONE_NAME);

    public readonly run = async <TState, TCustom>(ctx: dMvc.Ctx<TState, TCustom>, fn: () => dCaibird.PromiseOrSelf<void>) =>
        this.zone.runPromise(async () => {
            try {
                this.zone.set(this.CTX_KEY, ctx);
                this.zone.set(this.TAMP_KEY, { timestamp: [] });
                await fn();
            } catch (e: unknown) {
                throw e;
            } finally {
                this.clear();
            }
        });

    public readonly get = <TState = unknown, TCustom = dCaibird.Obj>() => {
        const ctx = this.zone.get(this.CTX_KEY) as dMvc.Ctx<TState, TCustom> | null;
        if (ctx) return ctx;
        throw new cError.Status({ status: eCaibird.Http.StatusCode.ServerError, msg: 'No Found Context' }, { key: 'NO_FOUND_CTX' });
    };

    public readonly getOrNull = <TState = unknown, TCustom = dCaibird.Obj>() => {
        const ctx = this.zone.get(this.CTX_KEY) as dMvc.Ctx<TState, TCustom> | null;
        if (ctx) return ctx;
        return null;
    };

    public readonly clear = () => {
        setTimeout(() => {
            this.zone.set(this.CTX_KEY, undefined);
            this.zone.set(this.TAMP_KEY, undefined);
        }, this.clearTimeout);
    };

    public readonly disableDefaultTimestamp = () => this.defaultTimestamp = false;

    public readonly setClearTimeout = (time: number) => this.clearTimeout = time;

    public readonly addTamp = (key: string) => {
        if (!this.defaultTimestamp) return;
        try {
            const tamp = this.zone.get(this.TAMP_KEY) as Tamp | null;
            if (tamp) {
                if (tamp.timestamp) {
                    const last = tamp.timestamp[tamp.timestamp.length - 1];
                    const now = Date.now();
                    tamp.timestamp.push({ key, value: now, span: last && (now - last.value) });
                }
            }
        } catch {

        }
    };

    public readonly getTamp = () => this.zone.get(this.TAMP_KEY) as Tamp | null;
}

type Tamp = { timestamp: { key: string, value: number, span: number }[] };

export const contextHelper = ContextHelper.instance;
