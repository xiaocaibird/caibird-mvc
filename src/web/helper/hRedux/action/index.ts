/**
 * @Creater cmZhou
 * @Desc redux action
 */

export default {
    reset() {
        return {
            type: 'reset'
        } as const;
    },
    recover(payload: dStore.State) {
        return {
            type: 'recover',
            payload
        } as const;
    }
};
