import { Todo, getChildren, isEnable, isInInterval, isInTags } from '../datas/Todo';
import { TodoRecord } from "../datas/TodoRecord";
import { UserSettings } from "../datas/UserSettings";
import { mapToValueArray } from "../util";

//num of records is 10^3
export class TodoWeightCalculator {
    private todo2Weight: Map<string, number> | null = null
    private todo2customWeight: Map<string, number> | null = null
    private force_calc = false
    constructor(force_memo = false) {
        this.force_calc = force_memo
    }
    public isCustomed(todoID: string) {
        if (!this.todo2customWeight) return false
        return this.todo2customWeight.get(todoID) !== undefined
    }
    public calcWeight(todo: Todo, todos: Map<string, Todo>, records: TodoRecord[], userSettings: UserSettings, now: Date) {
        if (!this.todo2Weight || this.force_calc) {
            this.updateMemo(todos, records, userSettings, now)
        }

        return this.todo2Weight?.get(todo.id) || 0
    }
    public updateMemo(todos: Map<string, Todo>, records: TodoRecord[], userSettings: UserSettings, now: Date) {
        const selectable = (todo: Todo) => {
            if (!isEnable(todo) || isInInterval(todo, now)) return false;
            if (userSettings.doRestrictByTags) {
                if (!isInTags(todo, todos, userSettings.timerTags, userSettings.timerExTags)) {
                    return false
                }
            }
            return true;
        }
        const updateTodo2CustomWeights = () => {
            try {
                // eslint-disable-next-line no-new-func
                const func = new Function('todos', 'records', 'date', userSettings.customWeightCode)
                const res = func(mapToValueArray(todos), records, new Date())
                this.todo2customWeight = res
            } catch (error) {
                console.log(error)
                this.todo2customWeight = null
            }
        }
        const calcWeight = (todo: Todo): number => {
            if (!selectable(todo)) return 0
            if (userSettings.useCustomWeight && this.todo2customWeight) {
                const cw = this.todo2customWeight.get(todo.id)
                if (cw !== undefined && cw >= 0) return cw
            }
            return todo.weight
        }
        const todo2Weight = new Map<string, number>()
        updateTodo2CustomWeights()
        const todos_array = mapToValueArray(todos)
        for (const todo of todos_array) {
            todo2Weight.set(todo.id,
                selectable(todo) ? calcWeight(todo) : 0)
        }
        const setWeightWithDIACD = (todo: Todo) => {
            const weight = todo2Weight.get(todo.id)
            if (weight && todo.disableIfAllChildrenDisable) {
                const children = getChildren(todo, todos);
                if (!children) return weight
                for (const child of children) {
                    const weight_child = setWeightWithDIACD(child)
                    if (weight_child) {
                        return weight
                    }
                }
                todo2Weight.set(todo.id, 0)
                return 0
            } else {
                return weight
            }
        }
        for (const todo of todos_array) {
            setWeightWithDIACD(todo)
        }
        this.todo2Weight = todo2Weight
    }

}