
export type UserInfo = {
    hasCreatedDefaultTodos: boolean;
}
export const createUserInfo = (data?: any) => {
    const userInfo: UserInfo = {
        hasCreatedDefaultTodos: false,
    }
    if (data) {
        Object.assign(userInfo, data);
    }
    return userInfo
}
export const userInfoToData = (userInfo: UserInfo) => {
    return {
        hasCreatedDefaultTodos: userInfo.hasCreatedDefaultTodos,
        updatedAt: Date.now(),
    }
}