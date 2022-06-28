/**
 * @Owners cmZhou
 * @Title gulp-changed-in-place.d
 */
declare module 'gulp-changed-in-place' {
    const changedInPlace: (opt?: { firstPass?: boolean }) => NodeJS.ReadWriteStream;
    export default changedInPlace;
}
