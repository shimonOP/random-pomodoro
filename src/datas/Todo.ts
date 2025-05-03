import { v4 as uuidv4 } from 'uuid';
import { stringUnionToArray } from '../util';
import { fuzzy } from 'fast-fuzzy';

const rfdcCopy = require('rfdc')()
export type TodoRawValues = {
    title: string
    memo: string
    tags: string[]
    childrenIds: string[]
    parentId: string | undefined;
    weight: number
    runTime: number//sec
    interval: number//sec
    defaultInterval: number//sec
    sumRunTime: number//sec
    lastRunDateTime: number//milisec
    isArchived: boolean
    isInbox: boolean
    isCompleted: boolean
    disableIfAllChildrenDisable: boolean
    doForceSpeech: boolean
    isFavorite: boolean
    isForcedLeaf: boolean
}
const keysOfTodoValues = stringUnionToArray<keyof TodoValues>()(
    "title",
    "memo",
    "tags",
    "childrenIds",
    "parentId",
    "weight",
    "runTime",
    "interval",
    "defaultInterval",
    "sumRunTime",
    "lastRunDateTime",
    "isArchived",
    "isInbox",
    "isCompleted",
    "disableIfAllChildrenDisable",
    "doForceSpeech",
    "isFavorite",
    "isForcedLeaf",
)
type WithUpdatedAt<T> = {
    value: T
    updatedAt: number
}
type StructWithUpdatedAt<Type> = {
    [Property in keyof Type]: WithUpdatedAt<Type[Property]>;
};
export type TodoValues = StructWithUpdatedAt<TodoRawValues>

export type TodoObject = {
    id: string
    createdAt: number
    needDelete: boolean
} & TodoValues

export const dataWithDafaultUpdate = (value: any) => {
    return { value: value, updatedAt: 0 }
}
const createDefaultTodo = () => {
    const data: TodoObject = {
        id: uuidv4(),
        createdAt: Date.now(),
        needDelete: false,
        title: dataWithDafaultUpdate(""),
        memo: dataWithDafaultUpdate(""),
        tags: dataWithDafaultUpdate([]),
        childrenIds: dataWithDafaultUpdate([]),
        parentId: dataWithDafaultUpdate(undefined),
        weight: dataWithDafaultUpdate(10),
        runTime: dataWithDafaultUpdate(600),//sec
        interval: dataWithDafaultUpdate(0),//sec
        defaultInterval: dataWithDafaultUpdate(0),//sec
        sumRunTime: dataWithDafaultUpdate(0),//sec
        lastRunDateTime: dataWithDafaultUpdate(Date.now()),//milisec
        isArchived: dataWithDafaultUpdate(false),
        isInbox: dataWithDafaultUpdate(false),
        isCompleted: dataWithDafaultUpdate(false),
        disableIfAllChildrenDisable: dataWithDafaultUpdate(false),
        doForceSpeech: dataWithDafaultUpdate(false),
        isFavorite: dataWithDafaultUpdate(false),
        isForcedLeaf: dataWithDafaultUpdate(false),
    }
    return data;
}
export class Todo {
    private data: TodoObject = createDefaultTodo();
    get id() { return this.data.id }
    public set id(id: string) {
        this.data.id = id;
    }
    get createdAt() { return this.data.createdAt }
    public set createdAt(createdAt: number) {
        this.data.createdAt = createdAt;
    }
    get needDelete() { return this.data.needDelete }
    set needDelete(needDelete) { this.data.needDelete = needDelete }
    get title() { return this.data.title.value }
    get memo() { return this.data.memo.value }
    get tags() { return [...this.data.tags.value] }
    get childrenIds() { return [...this.data.childrenIds.value] }
    get parentId() { return this.data.parentId.value }
    get weight() { return this.data.weight.value }
    get runTime() { return this.data.runTime.value }
    get interval() { return this.data.interval.value }
    get defaultInterval() { return this.data.defaultInterval.value }
    get sumRunTime() { return this.data.sumRunTime.value }
    get lastRunDateTime() { return this.data.lastRunDateTime.value }
    get isArchived() { return this.data.isArchived.value }
    get isInbox() { return this.data.isInbox.value }
    get isCompleted() { return this.data.isCompleted.value }
    get disableIfAllChildrenDisable() { return this.data.disableIfAllChildrenDisable.value }
    get doForceSpeech() { return this.data.doForceSpeech.value }
    get isFavorite() { return this.data.isFavorite.value }
    get isForcedLeaf() { return this.data.isForcedLeaf.value }
    //If you add new Fieald , you must modify update()

    constructor(data?: any) {
        if (data) this.update(data)
        return this
    }
    get displayTitle() {
        const { title, memo } = this;
        const re = /\$n\.(\d+)/g;

        if (!title) return "untitled";

        const result = title.replace(re, (match, num) => {
            const line = memo.split("\n")[parseInt(num) - 1] || "";
            return line;
        });

        return result;
    }
    public toObj() {
        return {
            ...this.data
        }
    }
    public fromObj(todotype: TodoObject) {
        this.data = { ...this.data, ...(todotype) }
        return this
    }
    public clone() {
        return new Todo().fromObj(this.data)
    }
    get updatedAt() {
        const data = this.toObj();
        let updatedAt = 0;
        for (const key of keysOfTodoValues) {
            updatedAt = data[key].updatedAt > updatedAt ? data[key].updatedAt : updatedAt;
        }
        return updatedAt;
    }
    // 気軽に使わないように。
    public update(property: Partial<TodoRawValues>) {
        if ('title' in property) { this.data.title = { value: property.title!, updatedAt: Date.now() } }
        if ('memo' in property) { this.data.memo = { value: property.memo!, updatedAt: Date.now() } }
        if ('tags' in property) { this.data.tags = { value: [...property.tags!], updatedAt: Date.now() } }
        if ('childrenIds' in property) { this.data.childrenIds = { value: [...property.childrenIds!], updatedAt: Date.now() } }
        if ('parentId' in property) { this.data.parentId = { value: property.parentId!, updatedAt: Date.now() } }
        if ('weight' in property) { this.data.weight = { value: property.weight!, updatedAt: Date.now() } }
        if ('runTime' in property) { this.data.runTime = { value: property.runTime!, updatedAt: Date.now() } }
        if ('interval' in property) {
            this.data.interval = { value: property.interval!, updatedAt: Date.now() }
        }
        if ('defaultInterval' in property) { this.data.defaultInterval = { value: property.defaultInterval!, updatedAt: Date.now() } }
        if ('sumRunTime' in property) { this.data.sumRunTime = { value: property.sumRunTime!, updatedAt: Date.now() } }
        if ('lastRunDateTime' in property) { this.data.lastRunDateTime = { value: property.lastRunDateTime!, updatedAt: Date.now() } }
        if ('isArchived' in property) { this.data.isArchived = { value: property.isArchived!, updatedAt: Date.now() } }
        if ('isInbox' in property) { this.data.isInbox = { value: property.isInbox!, updatedAt: Date.now() } }
        if ('isCompleted' in property) { this.data.isCompleted = { value: property.isCompleted!, updatedAt: Date.now() } }
        if ('disableIfAllChildrenDisable' in property) { this.data.disableIfAllChildrenDisable = { value: property.disableIfAllChildrenDisable!, updatedAt: Date.now() } }
        if ('doForceSpeech' in property) { this.data.doForceSpeech = { value: property.doForceSpeech!, updatedAt: Date.now() } }
        if ('isFavorite' in property) { this.data.isFavorite = { value: property.isFavorite!, updatedAt: Date.now() } }
        if ('isForcedLeaf' in property) { this.data.isForcedLeaf = { value: property.isForcedLeaf!, updatedAt: Date.now() } }
    }
    public inheritAttributes(parent: Todo) {
        this.update({ runTime: parent.runTime, defaultInterval: parent.defaultInterval })
    }
}
export const merge = (todo1: Todo, todo2: Todo) => {
    if (todo1.id !== todo2.id) {
        throw new Error("異なるTodoのmerge");
    }
    const data1 = todo1.toObj();
    const data2 = todo2.toObj();
    const newT = new Todo().fromObj(mergeData(data1, data2));
    newT.needDelete = todo1.needDelete || todo2.needDelete
    newT.id = data1.id
    newT.createdAt = data1.createdAt
    return newT
}
const mergeData = (data1: TodoValues, data2: TodoValues) => {
    const data = createDefaultTodo();
    const map: any = {}
    for (const key of keysOfTodoValues) {
        map[key] = data1[key].updatedAt > data2[key].updatedAt ? data1[key] : data2[key]
    }
    Object.assign(data, map);
    return data;
}
export const isInInterval = (todo: Todo, date: Date) => {
    const sa = todo.lastRunDateTime + todo.interval * 1000 - date.getTime();//milisec
    return (sa > 0);
}
export const isRoot = (todo: Todo) => {
    return todo.parentId === undefined;
}
export const calcDateOfOutBreak = (todo: Todo): Date => {
    const date = new Date();
    date.setTime(todo.interval * 1000 + todo.lastRunDateTime);
    return date;
}
export const isEnable = (todo: Todo) => {
    if (todo.isArchived) return false;
    if (todo.isCompleted) return false;
    if (todo.needDelete) return false;
    return true
}
export const isLeaf = (todo: Todo): boolean => {
    return todo.childrenIds.length === 0 || todo.isForcedLeaf;
}
export const defaultTodo: Todo = new Todo()

export function getTodo(id: string, todosMap: Map<String, Todo>) {
    return todosMap.get(id);
}
//子供の子供とかも得たい場合はgetOffSprings
export function getChildren(todo: Todo, todosMap: Map<String, Todo>) {
    const res = todo.childrenIds.map(id => getTodo(id, todosMap)).filter((todo): todo is Todo => todo !== undefined);
    return res;
}
export function getParent(todo: Todo, todosMap: Map<String, Todo>) {
    if (todo.parentId === undefined) return;
    return getTodo(todo.parentId, todosMap);
}
export function getLevel(todo: Todo, todosMap: Map<String, Todo>): number {
    return getAncestors(todo, todosMap).length;
}
//自分自身も含む
export function getAncestors(todo: Todo, todosMap: Map<String, Todo>): Todo[] {
    if (isRoot(todo)) return [todo];
    const parent = getParent(todo, todosMap);
    if (parent === undefined) {
        console.error("dataの親子関係情報が壊れています");
        console.error(todo);
        console.error(todosMap);
        return [todo]
    } else {
        const res = getAncestors(parent, todosMap);
        res.push(todo);
        return res;
    }
}
export function getOffSprings(todo: Todo, todosMap: Map<String, Todo>) {
    let res: Todo[] = [todo];
    const children = getChildren(todo, todosMap);
    children.forEach((c) => {
        res = res.concat(getOffSprings(c, todosMap));
    })
    return res;
}
export function getBrothers(todo: Todo, todosMap: Map<String, Todo>) {
    const res = new Array<Todo>();
    todosMap.forEach(t => {
        if (t.parentId === todo.parentId)
            res.push(t);
    })
    return res;
}
export function getPrev(todo: Todo, todosMap: Map<String, Todo>, condition?: (todo: Todo) => boolean) {
    if (condition === undefined) condition = (todo: Todo) => true;
    let prev: Todo | undefined = undefined;
    const brothers = getBrothers(todo, todosMap).sort((a, b) => a.createdAt - b.createdAt);
    for (const b of brothers) {
        if (b === todo) {
            if (prev !== undefined)
                return prev;
        }
        if (condition(b)) prev = b;
    }
    //もしprevが見つからなかったら親から探す
    const parent = getParent(todo, todosMap);
    if (parent !== undefined) {
        if (condition(parent)) prev = parent;
        else getPrev(parent, todosMap, condition)
    }
    return prev;
}
export function getTitlesReadByVoice(todo: Todo, todosMap: Map<String, Todo>): string[] {
    const ancestors = getAncestors(todo, todosMap);
    return ancestors.filter(t => t.id === todo.id || t.doForceSpeech).map(t => t.displayTitle);
}
export function getTitles(todo: Todo, todosMap: Map<String, Todo>): string[] {
    if (isRoot(todo)) return [todo.displayTitle]
    const parent = getParent(todo, todosMap);
    if (parent === undefined) {
        console.error("データの親子関係が壊れています")
        console.error(todo)
        console.error(todosMap)
        return [todo.displayTitle]
    } else {
        const res = getTitles(parent, todosMap);
        res.push(todo.displayTitle);
        return res;
    }
}
export function hasForcedLeafAncestor(todo: Todo, todosMap: Map<String, Todo>) {
    return getAncestors(todo, todosMap).some((t) => (t.id !== todo.id) && t.isForcedLeaf);
}
export function hasCompletedAncestor(todo: Todo, todosMap: Map<String, Todo>) {
    return getAncestors(todo, todosMap).some((t) => t.isCompleted);
}
export function hasInIntervalAncestor(todo: Todo, todosMap: Map<String, Todo>, date: Date) {
    return getAncestors(todo, todosMap).some((t) => isInInterval(t, date));
}
export function isRootWithCondition(todo: Todo, todosMap: Map<String, Todo>, condition: (todo: Todo) => boolean) {
    if (!condition(todo)) return false;
    const ancestors = getAncestors(todo, todosMap).filter((t) => { return condition(t) && t.id !== todo.id; });
    if (ancestors.length !== 0) return false;
    return true;
}
export function getTodosArray(todosMap: Map<String, Todo>) {
    const res: Todo[] = [];
    todosMap.forEach((todo: Todo) => {
        res.push(todo);
    })
    return res;
}
export function getRootTodos(todosMap: Map<String, Todo>) {
    return getTodosArray(todosMap).filter(todo => isRoot(todo));
}
export function copyTodosMap(todosMap: Map<String, Todo>) {
    return new Map(todosMap);
}
const hasTag = (tags: string[], todo: Todo) => {
    return tags.some((tag => todo.tags.some((tTag) => tTag === tag)));
}
export function isInTags(todo: Todo, todosMap: Map<String, Todo>, tags: string[], exTags: string[]) {
    if (!tags.length && !exTags.length) return true;
    const ancestors = getAncestors(todo, todosMap)
    if (ancestors.some((a) => hasTag(exTags, a))) return false;
    if (!tags.length) return true;
    const offsprings = getOffSprings(todo, todosMap);
    if (offsprings.some((o) => isEnable(o) && hasTag(tags, o)) || ancestors.some((a) => hasTag(tags, a))) return true;
    return false;
}
export function copyTodo(todo: Todo, todosMap: Map<String, Todo>) {
    const copied: Todo = new Todo(rfdcCopy(todo.toObj()));
    if (todosMap.has(todo.id)) {
        todosMap.set(todo.id, copied);
    }
    return copied;
}
export function countTodos(todosMap: Map<String, Todo>) {
    return getTodosArray(todosMap).filter(t => t.needDelete === false).length;
}

export const isValidData = (todosMap: Map<string, Todo>) => {
    return checkConsistencyPCRelation(todosMap);
    function checkConsistencyPCRelation(todosMap: Map<string, Todo>) {
        let res = true;
        todosMap.forEach((todo) => {
            if (!isRoot(todo)) {
                const parent = getParent(todo, todosMap);
                if (!parent) {
                    console.error(todo.displayTitle + "の親がいません");
                    res = false;
                } else {
                    if (!parent.childrenIds.some(id => id === todo.id)) {
                        console.error(todo.displayTitle + "の親:" + parent.displayTitle + "は" + todo.displayTitle + "を持っていません")
                        res = false;
                    }
                }
            }
        })
        return res;
    }
}
export function getTodoOptions(todos: Map<String, Todo>, input: string) {
    input = input.toLowerCase()
    const candidates = getTodosArray(todos).filter(t => {
        return !(t.isArchived || t.needDelete)
    })
    const todo2score_index = new Map<string, { score: number, index: number }>()
    candidates.forEach((t) => {
        const titles = getTitles(t, todos).reverse()
        const { score, match: { index } } = fuzzy(input, titles.join("/"), { returnMatchData: true })
        todo2score_index.set(t.id, { score, index })
    })
    const options: (Todo | string)[] = candidates
        .sort((a, b) => {
            if (Math.abs(todo2score_index.get(a.id)!.score - todo2score_index.get(b.id)!.score) < 0.1) {
                return todo2score_index.get(a.id)!.index - todo2score_index.get(b.id)!.index
            }
            return todo2score_index.get(b.id)!.score - todo2score_index.get(a.id)!.score
        });
    const rootString = "~";
    if (rootString.includes(input)) options.unshift(rootString)
    return options
}