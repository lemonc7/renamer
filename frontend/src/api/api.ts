import request from "../utils/request"


// export function getFile(path:string){
//     return request({
//         url: "/api/files",
//         method: "get",
//         params: {
//             path: path
//         }
//     })
// }

export const getFile = (path:string) => {
    return request({
    url: "/api/files",
    method: "get",
    params: {path}
});
};