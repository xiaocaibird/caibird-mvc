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
    recover(newValue: dStore.State) {
        return {
            type: 'recover',
            newValue
        } as const;
    }
};
